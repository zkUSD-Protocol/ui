"use client";
import { Header, TransactionStatus } from "@/lib/components";
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
