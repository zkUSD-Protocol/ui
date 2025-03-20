import Link from "next/link";
import Image from "next/image";
import React from "react";

const LandingFooter = () => {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-8 flex-1">
        <div className="relative w-10 h-5">
          <Link href="/">
            <Image
              src="/assets/fizk.svg"
              alt="wordmark"
              layout="fill"
              objectFit="contain"
            />
          </Link>
        </div>
        <p className="font-sans text-muted-foreground text-sm tracking-[0.06em]">
          Made with ❤️ on the Mina Protocol
        </p>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <p className="font-sans font-light text-muted-foreground text-sm tracking-[0.06em]">
          Protocol
        </p>
        <Link target="_blank" className="w-fit" href="https://docs.fizk.xyz/">
          <p className="font-mono font-light uppercase text-white text-sm tracking-[0.06em] hover:underline">
            Documentation
          </p>
        </Link>
        <Link
          target="_blank"
          className="w-fit"
          href="/assets/The Fizk Protocol - Whitepaper v0.1.pdf"
        >
          <p className="font-mono font-light uppercase text-white text-sm tracking-[0.06em] hover:underline">
            WhitePaper
          </p>
        </Link>
        <Link
          target="_blank"
          className="w-fit"
          href="https://github.com/zkUSD-Protocol/core"
        >
          <p className="font-mono font-light uppercase text-white text-sm tracking-[0.06em] hover:underline">
            GitHub
          </p>
        </Link>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <p className="font-sans font-light text-muted-foreground text-sm tracking-[0.06em]">
          Community
        </p>
        <Link
          target="_blank"
          className="w-fit"
          href="https://x.com/fizk_protocol"
        >
          <p className="font-mono font-light uppercase text-white text-sm tracking-[0.06em] hover:underline">
            X
          </p>
        </Link>
        <Link
          target="_blank"
          className="w-fit"
          href="https://discord.gg/q6q3EXRPpA"
        >
          <p className="font-mono uppercase text-white text-sm tracking-[0.06em] hover:underline">
            Discord
          </p>
        </Link>
        <Link
          target="_blank"
          className="w-fit"
          href="https://t.me/fizk_protocol"
        >
          <p className="font-mono font-light uppercase text-white text-sm tracking-[0.06em] hover:underline">
            Telegram
          </p>
        </Link>
      </div>
    </div>
  );
};

export default LandingFooter;
