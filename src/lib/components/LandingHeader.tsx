import React from "react";
import { ConnectWallet } from "@/lib/components";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui";
import { useRouter } from "next/navigation";

const LandingHeader = () => {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center h-9">
      <div className="relative w-20 h-5 ">
        <Link href="/">
          <Image
            src="/assets/fizk.svg"
            alt="wordmark"
            layout="fill"
            objectFit="contain"
          />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/app/connect")}>
          Launch App
        </Button>
      </div>
    </div>
  );
};

export default LandingHeader;
