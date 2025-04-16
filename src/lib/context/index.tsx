"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VaultProvider } from "./vault";

import { config } from "@lib/config";
import { WagminaProvider } from "wagmina";
import { ClientProvider } from "./client";
import { PriceProvider } from "./price";
import { TransactionStatusProvider } from "./transaction-status";
import { VaultManagerProvider } from "./vault-manager";

import { metadata, networks, projectId, wagminaAdapter } from "@lib/config";
import { createAppKit } from "@reown/appkit/react";

interface ProviderProps {
  children: React.ReactNode;
  initialState?: any;
}

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Create modal
createAppKit({
  adapters: [wagminaAdapter],
  themeMode: "dark",
  connectorImages: {
    "com.aurowallet":
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik05MCAwSDEwQzQuNDc3MTUgMCAwIDQuNDc3MTUgMCAxMFY5MEMwIDk1LjUyMjkgNC40NzcxNSAxMDAgMTAgMTAwSDkwQzk1LjUyMjkgMTAwIDEwMCA5NS41MjI5IDEwMCA5MFYxMEMxMDAgNC40NzcxNSA5NS41MjI5IDAgOTAgMFoiIGZpbGw9IiM1OTRBRjEiLz4KPHBhdGggZD0iTTUwLjAwNzYgMTguMDk5NkM1NS42NDc2IDE4LjA5OTYgNjAuNTY3NiAxOS4yMDk2IDY0Ljc2NzYgMjEuNDI5NkM2OC45Njc2IDIzLjY0OTYgNzIuMjA3NiAyNi45NDk2IDc0LjQ4NzYgMzEuMzI5NkM3Ni44Mjc2IDM1LjY0OTYgNzcuOTk3NiA0MC44OTk2IDc3Ljk5NzYgNDcuMDc5NlY4MS45OTk2SDY2LjI5NzZWNjUuNzk5NkgzMy41Mzc2VjgxLjk5OTZIMjIuMDE3NlY0Ny4wNzk2QzIyLjAxNzYgNDAuODk5NiAyMy4xNTc2IDM1LjY0OTYgMjUuNDM3NiAzMS4zMjk2QzI3Ljc3NzYgMjYuOTQ5NiAzMS4wNDc2IDIzLjY0OTYgMzUuMjQ3NiAyMS40Mjk2QzM5LjQ0NzYgMTkuMjA5NiA0NC4zNjc2IDE4LjA5OTYgNTAuMDA3NiAxOC4wOTk2Wk02Ni4yOTc2IDU1Ljk4OTZWNDUuOTk5NkM2Ni4yOTc2IDQwLjE3OTYgNjQuODU3NiAzNS43OTk2IDYxLjk3NzYgMzIuODU5NkM1OS4wOTc2IDI5Ljg1OTYgNTUuMDc3NiAyOC4zNTk2IDQ5LjkxNzYgMjguMzU5NkM0NC43NTc2IDI4LjM1OTYgNDAuNzM3NiAyOS44NTk2IDM3Ljg1NzYgMzIuODU5NkMzNC45Nzc2IDM1Ljc5OTYgMzMuNTM3NiA0MC4xNzk2IDMzLjUzNzYgNDUuOTk5NlY1NS45ODk2SDY2LjI5NzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  },
  // themeVariables: {
  //   "--w3m-color-mix": "#000000",
  //   "--w3m-accent": "#000000",
  // },
  features: {
    socials: false,
    email: false,
  },
  enableWalletConnect: false,
  projectId,
  metadata,
  networks,
});

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
