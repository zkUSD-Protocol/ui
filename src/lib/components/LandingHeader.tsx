import React from "react";
import { LandingNav } from "@/lib/components";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui";
import { useRouter } from "next/navigation";

const LandingHeader = () => {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center h-9">
      <div className="relative w-20 h-5">
        <Link href="/">
          <Image
            src="/assets/fizk.svg"
            alt="wordmark"
            layout="fill"
            objectFit="contain"
          />
        </Link>
      </div>
      <div className="hidden sm:block w-20 h-5">
        <LandingNav />
      </div>
    </div>
  );
};

export default LandingHeader;
