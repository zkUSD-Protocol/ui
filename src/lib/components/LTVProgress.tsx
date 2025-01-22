import React from "react";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils/ui";

interface LTVProgressProps {
  currentLTV: number;
  maxLTV: number;
  liquidationThreshold: number;
  className?: string;
}

const LTVProgress = ({
  currentLTV,
  maxLTV,
  liquidationThreshold,
  className,
}: LTVProgressProps) => {
  // Helper function to determine the risk level
  const getRiskLevel = (ltv: number) => {
    if (ltv < maxLTV * 0.5) return "Conservative";
    if (ltv < maxLTV * 0.75) return "Moderate";
    if (ltv < liquidationThreshold) return "Aggressive";
    return "Liquidation";
  };

  // Helper function to get the progress bar color based on LTV
  const getProgressColor = (ltv: number) => {
    if (ltv >= liquidationThreshold) return "bg-red-500";
    if (ltv >= maxLTV * 0.75) return "bg-yellow-500";
    return "bg-green-500";
  };

  console.log("Current LTV", currentLTV);
  console.log("Max LTV", maxLTV);
  console.log("Liquidation Threshold", liquidationThreshold);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-baseline">
        <div>
          <h3 className="text-lg font-medium">Loan to Value (LTV)</h3>
          <p className="text-sm text-muted-foreground">
            Ratio of the collateral value to the borrowed value
          </p>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-2xl font-bold">{currentLTV.toFixed(2)}%</span>
          <span className="text-sm text-muted-foreground ml-1">
            max. {maxLTV.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="relative">
        <Progress value={currentLTV} max={100} />

        {/* Liquidation threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          style={{
            left: `${liquidationThreshold}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-red-500">
            {liquidationThreshold.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 text-sm">
        <div
          className={cn(
            "text-center",
            currentLTV < maxLTV * 0.5 && "font-semibold"
          )}
        >
          Conservative
        </div>
        <div
          className={cn(
            "text-center",
            currentLTV >= maxLTV * 0.5 &&
              currentLTV < maxLTV * 0.75 &&
              "font-semibold"
          )}
        >
          Moderate
        </div>
        <div
          className={cn(
            "text-center",
            currentLTV >= maxLTV * 0.75 &&
              currentLTV < liquidationThreshold &&
              "font-semibold"
          )}
        >
          Aggressive
        </div>
        <div
          className={cn(
            "text-center",
            currentLTV >= liquidationThreshold && "font-semibold text-red-500"
          )}
        >
          Liquidation
        </div>
      </div>
    </div>
  );
};

export default LTVProgress;
