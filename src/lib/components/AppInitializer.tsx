// AppInitializer.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClient } from "@/lib/context/client";
import { useAccount } from "@/lib/context/account";
import { useVaultManager } from "@/lib/context/vault-manager";
import FadeLoader from "react-spinners/FadeLoader";

interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { zkusd } = useClient();
  const { accountInitialized, isConnected } = useAccount();
  const { vaultAddresses, vaultsLoaded } = useVaultManager();

  // App is ready when all async pieces are loaded.
  const appReady = zkusd && accountInitialized && vaultsLoaded;

  // Define the default route based on the state.
  const defaultRoute = !isConnected
    ? "/connect"
    : !vaultAddresses || vaultAddresses.length === 0
    ? "/onboarding"
    : `/vault/${vaultAddresses[0]}`;

  // Determine if the current pathname is valid.
  const validRoute =
    (!isConnected && pathname === "/connect") ||
    (isConnected &&
      (!vaultAddresses || vaultAddresses.length === 0) &&
      pathname === "/onboarding") ||
    (isConnected &&
      vaultAddresses &&
      vaultAddresses.length > 0 &&
      pathname.startsWith("/vault/") &&
      vaultAddresses.includes(pathname.split("/")[2]));

  // If the app is ready but the route isn't valid, redirect to the default route.
  useEffect(() => {
    if (!appReady) return;

    // If the current vault path is one of the valid ones, don't redirect.
    if (
      pathname.startsWith("/vault/") &&
      vaultAddresses?.includes(pathname.split("/")[2])
    ) {
      return;
    }

    if (!validRoute) {
      router.replace(defaultRoute);
    }
  }, [appReady, pathname, defaultRoute, router, vaultAddresses, validRoute]);

  // Show a loading spinner until the app is ready and the current route is valid.
  if (!appReady || !validRoute) {
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
