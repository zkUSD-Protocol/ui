"use client";
import { LandingHeader, LandingHero } from "@/lib/components";
import React from "react";

const Home = () => {
  return (
    <>
      <main className="min-h-screen flex flex-col py-8 px-6 justify-between">
        <LandingHeader />
        <div className="flex flex-col flex-1 max-w-5xl mx-auto mt-32">
          <LandingHero />
        </div>
      </main>
    </>
  );
};

export default Home;
