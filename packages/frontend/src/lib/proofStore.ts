export interface StoredProofBundle {
  proofA: number[];
  publicInputsA: string[];
  proofB1: number[];
  publicInputsB1: string[];
  proofB2: number[];
  publicInputsB2: string[];
  proofB3: number[];
  publicInputsB3: string[];
  proofB4: number[];
  publicInputsB4: string[];
  nullifier: string;
  publicBalance: string;
  blockNumber: number;
  blockHash: string;
  createdAt: number;
}

const STORAGE_KEY = "ghostbalance-proof";
const NULLIFIER_SEED_KEY = "ghostbalance-nullifier-seed";

export function saveProofBundle(bundle: StoredProofBundle): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadProofBundle(): StoredProofBundle | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProofBundle;
  } catch {
    return null;
  }
}

export function clearProofBundle(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasProofBundle(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

// Nullifier seed is stored separately so it persists across logouts
// (proof bundle is cleared on logout, but nullifier seed must survive for reprove)

export function saveNullifierSeed(weiString: string): void {
  try {
    localStorage.setItem(NULLIFIER_SEED_KEY, weiString);
  } catch {
    // ignore
  }
}

export function loadNullifierSeed(): string | null {
  try {
    return localStorage.getItem(NULLIFIER_SEED_KEY);
  } catch {
    return null;
  }
}