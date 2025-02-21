"use client";
import type { Metadata } from "next";
import "../globals.css";
import { Header, TransactionStatus, VaultSelect } from "@/lib/components";
import { useAccount } from "@/lib/context/account";
import { useVaultManager } from "@/lib/context/vault-manager";
import { usePrice } from "@/lib/context/price";
import { formatMinaAmount } from "@/lib/utils/formatting";
import AppRouting from "@/lib/components/AppInitializer";
import AppInitializer from "@/lib/components/AppInitializer";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="min-h-screen flex flex-col py-8 px-6 justify-between">
        <Header />
        <div className="flex flex-col flex-1">
          <AppInitializer>{children}</AppInitializer>
        </div>
      </main>
      <TransactionStatus />
    </>
  );
}
