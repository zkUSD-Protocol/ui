import React, { useEffect } from "react";
import { Button } from "@/lib/components/ui";
import { useAccount } from "@/lib/context/account";
import { formatDisplayAccount } from "@/lib/utils/formatting";

const ConnectWallet = () => {
  const { connect, account, isConnected, disconnect } = useAccount();

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-2 py-1">
            {formatDisplayAccount(account!.toBase58())}
          </div>

          <Button onClick={disconnect}>Disconnect</Button>
        </div>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}
    </>
  );
};

export default ConnectWallet;
