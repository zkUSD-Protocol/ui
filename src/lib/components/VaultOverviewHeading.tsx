import React from "react";
import { useVault } from "../context/vault";
import { formatDisplayAccount } from "../utils/formatting";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { OpenSection } from "./VaultOverview";

type VaultOverviewHeadingProps = {
  openSection: OpenSection;
  setOpenSection: (section: OpenSection) => void;
};

const VaultOverviewHeading = ({
  openSection,
  setOpenSection,
}: VaultOverviewHeadingProps) => {
  const { vault } = useVault();

  if (!vault) return null;

  return (
    <div className="h-8 flex items-end">
      {openSection === "overview" ? (
        <div className="flex justify-between w-full">
          <div className="flex gap-4 items-end">
            <h1 className="font-serif font-thin italic text-3xl leading-[32px] tracking-tighter text-white">
              Your vault
            </h1>
            <p className="hidden sm:block font-mono text-xs leading-[18px] tracking-[0.02em] text-white">
              {formatDisplayAccount(vault?.vaultAddress, 6)}
            </p>
          </div>
          <div
            onClick={() => setOpenSection("settings")}
            className="flex items-end uppercase font-mono font-light text-xs leading-[18px] tracking-[0.02em] text-white hover:underline  hover:cursor-pointer"
          >
            <span className="flex items-center gap-1">
              Vault Settings
              <ArrowRight style={{ width: "12px", height: "12px" }} />
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setOpenSection("overview")}
          className="flex items-end uppercase font-mono font-light text-xs leading-[18px] tracking-[0.02em] text-white hover:underline  hover:cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <ArrowLeft style={{ width: "12px", height: "12px" }} />
            Vault Overview
          </span>
        </div>
      )}
    </div>
  );
};

export default VaultOverviewHeading;
