// AppInitializer.tsx
"use client";
import { useClient } from "@/lib/context/client";
import { useVaultManager } from "@/lib/context/vault-manager";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { useAccount } from "wagmina";

interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { zkusd } = useClient();
  const { vaultAddresses } = useVaultManager();
  const { isConnected } = useAccount();

  const [isValidRoute, setIsValidRoute] = useState(false);
  useEffect(() => {
    if (!isConnected) {
      if (pathname !== "/app/connect") {
        router.push("/app/connect");
      }
      setIsValidRoute(true);
      return;
    }
    if (!zkusd || vaultAddresses === null) return;
    if (
      (pathname.startsWith("/app/vault/") &&
        vaultAddresses.includes(pathname.split("/")[3])) ||
      (vaultAddresses.length === 0 && pathname === "/app/onboarding")
    ) {
      setIsValidRoute(true);
      return;
    }
    router.replace(
      vaultAddresses.length === 0
        ? "/app/onboarding"
        : `/app/vault/${vaultAddresses[0]}`,
    );
  }, [isConnected, pathname, router, zkusd, vaultAddresses]);

  // Show a loading spinner until the app is ready and the current route is valid.
  if (!isValidRoute) {
    return (
      <div className="flex-1 items-center justify-center h-full w-full">
        <FadeLoader
          cssOverride={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(0, -10%)",
          }}
          color="hsl(var(--primary))"
          loading={true}
          width={1}
          height={10}
          margin={0}
          radius={2}
        />
      </div>
    );
  }

  // Render the app only when it's ready and on a valid route.
  return <>{children}</>;
}
