export interface VaultState {
  vaultAddress: string;
  collateralAmount: bigint;
  debtAmount: bigint;
  owner: string;
  currentLTV: number;
  currentHealthFactor: number;
}
