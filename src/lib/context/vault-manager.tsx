"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PublicKey, PrivateKey, Mina, AccountUpdate } from "o1js";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useContracts } from "./contracts";
import { fetchMinaAccount } from "zkcloudworker";
import { VaultTransactionType, ZkUsdVault } from "zkusd";
import { VaultState } from "../types";
import { useAccount } from "./account";
import { prepareTransaction, signAndProve } from "../utils/transaction";
// or wherever you keep your engine instance
// (importing a single shared engine or constructing it once in the app)

interface VaultManagerContextProps {
  vaultAddresses: string[];
  generateVaultAddress: () => { privateKey: PrivateKey; address: string };
  createNewVault: (privateKey: PrivateKey) => Promise<void>;
  removeVaultAddress: (vaultAddress: string) => void;
  importVaultAddress: (vaultAddress: string) => void;
}

/**
 * Create a context for the vault manager
 */
const VaultManagerContext = createContext<VaultManagerContextProps | null>(
  null
);

/**
 * The provider that manages the local storage and on-chain caching
 */
export function VaultManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { engine, token } = useContracts();
  const [vaultAddresses, setVaultAddresses] = useState<string[]>([]);
  const { account } = useAccount();

  // On first load, read any vault addresses from localStorage.
  useEffect(() => {
    const stored = localStorage.getItem("zkusdVaults");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setVaultAddresses(parsed);
        }
      } catch (err) {
        console.error("Failed to parse zkusdVaults from localStorage", err);
      }
    }
  }, []);

  // Whenever vaultAddresses changes, persist them to localStorage
  useEffect(() => {
    localStorage.setItem("zkusdVaults", JSON.stringify(vaultAddresses));
  }, [vaultAddresses]);

  /**
   * Generate a new vault address from a random private key
   */
  const generateVaultAddress = useCallback(() => {
    const vaultPrivateKey = PrivateKey.random();
    const vaultAddress = vaultPrivateKey.toPublicKey().toBase58();
    return { privateKey: vaultPrivateKey, address: vaultAddress };
  }, []);

  /**
   * Create a new vault with a specific private key and track it in our local storage array
   */
  const createNewVault = useCallback(
    async (vaultPrivateKey: PrivateKey) => {
      try {
        const vaultAddress = vaultPrivateKey.toPublicKey().toBase58();

        // Create the vault using the provided private key
        const memo = VaultTransactionType.CREATE_VAULT;
        let newAccounts = 0;

        // Check to see if the user already has a zkusd token account
        await fetchMinaAccount({
          publicKey: account!,
          tokenId: token.deriveTokenId(),
        });

        if (!Mina.hasAccount(account!)) {
          newAccounts = 2;
        } else {
          newAccounts = 1;
        }

        // Prepare transaction
        const tx = await prepareTransaction(
          async () => {
            // Fund new accounts for deploying the vault
            AccountUpdate.fundNewAccount(account!, newAccounts);
            await engine.createVault(PublicKey.fromBase58(vaultAddress));
          },
          memo,
          account!
        );

        // Sign the transaction
        tx.sign([vaultPrivateKey]);

        // Broadcast
        const response = await signAndProve({
          task: VaultTransactionType.CREATE_VAULT,
          tx,
          memo,
          args: {
            vaultAddress,
            newAccounts,
          },
        });

        if (response.success) {
          // Add to tracked addresses only after successful creation
          setVaultAddresses((prev) =>
            Array.from(new Set([...prev, vaultAddress]))
          );
        } else {
          throw new Error(response.error || "Failed to create vault");
        }
      } catch (error) {
        console.error("Error creating vault:", error);
        throw error; // Re-throw to handle in the component
      }
    },
    [engine, token, account]
  );

  /**
   * We can easily remove a vault address from local storage if wanted.
   */
  const removeVaultAddress = useCallback((vaultAddress: string) => {
    setVaultAddresses((prev) => prev.filter((addr) => addr !== vaultAddress));
  }, []);

  /**
   * Import a new vault address to track
   */
  const importVaultAddress = useCallback((vaultAddress: string) => {
    setVaultAddresses((prev) => {
      // Check if address already exists
      if (prev.includes(vaultAddress)) {
        return prev;
      }
      // Add new address to array
      return [...prev, vaultAddress];
    });
  }, []);

  /**
   * Invalidate the vault's query after deposit, mint, or repay, etc.
   * e.g. queryClient.invalidateQueries(["vaultState", vaultAddress]);
   *
   * You can do this inside your depositCollateral or mintZkUsd calls
   * in the VaultProvider or right here if you want.
   */

  return (
    <VaultManagerContext.Provider
      value={{
        vaultAddresses,
        generateVaultAddress,
        createNewVault,
        removeVaultAddress,
        importVaultAddress,
      }}
    >
      {children}
    </VaultManagerContext.Provider>
  );
}

export function useVaultManager() {
  const ctx = useContext(VaultManagerContext);
  if (!ctx) {
    throw new Error(
      "useVaultManager must be used within a VaultManagerProvider"
    );
  }
  return ctx;
}
