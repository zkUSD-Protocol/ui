"use client";
import { CreateVault, ImportVault } from "@/lib/components";
import { Button, Card } from "@/lib/components/ui";
import { useVaultManager } from "@/lib/context/vault-manager";
import React, { useState } from "react";

const OnboardingPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full mt-32">
        <div className="flex flex-col gap-6">
          <h1 className="text-left font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
            Create or Import Vault
          </h1>
          <div className="flex gap-4">
            <Card className="p-8 w-[464px]">
              <div className="h-full flex flex-col gap-4 justify-between">
                <div className="flex flex-col gap-4">
                  <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
                    Create a new vault
                  </p>
                  <p className="text-muted-foreground text-xs font-sans font-light leading-[18px] tracking-[0.06em]">
                    Start here to create a new vault. If this is your first
                    vault, first vault, it will cost 2 MINA to create. Otherwise
                    it will cost 1 MINA.
                  </p>
                </div>
                <Button
                  className="w-fit"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Vault
                </Button>
              </div>
            </Card>
            <Card className="p-8 w-[464px]">
              <div className="h-full flex flex-col gap-4 justify-between">
                <div className="flex flex-col gap-4">
                  <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
                    Import an existing vault
                  </p>
                  <p className="text-muted-foreground text-xs font-sans font-light leading-[18px] tracking-[0.06em]">
                    If you already own a vault, you can import it here and begin
                    managing your positions.
                  </p>
                </div>
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
      </div>
      <CreateVault open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ImportVault open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </>
  );
};

export default OnboardingPage;
