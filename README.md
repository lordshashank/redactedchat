# GhostBalance

**The only social network where your balance speaks but your identity stays hidden.**

[ghostbalance.chat](https://ghostbalance.chat)

GhostBalance is a privacy-first anonymous social platform built on zero-knowledge proofs. Users prove their ETH balance without revealing their wallet address, then interact through a pseudonymous identity — posting, following, messaging, and more. Your balance is public. Your identity is not.

## How It Works

GhostBalance uses [Noir](https://noir-lang.org/) ZK circuits to generate a proof that:

1. **You control a wallet** — by verifying an ECDSA signature over a fixed identity message
2. **Your balance meets a threshold** — by verifying the account's Ethereum state proof (block header RLP + MPT proof) entirely inside the circuit
3. **You get a pseudonymous identity** — a deterministic nullifier derived from your signature and balance, so the same wallet always produces the same identity

The proof reveals only: the claimed balance, block number, block hash, and the nullifier. The address, exact balance, and private key stay hidden.

## Features

- **Anonymous identity** — prove your ETH balance, get a pseudonymous profile
- **Social feed** — post, reply, repost, like, bookmark
- **Direct messages** — encrypted conversations between anonymous users
- **Balance tiers** — Dust, Rookie, Normie, Degen, Shark, Cartel, Phantom, Obsidian, Citadel
- **Leaderboard** — ranked by proven balance
- **Polls** — create and vote on polls
- **Notifications** — real-time alerts for interactions
- **Multiple themes** — Brutalist, Matrix, Synthwave, Art Deco, and more
- **Browser proving** — all ZK proofs generated client-side via bb.js WASM

## Architecture

The proof is split across 5 sub-circuits to fit within the browser's bb.js WASM proving limit (2^19 gates). All Ethereum data is pre-fetched in JavaScript — no oracle server needed.

```
Circuit A (identity_nullifier)     63K gates
    |  commitment
Circuit B1 (balance_header)       221K gates
    |  link_1
Circuit B2 (balance_mpt_step)     434K gates   — MPT nodes 0-3
    |  link_2
Circuit B3 (balance_mpt_step)     434K gates   — MPT nodes 4-7 (same circuit)
    |  link_3
Circuit B4 (balance_final)        284K gates   — remaining nodes + leaf + balance check
```

Inter-circuit integrity is maintained through Poseidon2 commitments (A -> B1) and blinded link commitments (B1 -> B2 -> B3 -> B4) that bind all private state across circuits.

For the full design — see **[packages/circuits/ARCHITECTURE.md](packages/circuits/ARCHITECTURE.md)**.

## Project Structure

```
ghostbalance/
├── packages/
│   ├── circuits/                     # Noir ZK circuits
│   │   ├── identity_nullifier/       # Circuit A: ECDSA + commitment + nullifier
│   │   ├── balance_header/           # Circuit B1: block header RLP + block hash
│   │   ├── balance_mpt_step/         # Circuit B2/B3: MPT node traversal (4 nodes each)
│   │   ├── balance_final/            # Circuit B4: remaining nodes + leaf + balance
│   │   ├── eth-primitives/           # Noir lib: link commitments, MPT, RLP, account
│   │   └── test/                     # Integration test against Sepolia
│   ├── frontend/                     # Next.js web app (Vercel)
│   │   ├── src/app/                  # Pages, API routes, OG image
│   │   ├── src/components/           # React components
│   │   ├── src/lib/noir/             # Proving pipeline, data fetching, MPT replay
│   │   └── public/circuits/          # Compiled circuit artifacts
│   └── backend/                      # Node.js API server (VPS + PM2)
│       ├── src/app/routes/           # 30+ REST endpoints
│       ├── src/auth/strategies/      # ZK proof verification, session auth
│       └── migrations/               # PostgreSQL schema
├── scripts/
│   └── build-circuits.sh             # Compile circuits + copy artifacts
└── package.json                      # npm workspaces root
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Circuits | Noir, Barretenberg (UltraHonk) |
| Frontend | Next.js, React, Tailwind, wagmi, RainbowKit |
| Backend | Node.js, PostgreSQL, raw HTTP server |
| Proving | bb.js WASM (browser-side) |
| Storage | Cloudflare R2 |
| Hosting | Vercel (frontend), VPS + PM2 + nginx (backend) |

## Getting Started

### Prerequisites

- [nargo](https://noir-lang.org/docs/getting_started/installation/) v1.0.0-beta.18
- [Node.js](https://nodejs.org/) 22+
- PostgreSQL 16+

### Build everything

```bash
npm install
npm run build          # circuits → frontend → backend
```

### Run locally

```bash
# Start backend (requires .env with DATABASE_URL, etc.)
cd packages/backend
npm run dev

# Start frontend
cd packages/frontend
npm run dev
```

Open http://localhost:3000, connect a wallet, and generate a proof.

### Run circuit integration tests

```bash
npm run test:integration           # Execute only (witness + constraint check)
npm run test:integration:prove     # Full: execute + prove + verify
```

## Dependencies

### Circuits
- [keccak256](https://github.com/noir-lang/keccak256) v0.1.2 — Keccak hash for EIP-191, address derivation, block hash, MPT node hashing
- [poseidon](https://github.com/noir-lang/poseidon) v0.1.1 — Poseidon2 hash for commitments, links, and nullifiers
- `eth-primitives/` — Vendored from [eth-proofs](https://github.com/lordshashank/eth-proofs): MPT verification, RLP decoding, account state parsing

### Frontend
- `@noir-lang/noir_js` — Circuit execution (witness generation)
- `@aztec/bb.js` — UltraHonk proof generation/verification (Barretenberg WASM)
- `next`, `react` — Web framework
- `wagmi`, `viem`, `@rainbow-me/rainbowkit` — Wallet connection

### Backend
- `pg` — PostgreSQL client
- `@aztec/bb.js` — Server-side proof verification
- `@aws-sdk/client-s3` — Cloudflare R2 file storage
