"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Mina, PublicKey, UInt32 } from "o1js";
import {
  ZkUsdEngineContract,
  oracleAggregationVk,
  FungibleTokenContract,
} from "zkusd";
import { blockchain, initBlockchain } from "zkcloudworker";

/**
 * Define the shape of what's in your contracts context.
 * If you have multiple contract instances, include them here.
 */
interface ContractsContextValue {
  engine: InstanceType<ReturnType<typeof ZkUsdEngineContract>> | null;
  token: InstanceType<ReturnType<typeof FungibleTokenContract>> | null;
  networkInitialized: boolean;
}

/**
 * Create a React context that will store your contract instances.
 */
const ContractsContext = createContext<ContractsContextValue | null>(null);

/**
 * The provider that initializes the Mina network instance (if needed)
 * and creates the contract instances, exposing them to the React tree.
 */
export function ContractsProvider({ children }: { children: React.ReactNode }) {
  // Example: If you need to set the active instance for Mina:
  // e.g. Mina.setActiveInstance(Mina.LocalBlockchain()); or some testnet config.

  const [networkInitialized, setNetworkInitialized] = useState(false);

  useEffect(() => {
    const initializeNetwork = async () => {
      await initBlockchain(process.env.NEXT_PUBLIC_CHAIN! as blockchain);
      setNetworkInitialized(true);
    };
    initializeNetwork();
  }, []);

  const contracts = useMemo(() => {
    if (!networkInitialized) {
      return { engine: null, token: null, networkIsInitialized: false };
    }
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
    const engineAddress = process.env.NEXT_PUBLIC_ENGINE_ADDRESS;
    if (!tokenAddress || !engineAddress) {
      throw new Error(
        "Missing environment variables for engine contract addresses"
      );
    }
    const ZkUsdEngine = ZkUsdEngineContract({
      zkUsdTokenAddress: PublicKey.fromBase58(tokenAddress),
      minaPriceInputZkProgramVkHash: oracleAggregationVk.hash,
    });
    const FungibleToken = ZkUsdEngine.FungibleToken;

    const engine = new ZkUsdEngine(PublicKey.fromBase58(engineAddress));
    const token = new FungibleToken(PublicKey.fromBase58(tokenAddress));

    return { engine, token };
  }, [networkInitialized]);

  return (
    <ContractsContext.Provider value={{ ...contracts, networkInitialized }}>
      {children}
    </ContractsContext.Provider>
  );
}

/**
 * A simple hook to access your contract instances.
 */
export function useContracts() {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error("useContracts must be called inside a ContractsProvider");
  }
  return context;
}
