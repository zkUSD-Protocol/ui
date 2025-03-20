import React from "react";
import Image from "next/image";

const LandingHero = () => {
  return (
    <div className="flex ">
      <div className="w-2/3 pr-24">
        <h1 className="font-serif text-6xl font-thin italic leading-[81px]">
          Mina's Native Stablecoin Protocol
        </h1>
        <p className="font-sans text-muted-foreground text-lg font-light leading-[24px]">
          A decentralised, zkApp-native algorithmic stablecoin built for Mina.
          Catalysing the zk DeFi revolution.
        </p>
      </div>
      <div className="w-1/3">
        <div className="flex items-center justify-center">
          <Image
            src="/assets/hero_pn.png"
            alt="Landing Hero"
            width={300}
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
