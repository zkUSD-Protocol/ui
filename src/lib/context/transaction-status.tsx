"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TxLifecycleStatus, ZkusdEngineTransactionType } from "@zkusd/core";

interface TransactionStatusContextValue {
  txStatus: TxLifecycleStatus | undefined;
  setTxStatus: (txStatus: TxLifecycleStatus | undefined) => void;
  txType: ZkusdEngineTransactionType | undefined;
  setTxType: (txType: ZkusdEngineTransactionType | undefined) => void;
  txError: string | undefined;
  setTxError: (txError: string | undefined) => void;
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
  [ZkusdEngineTransactionType.LIQUIDATE]: {
    title: "Liquidating vault",
  },
};

const TransactionStatusContext =
  createContext<TransactionStatusContextValue | null>(null);

export function TransactionStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [txStatus, setTxStatus] = useState<TxLifecycleStatus | undefined>(
    undefined
  );
  const [txType, setTxType] = useState<ZkusdEngineTransactionType | undefined>(
    undefined
  );
  const [txError, setTxError] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (!!txType && txType in txTypeMap) {
      setTitle(txTypeMap[txType as keyof typeof txTypeMap].title);
    }
  }, [txType]);

  const resetTxStatus = async () => {
    setTxStatus(undefined);
    setTxType(undefined);
    setTitle("");
    setTxError(undefined);
  };

  return (
    <TransactionStatusContext.Provider
      value={{
        txStatus,
        setTxStatus,
        title,
        txType,
        setTxType,
        txError,
        setTxError,
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
