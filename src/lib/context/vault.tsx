"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  fetchLastBlock,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  TokenId,
  UInt64,
} from "o1js";
import { useAccount } from "./account";
import { useClient } from "./client";
import { useLatestProof } from "../hooks/use-latest-proof";
import {
  MinaPriceInput,
  oracleAggregationVk,
  ZkusdEngineTransactionType,
  fetchMinaAccount,
  TxLifecycleStatus,
  TransactionHandle,
  getContractKeys,
  TransactionStatusNew,
  TransactionPhase,
  TransactionPhaseStatus,
} from "@zkusd/core";
import { VaultState } from "../types";
import { useTransactionStatus } from "./transaction-status";
import { calculateHealthFactor, calculateLTV } from "../utils/loan";
import { usePrice } from "./price";
import router from "next/router";

/**
 * This context provides only the contract calls for creating and interacting with vaults,
 * leaving the local-management of vault addresses and vault state queries to the VaultManager.
 */

interface VaultContextProps {
  depositCollateral: (amount: UInt64) => Promise<void>;
  mintZkUsd: (amount: UInt64) => Promise<void>;
  redeemCollateral: (amount: UInt64) => Promise<void>;
  burnZkUsd: (amount: UInt64) => Promise<void>;
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

  const { refetch: refetchLatestProof } = useLatestProof();
  const { zkusd } = useClient();
  const { account, refetchAccount } = useAccount();
  const {
    setTxPhase,
    setTxError,
    setTxType,
    resetTxStatus,
    setTxHash,
    txPhase,
    txError,
    txHash,
  } = useTransactionStatus();
  const { minaPrice } = usePrice();

  const txHashRef = useRef<string | undefined>(txHash);

  //General state
  const [vault, setVault] = useState<VaultState | null>(null);

  const [projectedState, setProjectedState] = useState<
    | {
        healthFactor: number;
        ltv: number;
      }
    | undefined
  >(undefined);

  /**
   * Consolidated helper that fetches the vault state and updates the local state.
   */
  const updateVaultState = async (
    vaultAddress: string
  ): Promise<VaultState> => {
    if (!zkusd) {
      throw new Error("Network is not initialized");
    }

    const vaultState = await zkusd.getVaultState(vaultAddress);
    const collateralAmount = vaultState.collateralAmount.toBigInt();
    const debtAmount = vaultState.debtAmount.toBigInt();
    const owner = vaultState.owner?.toBase58() ?? "Not Found";
    const currentLTV = calculateLTV(collateralAmount, debtAmount, minaPrice);
    const currentHealthFactor = calculateHealthFactor(
      collateralAmount,
      debtAmount,
      minaPrice
    );

    const newVaultState: VaultState = {
      vaultAddress,
      collateralAmount,
      debtAmount,
      owner,
      currentLTV,
      currentHealthFactor,
    };

    setVault(newVaultState);
    return newVaultState;
  };

  /**
   * Initializes the vault by fetching and setting its state.
   */
  const initVault = async (vaultAddress: string): Promise<VaultState> => {
    try {
      return await updateVaultState(vaultAddress);
    } catch (error) {
      console.error("Error initializing vault:", error);
      throw error;
    }
  };

  /**
   * Refetches the vault state using the current vault address.
   */
  const refetchVault = async () => {
    if (!vault?.vaultAddress) return;
    try {
      await updateVaultState(vault.vaultAddress);
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

  useEffect(() => {
    txHashRef.current = txHash;
  }, [txHash]);

  const executeVaultAction = useCallback(
    async (
      type: ZkusdEngineTransactionType,
      action: () => Promise<TransactionHandle> | undefined
    ) => {
      try {
        setTxType(type);
        setTxPhase(TransactionPhase.BUILDING);

        const txHandle = await action();

        if (!txHandle) {
          throw new Error("Transaction handle is undefined");
        }

        txHandle?.subscribeToLifecycle(
          async (lifecycle: TransactionStatusNew) => {
            let phase: TransactionPhase = lifecycle.phase;
            let status: TransactionPhaseStatus = lifecycle.status;
            if (txPhase !== phase) {
              setTxPhase(phase);
            }

            if ((status === "FAILED" || status === "EXCEPTION") && !txError) {
              setTxError(
                `Error during ${phase} phase, please check the console for more details!`
              );
              console.error(lifecycle);
            }

            if (txHandle.hash && !txHashRef.current) {
              setTxHash(txHandle.hash);
            }

            if (phase === TransactionPhase.INCLUDED) {
              await refetchVault();
              await refetchAccount();
            }
          }
        );
      } catch (error: any) {
        setTxError(error.message);
        throw error;
      }
    },
    [
      txHash,
      setTxPhase,
      setTxType,
      setTxError,
      refetchVault,
      refetchAccount,
      zkusd,
      setTxHash,
    ]
  );

  /**
   * Deposit Collateral
   */
  const depositCollateral = useCallback(
    async (amount: UInt64) => {
      if (!vault?.vaultAddress || !account) return;

      try {
        executeVaultAction(ZkusdEngineTransactionType.DEPOSIT_COLLATERAL, () =>
          zkusd?.depositCollateral(account, vault.vaultAddress, amount)
        );
      } catch (error) {
        throw error;
      }
    },
    [vault, account]
  );

  /**
   * Mint zkUSD
   */
  const mintZkUsd = useCallback(
    async (amount: UInt64) => {
      if (!vault?.vaultAddress || !account) return;
      try {
        setTxType(ZkusdEngineTransactionType.MINT_ZKUSD);

        const minaPriceInput = await getMinaPriceInput();

        executeVaultAction(ZkusdEngineTransactionType.MINT_ZKUSD, () =>
          zkusd?.mintZkUsd(account, vault.vaultAddress, amount, minaPriceInput)
        );
      } catch (error) {
        console.error("Error minting zkUSD", error);
        throw error;
      }
    },
    [vault, account]
  );

  const redeemCollateral = useCallback(
    async (amount: UInt64) => {
      if (!vault?.vaultAddress || !account) return;
      try {
        const minaPriceInput = await getMinaPriceInput();

        executeVaultAction(ZkusdEngineTransactionType.REDEEM_COLLATERAL, () =>
          zkusd?.redeemCollateral(
            account,
            vault.vaultAddress,
            amount,
            minaPriceInput
          )
        );
      } catch (error) {
        console.error("Error redeeming collateral", error);
        throw error;
      }
    },
    [vault, account]
  );

  const burnZkUsd = useCallback(
    async (amount: UInt64) => {
      if (!vault?.vaultAddress || !account) return;
      try {
        executeVaultAction(ZkusdEngineTransactionType.BURN_ZKUSD, () =>
          zkusd?.burnZkUsd(account, vault.vaultAddress, amount)
        );
      } catch (error) {
        console.error("Error burning zkUSD", error);
        throw error;
      }
    },
    [vault, account]
  );

  return (
    <VaultContext.Provider
      value={{
        depositCollateral,
        mintZkUsd,
        redeemCollateral,
        burnZkUsd,
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
