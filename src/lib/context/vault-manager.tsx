"use client";

import {
  TransactionPhase,
  type TransactionPhaseStatus,
  type TransactionStatusNew,
  ZkusdEngineTransactionType,
  fetchMinaAccount,
} from "@zkusd/core";
import { useRouter } from "next/navigation";
import { PrivateKey, PublicKey } from "o1js";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAccount } from "wagmina";
import { useClient } from "./client";
import { useTransactionStatus } from "./transaction-status";

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
  null,
);

export function VaultManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { zkusd } = useClient();
  const { address } = useAccount();
  const {
    setTxPhase,
    txPhase,
    setTxType,
    setTxError,
    setTxHash,
    txHash,
    txError,
  } = useTransactionStatus();
  const [vaultAddresses, setVaultAddresses] = useState<string[] | null>(null);
  const [vaultsLoaded, setVaultsLoaded] = useState(false);
  const txHashRef = useRef<string | undefined>(txHash);
  const txPhaseRef = useRef<TransactionPhase | undefined>(txPhase);
  const router = useRouter();
  // Load vaults from localStorage when the account changes.
  useEffect(() => {
    async function loadVaults() {
      if (!zkusd) return;
      if (!address) {
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
      const accountKey = address;
      const accountVaults = parsed[accountKey] || [];

      // Validate that each stored vault exists on the current network.
      const validVaults = await Promise.all(
        accountVaults.map(async (vaultAddress) => {
          try {
            const vaultAccount = await zkusd?.fetchVaultAccount(vaultAddress);
            return vaultAccount ? vaultAddress : null;
          } catch {
            return null;
          }
        }),
      );
      const filteredVaults = validVaults.filter(
        (addr): addr is string => addr !== null,
      );

      // Update localStorage if some vaults are no longer valid.
      if (filteredVaults.length !== accountVaults.length) {
        const updatedStorage = { ...parsed, [accountKey]: filteredVaults };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStorage));
      }
      setVaultAddresses(accountVaults);
      setVaultsLoaded(true);
    }
    loadVaults();
  }, [address, zkusd]);

  // Sync vaultAddresses state to localStorage whenever it changes.
  useEffect(() => {
    if (!address || vaultAddresses === null) return;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let parsed: StoredVaultData = {};
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing localStorage vaults:", error);
      }
    }
    parsed[address] = vaultAddresses || [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  }, [vaultAddresses, address]);

  useEffect(() => {
    txHashRef.current = txHash;
    txPhaseRef.current = txPhase;
  }, [txHash, txPhase]);

  // Generate a new vault address using a random private key.
  const generateVaultAddress = useCallback(() => {
    const vaultPrivateKey = PrivateKey.random();
    const vaultAddress = vaultPrivateKey.toPublicKey().toBase58();
    return { privateKey: vaultPrivateKey, address: vaultAddress };
  }, []);

  // Create a new vault and add its address to state.
  const createNewVault = useCallback(
    async (vaultPrivateKey: PrivateKey) => {
      if (!address || !zkusd) return;

      setTxType(ZkusdEngineTransactionType.CREATE_VAULT);

      const vaultAddress = vaultPrivateKey.toPublicKey().toBase58();

      setTxPhase(TransactionPhase.BUILDING);

      const minaAccount = await fetchMinaAccount({
        publicKey: PublicKey.fromBase58(address),
      });

      if (!minaAccount.account) {
        setTxError(
          "Mina account not found, you probably need to fund your account",
        );
        return;
      }

      const txHandle = await zkusd?.createVault(
        PublicKey.fromBase58(address),
        vaultPrivateKey,
        {
          extraSigners: [vaultPrivateKey],
        },
      );

      txHandle?.subscribeToLifecycle(
        async (lifecycle: TransactionStatusNew) => {
          const phase: TransactionPhase = lifecycle.phase;
          const status: TransactionPhaseStatus = lifecycle.status;
          if (txPhaseRef.current !== phase) {
            setTxPhase(phase);
          }

          if ((status === "FAILED" || status === "EXCEPTION") && !txError) {
            setTxError(
              `Error during ${phase} phase, please check the console for more details!`,
            );
            console.error(lifecycle);
          }

          if (txHandle.hash && !txHashRef.current) {
            setTxHash(txHandle.hash);
          }

          if (phase === TransactionPhase.INCLUDED) {
            setVaultAddresses((prev) =>
              Array.from(new Set([...(prev || []), vaultAddress])),
            );
            router.push(`/app/vault/${vaultAddress}`);
          }
        },
      );
    },
    [
      address,
      zkusd,
      setTxPhase,
      setTxError,
      setTxHash,
      setTxType,
      txError,
      router.push,
    ],
  );

  // Remove a vault address from state.
  const removeVaultAddress = useCallback((vaultAddress: string) => {
    setVaultAddresses((prev) =>
      prev ? prev.filter((addr) => addr !== vaultAddress) : [],
    );
  }, []);

  // Import a vault address after verifying its existence and ownership.
  const importVaultAddress = useCallback(
    async (vaultAddress: string): Promise<string | void> => {
      if (!address || !zkusd) return;
      try {
        const vaultState = await zkusd.getVaultState(vaultAddress);
        if (vaultState.owner.toBase58() !== address) {
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
    [address, zkusd],
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
      "useVaultManager must be used within a VaultManagerProvider",
    );
  }
  return context;
}
