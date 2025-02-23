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
import { ErrorMessage, TransactionProgress } from "@/lib/components";
import { CircleCheck } from "lucide-react";
import { CircleX } from "lucide-react";
import { TxLifecycleStatus } from "@zkusd/core";

const TransactionStatus = () => {
  const { txStatus, title, resetTxStatus, txError } = useTransactionStatus();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!!txStatus && !open) {
      setOpen(true);
    }

    if (
      txStatus === TxLifecycleStatus.SUCCESS ||
      txStatus === TxLifecycleStatus.FAILED
    ) {
      setTimeout(() => {
        resetTxStatus();
        handleOpenChange(false);
      }, 3000);
    }
  }, [txStatus]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetTxStatus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className=""
        closable={false}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center h-20 gap-6 justify-center">
          {txStatus === TxLifecycleStatus.SUCCESS ? (
            <div className="w-20 h-20 flex items-center justify-center">
              <CircleCheck
                className="text-primary"
                size={70}
                strokeWidth={0.5}
              />
            </div>
          ) : txStatus === TxLifecycleStatus.FAILED ? (
            <div className="w-20 h-20 flex items-center justify-center">
              <CircleX className="text-danger" size={70} strokeWidth={0.5} />
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

        {txError ? (
          <ErrorMessage error={txError} />
        ) : (
          <DialogFooter className="w-full">
            {txStatus && <TransactionProgress status={txStatus} />}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionStatus;
