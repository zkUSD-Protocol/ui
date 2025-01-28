"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { fetchLastBlock, Mina, PublicKey, UInt64 } from "o1js";
import { CloudWorkerResponse } from "@/lib/types/cloud-worker";
import { fetchMinaAccount } from "zkcloudworker";
import { useAccount } from "./account";
import { prepareTransaction, signAndProve } from "@/lib/utils/transaction";
import { useContracts } from "./contracts";
import { useLatestProof } from "../hooks/use-latest-proof";
import {
  MinaPriceInput,
  oracleAggregationVk,
  VaultTransactionType,
} from "zkusd";
import { VaultState } from "../types";
import { useVaultState } from "../hooks/use-vault-state";

/**
 * This context provides only the contract calls for creating and interacting with vaults,
 * leaving the local-management of vault addresses and vault state queries to the VaultManager.
 */

interface VaultContextProps {
  depositCollateral: (amount: UInt64) => Promise<CloudWorkerResponse>;
  mintZkUsd: (amount: UInt64) => Promise<CloudWorkerResponse>;
  redeemCollateral: (amount: UInt64) => Promise<CloudWorkerResponse>;
  burnZkUsd: (amount: UInt64) => Promise<CloudWorkerResponse>;
  liquidate: () => Promise<CloudWorkerResponse>;
  vault: VaultState | null;
  setVault: (vault: VaultState) => void;
}

const VaultContext = createContext<VaultContextProps | null>(null);

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  // Instances and context hooks
  const { engine } = useContracts();
  const { refetch: refetchLatestProof } = useLatestProof();
  const { account } = useAccount();

  //General state
  const [vault, setVault] = useState<VaultState>({
    vaultAddress: "",
    collateralAmount: BigInt(0),
    debtAmount: BigInt(0),
    owner: "",
  });

  const { refetch: refetchVaultState } = useVaultState(
    vault.vaultAddress,
    engine
  );

  const refetchVault = async () => {
    const { data: updatedVault } = await refetchVaultState();
    setVault((prevVault) => ({
      ...prevVault,
      ...updatedVault,
    }));
  };

  useEffect(() => {
    if (!vault.owner) {
      refetchVault();
    }
  }, [vault]);

  const getMinaPriceInput = async (): Promise<MinaPriceInput> => {
    const { data: latestProof } = await refetchLatestProof();

    console.log("Latest Proof", latestProof);

    if (!latestProof) {
      throw new Error("No latest proof found");
    }

    //Make sure that the proof is for the latest block
    const currentBlockHeight = (
      await fetchLastBlock()
    ).blockchainLength.toBigint();
    const proofBlockHeight =
      latestProof.publicOutput.minaPrice.currentBlockHeight.toBigint();

    console.log("Current Block", currentBlockHeight);
    console.log("Proof Block", proofBlockHeight);

    //the proofBlockHeight needs to be within 2

    if (
      currentBlockHeight - proofBlockHeight > 2n ||
      proofBlockHeight > currentBlockHeight
    ) {
      throw new Error("Proof is not within acceptable block range");
    }

    return new MinaPriceInput({
      proof: latestProof,
      verificationKey: oracleAggregationVk,
    });
  };

  /**
   * Sign locally with Mina wallet and send to the cloud worker to prove & broadcast.
   */

  /**
   * Deposit Collateral
   */
  const depositCollateral = useCallback(
    async (amount: UInt64) => {
      try {
        const tx = await prepareTransaction(
          async () => {
            await engine.depositCollateral(
              PublicKey.fromBase58(vault.vaultAddress),
              amount
            );
          },
          VaultTransactionType.DEPOSIT_COLLATERAL,
          account!
        );

        const response = await signAndProve({
          task: VaultTransactionType.DEPOSIT_COLLATERAL,
          tx: tx as any,
          memo: VaultTransactionType.DEPOSIT_COLLATERAL,
          args: {
            vaultAddress: vault.vaultAddress,
            collateralAmount: amount.toString(),
          },
        });

        await refetchVault();

        return response;
      } catch (error) {
        throw error;
      }
    },
    [engine, vault]
  );

  /**
   * Mint zkUSD
   */
  const mintZkUsd = useCallback(
    async (amount: UInt64) => {
      try {
        const minaPriceInput = await getMinaPriceInput();

        const tx = await prepareTransaction(
          async () => {
            await engine.mintZkUsd(
              PublicKey.fromBase58(vault.vaultAddress),
              amount,
              minaPriceInput
            );
          },
          VaultTransactionType.MINT_ZKUSD,
          account!
        );

        const response = await signAndProve({
          task: VaultTransactionType.MINT_ZKUSD,
          tx: tx as any,
          memo: VaultTransactionType.MINT_ZKUSD,
          args: {
            vaultAddress: vault!.vaultAddress!,
            zkusdAmount: amount.toString(),
            minaPriceProof: minaPriceInput.proof.toJSON(),
          },
        });

        await refetchVault();

        return response;
      } catch (error) {
        console.error("Error minting zkUSD", error);
        throw error;
      }
    },
    [engine, vault]
  );

  const redeemCollateral = useCallback(
    async (amount: UInt64) => {
      try {
        const minaPriceInput = await getMinaPriceInput();

        console.time("preparing redeem collateral transaction with proof");
        const tx = await prepareTransaction(
          async () => {
            await engine.redeemCollateral(
              PublicKey.fromBase58(vault.vaultAddress),
              amount,
              minaPriceInput
            );
          },
          VaultTransactionType.REDEEM_COLLATERAL,
          account!
        );
        console.timeEnd("preparing redeem collateral transaction with proof");

        const response = await signAndProve({
          task: VaultTransactionType.REDEEM_COLLATERAL,
          tx: tx as any,
          memo: VaultTransactionType.REDEEM_COLLATERAL,
          args: {
            vaultAddress: vault.vaultAddress,
            collateralAmount: amount.toString(),
            minaPriceProof: minaPriceInput.proof.toJSON(),
          },
        });

        await refetchVault();

        return response;
      } catch (error) {
        console.error("Error redeeming collateral", error);
        throw error;
      }
    },
    [engine, vault]
  );

  const burnZkUsd = useCallback(
    async (amount: UInt64) => {
      try {
        const tx = await prepareTransaction(
          async () => {
            await engine.burnZkUsd(
              PublicKey.fromBase58(vault.vaultAddress),
              amount
            );
          },
          VaultTransactionType.BURN_ZKUSD,
          account!
        );

        const response = await signAndProve({
          task: VaultTransactionType.BURN_ZKUSD,
          tx: tx as any,
          memo: VaultTransactionType.BURN_ZKUSD,
          args: {
            vaultAddress: vault.vaultAddress,
            zkusdAmount: amount.toString(),
          },
        });

        await refetchVault();

        return response;
      } catch (error) {
        console.error("Error burning zkUSD", error);
        throw error;
      }
    },
    [engine, vault]
  );

  const liquidate = useCallback(async () => {
    try {
      console.log("Liquidating vault");
      const minaPriceInput = await getMinaPriceInput();

      console.time("preparing liquidate transaction with proof");
      const tx = await prepareTransaction(
        async () => {
          await engine.liquidate(
            PublicKey.fromBase58(vault.vaultAddress),
            minaPriceInput
          );
        },
        VaultTransactionType.LIQUIDATE,
        account!
      );

      const response = await signAndProve({
        task: VaultTransactionType.LIQUIDATE,
        tx: tx as any,
        memo: VaultTransactionType.LIQUIDATE,
        args: {
          vaultAddress: vault.vaultAddress,
          minaPriceProof: minaPriceInput.proof.toJSON(),
        },
      });

      await refetchVault();

      return response;
    } catch (error) {
      console.error("Error liquidating vault", error);
      throw error;
    }
  }, [engine, vault]);

  return (
    <VaultContext.Provider
      value={{
        depositCollateral,
        mintZkUsd,
        redeemCollateral,
        burnZkUsd,
        liquidate,
        vault,
        setVault,
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
