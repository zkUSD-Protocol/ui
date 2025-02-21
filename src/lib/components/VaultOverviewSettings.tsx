import React from "react";
import { Card, Button } from "./ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { useVaultManager } from "@/lib/context/vault-manager";
import { useRouter } from "next/navigation";
import { useVault } from "../context/vault";

const VaultOverviewSettings = () => {
  const { vault } = useVault();
  const { removeVaultAddress } = useVaultManager();
  const router = useRouter();

  if (!vault) return null;

  const handleRemoveVault = () => {
    removeVaultAddress(vault?.vaultAddress);
    router.push("/");
  };

  return (
    <Card className="p-8 w-full">
      <div className="flex flex-col gap-4">
        <p className="text-white font-sans leading-[24px] tracking-[0.06em]">
          Remove Vault
        </p>
        <p className="text-muted-foreground text-xs font-sans font-light leading-[18px] tracking-[0.06em]">
          You can remove the vault from the app to stop tracking it. NOTE: This
          only removes your vault locally, it does not remove the vault
          on-chain.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive-outline" className="w-fit">
              Remove Vault
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-white font-sans leading-[24px] tracking-[0.06em]">
                Remove Vault
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs font-sans font-light leading-[18px] tracking-[0.06em]">
                Are you sure you want to remove this vault? Make sure you have
                saved the vault address somewhere safe if you want to import it
                again later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">No, Go Back</Button>
              </DialogClose>
              <Button variant="destructive-outline" onClick={handleRemoveVault}>
                Yes, Remove Vault
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default VaultOverviewSettings;
