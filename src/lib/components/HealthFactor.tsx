import React from "react";
import { useVault } from "../context/vault";
import { Gauge } from "@/lib/components/ui";
import { getGaugeColorForHealthFactor } from "../utils/color";
import { getHealthFactorRisk } from "../utils/loan";

const HealthFactor = () => {
  const { vault, projectedState } = useVault();

  if (!vault) return null;
  return (
    <div className="flex flex-col gap-2 p-10 w-full">
      <div className="flex h-24 gap-2 ">
        <div className="w-1/2 flex flex-col gap-2">
          <div className="flex justify-between">
            <h3 className="font-sans tracking-[0.06em] text-white">
              Health Score
            </h3>
            <div
              className="px-1 rounded-md my-auto"
              style={{
                backgroundColor: getGaugeColorForHealthFactor(
                  vault.currentHealthFactor
                )
                  .replace("hsl", "hsla")
                  .replace(")", ", 0.3)"),
              }}
            >
              {vault.currentHealthFactor !== -1 && (
                <h2 className="font-mono text-sm  tracking-[0.02em] text-white">
                  {getHealthFactorRisk(vault.currentHealthFactor)}
                </h2>
              )}
            </div>
          </div>
          <p className="hidden sm:block font-sans font-light text-muted-foreground text-xs tracking-[0.06em]">
            Your health score tracks the overall healthiness of your vault. If
            you fall below 100, your vault will be liquidated
          </p>
          <p className="block sm:hidden font-sans font-light text-muted-foreground text-xs tracking-[0.06em]">
            Your health score tracks the overall healthiness of your vault.
          </p>
        </div>
        <div className="relative w-1/2 flex justify-center items-center scale-125">
          <Gauge
            min={100}
            value={vault.currentHealthFactor}
            projectedValue={
              !!projectedState && projectedState?.healthFactor !== -1
                ? projectedState?.healthFactor
                : undefined
            }
            max={300}
            variant="gradient"
          />
        </div>
      </div>
    </div>
  );
};

export default HealthFactor;
