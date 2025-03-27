import React from "react";
import { Button, Card } from "./ui";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LandingLeverage = () => {
  return (
    <Card className="p-8">
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-8 sm:gap-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-center sm:text-left font-serif font-thin italic text-lg sm:text-3xl leading-[32px] tracking-tighter text-white">
            Leverage MINA without selling
          </h1>
          <p className="text-center sm:text-left font-sans text-muted-foreground text-sm font-light leading-[24px]">
            Unlock your liquidity, for greater capital efficiency.
          </p>
          <div className="flex justify-center sm:justify-start">
            <Link
              target="_blank"
              href="https://github.com/zkUSD-Protocol/whitepaper"
              className="w-fit"
            >
              <Button variant="outline">
                Read the whitepaper{" "}
                <ArrowRight style={{ width: "12px", height: "12px" }} />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative w-[200px] h-[62px] sm:w-[300px] sm:h-[93px] sm:flex-grow flex items-center justify-center mx-auto sm:mx-0">
          <Image
            src="/assets/price_equal.png"
            alt="Landing Leverage"
            fill
            objectFit="contain"
          />
        </div>
      </div>
    </Card>
  );
};

export default LandingLeverage;
