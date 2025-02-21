"use client";

import { ProjectedInfo, VaultActions, VaultSelect } from "@/lib/components";
import { useVault } from "@/lib/context/vault";
import { useEffect, useState } from "react";
import { VaultOverview } from "@/lib/components/";
import { useAccount } from "@/lib/context/account";
import { useRouter } from "next/navigation";
import { useClient } from "@/lib/context/client";
import { usePrice } from "@/lib/context/price";
import { useVaultManager } from "@/lib/context/vault-manager";
import { formatMinaAmount } from "@/lib/utils/formatting";

export default function VaultPage({ params }: { params: { address: string } }) {
  const { initVault, vault } = useVault();
  const { isConnected, account } = useAccount();
  const { zkusd } = useClient();
  const router = useRouter();
  const { vaultAddresses } = useVaultManager();
  const { minaPrice, isLoading: isMinaPriceLoading } = usePrice();

  useEffect(() => {
    const loadVault = async () => {
      if (!zkusd || !account) return;

      await initVault(params.address);
    };

    loadVault();
  }, [params.address, zkusd, account]);

  return (
    <>
      {isConnected && (
        <>
          <div className="flex max-w-5xl w-full mx-auto h-[540px] my-auto gap-6 ">
            <div className="flex-1 flex flex-col gap-2">
              <VaultActions />
              <ProjectedInfo />
            </div>
            <div className="flex-1">
              <VaultOverview />
            </div>
          </div>
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

            {isConnected && vaultAddresses && vaultAddresses.length > 0 && (
              <VaultSelect />
            )}
          </div>
        </>
      )}
    </>
  );
}
