import React from "react";
import { Card } from "./ui";
import { ChartLine, Eye, Mountain, Shield, Vault, Zap } from "lucide-react";

const LandingFeatures = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Personal Vaults
              </h1>
              <Vault className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Open over-collateralised vaults with ETH, SUI, MINA & more. You
              stay in full control.
            </p>
          </div>
        </Card>
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Scalable & Secure
              </h1>
              <Zap className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Runs on a high-throughput zkRollup and bridges to every major L1.
              Privacy for payments, Easy access for DeFi.
            </p>
          </div>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-8">
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                zk-Native Oracles
              </h1>
              <Eye className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Robust observer network running inside of TEE's for a fast,
              efficent and secure price feed.
            </p>
          </div>
        </Card>
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Deep Liquidity
              </h1>
              <ChartLine className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Bridge zkUSD to ETH, Sui, Solana and more to tap instantly into
              the deepest DeFi pools—then hop back to the private layer whenever
              you need.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LandingFeatures;
