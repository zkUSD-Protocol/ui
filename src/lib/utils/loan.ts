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
  if (debtAmount === 0n) {
    return Number.MAX_SAFE_INTEGER;
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
  if (collateralAmount === 0n) {
    return 0;
  }

  // Calculate USD value of collateral
  const collateralValue =
    (collateralAmount * minaPrice) / BigInt(UNIT_PRECISION);

  // If collateral has no value, return 100% LTV
  if (collateralValue === 0n) {
    return 100;
  }

  // Calculate LTV as (debt / collateralValue) * 100
  const ltv = (debtAmount * 100n) / collateralValue;

  return Number(ltv);
}

/**
 * Helper function to determine the color for displaying health factor
 * @param healthFactor - The calculated health factor
 * @returns A string representing the Tailwind CSS color class
 */
export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor >= 150) return "text-green-500";
  if (healthFactor >= 110) return "text-yellow-500";
  return "text-red-500";
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
