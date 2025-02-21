import React, { useEffect } from "react";
import { Button, Separator } from "@/lib/components/ui";
import { useAccount } from "@/lib/context/account";
import { formatDisplayAccount, formatMinaAmount } from "@/lib/utils/formatting";
import Image from "next/image";
import { useVaultManager } from "../context/vault-manager";

const ConnectWallet = () => {
  const { account, isConnected, disconnect, minaBalance } = useAccount();
  const { vaultsLoaded } = useVaultManager();

  return (
    <>
      {isConnected && vaultsLoaded ? (
        <div className="flex items-center gap-4">
          <div className="flex gap-4 bg-card border border-card-border rounded-lg p-2 font-mono text-xs tracking-[0.02em] text-white">
            <div className="">{formatDisplayAccount(account!.toBase58())}</div>
            <div className="flex-grow -my-2">
              <Separator orientation="vertical" />
            </div>
            <div className="flex gap-1">
              <Image src="/assets/mina.svg" alt="Mina" width={12} height={12} />
              <div className="mt-[3px] leading-none">
                {formatMinaAmount(minaBalance ?? 0n)}
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        // <Button onClick={connect}>Connect Wallet</Button>
        <></>
      )}
    </>
  );
};

export default ConnectWallet;
