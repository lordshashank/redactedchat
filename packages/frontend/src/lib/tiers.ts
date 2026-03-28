export interface Tier {
  name: string;
  minEth: number;
  maxEth: number | null; // null = no upper bound
}

const TIERS: Tier[] = [
  { name: "Dust", minEth: 0, maxEth: 0 },
  { name: "Normie", minEth: 0, maxEth: 1 },
  { name: "Degen", minEth: 1, maxEth: 10 },
  { name: "Shark", minEth: 10, maxEth: 50 },
  { name: "Cartel", minEth: 50, maxEth: 100 },
  { name: "Phantom", minEth: 100, maxEth: 500 },
  { name: "Obsidian", minEth: 500, maxEth: 1000 },
  { name: "Citadel", minEth: 1000, maxEth: null },
];

export function getTier(balanceEth: number): Tier {
  if (balanceEth === 0) return TIERS[0]; // Dust
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (balanceEth >= TIERS[i].minEth) return TIERS[i];
  }
  return TIERS[0];
}

export function getTierName(balanceEth: number): string {
  return getTier(balanceEth).name;
}

export function formatTierRange(tier: Tier): string {
  if (tier.name === "Dust") return "0 ETH";
  if (tier.maxEth === null) return `${tier.minEth}+ ETH`;
  return `${tier.minEth} - ${tier.maxEth} ETH`;
}

export { TIERS };
