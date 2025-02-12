"use client";

import { ProjectedInfo, VaultActions } from "@/lib/components";
import { useVault } from "@/lib/context/vault";
import { useEffect } from "react";
import { VaultOverview } from "@/lib/components/";
import { useAccount } from "@/lib/context/account";
import { useRouter } from "next/navigation";

export default function VaultPage({ params }: { params: { address: string } }) {
  const { initVault } = useVault();
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    initVault(params.address);
  }, [params.address]);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected]);

  return (
    <>
      {isConnected && (
        <div className="flex max-w-5xl w-full mx-auto h-[540px] my-auto gap-6 ">
          <div className="flex-1 flex flex-col gap-2">
            <VaultActions />
            <ProjectedInfo />
          </div>
          <div className="flex-1">
            <VaultOverview />
          </div>
        </div>
      )}
    </>
  );
}
