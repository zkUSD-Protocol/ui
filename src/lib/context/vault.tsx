"use client";

import { createContext, useContext, useCallback } from "react";
import {
  PublicKey,
  UInt64,
  Mina,
  AccountUpdate,
  PrivateKey,
  JsonProof,
} from "o1js";
import { useCloudWorker } from "./cloud-worker";

import { CloudWorkerResponse } from "@/lib/types/cloud-worker";
import { fetchMinaAccount } from "zkcloudworker";
import { useAccount } from "./account";
import { useTransaction } from "./transaction";
import { useContracts } from "./contracts";
import { useLatestProof } from "../hooks/useLatestProof";
import {
  MinaPriceInput,
  oracleAggregationVk,
  VaultTransactionType,
  VaultTransactionArgs,
} from "zkusd";
import { useQueryClient } from "@tanstack/react-query";

/**
 * This context provides only the contract calls for creating and interacting with vaults,
 * leaving the local-management of vault addresses and vault state queries to the VaultManager.
 */

interface VaultContextProps {
  createVault: (vaultPrivateKey: PrivateKey) => Promise<CloudWorkerResponse>;
  depositCollateral: (
    vaultAddress: PublicKey,
    amount: UInt64
  ) => Promise<CloudWorkerResponse>;
  mintZkUsd: (
    vaultAddress: PublicKey,
    amount: UInt64
  ) => Promise<CloudWorkerResponse>;
  redeemCollateral: (
    vaultAddress: PublicKey,
    amount: UInt64
  ) => Promise<CloudWorkerResponse>;
  burnZkUsd: (
    vaultAddress: PublicKey,
    amount: UInt64
  ) => Promise<CloudWorkerResponse>;
  liquidate: (vaultAddress: PublicKey) => Promise<CloudWorkerResponse>;
}

const VaultContext = createContext<VaultContextProps | null>(null);

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  // Instances and context hooks
  const { engine } = useContracts();
  const { executeTransaction } = useCloudWorker();
  const { prepareTransaction, serializeTransaction } = useTransaction();
  const { data: latestProof } = useLatestProof();
  const { account } = useAccount();
  const queryClient = useQueryClient();
  /*
    addVaultAddress (or createAndTrackVault) is from the vault-manager.
    addVaultAddress: (vaultAddr: string) => void 
  */

  /**
   * Sign locally with Mina wallet and send to the cloud worker to prove & broadcast.
   */
  const signAndProve = async ({
    task,
    tx,
    memo,
    args,
  }: {
    task: VaultTransactionType;
    tx: Mina.Transaction<false, false>;
    memo: VaultTransactionType;
    args: VaultTransactionArgs[VaultTransactionType];
  }) => {
    try {
      const serializedTx = serializeTransaction(tx);
      const signResult = await window.mina?.sendTransaction({
        onlySign: true,
        transaction: tx.toJSON(),
        feePayer: {
          fee: Number(tx.transaction.feePayer.body.fee),
          memo,
        },
      });

      if (!signResult || "code" in signResult) {
        throw new Error(signResult?.message || "Signing failed");
      }

      if (!("signedData" in signResult)) {
        throw new Error("Expected signed zkApp command");
      }

      const signedData = signResult.signedData;

      const transaction = JSON.stringify({
        serializedTx,
        signedData,
      });

      const response = await executeTransaction({
        task: task,
        transactions: [transaction],
        args: JSON.stringify(args),
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Create a brand new vault on-chain.
   * Once created, we store the vault address in the local manager's storage using addVaultAddress.
   */
  const createVault = useCallback(
    async (vaultPrivateKey: PrivateKey) => {
      const memo = VaultTransactionType.CREATE_VAULT;
      const vaultAddress = vaultPrivateKey.toPublicKey();
      let newAccounts = 0;

      // Check to see if the user already has an account
      await fetchMinaAccount({
        publicKey: account!,
        tokenId: engine.deriveTokenId(),
      });

      if (!Mina.hasAccount(account!)) {
        newAccounts = 2;
      } else {
        newAccounts = 1;
      }

      console.log("newAccounts", newAccounts);

      // Prepare transaction
      const tx = await prepareTransaction(async () => {
        // Fund new accounts for deploying the vault
        AccountUpdate.fundNewAccount(account!, newAccounts);
        await engine.createVault(vaultAddress);
      }, memo);

      // Sign the transaction
      tx.sign([vaultPrivateKey]);

      // Broadcast
      const response = await signAndProve({
        task: VaultTransactionType.CREATE_VAULT,
        tx,
        memo,
        args: {
          vaultAddress: vaultAddress.toBase58(),
          newAccounts,
        },
      });

      return response;
    },
    [engine, prepareTransaction, signAndProve, account]
  );

  /**
   * Deposit Collateral
   */
  const depositCollateral = useCallback(
    async (vaultAddress: PublicKey, amount: UInt64) => {
      try {
        // Prepare the transaction via engine or building it yourself
        const memo = VaultTransactionType.DEPOSIT_COLLATERAL;

        const tx = await prepareTransaction(async () => {
          await engine.depositCollateral(vaultAddress, amount);
        }, memo);

        // We do not sign here manually because depositCollateral
        // might have a .sign() step inside or require the user to sign the fee.
        // So let's replicate the signAndProve pattern:
        // if you prefer a "prepareTransaction" approach, you can do that as well.
        const response = await signAndProve({
          task: VaultTransactionType.DEPOSIT_COLLATERAL,
          tx: tx as any,
          memo,
          args: {
            vaultAddress: vaultAddress.toBase58(),
            collateralAmount: amount.toString(),
          },
        });

        // On success, we can optionally invalidate the query in vault-manager
        // (the vault manager or the component can do something like
        queryClient.invalidateQueries({
          queryKey: ["vaultState", vaultAddress.toBase58()],
        });

        return response;
      } catch (error) {
        throw error;
      }
    },
    [engine, signAndProve]
  );

  /**
   * Mint zkUSD
   */
  const mintZkUsd = useCallback(
    async (vaultAddress: PublicKey, amount: UInt64) => {
      try {
        const memo = VaultTransactionType.MINT_ZKUSD;

        if (!latestProof) {
          throw new Error("No latest proof found");
        }

        await fetchMinaAccount({
          publicKey: engine.address,
        });

        const minaPriceInput = new MinaPriceInput({
          proof: latestProof,
          verificationKey: oracleAggregationVk,
        });

        console.time("preparing transaction with proof");
        const tx = await prepareTransaction(async () => {
          await engine.mintZkUsd(vaultAddress, amount, minaPriceInput);
        }, memo);
        console.timeEnd("preparing transaction with proof");

        console.log(
          "Providing proof for block",
          latestProof.toJSON().publicInput[0]
        );

        const response = await signAndProve({
          task: VaultTransactionType.MINT_ZKUSD,
          tx: tx as any,
          memo,
          args: {
            vaultAddress: vaultAddress.toBase58(),
            zkusdAmount: amount.toString(),
            minaPriceProof: latestProof.toJSON(),
          },
        });

        queryClient.invalidateQueries({
          queryKey: ["vaultState", vaultAddress.toBase58()],
        });

        return response;
      } catch (error) {
        console.error("Error minting zkUSD", error);
        throw error;
      }
    },
    [engine, signAndProve, latestProof]
  );

  const redeemCollateral = useCallback(
    async (vaultAddress: PublicKey, amount: UInt64) => {
      try {
        const memo = VaultTransactionType.REDEEM_COLLATERAL;

        if (!latestProof) {
          throw new Error("No latest proof found");
        }

        await fetchMinaAccount({
          publicKey: engine.address,
        });

        const minaPriceInput = new MinaPriceInput({
          proof: latestProof,
          verificationKey: oracleAggregationVk,
        });

        console.time("preparing redeem collateral transaction with proof");
        const tx = await prepareTransaction(async () => {
          await engine.redeemCollateral(vaultAddress, amount, minaPriceInput);
        }, memo);
        console.timeEnd("preparing redeem collateral transaction with proof");

        const response = await signAndProve({
          task: VaultTransactionType.REDEEM_COLLATERAL,
          tx: tx as any,
          memo,
          args: {
            vaultAddress: vaultAddress.toBase58(),
            collateralAmount: amount.toString(),
            minaPriceProof: latestProof.toJSON(),
          },
        });

        queryClient.invalidateQueries({
          queryKey: ["vaultState", vaultAddress.toBase58()],
        });

        return response;
      } catch (error) {
        console.error("Error redeeming collateral", error);
        throw error;
      }
    },
    [engine, signAndProve, latestProof]
  );

  const burnZkUsd = useCallback(
    async (vaultAddress: PublicKey, amount: UInt64) => {
      try {
        const memo = VaultTransactionType.BURN_ZKUSD;

        // Fetch the engine account state
        await fetchMinaAccount({
          publicKey: engine.address,
        });

        console.time("preparing burn zkUSD transaction");
        const tx = await prepareTransaction(async () => {
          await engine.burnZkUsd(vaultAddress, amount);
        }, memo);
        console.timeEnd("preparing burn zkUSD transaction");

        const response = await signAndProve({
          task: VaultTransactionType.BURN_ZKUSD,
          tx: tx as any,
          memo,
          args: {
            vaultAddress: vaultAddress.toBase58(),
            zkusdAmount: amount.toString(),
          },
        });

        queryClient.invalidateQueries({
          queryKey: ["vaultState", vaultAddress.toBase58()],
        });

        return response;
      } catch (error) {
        console.error("Error burning zkUSD", error);
        throw error;
      }
    },
    [engine, prepareTransaction, signAndProve]
  );

  const liquidate = useCallback(
    async (vaultAddress: PublicKey) => {
      try {
        const memo = VaultTransactionType.LIQUIDATE;

        if (!latestProof) {
          throw new Error("No latest proof found");
        }

        await fetchMinaAccount({
          publicKey: engine.address,
        });

        const minaPriceInput = new MinaPriceInput({
          proof: latestProof,
          verificationKey: oracleAggregationVk,
        });

        console.time("preparing liquidate transaction with proof");
        const tx = await prepareTransaction(async () => {
          await engine.liquidate(vaultAddress, minaPriceInput);
        }, memo);
        console.timeEnd("preparing liquidate transaction with proof");

        const response = await signAndProve({
          task: VaultTransactionType.LIQUIDATE,
          tx: tx as any,
          memo,
          args: {
            vaultAddress: vaultAddress.toBase58(),
            minaPriceProof: latestProof.toJSON(),
          },
        });

        queryClient.invalidateQueries({
          queryKey: ["vaultState", vaultAddress.toBase58()],
        });

        return response;
      } catch (error) {
        console.error("Error liquidating vault", error);
        throw error;
      }
    },
    [engine, prepareTransaction, signAndProve, latestProof]
  );

  return (
    <VaultContext.Provider
      value={{
        createVault,
        depositCollateral,
        mintZkUsd,
        redeemCollateral,
        burnZkUsd,
        liquidate,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
};
