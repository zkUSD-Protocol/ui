import { http, type Chain } from "vimina";
import { devnet, lightnet, mainnet } from "vimina/chains";
import { createConfig } from "wagmina";

const chainMap = {
  mainnet: mainnet,
  devnet: devnet,
  lightnet: lightnet,
};

export const chain = chainMap[
  process.env.NEXT_PUBLIC_CHAIN as keyof typeof chainMap
] as Chain;

export const config = createConfig({
  chains: [mainnet, devnet, lightnet],
  transports: {
    [mainnet.id]: http(),
    [devnet.id]: http(),
    [lightnet.id]: http(),
  },
});
