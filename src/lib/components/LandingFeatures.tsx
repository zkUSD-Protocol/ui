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
              Create and manage your own risk. Control your own assets. Be in
              the driving seat.
            </p>
          </div>
        </Card>
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Built for zkApps
              </h1>
              <Zap className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Built as the foundation of Mina's DeFi ecosystem. Deployed on L1,
              bridge anywhere.
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
              Create your own off-chain zk price proofs from our network of
              decentralised oracles.
            </p>
          </div>
        </Card>
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Peg Stability
              </h1>
              <ChartLine className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              zkUSD maintains its value through carefully designed
              collateralization ratios and zk-proof verified price feeds.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LandingFeatures;
