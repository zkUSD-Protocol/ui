"use client";
import { CreateVault, ImportVault } from "@/lib/components";
import ConnectingWallet from "@/lib/components/ConnectingWallet";
import { Card, Button } from "@/lib/components/ui";
import { useAccount } from "@/lib/context/account";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ConnectPage = () => {
  const { connect, isConnected } = useAccount();
  const router = useRouter();
  const [isConnectingWalletOpen, setIsConnectingWalletOpen] = useState(false);
  const handleConnect = async () => {
    try {
      await connect();
      setIsConnectingWalletOpen(true);
      // Navigate immediately after a successful connection
      router.push("/onboarding"); // or wherever you want to route the user
    } catch (error) {
      console.error("Failed to connect:", error);
      // Optionally, show an error message here
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full mt-32">
        <div className="flex flex-col gap-6">
          <h1 className="text-left font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
            Connect Wallet
          </h1>
          <Card className="p-8 w-full sm:w-[464px]">
            <div className="flex flex-col gap-4">
              <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
                Connect your wallet to get started
              </p>

              <Button className="w-fit" onClick={handleConnect}>
                Connect Wallet
              </Button>
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
