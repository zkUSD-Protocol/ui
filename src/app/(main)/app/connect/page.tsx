"use client";
import { ErrorMessage } from "@/lib/components";
import ConnectingWallet from "@/lib/components/ConnectingWallet";
import { Button, Card } from "@/lib/components/ui";
import { network } from "@lib/config";
import { useAppKit } from "@reown/appkit/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConnectors,
  useNetworkId,
  useSwitchChain,
} from "wagmina";

const ConnectPage = () => {
  const connectors = useConnectors();
  const auroWalletConnector = useMemo(
    () => connectors.find((c) => c.id === "com.aurowallet"),
    [connectors],
  );

  const { isConnected } = useAccount();
  const { switchChain, status: switchChainStatus } = useSwitchChain();
  const networkId = useNetworkId();

  const [isConnectingWalletOpen, setIsConnectingWalletOpen] = useState(false);

  const { open } = useAppKit();

  useEffect(() => {
    if (auroWalletConnector) {
      open();
    }
  }, [auroWalletConnector, open]);

  const handleConnect = useCallback(async () => {
    if (networkId !== network.id && switchChainStatus !== "pending") {
      switchChain({
        networkId: network.id,
      });
    } else {
      open();
    }
  }, [open, networkId, switchChainStatus, switchChain]);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full mt-32">
        <div className="flex flex-col gap-6">
          <h1 className="text-center sm:text-left font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
            Connect Wallet
          </h1>
          <Card className="p-8 w-full sm:w-[464px]">
            <div className="items-center sm:items-start flex flex-col gap-4">
              <p className="text-center sm:text-left text-white font-sans leading-[24px] tracking-[0.06em]">
                Connect your wallet to get started
              </p>
              {auroWalletConnector ? (
                <Button className="w-fit" onClick={handleConnect}>
                  {isConnected ? "Switch Network" : "Connect Wallet"}
                </Button>
              ) : (
                <ErrorMessage
                  error={
                    "We can't detect a wallet. <a href='https://chromewebstore.google.com/detail/auro-wallet/cnmamaachppnkjgnildpdmkaakejnhae?hl=en' target='_blank' rel='noopener noreferrer' class='underline text-blue-400 hover:text-blue-300'>Get Auro Wallet here.</a>"
                  }
                />
              )}
            </div>
          </Card>
        </div>
      </div>
      <ConnectingWallet
        open={isConnectingWalletOpen}
        onOpenChange={setIsConnectingWalletOpen}
      />
    </>
  );
};

export default ConnectPage;

// npm install @reown/appkit@^1.6.9 @reown/appkit-common@^1.6.9 @reown/appkit-core@^1.6.9 @reown/appkit-utils@^1.6.9 @reown/appkit-wallet@^1.6.9
