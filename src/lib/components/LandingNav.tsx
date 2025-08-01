import Link from "next/link";
import React from "react";

const LandingNav = () => {
  return (
    <nav className="flex justify-between items-center gap-8">
      <Link target="_blank" href="https://github.com/zkUSD-Protocol/rollup">
        <p className="font-mono font-light uppercase text-white text-sm tracking-[0.06em] hover:underline">
          GitHub
        </p>
      </Link>
    </nav>
  );
};

export default LandingNav;
