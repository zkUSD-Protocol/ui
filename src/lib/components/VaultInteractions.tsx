"use client";

import React from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui";
import { useVault } from "@/lib/context/vault";
import { useAccount } from "@/lib/context/account";
import { useState } from "react";
import { PublicKey, UInt64 } from "o1js";
import { CloudWorkerResponse } from "../types";
import { toRawMinaAmount } from "../utils";

interface VaultInteractionsProps {
  vaultAddress: string;
}

const VaultInteractions = ({ vaultAddress }: VaultInteractionsProps) => {
  const { isConnected } = useAccount();
  const {
    depositCollateral,
    mintZkUsd,
    burnZkUsd,
    redeemCollateral,
    liquidate,
  } = useVault();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (
    action: (address: PublicKey, amount: UInt64) => Promise<CloudWorkerResponse>
  ) => {
    if (!amount) return;
    setIsLoading(true);
    try {
      await action(
        PublicKey.fromBase58(vaultAddress),
        new UInt64(toRawMinaAmount(amount))
      );
      setAmount("");
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="repay">Repay</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="liquidate">Liquidate</TabsTrigger>
        </TabsList>

        <div className="px-5 py-5">
          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Deposit Collateral</h3>
              <p className="text-sm text-muted-foreground">
                Deposit MINA as collateral to borrow zkUSD
              </p>
              <div className="flex gap-2 w-1/3">
                <Input
                  type="number"
                  placeholder="Amount in MINA"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  onClick={() => handleAction(depositCollateral)}
                  disabled={!isConnected || isLoading || !amount}
                >
                  {isLoading ? "Depositing..." : "Deposit"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="borrow" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Borrow zkUSD</h3>
              <p className="text-sm text-muted-foreground">
                Borrow zkUSD against your deposited collateral
              </p>
              <div className="flex gap-2 w-1/3">
                <Input
                  type="number"
                  placeholder="Amount in zkUSD"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  onClick={() => handleAction(mintZkUsd)}
                  disabled={!isConnected || isLoading || !amount}
                >
                  {isLoading ? "Borrowing..." : "Borrow"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="repay" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Repay Debt</h3>
              <p className="text-sm text-muted-foreground">
                Repay your zkUSD debt to improve your health factor
              </p>
              <div className="flex gap-2 w-1/3">
                <Input
                  type="number"
                  placeholder="Amount in zkUSD"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  onClick={() => handleAction(burnZkUsd)}
                  disabled={!isConnected || isLoading || !amount}
                >
                  {isLoading ? "Repaying..." : "Repay"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Withdraw Collateral</h3>
              <p className="text-sm text-muted-foreground">
                Withdraw your MINA collateral
              </p>
              <div className="flex gap-2 w-1/3">
                <Input
                  type="number"
                  placeholder="Amount in MINA"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  onClick={() => handleAction(redeemCollateral)}
                  disabled={!isConnected || isLoading || !amount}
                >
                  {isLoading ? "Withdrawing..." : "Withdraw"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liquidate" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Liquidate Vault</h3>
              <p className="text-sm text-muted-foreground">
                Liquidate an unhealthy vault to receive a bonus
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAction(liquidate)}
                  disabled={!isConnected || isLoading || !amount}
                  variant="destructive"
                  className="w-1/3"
                >
                  {isLoading ? "Liquidating..." : "Liquidate"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default VaultInteractions;
