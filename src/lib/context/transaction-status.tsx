"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TransactionPhase, ZkusdEngineTransactionType } from "@zkusd/core";

interface TransactionStatusContextValue {
  txPhase: TransactionPhase | undefined;
  setTxPhase: (txPhase: TransactionPhase | undefined) => void;
  txType: ZkusdEngineTransactionType | undefined;
  setTxType: (txType: ZkusdEngineTransactionType | undefined) => void;
  txError: string | undefined;
  setTxError: (txError: string | undefined) => void;
  txHash: string | undefined;
  setTxHash: (txHash: string | undefined) => void;
  title: string;
  resetTxStatus: () => Promise<void>;
}

const txTypeMap: Record<
  Exclude<
    ZkusdEngineTransactionType,
    | ZkusdEngineTransactionType.UPDATE_ADMIN
    | ZkusdEngineTransactionType.UPDATE_VALID_PRICE_BLOCK_COUNT
    | ZkusdEngineTransactionType.UPDATE_ORACLE_WHITELIST
    | ZkusdEngineTransactionType.TOGGLE_EMERGENCY_STOP
    | ZkusdEngineTransactionType.TRANSFER
    | ZkusdEngineTransactionType.LIQUIDATE
  >,
  {
    title: string;
  }
> = {
  [ZkusdEngineTransactionType.CREATE_VAULT]: {
    title: "Creating new vault",
  },
  [ZkusdEngineTransactionType.DEPOSIT_COLLATERAL]: {
    title: "Depositing collateral",
  },
  [ZkusdEngineTransactionType.REDEEM_COLLATERAL]: {
    title: "Withdrawing collateral",
  },
  [ZkusdEngineTransactionType.MINT_ZKUSD]: {
    title: "Minting zkUSD",
  },
  [ZkusdEngineTransactionType.BURN_ZKUSD]: {
    title: "Repaying zkUSD",
  },
};

const TransactionStatusContext =
  createContext<TransactionStatusContextValue | null>(null);

export function TransactionStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [txPhase, setTxPhase] = useState<TransactionPhase | undefined>(
    undefined
  );
  const [txType, setTxType] = useState<ZkusdEngineTransactionType | undefined>(
    undefined
  );
  const [txError, setTxError] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!!txType && txType in txTypeMap) {
      setTitle(txTypeMap[txType as keyof typeof txTypeMap].title);
    }
  }, [txType]);

  const resetTxStatus = async () => {
    setTxPhase(undefined);
    setTxType(undefined);
    setTitle("");
    setTxError(undefined);
    setTxHash(undefined);
  };

  return (
    <TransactionStatusContext.Provider
      value={{
        txPhase,
        setTxPhase,
        title,
        txType,
        setTxType,
        txError,
        setTxError,
        txHash,
        setTxHash,
        resetTxStatus,
      }}
    >
      {children}
    </TransactionStatusContext.Provider>
  );
}

export function useTransactionStatus() {
  const context = useContext(TransactionStatusContext);
  if (!context) {
    throw new Error(
      "useTransactionStatus must be used within a TransactionStatusProvider"
    );
  }
  return context;
}
