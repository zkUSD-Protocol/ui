"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NatsConnection, wsconnect } from "@nats-io/nats-core";
import { TxLifecycleStatus, VaultTransactionType } from "zkusd";

interface TransactionStatusContextValue {
  txStatus: TxLifecycleStatus | undefined;
  setTxStatus: (txStatus: TxLifecycleStatus | undefined) => void;
  listen: (txId: string) => Promise<void>;
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
  const [natsConnection, setNatsConnection] = useState<NatsConnection | null>(
    null
  );

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
    if (natsConnection && !natsConnection.isClosed()) {
      await natsConnection.drain();
      setNatsConnection(null);
    }
  };

  async function listen(txId: string): Promise<void> {
    try {
      const natsServer = process.env.NEXT_PUBLIC_NATS_SERVER;
      if (!natsServer) {
        throw new Error("NATS server not configured");
      }
      // Connect to the NATS server.
      const nc: NatsConnection = await wsconnect({ servers: natsServer });
      setNatsConnection(nc);

      //Drain the connection after 5 mins if its not already drained
      setTimeout(async () => {
        if (!nc.isClosed()) {
          console.log("Draining connection after timeout");
          await nc.drain();
          setNatsConnection(null);
        }
      }, 5 * 60 * 1000);

      nc.subscribe(txId, {
        callback: async (err, msg) => {
          if (err) {
            console.error("Error subscribing to transaction:", err);
          } else {
            // Convert the received Uint8Array to a UTF-8 string.
            const decoder = new TextDecoder("utf-8");
            const messageString = decoder.decode(msg.data);
            try {
              const parsedData = JSON.parse(messageString);
              setTxStatus(parsedData.status as TxLifecycleStatus);

              if (
                parsedData.status === TxLifecycleStatus.SUCCESS ||
                parsedData.status === TxLifecycleStatus.FAILED
              ) {
                await nc.drain();
              }
            } catch (parseError) {
              console.error("Error parsing message JSON:", parseError);
            }
          }
        },
      });
    } catch (error) {
      console.error("Error listening to transaction via Nats:", error);
    }
  }

  return (
    <TransactionStatusContext.Provider
      value={{
        txStatus,
        setTxStatus,
        listen,
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
