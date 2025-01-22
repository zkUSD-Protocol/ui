"use client";

import {
  VaultDetailCard,
  VaultCard,
  VaultInteractions,
} from "@/lib/components";
import { useVaultManager } from "@/lib/context/vault-manager";
import { Button } from "@/lib/components/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VaultPage({ params }: { params: { address: string } }) {
  const { getVaultQuery } = useVaultManager();
  const { data, isLoading, isError } = getVaultQuery(params.address);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Vault Details</h1>
      </div>

      <VaultDetailCard
        vaultAddress={params.address}
        vaultData={data}
        isLoading={isLoading}
        isError={isError}
      />

      <VaultInteractions vaultAddress={params.address} />
    </div>
  );
}
