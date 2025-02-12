"use client";
import type { Metadata } from "next";
import "../globals.css";
import { Header, TransactionStatus, VaultSelect } from "@/lib/components";
import { useAccount } from "@/lib/context/account";
import { useVaultManager } from "@/lib/context/vault-manager";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrice } from "@/lib/context/price";
import { formatMinaAmount } from "@/lib/utils/formatting";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnected } = useAccount();
  const { vaultAddresses } = useVaultManager();
  const { minaPrice, isLoading: isMinaPriceLoading } = usePrice();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && vaultAddresses.length > 0) {
      router.push(`/vault/${vaultAddresses[0]}`);
    }
  }, [isConnected]);

  return (
    <>
      <main className="min-h-screen flex flex-col py-8 px-6 justify-between">
        <Header />
        <div className="flex flex-col flex-1">{children}</div>
        <div className="flex flex-col gap-2">
          {!isMinaPriceLoading && (
            <div className="flex items-end gap-2">
              <div className="font-sans text-xs  tracking-[0.08em]">
                MINA Price:{" "}
              </div>
              <div className="font-mono text-sm tracking-[0.02em]">
                ${formatMinaAmount(minaPrice)}
              </div>
            </div>
          )}

          {isConnected && vaultAddresses.length > 0 && <VaultSelect />}
        </div>
      </main>
      <TransactionStatus />
    </>
  );
}
