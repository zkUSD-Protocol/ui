import { Field, UInt64 } from "o1js";

const COLLATERAL_RATIO = 150; // 150%
const COLLATERAL_RATIO_PRECISION = 100;
const UNIT_PRECISION = 1e9; // Mina has 9 decimal places

/**
 * Calculates the health factor of a vault
 * @param collateralAmount - Amount of MINA collateral in the vault (in nanomina)
 * @param debtAmount - Amount of zkUSD debt in the vault (in nanozkUSD)
 * @param minaPrice - Current MINA price in USD (in nanoUSD)
 * @returns number between 0 and MAX_UINT64, where:
 * - < 100 means undercollateralized (can be liquidated)
 * - = 100 means exactly at minimum collateral ratio
 * - > 100 means overcollateralized
 * - MAX_UINT64 means no debt
 */
export function calculateHealthFactor(
  collateralAmount: bigint,
  debtAmount: bigint,
  minaPrice: bigint
): number {
  // If there's no debt, return maximum health factor
  if (debtAmount === 0n || minaPrice === BigInt(0)) {
    return -1;
  }

  // Calculate USD value of collateral
  const collateralValue =
    (collateralAmount * minaPrice) / BigInt(UNIT_PRECISION);

  // Calculate maximum allowed debt based on collateral value
  const maxAllowedDebt =
    (collateralValue * BigInt(COLLATERAL_RATIO_PRECISION)) /
    BigInt(COLLATERAL_RATIO);

  // Calculate health factor (scaled by COLLATERAL_RATIO_PRECISION)
  const healthFactor =
    (maxAllowedDebt * BigInt(COLLATERAL_RATIO_PRECISION)) / debtAmount;

  if (healthFactor < 0) {
    return -1;
  }

  return Number(healthFactor);
}

/**
 * Calculates the current Loan-to-Value ratio of a vault
 * @param collateralAmount - Amount of MINA collateral in the vault (in nanomina)
 * @param debtAmount - Amount of zkUSD debt in the vault (in nanozkUSD)
 * @param minaPrice - Current MINA price in USD (in nanoUSD)
 * @returns number between 0 and 100 representing the LTV percentage
 */
export function calculateLTV(
  collateralAmount: bigint,
  debtAmount: bigint,
  minaPrice: bigint
): number {
  // If there's no collateral, return 100% LTV
  if (collateralAmount === 0n || minaPrice === BigInt(0)) {
    return 0.0;
  }

  // Calculate USD value of collateral
  const collateralValue =
    (collateralAmount * minaPrice) / BigInt(UNIT_PRECISION);

  // Calculate LTV as (debt / collateralValue) * 100
  const ltv = (debtAmount * 100n) / collateralValue;

  if (ltv < 0) {
    return 0.0;
  }

  return Number(ltv);
}

export function getHealthFactorRisk(healthFactor: number): string {
  if (healthFactor >= 150) return "HEALTHY";
  if (healthFactor >= 130) return "CAUTION";
  if (healthFactor >= 120) return "RISKY";
  if (healthFactor >= 110) return "DANGER";
  return "DANGER";
}

/**
 * Helper function to format the health factor for display
 * @param healthFactor - The calculated health factor
 * @returns A formatted string representing the health factor
 */
export function formatHealthFactor(healthFactor: number): string {
  if (healthFactor === Number.MAX_SAFE_INTEGER) return "∞";
  return healthFactor.toString();
}

/**
 * Helper function to format the LTV for display
 * @param ltv - The calculated LTV
 * @returns A formatted string representing the LTV percentage
 */
export function formatLTV(ltv: number): string {
  return `${ltv.toFixed(2)}%`;
}
