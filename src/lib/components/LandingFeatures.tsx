import React from "react";
import { Card } from "./ui";
import {
  ChartLine,
  EyeOff,
  Mountain,
  Shield,
  Vault,
  Zap,
  ShieldPlus,
  SendToBack,
} from "lucide-react";

const LandingFeatures = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Auditable
              </h1>
              <ShieldPlus className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Fizk employs innovative governance controlled audit capabilites
              dettering illicit use without exposing routine activity
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
              Utilises a unique zkRollup architecture to provide scalable
              infrastructure secured through zkProofs
            </p>
          </div>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-8">
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Confidential
              </h1>
              <EyeOff className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Make payments without exposing your balance or transaction history
            </p>
          </div>
        </Card>
        <Card className="p-8 w-full sm:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
                Seemless bridging
              </h1>
              <SendToBack className="w-12 h-12 text-primary" />
            </div>
            <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
              Easily bridge USDC to Fizk and back to any supported L1. Powered
              by Wormhole and CCTP.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LandingFeatures;
