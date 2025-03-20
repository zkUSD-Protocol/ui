import React from "react";
import { Button, Card } from "./ui";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LandingLeverage = () => {
  return (
    <Card className="p-8">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <h1 className="font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
            Leverage MINA without selling
          </h1>
          <p className="font-sans text-muted-foreground text-sm font-light leading-[24px]">
            Unlock your liquidity, for greater capital efficiency.
          </p>
          <Link
            target="_blank"
            href="/assets/The Fizk Protocol - Whitepaper v0.1.pdf"
            className="w-fit"
          >
            <Button variant="outline">
              Read the whitepaper{" "}
              <ArrowRight style={{ width: "12px", height: "12px" }} />
            </Button>
          </Link>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <Image
            src="/assets/price_equal.png"
            alt="Landing Leverage"
            width={300}
            height={93}
          />
        </div>
      </div>
    </Card>
  );
};

export default LandingLeverage;
