import React from "react";
import { Progress } from "./ui/progress";
import { useVault } from "../context/vault";
import { Triangle } from "lucide-react";
import { Separator } from "./ui";
import { getGradientColorForLTV } from "@/lib/utils/color";

const LTVProgress = () => {
  const { vault, projectedState } = useVault();

  if (!vault) return null;

  let ltv: number;

  if (!!projectedState) {
    ltv = Math.min(projectedState.ltv, 100);
  } else {
    ltv = vault.currentLTV;
  }

  const projectedColor = getGradientColorForLTV(ltv);

  return (
    <>
      <div className="flex items-end relative h-20 ">
        <div
          className="absolute bottom-0 w-full h-16 "
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--healthy)) 0%, hsl(var(--healthy)) 40%, hsl(var(--warning)) 50%, hsl(var(--danger)) 66%, hsl(var(--danger)) 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0, 0, 0, 0.2) 10%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0, 0, 0, 0.2) 10%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)",
            clipPath: `inset(0 ${100 - ltv}% 0 0)`,
          }}
        />
        <div className="absolute bottom-0 left-[66%] w-[1px] bg-danger h-14 flex items-center justify-center">
          <div className="absolute top-0 left-2 text-nowrap text-danger text-xs leaing-[18px] tracking-[0.06em]">
            max 66.6%
          </div>
        </div>
        <div
          className={`absolute bottom-[1px] transform -translate-x-1/2 flex flex-col items-center`}
          style={{
            left: `${vault.currentLTV}%`,
            transform: "translateX(-50%)",
          }}
        >
          {vault.collateralAmount > 0n && vault.debtAmount > 0n && (
            <>
              {!projectedState && (
                <p className="text-xs leading-[18px] tracking-[0.06em]">
                  Current
                </p>
              )}
              <Triangle
                className="w-2 h-2 text-white rotate-180"
                strokeWidth={0}
                fill="currentColor"
              />
            </>
          )}
        </div>
        {!!projectedState && projectedState.ltv > 0 && (
          <div
            className={`absolute bottom-[1px] transform -translate-x-1/2 flex flex-col items-center`}
            style={{
              left: `${ltv}%`,
              transform: "translateX(-50%)",
              color: projectedColor,
            }}
          >
            <p className="text-xs leading-[18px] tracking-[0.06em]">
              Projected
            </p>
            <Triangle
              className="w-2 h-2 text-white rotate-180"
              strokeWidth={0}
              fill={projectedColor}
            />
          </div>
        )}

        <Progress value={ltv} variant="gradient" className="w-full h-[1px]" />
      </div>
      <div className="flex text-xs leading-[18px] tracking-[0.06em] font-light text-muted-foreground">
        <div className="w-2/3 flex gap-2 text-center">
          <div className="w-1/3">Conservative</div>
          <Separator orientation="vertical" />
          <div className="w-1/3">Balanced</div>
          <Separator orientation="vertical" />
          <div className="w-1/3">Aggressive</div>
          <Separator orientation="vertical" />
        </div>
        <div className="w-1/3 text-center">Liquidation</div>
      </div>
    </>
  );
};

export default LTVProgress;
