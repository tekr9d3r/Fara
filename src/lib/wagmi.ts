import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { defineChain } from "viem";

export const robinhoodChain = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.testnet.chain.robinhood.com" },
  },
  testnet: true,
});

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [robinhoodChain],
    transports: {
      [robinhoodChain.id]: http("https://rpc.testnet.chain.robinhood.com"),
    },
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "",
    appName: "Fara",
    appDescription: "Hunt stocks in the wild.",
  })
);
