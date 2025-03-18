"use client";

import { ProjectedInfo, VaultActions, VaultSelect } from "@/lib/components";
import { VaultOverview } from "@/lib/components/";
import { useClient } from "@/lib/context/client";
import { usePrice } from "@/lib/context/price";
import { useVault } from "@/lib/context/vault";
import { useVaultManager } from "@/lib/context/vault-manager";
import { formatMinaAmount } from "@/lib/utils/formatting";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmina";

export default function VaultPage() {
  const { address }: { address: string } = useParams();
  const { initVault } = useVault();
  const { address: userAddress } = useAccount();
  const { zkusd } = useClient();
  const { vaultAddresses } = useVaultManager();
  const { minaPrice, isLoading: isMinaPriceLoading } = usePrice();

  useEffect(() => {
    const loadVault = async () => {
      if (!zkusd || !userAddress) return;

      await initVault(address);
    };

    loadVault();
  }, [address, zkusd, userAddress, initVault]);

  return (
    <>
      {userAddress && (
        <>
          <div className="mt-16 flex flex-col-reverse max-w-5xl w-full mx-auto md:h-[540px] my-auto gap-6 md:flex-row ">
            <div className="flex-1 flex flex-col gap-2">
              <VaultActions />
              <ProjectedInfo />
            </div>
            <div className="flex-1">
              <VaultOverview />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-5 sm:mt-0">
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

            {userAddress && vaultAddresses && vaultAddresses.length > 0 && (
              <VaultSelect />
            )}
          </div>
        </>
      )}
    </>
  );
}
