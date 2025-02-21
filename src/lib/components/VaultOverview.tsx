import React, { useState } from "react";
import {
  VaultOverviewHeading,
  VaultOverviewCard,
  VaultOverviewSettings,
} from "@/lib/components";

export type OpenSection = "overview" | "settings";

const VaultOverview = () => {
  const [openSection, setOpenSection] = useState<OpenSection>("overview");

  return (
    <div className="flex flex-col gap-4">
      <VaultOverviewHeading
        openSection={openSection}
        setOpenSection={setOpenSection}
      />
      {openSection === "overview" && <VaultOverviewCard />}
      {openSection === "settings" && <VaultOverviewSettings />}
    </div>
  );
};

export default VaultOverview;
