"use client";
import { CreateVault, ErrorMessage, ImportVault } from "@/lib/components";
import ConnectingWallet from "@/lib/components/ConnectingWallet";
import { Card, Button } from "@/lib/components/ui";
import { useAccount } from "@/lib/context/account";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ConnectPage = () => {
  const { connect, isConnected } = useAccount();
  const router = useRouter();
  const [isConnectingWalletOpen, setIsConnectingWalletOpen] = useState(false);
  const [error, setError] = useState("");
  const handleConnect = async () => {
    try {
      await connect();
      setIsConnectingWalletOpen(true);
      // Navigate immediately after a successful connection
      router.push("/onboarding"); // or wherever you want to route the user
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("No accounts found")
      ) {
        setError(
          "We can't detect a wallet. <a href='https://chromewebstore.google.com/detail/auro-wallet/cnmamaachppnkjgnildpdmkaakejnhae?hl=en' target='_blank' rel='noopener noreferrer' class='underline text-blue-400 hover:text-blue-300'>Get Auro Wallet here.</a>"
        );
      }
    }
  };

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

              <Button className="w-fit" onClick={handleConnect}>
                Connect Wallet
              </Button>
              {error && <ErrorMessage error={error} />}
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
