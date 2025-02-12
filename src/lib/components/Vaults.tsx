import React, { useState } from "react";
import { Button } from "./ui";
import { CreateVault, ImportVault, VaultSummaryCard } from ".";
import { useVaultManager } from "@/lib/context/vault-manager";

const Vaults = () => {
  const { vaultAddresses, createNewVault } = useVaultManager();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Vaults
      </h1>
      <div className="flex gap-4 py-10">
        <CreateVault
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
        <ImportVault
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
        />
      </div>
      <div className="font-sans">This will use Helvetica Neue</div>
      <div className="font-zkusd">This will use Golden State ƵkUSD</div>
      <div className="font-mono">This will use Aptos Mono</div>

      {/* You might want to add a list of imported vaults here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {vaultAddresses.map((address) => (
          <div key={address}>
            {/* Your vault display component */}
            <VaultSummaryCard vaultAddress={address} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vaults;
