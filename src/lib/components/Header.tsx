import Image from "next/image";
import Link from "next/link";

const Header = () => {
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
      <div className="flex items-center gap-4">{/* <ConnectWallet /> */}</div>
    </div>
  );
};

export default Header;
