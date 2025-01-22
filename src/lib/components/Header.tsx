import React from "react";
import { Button } from "@/lib/components/ui";
import ConnectWallet from "./ConnectWallet";

const Header = () => {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="text-2xl font-bold">zkUSD</div>
      <div className="flex items-center gap-4">
        <ConnectWallet />
      </div>
    </div>
  );
};

export default Header;
