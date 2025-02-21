import React from "react";
import { useVault } from "../context/vault";
import { LTVProgress } from "@/lib/components";
import { getGradientColorForLTV } from "@/lib/utils/color";

const LTV = () => {
  const { vault, projectedState } = useVault();
  if (!vault) return null;
  return (
    <div className="flex flex-col gap-2 p-10">
      <div className="flex justify-between ">
        <div className="flex flex-col gap-2">
          <h3 className="font-sans tracking-[0.06em] text-white">
            Loan to Value (LTV)
          </h3>
          <p className="font-sans font-light text-muted-foreground text-xs tracking-[0.06em]">
            Ratio of the collateral value to the debt value.
          </p>
        </div>
        <div className="relative">
          <h2 className="font-mono text-xl tracking-[0.02em] text-white">
            {vault.currentLTV.toFixed(2)}%
          </h2>
          <div className="h-8">
            {!!projectedState && projectedState.ltv > 0 && (
              <div
                className="bg-card-foreground py-[5px] px-[6px] w-fit rounded-md"
                style={{ color: getGradientColorForLTV(projectedState.ltv) }}
              >
                <h2 className="font-mono text-sm tracking-[0.02em] text-right">
                  {projectedState.ltv.toFixed(2)}%
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
      <div></div>
      <LTVProgress />
    </div>
  );
};

export default LTV;
