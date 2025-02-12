import React from "react";
import { Button } from "@/lib/components/ui";
import ConnectWallet from "./ConnectWallet";
import { usePrice } from "@/lib/context/price";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const { minaPrice, isLoading } = usePrice();

  const formatPrice = (price: bigint) => {
    return `$${(Number(price) / 1e9).toFixed(2)}`;
  };

  return (
    <div className="flex justify-between items-center">
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
