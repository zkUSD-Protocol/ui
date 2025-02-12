import React, { useState } from "react";
import { useAccount } from "../context/account";
import { Button, Card } from "./ui";
import { useVaultManager } from "../context/vault-manager";
import CreateVault from "./CreateVault";
import ImportVault from "./ImportVault";

const AppOnboarding = () => {
  const { connect, account, isConnected } = useAccount();
  const { vaultAddresses } = useVaultManager();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full mt-32">
        {!isConnected && (
          <div className="flex flex-col gap-6">
            <h1 className="text-left font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
              Connect Wallet
            </h1>
            <Card className="p-8 w-[464px]">
              <div className="flex flex-col gap-4">
                <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
                  Connect your wallet to get started
                </p>
                <Button className="w-fit" onClick={connect}>
                  Connect Wallet
                </Button>
              </div>
            </Card>
          </div>
        )}
        {!!isConnected && vaultAddresses.length == 0 && (
          <div className="flex flex-col gap-6">
            <h1 className="text-left font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
              Create or Import Vault
            </h1>
            <div className="flex gap-4">
              <Card className="p-8 w-[464px]">
                <div className="flex flex-col gap-4">
                  <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
                    Create a new vault
                  </p>
                  <p className="text-muted-foreground text-xs font-sans font-light leading-[18px] tracking-[0.06em]">
                    Start here if you don't already have own a vault. Once
                    created you will be able to deposit MINA and borrow zkUSD.
                  </p>
                  <Button
                    className="w-fit"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create Vault
                  </Button>
                </div>
              </Card>
              <Card className="p-8 w-[464px]">
                <div className="flex flex-col gap-4">
                  <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
                    Import an existing vault
                  </p>
                  <p className="text-muted-foreground text-xs font-sans font-light leading-[18px] tracking-[0.06em]">
                    If you already own a vault, you can import it here and begin
                    managing your positions.
                  </p>
                  <Button
                    className="w-fit"
                    onClick={() => setImportDialogOpen(true)}
                  >
                    Import Vault
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      <CreateVault open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ImportVault open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </>
  );
};

export default AppOnboarding;
