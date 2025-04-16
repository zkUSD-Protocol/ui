import { WagminaAdapter, type WagminaAppKitNetwork } from "@wagmina/appkit";
import {
  minaDevnet,
  minaLightnet,
  minaMainnet,
} from "@wagmina/appkit/networks";
import { http } from "vimina";

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const metadata = {
  name: "Fizk",
  description: "zkUSD Protocol",
  url: "https://devnet.fizk.xyz/",
  icons: ["https://devnet.fizk.xyz/assets/favicon_fizk.png"],
};

const networkMap: {
  [key: string]: WagminaAppKitNetwork;
} = {
  mainnet: minaMainnet,
  devnet: minaDevnet,
  lightnet: minaLightnet,
};

export const network =
  networkMap[process.env.NEXT_PUBLIC_CHAIN as keyof typeof networkMap];

export const networks: [WagminaAppKitNetwork, ...WagminaAppKitNetwork[]] = [
  network,
];

//Set up the Wagmina Adapter (Config)
export const wagminaAdapter = new WagminaAdapter({
  projectId,
  networks,
  excludeWalletIds: ["co.pallad"],
  transports: {
    [minaMainnet.id]: http(),
    [minaDevnet.id]: http(),
    [minaLightnet.id]: http(),
  },
});

export const config = wagminaAdapter.wagminaConfig;
