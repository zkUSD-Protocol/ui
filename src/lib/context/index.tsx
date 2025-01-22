"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CloudWorkerProvider } from "./cloud-worker";
import { VaultProvider } from "./vault";
import { AccountProvider } from "./account";
import { TransactionProvider } from "./transaction";
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
        <CloudWorkerProvider>
          <AccountProvider>
            <TransactionProvider>
              <VaultProvider>
                <VaultManagerProvider>
                  <PriceProvider>{children}</PriceProvider>
                </VaultManagerProvider>
              </VaultProvider>
            </TransactionProvider>
          </AccountProvider>
        </CloudWorkerProvider>
      </ContractsProvider>
    </QueryClientProvider>
  );
}
