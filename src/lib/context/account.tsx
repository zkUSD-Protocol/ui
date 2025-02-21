"use client";

import { PublicKey } from "o1js";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchMinaAccount } from "@zkusd/core";
import { useClient } from "./client";
import { useAccountState } from "../hooks/use-account-state";
import { useRouter } from "next/navigation";

interface AccountContextProps {
  account: PublicKey | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  minaBalance: bigint | null;
  zkusdBalance: bigint | null;
  refetchAccount: () => Promise<void>;
  accountInitialized: boolean;
}

const AccountContext = createContext<AccountContextProps | null>(null);

export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { zkusd } = useClient();
  const router = useRouter();
  const [account, setAccount] = useState<PublicKey | null>(null);
  const [minaBalance, setMinaBalance] = useState<bigint | null>(null);
  const [zkusdBalance, setZkusdBalance] = useState<bigint | null>(null);
  const [accountInitialized, setAccountInitialized] = useState(false);

  const { refetch: refetchAccountState } = useAccountState(
    account?.toBase58() ?? "",
    zkusd?.getTokenId("token") ?? 0
  );

  const refetchAccount = async () => {
    const { data: accountState } = await refetchAccountState();
    setMinaBalance(accountState?.minaBalance ?? null);
    setZkusdBalance(accountState?.zkusdBalance ?? null);
  };

  const connect = async () => {
    try {
      const accounts = await window.mina?.requestAccounts();
      if (!accounts || "code" in accounts) {
        throw new Error("No accounts found");
      }

      const publicKey = PublicKey.fromBase58(accounts[0]);
      //Lets fetch the balance of the account
      const minaAccount = await fetchMinaAccount({
        publicKey,
        force: true,
      });

      const zkusdAccount = await fetchMinaAccount({
        publicKey,
        tokenId: zkusd?.getTokenId("token") ?? 0,
        force: true,
      });

      setAccount(publicKey);
      setMinaBalance(minaAccount.account?.balance.toBigInt() ?? null);
      setZkusdBalance(zkusdAccount.account?.balance.toBigInt() ?? null);
      sessionStorage.setItem("wallet-connected", "true");
    } catch (error) {
      console.error("Failed to connect account:", error);
      throw error;
    } finally {
      setAccountInitialized(true);
    }
  };

  const disconnect = () => {
    setAccount(null);
    sessionStorage.setItem("wallet-connected", "false");
    router.push("/connect");
  };

  // Auto-connect on mount
  useEffect(() => {
    if (!zkusd) return;
    const isConnected = sessionStorage.getItem("wallet-connected") === "true";
    if (isConnected) {
      connect().catch(console.error);
    } else {
      setAccountInitialized(true);
      router.push("/");
    }
  }, [zkusd]);

  useEffect(() => {
    refetchAccount();
  }, [account]);

  return (
    <AccountContext.Provider
      value={{
        account,
        minaBalance,
        zkusdBalance,
        isConnected: !!account,
        connect,
        disconnect,
        refetchAccount,
        accountInitialized,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};
