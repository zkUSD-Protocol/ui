"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VaultProvider } from "./vault";

import { config } from "@lib/config";
import { WagminaProvider } from "wagmina";
import { ClientProvider } from "./client";
import { PriceProvider } from "./price";
import { TransactionStatusProvider } from "./transaction-status";
import { VaultManagerProvider } from "./vault-manager";

interface ProviderProps {
  children: React.ReactNode;
  initialState?: any;
}

const queryClient = new QueryClient();

export function Providers({ children, initialState }: ProviderProps) {
  return (
    <WagminaProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ClientProvider>
          <TransactionStatusProvider>
            <PriceProvider>
              <VaultManagerProvider>
                <VaultProvider>{children}</VaultProvider>
              </VaultManagerProvider>
            </PriceProvider>
          </TransactionStatusProvider>
        </ClientProvider>
      </QueryClientProvider>
    </WagminaProvider>
  );
}
