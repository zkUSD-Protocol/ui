import React from "react";
import { ConnectWallet } from "@/lib/components";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <div className="flex justify-between items-center h-9">
      <div className="relative w-20 h-5 ">
        <Link href="/">
          <Image
            src="/assets/wordmark.svg"
            alt="wordmark"
            layout="fill"
            objectFit="contain"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ConnectWallet />
      </div>
    </div>
  );
};

export default Header;
