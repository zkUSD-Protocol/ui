"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NatsConnection, wsconnect } from "@nats-io/nats-core";
import { TxLifecycleStatus, VaultTransactionType } from "zkusd";

interface TransactionStatusContextValue {
  txStatus: TxLifecycleStatus | undefined;
  setTxStatus: (txStatus: TxLifecycleStatus | undefined) => void;
  txType: VaultTransactionType | undefined;
  setTxType: (txType: VaultTransactionType | undefined) => void;
  txError: string | undefined;
  setTxError: (txError: string | undefined) => void;
  title: string;
  resetTxStatus: () => Promise<void>;
}

const txTypeMap: Record<
  VaultTransactionType,
  {
    title: string;
  }
> = {
  [VaultTransactionType.CREATE_VAULT]: {
    title: "Creating new vault",
  },
  [VaultTransactionType.DEPOSIT_COLLATERAL]: {
    title: "Depositing collateral",
  },
  [VaultTransactionType.REDEEM_COLLATERAL]: {
    title: "Withdrawing collateral",
  },
  [VaultTransactionType.MINT_ZKUSD]: {
    title: "Minting zkUSD",
  },
  [VaultTransactionType.BURN_ZKUSD]: {
    title: "Repaying zkUSD",
  },
  [VaultTransactionType.LIQUIDATE]: {
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
  const [txType, setTxType] = useState<VaultTransactionType | undefined>(
    undefined
  );
  const [txError, setTxError] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (!!txType) {
      setTitle(txTypeMap[txType].title);
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
