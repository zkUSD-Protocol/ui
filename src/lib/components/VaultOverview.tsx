import {
  VaultOverviewCard,
  VaultOverviewHeading,
  VaultOverviewSettings,
} from "@/lib/components";
import { useState } from "react";

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
