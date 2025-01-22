"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useVaultManager } from "@/lib/context/vault-manager";
import { PublicKey } from "o1js";
import { Button } from "./ui";

const ImportVault = () => {
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [vaultAddress, setVaultAddress] = useState("");
  const { vaultAddresses, importVaultAddress } = useVaultManager();

  const handleImportVault = () => {
    setError("");
    try {
      // Validate the address is a valid base58 PublicKey
      PublicKey.fromBase58(vaultAddress);

      // Check if vault is already imported
      if (vaultAddresses.includes(vaultAddress)) {
        setError("Vault already imported");
        return;
      }

      // Add the vault address
      importVaultAddress(vaultAddress);

      // Clear the input and close dialog
      setVaultAddress("");
      setOpen(false);
    } catch (err) {
      setError("Invalid vault address");
    }
  };
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Import Vault</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Vault</DialogTitle>
            <DialogDescription>
              Enter the address of the vault you want to import.
            </DialogDescription>
          </DialogHeader>

          <Input
            id="vault-address"
            value={vaultAddress}
            onChange={(e) => setVaultAddress(e.target.value)}
            placeholder="Enter vault address"
            className="w-cover-full"
          />

          {error && (
            <span className="text-sm text-red-500 text-center">{error}</span>
          )}

          <DialogFooter>
            <Button onClick={handleImportVault}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportVault;
