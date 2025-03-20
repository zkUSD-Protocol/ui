"use client";
import {
  LandingFeatures,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingLeverage,
} from "@/lib/components";
import React from "react";

const Home = () => {
  return (
    <>
      <main className="min-h-screen flex flex-col py-8 px-6 justify-between">
        <LandingHeader />
        <div className="flex flex-col flex-1 max-w-5xl mx-auto mt-16 sm:mt-32 gap-24">
          <LandingHero />
          <LandingLeverage />
          <LandingFeatures />
          <LandingFooter />
        </div>
      </main>
    </>
  );
};

export default Home;
