"use client";
import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/lib/components";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="flex flex-col flex-grow px-3 py-8 sm:px-5 lg:px-14 lg:py-10 overflow-x-hidden">
        {children}
      </div>
    </main>
  );
}
