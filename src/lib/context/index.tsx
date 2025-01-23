"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VaultProvider } from "./vault";
import { AccountProvider } from "./account";

import { VaultManagerProvider } from "./vault-manager";
import { ContractsProvider } from "./contracts";
import { PriceProvider } from "./price";

interface ProviderProps {
  children: React.ReactNode;
  initialState?: any;
}

const queryClient = new QueryClient();

export function Providers({ children, initialState }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ContractsProvider>
        <AccountProvider>
          <VaultManagerProvider>
            <VaultProvider>
              <PriceProvider>{children}</PriceProvider>
            </VaultProvider>
          </VaultManagerProvider>
        </AccountProvider>
      </ContractsProvider>
    </QueryClientProvider>
  );
}
