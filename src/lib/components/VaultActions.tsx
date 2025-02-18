import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/lib/components/ui";
import { ErrorMessage } from "@/lib/components";
import { formatMinaAmount, toRawMinaAmount } from "../utils/formatting";
import { useAccount } from "../context/account";
import { useVault } from "../context/vault";
import { UInt64 } from "o1js";
import { calculateHealthFactor, calculateLTV } from "../utils/loan";
import { usePrice } from "../context/price";
import { VaultTransactionType } from "zkusd";

interface ActionCardProps {
  action: VaultTransactionType;
  type: "mina" | "zkusd";
}

const ActionCard = ({ action, type }: ActionCardProps) => {
  const {
    depositCollateral,
    mintZkUsd,
    burnZkUsd,
    redeemCollateral,
    setProjectedState,
    projectedState,
    vault,
  } = useVault();

  const { minaBalance, zkusdBalance } = useAccount();
  const { minaPrice } = usePrice();

  const [amount, setAmount] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");

  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleAction = async (action: (amount: UInt64) => Promise<void>) => {
    if (!amount) return;
    try {
      await action(new UInt64(toRawMinaAmount(amount)));
      setAmount("");
    } catch (error: any) {
      if (error.code === 30001) {
        setErrMsg(error.message);
      } else {
        console.error("Transaction failed:", error);
      }
    }
  };

  //Do we disable the action button
  useEffect(() => {
    if (!vault) return;
    if (
      action !== VaultTransactionType.DEPOSIT_COLLATERAL &&
      vault.collateralAmount === 0n
    ) {
      setIsDisabled(true);
    }

    if (action == VaultTransactionType.BURN_ZKUSD && vault.debtAmount === 0n) {
      setIsDisabled(true);
    }
  }, []);

  useEffect(() => {
    if (!vault) return;
    if (!amount) {
      setProjectedState(undefined);
      return;
    }

    let projectedCollateralAmount = vault.collateralAmount;
    let projectedDebtAmount = vault.debtAmount;

    switch (action) {
      case VaultTransactionType.DEPOSIT_COLLATERAL:
        projectedCollateralAmount =
          projectedCollateralAmount + BigInt(toRawMinaAmount(amount));

        if (BigInt(toRawMinaAmount(amount)) > (minaBalance ?? 0)) {
          setErrMsg("Insufficient balance");
        }

        break;
      case VaultTransactionType.MINT_ZKUSD:
        projectedDebtAmount =
          projectedDebtAmount + BigInt(toRawMinaAmount(amount));

        break;
      case VaultTransactionType.BURN_ZKUSD:
        projectedDebtAmount =
          projectedDebtAmount - BigInt(toRawMinaAmount(amount));

        if (BigInt(toRawMinaAmount(amount)) > (zkusdBalance ?? 0)) {
          setErrMsg("Insufficient balance");
        }

        break;
      case VaultTransactionType.REDEEM_COLLATERAL:
        projectedCollateralAmount =
          projectedCollateralAmount - BigInt(toRawMinaAmount(amount));

        if (BigInt(toRawMinaAmount(amount)) > (vault.collateralAmount ?? 0)) {
          setErrMsg("Not enough collateral to withdraw");
        }

        break;
    }

    const projectedLTV = calculateLTV(
      projectedCollateralAmount,
      projectedDebtAmount,
      minaPrice
    );

    const projectedHealthFactor = calculateHealthFactor(
      projectedCollateralAmount,
      projectedDebtAmount,
      minaPrice
    );

    setProjectedState({
      healthFactor: projectedHealthFactor,
      ltv: projectedLTV,
    });

    if (projectedHealthFactor > 0 && projectedHealthFactor < 100) {
      setErrMsg("Health score would be too low to perform this action");
    }
  }, [amount]);

  interface ActionConfig {
    heading: string;
    buttonText: string;
    placeholder: string;
    handler: (amount: UInt64) => Promise<void>;
  }

  type VaultActionTypes = Omit<
    Record<VaultTransactionType, ActionConfig>,
    VaultTransactionType.LIQUIDATE | VaultTransactionType.CREATE_VAULT
  >;

  const actionConfig: VaultActionTypes = {
    [VaultTransactionType.DEPOSIT_COLLATERAL]: {
      heading: "Deposit MINA into your vault",
      buttonText: "Deposit",
      placeholder: "Amount in MINA",
      handler: depositCollateral,
    },
    [VaultTransactionType.MINT_ZKUSD]: {
      heading: "Borrow ƶkUSD against your deposited MINA",
      buttonText: "Borrow",
      placeholder: "Amount in ƶkUSD",
      handler: mintZkUsd,
    },
    [VaultTransactionType.BURN_ZKUSD]: {
      heading: "Repay your borrowed ƶkUSD",
      buttonText: "Repay",
      placeholder: "Amount in ƶkUSD",
      handler: burnZkUsd,
    },
    [VaultTransactionType.REDEEM_COLLATERAL]: {
      heading: "Withdraw MINA from your vault",
      buttonText: "Withdraw",
      placeholder: "Amount in MINA",
      handler: redeemCollateral,
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <Card className="p-8">
        <div className="flex flex-col gap-4">
          <h2 className="font-sans leading-6 tracking-[0.06em] text-white">
            {actionConfig[action as keyof VaultActionTypes].heading}
          </h2>
          <div className="flex flex-col gap-2">
            {type === "mina" && (
              <p className="font-mono text-xs leading-[18px] tracking-[0.02em] text-white">
                MINA Balance: {formatMinaAmount(minaBalance ?? 0)}
              </p>
            )}
            {type === "zkusd" && (
              <p className="font-mono text-xs leading-[18px] tracking-[0.02em] text-white">
                ƶkUSD Balance: {formatMinaAmount(zkusdBalance ?? 0)}
              </p>
            )}
            <div className="flex gap-6">
              <Input
                type="number"
                disabled={isDisabled}
                placeholder={
                  actionConfig[action as keyof VaultActionTypes].placeholder
                }
                className="w-full"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrMsg("");
                }}
              />
              <Button
                disabled={!!errMsg || isDisabled}
                onClick={() =>
                  handleAction(
                    actionConfig[action as keyof VaultActionTypes].handler
                  )
                }
              >
                {actionConfig[action as keyof VaultActionTypes].buttonText}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {errMsg && <ErrorMessage error={errMsg} />}
    </div>
  );
};

const VaultActions = () => {
  const [activeTab, setActiveTab] = useState("deposit");

  const tabTitles: { [key: string]: string } = {
    deposit: "Deposit collateral",
    borrow: "Borrow ƶkUSD",
    repay: "Repay ƶkUSD",
    withdraw: "Withdraw collateral",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between w-full">
        <div className="flex gap-4 items-end">
          <h1 className="font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
            {tabTitles[activeTab]}
          </h1>
        </div>
      </div>
      <Tabs defaultValue="deposit" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="repay">Repay</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <ActionCard
            action={VaultTransactionType.DEPOSIT_COLLATERAL}
            type="mina"
          />
        </TabsContent>
        <TabsContent value="borrow">
          <ActionCard action={VaultTransactionType.MINT_ZKUSD} type="zkusd" />
        </TabsContent>
        <TabsContent value="repay">
          <ActionCard action={VaultTransactionType.BURN_ZKUSD} type="zkusd" />
        </TabsContent>
        <TabsContent value="withdraw">
          <ActionCard
            action={VaultTransactionType.REDEEM_COLLATERAL}
            type="mina"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VaultActions;
