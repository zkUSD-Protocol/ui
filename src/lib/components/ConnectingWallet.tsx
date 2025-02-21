"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useTransactionStatus } from "@/lib/context/transaction-status";
import FadeLoader from "react-spinners/FadeLoader";
import { CircleCheck } from "lucide-react";
import { useVaultManager } from "../context/vault-manager";

type ConnectingWalletProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ConnectingWallet = ({ open, onOpenChange }: ConnectingWalletProps) => {
  const { vaultsLoaded } = useVaultManager();

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  useEffect(() => {
    if (vaultsLoaded) {
      setTimeout(() => {
        handleOpenChange(false);
      }, 3000);
    }
  }, [vaultsLoaded]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className=""
        closable={false}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="">Connecting Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex items-center h-20 gap-6 justify-center">
          {vaultsLoaded ? (
            <div className="w-20 h-20 flex items-center justify-center">
              <CircleCheck
                className="text-primary"
                size={70}
                strokeWidth={0.5}
              />
            </div>
          ) : (
            <div className="relative w-20 h-20 flex items-center justify-center">
              <FadeLoader
                cssOverride={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(0, -10%)",
                }}
                color="hsl(var(--primary))"
                loading={true}
                width={1}
                height={10}
                margin={0}
                radius={2}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectingWallet;
