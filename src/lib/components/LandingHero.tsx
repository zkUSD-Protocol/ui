import React from "react";
import Image from "next/image";

const LandingHero = () => {
  return (
    <div className="flex flex-col-reverse sm:flex-row">
      <div className="w-full sm:w-2/3 sm:pr-24">
        <h1 className="text-center sm:text-left font-serif text-4xl sm:text-6xl font-thin italic leading-[51px] sm:leading-[81px]">
          Confidential Stablecoin Infrastructure
        </h1>
        <p className="text-center sm:text-left font-sans text-muted-foreground text-lg font-light leading-[24px] mt-5">
          Fizk is a confidential stablecoin zkRollup that brings cash-like
          privacy to USDC and USDT. Private by default, auditable on demand.
        </p>
      </div>
      <div className="w-full sm:w-1/3 flex justify-center items-center">
        <div className="relative  w-32 h-32 sm:w-full sm:h-full mb-10 sm:mb-0 scale-150">
          <Image
            src="/assets/Z_coin_new_BGND.webp"
            alt="Landing Hero"
            fill
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
