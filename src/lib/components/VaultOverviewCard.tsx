import React from "react";
import { useVault } from "../context/vault";
import { Card } from "./ui/card";
import { formatMinaAmount } from "../utils/formatting";
import { Separator } from "./ui";
import { HealthFactor, LTV } from "@/lib/components";

const VaultOverviewCard = () => {
  const { vault } = useVault();

  if (!vault) return null;
  return (
    <Card>
      <div className="flex w-full items-stretch">
        <div className="w-1/2">
          <div className="flex flex-col gap-1 p-10">
            <h3 className="font-sans font-light text-sm leading-[18px] tracking-[0.06em] text-white">
              Collateral
            </h3>
            <p className="font-mono text-xl font-light leading-[30px] tracking-[0.02em] text-white">
              {formatMinaAmount(vault.collateralAmount)} MINA
            </p>
          </div>
        </div>
        <div className="flex-grow">
          <Separator orientation="vertical" />
        </div>
        <div className="w-1/2">
          <div className="flex flex-col gap-1 p-10">
            <h3 className="font-sans font-light text-sm leading-[18px] tracking-[0.06em] text-white">
              Debt
            </h3>
            <p className="font-mono font-light text-xl leading-[30px] tracking-[0.02em] text-white ">
              {formatMinaAmount(vault.debtAmount)} ƶkUSD
            </p>
          </div>
        </div>
      </div>
      <Separator />
      <HealthFactor />
      <Separator />
      <LTV />
    </Card>
  );
};

export default VaultOverviewCard;
