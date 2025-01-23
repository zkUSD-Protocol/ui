"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLatestProof } from "../hooks/use-latest-proof";

interface PriceContextProps {
  minaPrice: bigint;
  isLoading: boolean;
  error: Error | null;
}

const PriceContext = createContext<PriceContextProps | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [minaPrice, setMinaPrice] = useState<bigint>(BigInt(1e9)); // Default to $1
  const { data: latestProof, isLoading, error } = useLatestProof();

  useEffect(() => {
    if (latestProof?.publicOutput.minaPrice.priceNanoUSD) {
      setMinaPrice(
        BigInt(latestProof.publicOutput.minaPrice.priceNanoUSD.toString())
      );
    }
  }, [latestProof]);

  return (
    <PriceContext.Provider
      value={{
        minaPrice,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePrice must be used within a PriceProvider");
  }
  return context;
}
