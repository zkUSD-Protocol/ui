import { ChevronUp, Import, Plus } from "lucide-react";
import { CreateVault, ImportVault } from "@/lib/components/";
import { Card } from "@/lib/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { useState } from "react";
import { useVaultManager } from "../context/vault-manager";
import { Vault, ArrowRight } from "lucide-react";
import { formatDisplayAccount } from "../utils/formatting";
import Link from "next/link";

const VaultSelect = () => {
  const { vaultAddresses } = useVaultManager();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Card className="group flex justify-between items-center font-mono uppercase tracking-[0.06em] text-xs font-normal leading-[18px] py-3 px-5 w-48 h-11 cursor-pointer">
            Vaults
            <ChevronUp className="w-3 h-3 my-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setCreateDialogOpen(true);
                setMenuOpen(false);
              }}
            >
              <span>Create Vault</span>
              <Plus
                style={{ width: "12px", height: "12px" }}
                className="w-3 h-3 my-auto"
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setImportDialogOpen(true);
                setMenuOpen(false);
              }}
            >
              <span>Import Vault</span>
              <Import
                style={{ width: "12px", height: "12px" }}
                className="w-3 h-3 my-auto"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {vaultAddresses && vaultAddresses.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {vaultAddresses.map((address, index) => (
                  <Link
                    href={`/vault/${address}`}
                    key={index}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem>
                      <Vault
                        style={{ width: "20px", height: "20px" }}
                        className="my-auto text-primary"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs leading-[15px] tracking-[0.02em] text-white uppercase font-mono">
                          Vault {index + 1}
                        </span>
                        <span className="text-white text-xs leading-[13px] tracking-[0.02em] text-muted-foreground">
                          {formatDisplayAccount(address, 4)}
                        </span>
                      </div>
                      <ArrowRight
                        style={{ width: "12px", height: "12px" }}
                        className=" my-auto"
                      />
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateVault open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ImportVault open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </>
  );
};

export default VaultSelect;
