import React from "react";
import { TriangleAlert } from "lucide-react";

interface ErrorMessageProps {
  error: string;
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  return (
    <div className="flex items-center border border-destructive-foreground-border rounded-lg py-2 px-4 gap-4 bg-destructive-foreground text-white font-light font-sans leading-[18px] text-xs tracking-[0.08em]">
      <TriangleAlert
        style={{ width: "12px", height: "12px" }}
        className="my-auto"
      />
      <span className="mt-[3px]">{error}</span>
    </div>
  );
};

export default ErrorMessage;
