import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { formatDisplayAccount, formatMinaAmount } from "@/lib/utils";
import { VaultOnChainState } from "@/lib/context/vault-manager";
import { Separator } from "./ui/separator";
import {
  calculateHealthFactor,
  calculateLTV,
  formatHealthFactor,
  formatLTV,
  getHealthFactorColor,
} from "@/lib/utils/loan";
import { useLatestProof } from "../hooks/useLatestProof";
import { usePrice } from "@/lib/context/price";
import LTVProgress from "./LTVProgress";

interface VaultDetailCardProps {
  vaultAddress: string;
  vaultData: VaultOnChainState | undefined;
  isLoading: boolean;
  isError: boolean;
}

const VaultDetailCard = ({
  vaultAddress,
  vaultData,
  isLoading,
  isError,
}: VaultDetailCardProps) => {
  const [healthFactor, setHealthFactor] = useState(0);
  const { minaPrice, isLoading: isPriceLoading } = usePrice();

  useEffect(() => {
    if (minaPrice) {
      setHealthFactor(
        calculateHealthFactor(
          BigInt(vaultData?.collateralAmount || 0),
          BigInt(vaultData?.debtAmount || 0),
          minaPrice
        )
      );
    }
  }, [minaPrice, vaultData]);

  const ltv = vaultData
    ? calculateLTV(
        BigInt(vaultData.collateralAmount),
        BigInt(vaultData.debtAmount),
        minaPrice
      )
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Vault Overview</h2>
            <p className="text-sm text-muted-foreground font-mono">
              {formatDisplayAccount(vaultAddress)}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Owner
              </h3>
              <p className="font-mono text-sm">
                {formatDisplayAccount(vaultData?.owner || "")}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6">
        {isLoading && (
          <p className="text-muted-foreground">Loading vault details...</p>
        )}

        {isError && <p className="text-red-500">Error loading vault details</p>}

        {vaultData && (
          <>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="space-y-2 flex flex-col items-center">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Collateral
                </h3>
                <p className="text-2xl font-bold">
                  {formatMinaAmount(vaultData.collateralAmount)} MINA
                </p>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Debt
                </h3>
                <p className="text-2xl font-bold">
                  {formatMinaAmount(vaultData.debtAmount)} zkUSD
                </p>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Health Factor
                </h3>
                <p
                  className={`text-lg font-semibold ${getHealthFactorColor(
                    healthFactor
                  )}`}
                >
                  {healthFactor}
                </p>
              </div>
            </div>

            <LTVProgress
              currentLTV={ltv}
              maxLTV={66.6}
              liquidationThreshold={66.6}
              className="mt-4"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VaultDetailCard;
