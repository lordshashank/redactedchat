// Pre-fetches all Ethereum data needed for the sharded balance circuits (B1-B4).
// Replaces the oracle server entirely -- all data is pre-fetched and passed as circuit inputs.

import { type Hex, hexToBytes, keccak256, toHex, toRlp } from "viem";
import {
  blockToHeader,
  headerToRlp,
  type Block,
} from "@/lib/oracles/encode/blockHeader";

export interface ProofDataHeader {
  rlpBytes: Uint8Array;
  rlpLen: number;
  stateRoot: Uint8Array;
}

export interface ProofDataAccount {
  nonce: bigint;
  balance: bigint;
  storageHash: Uint8Array;
  codeHash: Uint8Array;
  rlpBytes: Uint8Array;
}

export interface ProofDataMpt {
  internalNodes: Uint8Array[];
  leaf: Uint8Array;
  depth: number;
}

export interface ProofData {
  header: ProofDataHeader;
  account: ProofDataAccount;
  mpt: ProofDataMpt;
  addressHash: Uint8Array;
}

/**
 * Fetch all data needed for circuits B1-B4.
 * Uses the existing blockToHeader + headerToRlp from the oracles/encode module.
 */
export async function fetchProofData(
  publicClient: {
    getBlock: (args: { blockNumber: bigint }) => Promise<Block>;
    getProof: (args: {
      address: Hex;
      storageKeys: Hex[];
      blockNumber: bigint;
    }) => Promise<{
      accountProof: Hex[];
      nonce: number;
      balance: bigint;
      storageHash: Hex;
      codeHash: Hex;
    }>;
  },
  address: Hex,
  blockNumber: bigint
): Promise<ProofData> {
  // Fetch block header and account proof in parallel
  const [block, proof] = await Promise.all([
    publicClient.getBlock({ blockNumber }),
    publicClient.getProof({ address, storageKeys: [], blockNumber }),
  ]);

  // RLP-encode the header using existing helpers
  const header = blockToHeader(block);
  const headerRlpHex = headerToRlp(header);
  const headerRlpBytes = hexToBytes(headerRlpHex);

  // Parse MPT proof nodes
  const proofNodes = proof.accountProof.map((hex) => hexToBytes(hex));
  const internalNodes = proofNodes.slice(0, -1);
  const leaf = proofNodes[proofNodes.length - 1];
  const depth = proofNodes.length;

  // Build account RLP value
  const accountRlpHex = toRlp([
    proof.nonce === 0 ? "0x" : toHex(proof.nonce),
    proof.balance === 0n ? "0x" : toHex(proof.balance),
    proof.storageHash,
    proof.codeHash,
  ]);
  const accountRlpBytes = hexToBytes(accountRlpHex as Hex);

  return {
    header: {
      rlpBytes: headerRlpBytes,
      rlpLen: headerRlpBytes.length,
      stateRoot: hexToBytes(block.stateRoot),
    },
    account: {
      nonce: BigInt(proof.nonce),
      balance: proof.balance,
      storageHash: hexToBytes(proof.storageHash),
      codeHash: hexToBytes(proof.codeHash),
      rlpBytes: accountRlpBytes,
    },
    mpt: {
      internalNodes,
      leaf,
      depth,
    },
    addressHash: hexToBytes(keccak256(address)),
  };
}
