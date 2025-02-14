"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PublicKey, PrivateKey, AccountUpdate } from "o1js";
import { useContracts } from "./contracts";
import { fetchMinaAccount } from "zkcloudworker";
import { Vault, VaultTransactionType } from "zkusd";
import { useAccount } from "./account";
import { prepareTransaction, signAndProve } from "../utils/transaction";
import { useTransactionStatus } from "./transaction-status";
import { useRouter } from "next/navigation";

interface VaultManagerContextProps {
  vaultAddresses: string[] | null;
  generateVaultAddress: () => { privateKey: PrivateKey; address: string };
  createNewVault: (privateKey: PrivateKey) => Promise<void>;
  removeVaultAddress: (vaultAddress: string) => void;
  importVaultAddress: (vaultAddress: string) => Promise<string | void>;
  vaultsLoaded: boolean;
}

interface StoredVaultData {
  [accountAddress: string]: string[]; // Maps account addresses to their vault addresses
}

const LOCAL_STORAGE_KEY = "zkusdVaults";

const VaultManagerContext = createContext<VaultManagerContextProps | null>(
  null
);

export function VaultManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { engine, token } = useContracts();
  const { account, accountInitialized } = useAccount();
  const { setTxStatus, listen, setTxType, setTxError } = useTransactionStatus();
  const router = useRouter();

  const [vaultAddresses, setVaultAddresses] = useState<string[] | null>(null);
  const [vaultsLoaded, setVaultsLoaded] = useState(false);

  // Load vaults from localStorage when the account changes.
  useEffect(() => {
    async function loadVaults() {
      if (!account) {
        setVaultAddresses([]);
        setVaultsLoaded(true);
        return;
      }
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let parsed: StoredVaultData = {};
      if (stored) {
        try {
          parsed = JSON.parse(stored);
        } catch (error) {
          console.error("Error parsing vaults from localStorage:", error);
          parsed = {};
        }
      }
      const accountKey = account.toBase58();
      const accountVaults = parsed[accountKey] || [];

      // Validate that each stored vault exists on the current network.
      const validVaults = await Promise.all(
        accountVaults.map(async (address) => {
          try {
            const vaultAccount = await fetchMinaAccount({
              publicKey: PublicKey.fromBase58(address),
              tokenId: engine?.deriveTokenId(),
            });
            return vaultAccount.account ? address : null;
          } catch {
            return null;
          }
        })
      );
      const filteredVaults = validVaults.filter(
        (addr): addr is string => addr !== null
      );

      // Update localStorage if some vaults are no longer valid.
      if (filteredVaults.length !== accountVaults.length) {
        const updatedStorage = { ...parsed, [accountKey]: filteredVaults };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStorage));
      }
      setVaultAddresses(filteredVaults);
      setVaultsLoaded(true);
    }
    loadVaults();
  }, [account, accountInitialized, engine]);

  // Sync vaultAddresses state to localStorage whenever it changes.
  useEffect(() => {
    if (!account) return;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let parsed: StoredVaultData = {};
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing localStorage vaults:", error);
      }
    }
    parsed[account.toBase58()] = vaultAddresses || [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  }, [vaultAddresses, account]);

  // Generate a new vault address using a random private key.
  const generateVaultAddress = useCallback(() => {
    const vaultPrivateKey = PrivateKey.random();
    const vaultAddress = vaultPrivateKey.toPublicKey().toBase58();
    return { privateKey: vaultPrivateKey, address: vaultAddress };
  }, []);

  // Create a new vault and add its address to state.
  const createNewVault = useCallback(
    async (vaultPrivateKey: PrivateKey) => {
      if (!account || !engine || !token) return;
      try {
        setTxType(VaultTransactionType.CREATE_VAULT);
        const txId = PrivateKey.random().toBase58();
        await listen(txId);
        const vaultAddress = vaultPrivateKey.toPublicKey().toBase58();
        const memo = VaultTransactionType.CREATE_VAULT;

        // Determine the number of new accounts needed.
        const zkusdTokenAccount = await fetchMinaAccount({
          publicKey: account,
          tokenId: token.deriveTokenId(),
        });
        const newAccounts = zkusdTokenAccount.account ? 1 : 2;

        // Prepare and sign the transaction.
        const tx = await prepareTransaction(
          async () => {
            AccountUpdate.fundNewAccount(account, newAccounts);
            await engine.createVault(PublicKey.fromBase58(vaultAddress));
          },
          memo,
          account
        );
        tx.sign([vaultPrivateKey]);

        // Broadcast the transaction.
        const response = await signAndProve({
          task: VaultTransactionType.CREATE_VAULT,
          tx,
          memo,
          args: { transactionId: txId, vaultAddress, newAccounts },
          setTxStatus,
          setTxError,
        });

        const responseData = JSON.parse(response.data);
        if (responseData.txStatus === "Included") {
          // Update state with the new vault.
          setVaultAddresses((prev) =>
            Array.from(new Set([...(prev || []), vaultAddress]))
          );
          router.push(`/vault/${vaultAddress}`);
        } else {
          throw new Error(response.error || "Failed to create vault");
        }
      } catch (error) {
        console.error("Error creating vault:", error);
        throw error;
      }
    },
    [account, engine, token, listen, setTxType, setTxStatus, setTxError, router]
  );

  // Remove a vault address from state.
  const removeVaultAddress = useCallback((vaultAddress: string) => {
    setVaultAddresses((prev) =>
      prev ? prev.filter((addr) => addr !== vaultAddress) : []
    );
  }, []);

  // Import a vault address after verifying its existence and ownership.
  const importVaultAddress = useCallback(
    async (vaultAddress: string): Promise<string | void> => {
      if (!account || !engine) return;
      try {
        const vaultAccount = await fetchMinaAccount({
          publicKey: PublicKey.fromBase58(vaultAddress),
          tokenId: engine.deriveTokenId(),
        });
        if (!vaultAccount.account) {
          return "Vault not found";
        }
        const vaultState = Vault.fromAccount(vaultAccount.account);
        if (vaultState.owner.toBase58() !== account.toBase58()) {
          return "You are not the owner of this vault";
        }
        setVaultAddresses((prev) => {
          if (prev && prev.includes(vaultAddress)) return prev;
          return [...(prev || []), vaultAddress];
        });
      } catch (error) {
        console.error("Failed to import vault:", error);
        throw error;
      }
    },
    [account, engine]
  );

  return (
    <VaultManagerContext.Provider
      value={{
        vaultAddresses,
        generateVaultAddress,
        createNewVault,
        removeVaultAddress,
        importVaultAddress,
        vaultsLoaded,
      }}
    >
      {children}
    </VaultManagerContext.Provider>
  );
}

export function useVaultManager() {
  const context = useContext(VaultManagerContext);
  if (!context) {
    throw new Error(
      "useVaultManager must be used within a VaultManagerProvider"
    );
  }
  return context;
}
