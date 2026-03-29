"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, type Config } from "wagmi";
import { http as viemHttp } from "viem";
import { mainnet, sepolia, type Chain } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const CHAINS: Record<string, Chain> = { mainnet, sepolia };
const primaryName = process.env.NEXT_PUBLIC_CHAIN || "mainnet";
export const PROOF_CHAIN = CHAINS[primaryName] || mainnet;
const rest = Object.values(CHAINS).filter((c) => c.id !== PROOF_CHAIN.id);
const customRpc = process.env.NEXT_PUBLIC_RPC_URL;

const config: Config = getDefaultConfig({
  appName: "GhostBalance",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER",
  chains: [PROOF_CHAIN, ...rest] as [Chain, ...Chain[]],
  ssr: true,
  ...(customRpc && {
    transports: Object.fromEntries(
      [PROOF_CHAIN, ...rest].map((c) =>
        [c.id, c.id === PROOF_CHAIN.id ? viemHttp(customRpc) : viemHttp()]
      ),
    ),
  }),
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
