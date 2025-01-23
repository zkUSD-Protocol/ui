"use client";

import React, { useMemo } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui";
import { useVault } from "@/lib/context/vault";
import { useAccount } from "@/lib/context/account";
import { useState } from "react";
import { PublicKey, UInt64 } from "o1js";
import { CloudWorkerResponse } from "../types";
import { toRawMinaAmount } from "@/lib/utils/formatting";
import { usePrice } from "@/lib/context/price";
import {
  calculateHealthFactor,
  calculateLTV,
  formatHealthFactor,
  formatLTV,
  getHealthFactorColor,
} from "../utils/loan";

interface VaultInteractionsProps {
  vaultAddress: string;
  currentCollateral: bigint;
  currentDebt: bigint;
}

const VaultInteractions = () => {
  const { isConnected } = useAccount();
  const { minaPrice } = usePrice();
  const {
    depositCollateral,
    mintZkUsd,
    burnZkUsd,
    redeemCollateral,
    liquidate,
    vault,
  } = useVault();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate projected values based on action type and amount
  const getProjectedValues = (actionType: "borrow" | "repay" | "withdraw") => {
    if (!amount) return null;

    const amountBigInt = BigInt(toRawMinaAmount(amount));
    let projectedCollateral = vault?.collateralAmount;
    let projectedDebt = vault?.debtAmount;

    switch (actionType) {
      case "borrow":
        projectedDebt = projectedDebt
          ? projectedDebt + amountBigInt
          : amountBigInt;
        break;
      case "repay":
        projectedDebt = projectedDebt ? projectedDebt - amountBigInt : 0n;
        break;
      case "withdraw":
        projectedCollateral = projectedCollateral
          ? projectedCollateral - amountBigInt
          : 0n;
        break;
    }

    const projectedHealthFactor = calculateHealthFactor(
      projectedCollateral!,
      projectedDebt!,
      minaPrice
    );

    const projectedLTV = calculateLTV(
      projectedCollateral!,
      projectedDebt!,
      minaPrice
    );

    return {
      healthFactor: projectedHealthFactor,
      ltv: projectedLTV,
      isHealthy: projectedHealthFactor >= 100,
    };
  };

  const handleAction = async (
    action: (amount: UInt64) => Promise<CloudWorkerResponse>
  ) => {
    if (!amount && action !== liquidate) return;
    setIsLoading(true);
    try {
      await action(new UInt64(toRawMinaAmount(amount)));
      setAmount("");
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ProjectedStats = ({
    actionType,
  }: {
    actionType: "borrow" | "repay" | "withdraw";
  }) => {
    const projected = getProjectedValues(actionType);

    if (!amount || !projected) return null;

    return (
      <div className="mt-4 p-3 bg-secondary/50 rounded-md ">
        <h4 className="text-sm font-medium mb-2">Projected Position</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Health Factor: </span>
            <span className={getHealthFactorColor(projected.healthFactor)}>
              {formatHealthFactor(projected.healthFactor)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">LTV: </span>
            <span>{formatLTV(projected.ltv)}</span>
          </div>
        </div>
      </div>
    );
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
            <div className="flex gap-10">
              <div className="space-y-2 w-1/3">
                <h3 className="text-lg font-medium">Borrow zkUSD</h3>
                <p className="text-sm text-muted-foreground">
                  Borrow zkUSD against your collateral
                </p>
                <div className="flex gap-2 w-full">
                  <Input
                    type="number"
                    placeholder="Amount in zkUSD"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Button
                    onClick={() => handleAction(mintZkUsd)}
                    disabled={
                      !isConnected ||
                      isLoading ||
                      !amount ||
                      (getProjectedValues("borrow")?.healthFactor || 0) < 100
                    }
                  >
                    {isLoading ? "Borrowing..." : "Borrow"}
                  </Button>
                </div>
              </div>
              <ProjectedStats actionType="borrow" />
            </div>
          </TabsContent>

          <TabsContent value="repay" className="space-y-4">
            <div className="flex gap-10">
              <div className="space-y-2 w-1/3">
                <h3 className="text-lg font-medium">Repay Debt</h3>
                <p className="text-sm text-muted-foreground">
                  Repay your zkUSD debt to improve your health factor
                </p>
                <div className="flex gap-2 w-full">
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
              <ProjectedStats actionType="repay" />
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="flex gap-10">
              <div className="space-y-2 w-1/3">
                <h3 className="text-lg font-medium">Withdraw Collateral</h3>
                <p className="text-sm text-muted-foreground">
                  Withdraw your MINA collateral
                </p>
                <div className="flex gap-2 w-full">
                  <Input
                    type="number"
                    placeholder="Amount in MINA"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Button
                    onClick={() => handleAction(redeemCollateral)}
                    disabled={
                      !isConnected ||
                      isLoading ||
                      !amount ||
                      (getProjectedValues("withdraw")?.healthFactor || 0) < 100
                    }
                  >
                    {isLoading ? "Withdrawing..." : "Withdraw"}
                  </Button>
                </div>
              </div>
              <ProjectedStats actionType="withdraw" />
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
                  disabled={!isConnected || isLoading}
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
