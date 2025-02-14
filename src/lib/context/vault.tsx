"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { fetchLastBlock, Mina, PrivateKey, PublicKey, UInt64 } from "o1js";
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
import { useTransactionStatus } from "./transaction-status";
import { calculateHealthFactor, calculateLTV } from "../utils/loan";
import { usePrice } from "./price";
import { Vault } from "zkusd";

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
  initVault: (vaultAddress: string) => Promise<VaultState>;
  refetchVault: () => Promise<void>;
  projectedState:
    | {
        healthFactor: number;
        ltv: number;
      }
    | undefined;
  setProjectedState: (
    state: { healthFactor: number; ltv: number } | undefined
  ) => void;
}

const VaultContext = createContext<VaultContextProps | null>(null);

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  // Instances and context hooks
  const { engine, networkInitialized } = useContracts();
  const { refetch: refetchLatestProof } = useLatestProof();
  const { account, refetchAccount } = useAccount();
  const { setTxStatus, setTxError, setTxType, listen } = useTransactionStatus();
  const { minaPrice } = usePrice();

  //General state
  const [vault, setVault] = useState<VaultState | null>(null);

  const [projectedState, setProjectedState] = useState<
    | {
        healthFactor: number;
        ltv: number;
      }
    | undefined
  >(undefined);

  const fetchVaultState = async (vaultAddress: string): Promise<VaultState> => {
    if (!networkInitialized) {
      throw new Error("Network is not initialized");
    }

    // Fetch the vault account
    const vaultAccount = await fetchMinaAccount({
      publicKey: PublicKey.fromBase58(vaultAddress),
      tokenId: engine?.deriveTokenId(),
      force: true,
    });

    if (!vaultAccount.account) {
      throw new Error("Vault not found");
    }

    const vaultState = Vault.fromAccount(vaultAccount.account);

    const collateralAmount = vaultState.collateralAmount.toBigInt();
    const debtAmount = vaultState.debtAmount.toBigInt();
    const ownerPublicKey = vaultState.owner;
    const owner = ownerPublicKey?.toBase58() ?? "Not Found";

    const currentLTV = calculateLTV(collateralAmount, debtAmount, minaPrice);

    const currentHealthFactor = calculateHealthFactor(
      collateralAmount,
      debtAmount,
      minaPrice
    );

    return {
      vaultAddress,
      collateralAmount,
      debtAmount,
      owner,
      currentLTV,
      currentHealthFactor,
    };
  };

  const initVault = async (vaultAddress: string): Promise<VaultState> => {
    try {
      const vaultState = await fetchVaultState(vaultAddress);
      setVault(vaultState);
      return vaultState;
    } catch (error) {
      console.error("Error initializing vault:", error);
      throw error;
    }
  };

  const refetchVault = async () => {
    if (!vault?.vaultAddress) return;
    try {
      const vaultState = await fetchVaultState(vault.vaultAddress);
      setVault(vaultState);
    } catch (error) {
      console.error("Error refetching vault:", error);
      throw error;
    }
  };

  const getMinaPriceInput = async (): Promise<MinaPriceInput> => {
    const { data: latestProof } = await refetchLatestProof();

    if (!latestProof) {
      throw new Error("No latest proof found");
    }

    //Make sure that the proof is for the latest block
    const currentBlockHeight = (
      await fetchLastBlock()
    ).blockchainLength.toBigint();
    const proofBlockHeight =
      latestProof.publicOutput.minaPrice.currentBlockHeight.toBigint();

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
        setTxType(VaultTransactionType.DEPOSIT_COLLATERAL);

        const txId = PrivateKey.random().toBase58();

        await listen(txId);

        //fetch the vault account
        const vaultAccount = await fetchMinaAccount({
          publicKey: PublicKey.fromBase58(vault?.vaultAddress || ""),
          tokenId: engine?.deriveTokenId(),
          force: true,
        });

        if (!vaultAccount) {
          throw new Error("Vault account not found");
        }

        let tx;
        try {
          tx = await prepareTransaction(
            async () => {
              await engine?.depositCollateral(
                PublicKey.fromBase58(vault?.vaultAddress || ""),
                amount
              );
            },
            VaultTransactionType.DEPOSIT_COLLATERAL,
            account!
          );
        } catch (error: any) {
          throw {
            code: 30001,
            message: error.message,
          };
        }

        const response = await signAndProve({
          task: VaultTransactionType.DEPOSIT_COLLATERAL,
          tx: tx as any,
          memo: VaultTransactionType.DEPOSIT_COLLATERAL,
          args: {
            transactionId: txId,
            vaultAddress: vault?.vaultAddress || "",
            collateralAmount: amount.toString(),
          },
          setTxStatus,
          setTxError,
        });

        await refetchVault();

        return response;
      } catch (error) {
        throw error;
      }
    },
    [engine, vault, account]
  );

  /**
   * Mint zkUSD
   */
  const mintZkUsd = useCallback(
    async (amount: UInt64) => {
      try {
        setTxType(VaultTransactionType.MINT_ZKUSD);

        const txId = PrivateKey.random().toBase58();

        await listen(txId);

        const minaPriceInput = await getMinaPriceInput();

        let tx;
        try {
          tx = await prepareTransaction(
            async () => {
              await engine?.mintZkUsd(
                PublicKey.fromBase58(vault?.vaultAddress || ""),
                amount,
                minaPriceInput
              );
            },
            VaultTransactionType.MINT_ZKUSD,
            account!
          );
        } catch (error: any) {
          throw {
            code: 30001,
            message: error.message,
          };
        }

        const response = await signAndProve({
          task: VaultTransactionType.MINT_ZKUSD,
          tx: tx as any,
          memo: VaultTransactionType.MINT_ZKUSD,
          args: {
            transactionId: txId,
            vaultAddress: vault?.vaultAddress || "",
            zkusdAmount: amount.toString(),
            minaPriceProof: minaPriceInput.proof.toJSON(),
          },
          setTxStatus,
          setTxError,
        });

        await refetchVault();

        return response;
      } catch (error) {
        console.error("Error minting zkUSD", error);
        throw error;
      }
    },
    [engine, vault, account]
  );

  const redeemCollateral = useCallback(
    async (amount: UInt64) => {
      try {
        setTxType(VaultTransactionType.REDEEM_COLLATERAL);

        const txId = PrivateKey.random().toBase58();

        await listen(txId);

        const minaPriceInput = await getMinaPriceInput();

        let tx;
        try {
          tx = await prepareTransaction(
            async () => {
              await engine?.redeemCollateral(
                PublicKey.fromBase58(vault?.vaultAddress || ""),
                amount,
                minaPriceInput
              );
            },
            VaultTransactionType.REDEEM_COLLATERAL,
            account!
          );
        } catch (error: any) {
          throw {
            code: 30001,
            message: error.message,
          };
        }

        const response = await signAndProve({
          task: VaultTransactionType.REDEEM_COLLATERAL,
          tx: tx as any,
          memo: VaultTransactionType.REDEEM_COLLATERAL,
          args: {
            transactionId: txId,
            vaultAddress: vault?.vaultAddress || "",
            collateralAmount: amount.toString(),
            minaPriceProof: minaPriceInput.proof.toJSON(),
          },
          setTxStatus,
          setTxError,
        });

        await refetchVault();

        return response;
      } catch (error) {
        console.error("Error redeeming collateral", error);
        throw error;
      }
    },
    [engine, vault, account]
  );

  const burnZkUsd = useCallback(
    async (amount: UInt64) => {
      try {
        setTxType(VaultTransactionType.BURN_ZKUSD);

        const txId = PrivateKey.random().toBase58();

        await listen(txId);

        let tx;
        try {
          tx = await prepareTransaction(
            async () => {
              await engine?.burnZkUsd(
                PublicKey.fromBase58(vault?.vaultAddress || ""),
                amount
              );
            },
            VaultTransactionType.BURN_ZKUSD,
            account!
          );
        } catch (error: any) {
          throw {
            code: 30001,
            message: error.message,
          };
        }

        const response = await signAndProve({
          task: VaultTransactionType.BURN_ZKUSD,
          tx: tx as any,
          memo: VaultTransactionType.BURN_ZKUSD,
          args: {
            transactionId: txId,
            vaultAddress: vault?.vaultAddress || "",
            zkusdAmount: amount.toString(),
          },
          setTxStatus,
          setTxError,
        });

        await refetchVault();

        return response;
      } catch (error) {
        console.error("Error burning zkUSD", error);
        throw error;
      }
    },
    [engine, vault, account]
  );

  const liquidate = useCallback(async () => {
    try {
      setTxType(VaultTransactionType.LIQUIDATE);

      const txId = PrivateKey.random().toBase58();

      await listen(txId);

      const minaPriceInput = await getMinaPriceInput();

      let tx;
      try {
        tx = await prepareTransaction(
          async () => {
            await engine?.liquidate(
              PublicKey.fromBase58(vault?.vaultAddress || ""),
              minaPriceInput
            );
          },
          VaultTransactionType.LIQUIDATE,
          account!
        );
      } catch (error: any) {
        throw {
          code: 30001,
          message: error.message,
        };
      }

      const response = await signAndProve({
        task: VaultTransactionType.LIQUIDATE,
        tx: tx as any,
        memo: VaultTransactionType.LIQUIDATE,
        args: {
          transactionId: txId,
          vaultAddress: vault?.vaultAddress || "",
          minaPriceProof: minaPriceInput.proof.toJSON(),
        },
        setTxStatus,
        setTxError,
      });

      await refetchVault();

      return response;
    } catch (error) {
      console.error("Error liquidating vault", error);
      throw error;
    }
  }, [engine, vault, account]);

  return (
    <VaultContext.Provider
      value={{
        depositCollateral,
        mintZkUsd,
        redeemCollateral,
        burnZkUsd,
        liquidate,
        vault,
        initVault,
        refetchVault,
        projectedState,
        setProjectedState,
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
