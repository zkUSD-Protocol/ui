"use client";

import * as React from "react";
import { cn } from "@/lib/utils/ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Triangle } from "lucide-react"; // import the triangle icon
import { getGaugeColorForHealthFactor } from "@/lib/utils/color";

const gaugeVariants = cva("relative", {
  variants: {
    variant: {
      default: "text-primary",
      gradient: "text-white",
    },
    size: {
      default: "w-[200px] h-[100px]",
      lg: "w-[300px] h-[150px]",
      sm: "w-[150px] h-[75px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface GaugeProps extends VariantProps<typeof gaugeVariants> {
  value?: number;
  /** The minimum value (e.g. for health factor, 100) */
  min?: number;
  /** The maximum value (e.g. for health factor, 300) */
  max?: number;
  /** An optional projected value (such as a projected health factor) */
  projectedValue?: number;
  className?: string;
  showValue?: boolean;
}

const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(
  (
    {
      className,
      value = 0,
      projectedValue,
      min = 0,
      max = 500,
      variant,
      size,
      showValue = true,
      ...props
    },
    ref
  ) => {
    // Map value from [min, max] to a percentage (0-100)
    const percentage = Math.min(
      100,
      Math.max(0, ((value - min) / (max - min)) * 100)
    );
    // Convert percentage to an angle (0-180°) for the semicircular arc
    const angle = (percentage * 180) / 100;

    const projectedPercentage =
      typeof projectedValue === "number"
        ? Math.min(
            100,
            Math.max(0, ((projectedValue - min) / (max - min)) * 100)
          )
        : undefined;

    // Gauge geometry parameters
    const centerX = 100;
    const centerY = 90;
    const arcRadius = 80;

    // --- Calculate the "current" triangle placement (outside the arc) ---
    const currentTriangleOffset = 9; // positive => outside the arc
    const currentTriangleRadius = arcRadius + currentTriangleOffset;
    const trianglePoint = getPointOnArcCoordinates(
      angle,
      currentTriangleRadius,
      centerX,
      centerY
    );
    const radialAngle =
      (Math.atan2(trianglePoint.y - centerY, trianglePoint.x - centerX) * 180) /
      Math.PI;
    const triangleRotation = radialAngle - 270;

    // --- Calculate projected triangle (if provided) ---
    let projectedTriangleElement = null;
    if (typeof projectedValue === "number") {
      // Map projectedValue from [min, max] to percentage
      const projectedPercentage = Math.min(
        100,
        Math.max(0, ((projectedValue - min) / (max - min)) * 100)
      );
      const projectedAngle = (projectedPercentage * 180) / 100;
      // Use a negative offset to place the projected triangle *inside* the arc
      const projectedTriangleOffset = 9;
      const projectedTriangleRadius = arcRadius + projectedTriangleOffset;
      const projectedPoint = getPointOnArcCoordinates(
        projectedAngle,
        projectedTriangleRadius,
        centerX,
        centerY
      );
      const projectedRadialAngle =
        (Math.atan2(projectedPoint.y - centerY, projectedPoint.x - centerX) *
          180) /
        Math.PI;
      const projectedRotation = projectedRadialAngle - 270;
      // Get a color based on the projected percentage using our helper
      const projectedColor = getGaugeColorForHealthFactor(projectedValue!);

      projectedTriangleElement = (
        <g
          transform={`
            translate(${projectedPoint.x} ${projectedPoint.y})
            rotate(${projectedRotation})
            translate(-5 -2)
          `}
        >
          <Triangle
            height={10}
            width={10}
            className=""
            strokeWidth={0}
            fill={projectedColor}
          />
        </g>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(gaugeVariants({ variant, size }), className)}
        {...props}
      >
        <svg className="w-full h-full" viewBox="-12 -20 220 120">
          <defs>
            {/* Define the gradient */}
            <linearGradient
              id="risk-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="hsl(var(--danger))" />
              <stop offset="10%" stopColor="hsl(var(--warning))" />
              <stop offset="20%" stopColor="hsl(var(--warning))" />
              <stop offset="30%" stopColor="hsl(var(--healthy))" />
              <stop offset="100%" stopColor="hsl(var(--healthy))" />
            </linearGradient>

            {/* Define the glow filter */}
            <filter id="glow" x="-20%" y="-40%" width="140%" height="140%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="18"
                result="blur"
              />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.6" />
              </feComponentTransfer>
            </filter>

            {/* Define a clipPath that only shows the area below the arc */}
            <clipPath id="clip-glow">
              <path d="M 10 90 A 80 80 0 0 1 190 90 L 190 120 L 10 120 Z" />
            </clipPath>
          </defs>

          {/* Glowing effect (clipped so it doesn’t bleed above the arc) */}
          <g clipPath="url(#clip-glow)">
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              className={cn(
                "stroke-[20]",
                variant === "gradient"
                  ? "stroke-[url(#risk-gradient)]"
                  : "stroke-primary/20"
              )}
              filter="url(#glow)"
              strokeLinecap="round"
            />
          </g>

          {/* Background track */}
          <path
            d="M 10 90 A 80 80 0 0 1 190 90"
            fill="none"
            className={cn(
              "stroke-[1]",
              variant === "gradient"
                ? "stroke-[url(#risk-gradient)]"
                : "stroke-primary/20"
            )}
            strokeLinecap="round"
          />

          {/* Current value triangle (outside the arc) */}
          {value !== 0 && (
            <g
              transform={`
                translate(${trianglePoint.x} ${trianglePoint.y})
                rotate(${triangleRotation})
                translate(-5 -2)
              `}
            >
              <Triangle
                height={10}
                width={10}
                className="text-white"
                strokeWidth={0}
                fill="currentColor"
              />
            </g>
          )}

          {/* Projected value triangle (inside the arc) */}
          {projectedTriangleElement}
        </svg>
        {/* --- Projected value box --- */}

        <div className="absolute bottom-6 left-1/2 transform -translate-x-[45%]">
          {value !== 0 ? (
            <div
              className="py-[6px] px-[7px] w-fit rounded-md"
              style={{
                backgroundColor: getGaugeColorForHealthFactor(value)
                  .replace("hsl", "hsla")
                  .replace(")", ", 0.3)"),
              }}
            >
              <h2 className="font-mono text-lg leading-none tracking-[0.02em] text-white">
                {value}
              </h2>
            </div>
          ) : (
            <div className="py-[6px] px-[7px] w-fit rounded-md">
              <h2 className="font-mono text-lg leading-none tracking-[0.02em] text-white">
                N/A
              </h2>
            </div>
          )}
        </div>

        {typeof projectedValue === "number" && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-[45%]">
            <div
              className="bg-card-foreground py-[2px] px-[6px] w-fit rounded-md"
              style={{
                color: getGaugeColorForHealthFactor(projectedValue!),
              }}
            >
              <h2 className="font-mono text-xs tracking-[0.02em] text-right">
                {projectedValue}
              </h2>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Gauge.displayName = "Gauge";

export { Gauge };

/**
 * Helper function to calculate a point on the arc as coordinates.
 */
function getPointOnArcCoordinates(
  angle: number,
  radius: number,
  centerX: number,
  centerY: number
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(Math.PI - radians);
  const y = centerY - radius * Math.sin(Math.PI - radians);
  return { x, y };
}
