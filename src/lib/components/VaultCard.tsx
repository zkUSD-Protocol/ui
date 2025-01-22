"use client";
import { useVaultManager } from "@/lib/context/vault-manager";
import {
  formatDisplayAccount,
  formatMinaAmount,
  toRawMinaAmount,
} from "@/lib/utils/index";
import { VaultTransactionType } from "zkusd";
import { useState } from "react";
import { useVault } from "@/lib/context/vault";
import { PublicKey, UInt64 } from "o1js";

const VaultCard = ({ vaultAddr }: { vaultAddr: string }) => {
  const { getVaultQuery } = useVaultManager();
  const { data, isLoading, isError } = getVaultQuery(vaultAddr);
  const {
    depositCollateral,
    mintZkUsd,
    redeemCollateral,
    burnZkUsd,
    liquidate,
  } = useVault();
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState({
    raw: "",
    mina: "",
  });
  const [activeTransaction, setActiveTransaction] =
    useState<VaultTransactionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransaction = async (type: VaultTransactionType) => {
    if (
      [
        VaultTransactionType.DEPOSIT_COLLATERAL,
        VaultTransactionType.REDEEM_COLLATERAL,
        VaultTransactionType.MINT_ZKUSD,
        VaultTransactionType.BURN_ZKUSD,
      ].includes(type)
    ) {
      setActiveTransaction(type);
      setShowAmountInput(true);
    } else if (type === VaultTransactionType.LIQUIDATE) {
      try {
        setIsProcessing(true);
        setActiveTransaction(type);
        await liquidate(PublicKey.fromBase58(vaultAddr));
        // You might want to add a success notification here
      } catch (error) {
        console.error("Liquidation failed:", error);
        // You might want to add an error notification here
      } finally {
        setIsProcessing(false);
        setActiveTransaction(null);
      }
    }
  };

  const handleConfirm = () => {
    console.log(
      `Executing ${activeTransaction} with amount ${amount} for vault ${vaultAddr}`
    );
    setShowAmountInput(false);
    setAmount({ raw: "", mina: "" });
    setActiveTransaction(null);

    switch (activeTransaction) {
      case VaultTransactionType.DEPOSIT_COLLATERAL:
        depositCollateral(
          PublicKey.fromBase58(vaultAddr),
          UInt64.from(amount.raw)
        );
        break;
      case VaultTransactionType.MINT_ZKUSD:
        mintZkUsd(PublicKey.fromBase58(vaultAddr), UInt64.from(amount.raw));
        break;
      case VaultTransactionType.REDEEM_COLLATERAL:
        redeemCollateral(
          PublicKey.fromBase58(vaultAddr),
          UInt64.from(amount.raw)
        );
        break;
      case VaultTransactionType.BURN_ZKUSD:
        burnZkUsd(PublicKey.fromBase58(vaultAddr), UInt64.from(amount.raw));
        break;
      case VaultTransactionType.LIQUIDATE:
        liquidate(PublicKey.fromBase58(vaultAddr));
        break;
    }
  };

  const handleCancel = () => {
    setShowAmountInput(false);
    setAmount({ raw: "", mina: "" });
    setActiveTransaction(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawAmount = toRawMinaAmount(e.target.value);
    setAmount({ raw: rawAmount, mina: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded shadow border border-black">
      <p className="font-semibold text-gray-700 break-all">Vault Address:</p>
      <p className="text-xs mb-2 break-all">
        {formatDisplayAccount(vaultAddr)}
      </p>

      {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
      {isError && <p className="text-sm text-red-500">Error fetching data</p>}

      {data && (
        <>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Collateral: {formatMinaAmount(data.collateralAmount)} Mina</p>
            <p>Debt: {formatMinaAmount(data.debtAmount)} zkUsd</p>
            <p className="break-all">
              Owner: {formatDisplayAccount(data.owner)}
            </p>
          </div>

          {showAmountInput && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                {activeTransaction ===
                  VaultTransactionType.DEPOSIT_COLLATERAL &&
                  "Enter deposit amount"}
                {activeTransaction === VaultTransactionType.REDEEM_COLLATERAL &&
                  "Enter withdrawal amount"}
                {activeTransaction === VaultTransactionType.MINT_ZKUSD &&
                  "Enter zkUSD amount to mint"}
                {activeTransaction === VaultTransactionType.BURN_ZKUSD &&
                  "Enter zkUSD amount to burn"}
              </p>
              <input
                type="number"
                name="amount"
                value={amount.mina}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full px-3 py-1 border rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() =>
                handleTransaction(VaultTransactionType.DEPOSIT_COLLATERAL)
              }
            >
              Deposit
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() =>
                handleTransaction(VaultTransactionType.REDEEM_COLLATERAL)
              }
            >
              Withdraw
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleTransaction(VaultTransactionType.MINT_ZKUSD)}
            >
              Mint zkUSD
            </button>
            <button
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleTransaction(VaultTransactionType.BURN_ZKUSD)}
            >
              Repay zkUSD
            </button>
            <button
              className={`px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 col-span-2 ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handleTransaction(VaultTransactionType.LIQUIDATE)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Liquidate"}
            </button>
          </div>

          {/* {data.healthFactor && (
            <div
              className={`mt-2 text-sm ${
                Number(data.healthFactor) < 100
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              Health Factor: {data.healthFactor}
            </div> */}
        </>
      )}
    </div>
  );
};

export default VaultCard;
