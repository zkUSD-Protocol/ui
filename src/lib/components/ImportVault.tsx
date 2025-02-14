"use client";
import React, { useEffect, useState } from "react";
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
import ErrorMessage from "./ErrorMessage";

type ImportVaultProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ImportVault = ({ open, onOpenChange }: ImportVaultProps) => {
  const [error, setError] = useState("");
  const [vaultAddress, setVaultAddress] = useState("");
  const { vaultAddresses, importVaultAddress } = useVaultManager();

  useEffect(() => {
    setError("");
  }, [open]);

  const handleImportVault = async () => {
    setError("");
    try {
      // Validate the address is a valid base58 PublicKey
      PublicKey.fromBase58(vaultAddress);

      // Check if vault is already imported
      if (vaultAddresses && vaultAddresses.includes(vaultAddress)) {
        setError("Vault already imported");
        return;
      }

      // Add the vault address
      const error = await importVaultAddress(vaultAddress);
      if (error) {
        setError(error);
        return;
      }

      // Clear the input and close dialog
      setVaultAddress("");
      onOpenChange(false);
    } catch (err) {
      setError("Invalid vault address");
    }
  };
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Import an existing vault</DialogTitle>
            <DialogDescription>
              Enter the address of the vault you want to import.
            </DialogDescription>
          </DialogHeader>

          <Input
            id="vault-address"
            value={vaultAddress}
            onChange={(e) => {
              setVaultAddress(e.target.value);
              setError("");
            }}
            placeholder="Paste address here"
            className="w-cover-full"
          />

          {!!error && (
            <>
              <div className="-my-4">
                <ErrorMessage error={error} />
              </div>
            </>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mr-auto">
            <Button onClick={handleImportVault}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportVault;
