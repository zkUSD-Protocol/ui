"use client";

import { PublicKey } from "o1js";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchMinaAccount } from "zkcloudworker";
import { useContracts } from "./contracts";
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
}

const AccountContext = createContext<AccountContextProps | null>(null);

export const AccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { token } = useContracts();
  const router = useRouter();
  const [account, setAccount] = useState<PublicKey | null>(null);
  const [minaBalance, setMinaBalance] = useState<bigint | null>(null);
  const [zkusdBalance, setZkusdBalance] = useState<bigint | null>(null);

  const { refetch: refetchAccountState } = useAccountState(
    account?.toBase58() ?? "",
    token.deriveTokenId()
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
        tokenId: token.deriveTokenId(),
        force: true,
      });

      setAccount(publicKey);
      setMinaBalance(minaAccount.account?.balance.toBigInt() ?? null);
      setZkusdBalance(zkusdAccount.account?.balance.toBigInt() ?? null);
      sessionStorage.setItem("wallet-connected", "true");

      console.log("ACCOUNT AND BALANCE SET");
    } catch (error) {
      console.error("Failed to connect account:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    sessionStorage.setItem("wallet-connected", "false");
    router.push("/");
  };

  // Auto-connect on mount
  useEffect(() => {
    const isConnected = sessionStorage.getItem("wallet-connected") === "true";
    if (isConnected) {
      connect().catch(console.error);
    }
  }, []);

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
