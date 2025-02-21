import React from "react";
import { Card } from "./ui";
import { Info } from "lucide-react";

const ProjectedInfo = () => {
  return (
    <Card className="py-2 px-4">
      <div className="relative flex items-center gap-4">
        <Info style={{ width: "12px", height: "12px" }} className="w-3 h-3 " />
        <p className="font-sans mt-[3px] font-light text-xs leading-[18px]  tracking-[0.08em] text-white">
          Check your vault for projected values
        </p>
      </div>
    </Card>
  );
};

export default ProjectedInfo;
