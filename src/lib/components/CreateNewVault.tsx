"use client";
import React, { useState } from "react";
import { Button } from "./ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useVaultManager } from "@/lib/context/vault-manager";
import { PrivateKey } from "o1js";
import { Copy, Check } from "lucide-react";

const CreateNewVault = () => {
  const { generateVaultAddress, createNewVault } = useVaultManager();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vaultData, setVaultData] = useState<{
    privateKey: PrivateKey;
    address: string;
  } | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset states when dialog closes
      setCopied(false);
      setVaultData(null);
      setIsCreating(false);
    }
  };

  const handleDialogTrigger = () => {
    // Generate new vault data when dialog opens
    const newVaultData = generateVaultAddress();
    setVaultData(newVaultData);
  };

  const copyToClipboard = async () => {
    if (!vaultData) return;

    try {
      await navigator.clipboard.writeText(vaultData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCreate = async () => {
    if (!vaultData) return;

    try {
      setIsCreating(true);
      await createNewVault(vaultData.privateKey);
      setOpen(false);
    } catch (error) {
      console.error("Error creating vault:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={handleDialogTrigger}>
        <Button>Create Vault</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Vault</DialogTitle>
          <DialogDescription>
            This will be your vault's address. Please save it somewhere safe as
            you'll need it to access your vault later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="bg-muted p-2 rounded-md break-all font-mono text-sm">
              {vaultData?.address}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !vaultData}>
            {isCreating ? "Creating..." : "Create Vault"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewVault;
