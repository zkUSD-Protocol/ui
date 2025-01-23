import React from "react";
import { Button } from "@/lib/components/ui";
import ConnectWallet from "./ConnectWallet";
import { usePrice } from "@/lib/context/price";
import { Loader2 } from "lucide-react";

const Header = () => {
  const { minaPrice, isLoading } = usePrice();

  const formatPrice = (price: bigint) => {
    return `$${(Number(price) / 1e9).toFixed(2)}`;
  };

  return (
    <div className="flex justify-between items-center p-4">
      <div className="text-2xl font-bold">zkUSD</div>

      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <span className="text-sm text-muted-foreground">MINA Price:</span>
            <span className="font-medium">{formatPrice(minaPrice)}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ConnectWallet />
      </div>
    </div>
  );
};

export default Header;
