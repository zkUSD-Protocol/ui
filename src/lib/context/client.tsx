"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { blockchain, ZKUSDClient } from "@zkusd/core";
/**
 * Define the shape of what's in your contracts context.
 * If you have multiple contract instances, include them here.
 */
interface ClientContextValue {
  zkusd: ZKUSDClient | null;
}

/**
 * Create a React context that will store your contract instances.
 */
const ClientContext = createContext<ClientContextValue | null>(null);

/**
 * The provider that initializes the Mina network instance (if needed)
 * and creates the contract instances, exposing them to the React tree.
 */
export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [zkusd, setZkusd] = useState<ZKUSDClient | null>(null);

  useEffect(() => {
    const initializeNetwork = async () => {
      console.log("Initializing network, chain", process.env.NEXT_PUBLIC_CHAIN);
      const client = await ZKUSDClient.create({
        chain: process.env.NEXT_PUBLIC_CHAIN! as blockchain,
        httpProver: process.env.NEXT_PUBLIC_PROVER_URL!,
      });
      setZkusd(client);
    };
    initializeNetwork();
  }, []);

  return (
    <ClientContext.Provider value={{ zkusd }}>
      {children}
    </ClientContext.Provider>
  );
}

/**
 * A simple hook to access your contract instances.
 */
export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be called inside a ClientProvider");
  }
  return context;
}
