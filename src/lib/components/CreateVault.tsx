"use client";
import React, { useEffect, useState } from "react";
import { Button, Card } from "./ui";
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

type CreateNewVaultProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CreateVault = ({ open, onOpenChange }: CreateNewVaultProps) => {
  const { generateVaultAddress, createNewVault } = useVaultManager();
  const [copied, setCopied] = useState(false);
  const [vaultKeyPair, setVaultKeyPair] = useState<{
    privateKey: PrivateKey;
    address: string;
  } | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset states when dialog closes
      setCopied(false);
      setVaultKeyPair(null);
    }
  };

  useEffect(() => {
    const newVaultKeyPair = generateVaultAddress();
    setVaultKeyPair(newVaultKeyPair);
  }, [open]);

  const copyToClipboard = async () => {
    if (!vaultKeyPair) return;

    try {
      await navigator.clipboard.writeText(vaultKeyPair.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCreate = async () => {
    if (!vaultKeyPair) return;

    try {
      onOpenChange(false);
      await createNewVault(vaultKeyPair.privateKey);
    } catch (error) {
      console.error("Error creating vault:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="">Create new vault</DialogTitle>
          <DialogDescription>
            This will be your vault's address. Please save it somewhere safe as
            you'll need it to access your vault later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-6 ">
          <div className="grid flex-1 gap-2">
            <Card
              className="py-2 px-4 break-all font-mono leading-[18px] text-xs tracking-[0.06em]"
              variant="foreground"
            >
              {vaultKeyPair?.address}
            </Card>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
          >
            <span className="">Copy</span>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mr-auto">
          <Button onClick={handleCreate} disabled={!vaultKeyPair}>
            Create Vault
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVault;
