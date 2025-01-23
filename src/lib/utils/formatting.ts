export const formatDisplayAccount = (account: string) =>
  `${account.slice(0, 6)}...${account.slice(-4)}`;

export const formatMinaAmount = (
  rawAmount: string | number | bigint,
  decimals = 4
): string => {
  const amount = Number(rawAmount) / 1e9;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(amount);

  return formattedAmount;
};

export const toRawMinaAmount = (amount: string | number): string => {
  // Convert to string and handle empty input
  if (!amount || amount === "") return "0";

  // Convert the number to a string with 9 decimal places
  const parts = amount.toString().split(".");
  const whole = parts[0];
  const decimal = parts[1] || "";

  // Pad or truncate decimal to 9 places
  const paddedDecimal = decimal.padEnd(9, "0").slice(0, 9);

  // Remove any leading zeros from the whole number part
  const cleanWhole = whole.replace(/^0+/, "") || "0";

  // Combine whole and decimal parts
  const rawAmount = cleanWhole + paddedDecimal;

  // Remove leading zeros from final result
  return BigInt(rawAmount).toString();
};
