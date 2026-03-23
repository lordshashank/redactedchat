import type { Post } from "@/components/PostItem";

export const DUMMY_POSTS: Post[] = [
  {
    id: "1",
    balance: "42.8 ETH",
    timeAgo: "12m",
    body: "Identity is the final frontier of decentralization. ZK proofs aren't just for scaling; they are for human dignity. Discuss.",
    comments: 24,
    reposts: 12,
    likes: 156,
  },
  {
    id: "2",
    balance: "156.4 ETH",
    timeAgo: "45m",
    body: "ETH/BTC pair testing critical monthly support. The divergence in RSI suggests a massive rotational move coming. Eyeing $3,200 as the springboard.",
    imageUrl: "chart",
    comments: 8,
    reposts: 42,
    likes: 312,
  },
  {
    id: "3",
    balance: "1,200 ETH",
    timeAgo: "4h",
    body: "Just moved 1,200 ETH into the GhostPool. Yield looks sustainable and the anonymity set is thickening. WAGMI.",
    comments: 142,
    reposts: 56,
    likes: 1200,
  },
  {
    id: "4",
    balance: "8.4 ETH",
    timeAgo: "6h",
    body: "Built a new nullifier rotation scheme that reduces proof generation time by 40%. Open-sourcing next week. Privacy is a public good.",
    comments: 31,
    reposts: 18,
    likes: 89,
  },
  {
    id: "5",
    balance: "0.5 ETH",
    timeAgo: "8h",
    body: "Just verified my first balance proof on GhostBalance. The future of anonymous social is here. No doxxing, just vibes.",
    comments: 5,
    reposts: 3,
    likes: 22,
  },
];

export const TRENDING_TAGS = [
  { category: "Protocol_Tag", tag: "#ZeroKnowledge", count: "12.5k GhostPost" },
  { category: "Asset_Tag", tag: "$GHOST", count: "8.2k GhostPost" },
  { category: "Security_Tag", tag: "Nullifier_Rotate", count: "4.1k GhostPost" },
];

export const WHO_TO_FOLLOW = [
  { balance: "24.5 ETH", handle: "ZK_DEV" },
  { balance: "12.7 ETH", handle: "MACRO_ANLYST" },
  { balance: "45.2 ETH", handle: "PROTOCOL_JUNKIE" },
];

export const LEADERBOARD_PREVIEW = [
  { rank: "01", balance: "1,200 ETH", tier: "WHALE", score: "24,502 GT" },
  { rank: "02", balance: "842.1 ETH", tier: "DEITY", score: "18,911 GT" },
];

export const LEADERBOARD_TOP3 = [
  { rank: 1, balance: "142.7 ETH", tier: "Elite Tier", followers: "12.8k Followers" },
  { rank: 2, balance: "84.2 ETH", tier: "Platinum Tier", posts: "4.2k Posts" },
  { rank: 3, balance: "23.1 ETH", tier: "Gold Tier", posts: "3.1k Posts" },
];

export const LEADERBOARD_LIST = [
  { rank: 4, balance: "5.2 ETH", tier: "Gold Tier", posts: 1240, followers: 2810, highlighted: true },
  { rank: 5, balance: "3.8 ETH", tier: "Gold Tier", posts: 982, followers: 2110, highlighted: true },
  { rank: 6, balance: "2.4 ETH", tier: null, posts: 870, followers: 1902 },
  { rank: 7, balance: "1.9 ETH", tier: null, posts: 762, followers: 1844 },
  { rank: 8, balance: "0.8 ETH", tier: null, posts: 612, followers: 1620 },
];

export const TIER_DISTRIBUTION = [
  { balance: "150.2 ETH", pct: "0.1%", width: "5%" },
  { balance: "45.6 ETH", pct: "4.2%", width: "25%" },
  { balance: "4.2 ETH", pct: "12.5%", width: "55%" },
  { balance: "0.35 ETH", pct: "83.2%", width: "90%" },
];

export const RECENT_MOVERS = [
  { balance: "12.1 ETH", change: "+12 Spots", direction: "up" as const },
  { balance: "3.4 ETH", change: "+8 Spots", direction: "up" as const },
  { balance: "0.18 ETH", change: "-4 Spots", direction: "down" as const },
];

export const PROFILE_POSTS: Post[] = [
  {
    id: "p1",
    balance: "23.1 ETH",
    timeAgo: "2h",
    body: "The transition from public verification to ZK-proofs is the most significant privacy leap of this decade. No disclosure is the new standard.",
    comments: 24,
    reposts: 12,
    likes: 156,
  },
  {
    id: "p2",
    balance: "23.1 ETH",
    timeAgo: "5h",
    body: "Generating proofs for the latest governance vote. Privacy shouldn't mean exclusion from participation.",
    imageUrl: "governance",
    comments: 8,
    reposts: 42,
    likes: 312,
  },
];

export const ACTIVITY_HISTORY = [
  { date: "Oct 24, 2023", label: "Status Re-verified", active: true },
  { date: "Sep 12, 2023", label: "Badge Minted", active: false },
  { date: "Aug 05, 2023", label: "Nullifier Rotation", active: false },
];

export const SUGGESTED_USERS = [
  { balance: "12.4 ETH", handle: "ZK_Researcher" },
  { balance: "45.2 ETH", handle: "Protocol_Junkie" },
];
