import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { formatDisplayAccount, formatMinaAmount } from "@/lib/utils/formatting";
import { Separator } from "./ui/separator";
import {
  calculateHealthFactor,
  calculateLTV,
  formatHealthFactor,
  getHealthFactorColor,
} from "@/lib/utils/loan";
import { VaultState } from "@/lib/types";
import { usePrice } from "@/lib/context/price";
import LTVProgress from "./LTVProgress";
import { useVault } from "@/lib/context/vault";

const VaultDetailCard = () => {
  const [healthFactor, setHealthFactor] = useState(0);
  const { minaPrice, isLoading: isPriceLoading } = usePrice();
  const { vault } = useVault();

  useEffect(() => {
    if (minaPrice) {
      setHealthFactor(
        calculateHealthFactor(
          BigInt(vault?.collateralAmount || 0),
          BigInt(vault?.debtAmount || 0),
          minaPrice
        )
      );
    }
  }, [minaPrice, vault]);

  const ltv = vault
    ? calculateLTV(
        BigInt(vault.collateralAmount),
        BigInt(vault.debtAmount),
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
              {formatDisplayAccount(vault?.vaultAddress || "")}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Owner
              </h3>
              <p className="font-mono text-sm">
                {formatDisplayAccount(vault?.owner || "")}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* {vaultQuery?.isLoading && (
          <p className="text-muted-foreground">Loading vault details...</p>
        )}

        {vaultQuery?.isError && (
          <p className="text-red-500">Error loading vault details</p>
        )} */}

        {vault && (
          <>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="space-y-2 flex flex-col items-center">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Collateral
                </h3>
                <p className="text-2xl font-bold">
                  {formatMinaAmount(vault!.collateralAmount)} MINA
                </p>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Debt
                </h3>
                <p className="text-2xl font-bold">
                  {formatMinaAmount(vault!.debtAmount)} zkUSD
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
                  {formatHealthFactor(healthFactor)}
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
