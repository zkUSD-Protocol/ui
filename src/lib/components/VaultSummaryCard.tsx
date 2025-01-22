import React from "react";
import { useVaultManager } from "@/lib/context/vault-manager";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDisplayAccount, formatMinaAmount } from "@/lib/utils";

const VaultSummaryCard = ({ vaultAddress }: { vaultAddress: string }) => {
  const { getVaultQuery, removeVaultAddress } = useVaultManager();
  const { data, isLoading, isError } = getVaultQuery(vaultAddress);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    removeVaultAddress(vaultAddress);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vault Summary</h3>
          <p className="text-sm text-muted-foreground break-all">
            {formatDisplayAccount(vaultAddress)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-red-500"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="">
        {isLoading && (
          <p className="text-muted-foreground text-center">Loading vault...</p>
        )}

        {isError && (
          <p className="text-red-500 text-center">Error loading vault</p>
        )}

        {data && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Collateral:</span>
              <span className="font-medium">
                {formatMinaAmount(data.collateralAmount)} MINA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Debt:</span>
              <span className="font-medium">
                {formatMinaAmount(data.debtAmount)} zkUSD
              </span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/vault/${vaultAddress}`} className="w-full">
          <Button disabled={isLoading || isError || !data} className="w-full">
            Open Vault
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default VaultSummaryCard;
