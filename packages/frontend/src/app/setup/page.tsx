"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, type Hex } from "viem";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { IDENTITY_MESSAGE, recoverIdentity } from "@/lib/noir/identity";
import {
  generateShardedProof,
  type CircuitAInputs,
} from "@/lib/noir/prove";
import { fetchProofData } from "@/lib/noir/fetchProofData";

type Status =
  | "idle"
  | "signing"
  | "fetching_data"
  | "executing"
  | "proving"
  | "verifying"
  | "done"
  | "error";

interface VerifyResult {
  valid: boolean;
  blockNumber: number;
  publicBalance: string;
  blockHash: string;
  nullifier: string;
}

function generateBlinding(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(31));
  let value = 0n;
  for (const b of bytes) {
    value = (value << 8n) | BigInt(b);
  }
  return value.toString();
}

function addressToByteStrings(address: string): string[] {
  const hex = address.startsWith("0x") ? address.slice(2) : address;
  const bytes: string[] = [];
  for (let i = 0; i < 40; i += 2) {
    bytes.push("0x" + hex.slice(i, i + 2));
  }
  return bytes;
}

function getStepNumber(status: Status): number {
  switch (status) {
    case "idle":
      return 1;
    case "signing":
    case "fetching_data":
    case "executing":
    case "proving":
    case "verifying":
      return 2;
    case "done":
      return 3;
    case "error":
      return 2;
    default:
      return 1;
  }
}

function OnboardingSidebar({
  status,
  completedSteps,
  statusMessage,
  error,
}: {
  status: Status;
  completedSteps: string[];
  statusMessage: string;
  error: string | null;
}) {
  const currentStep = getStepNumber(status);

  return (
    <>
      {/* Onboarding Path */}
      <section className="glass-panel p-6">
        <h3 className="font-bold mb-6 tracking-tight text-primary matrix-glow flex items-center gap-2 uppercase text-xs tracking-[0.2em]">
          <Icon name="route" className="text-lg" />
          Onboarding Path
        </h3>
        <div className="space-y-6 font-mono">
          <div className="border-l-2 border-outline pl-4 py-1 relative">
            <div
              className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                currentStep >= 1
                  ? "bg-primary glow-dot"
                  : "bg-primary/20"
              }`}
            />
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
              Step 1
            </p>
            <p className="text-xs font-bold text-primary">Setup Profile</p>
            <p className="text-[9px] text-on-surface-variant uppercase mt-1">
              {currentStep === 1 ? "Active Phase" : "Complete"}
            </p>
          </div>
          <div className="border-l-2 border-outline pl-4 py-1 relative">
            <div
              className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                currentStep >= 2
                  ? "bg-primary glow-dot"
                  : "bg-primary/20"
              }`}
            />
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
              Step 2
            </p>
            <p
              className={`text-xs font-bold ${
                currentStep >= 2 ? "text-primary" : "text-on-surface-variant/60"
              }`}
            >
              Generate Proof
            </p>
            <p
              className={`text-[9px] uppercase mt-1 ${
                currentStep === 2
                  ? "text-on-surface-variant"
                  : currentStep > 2
                  ? "text-on-surface-variant"
                  : "text-on-surface-variant/50"
              }`}
            >
              {currentStep < 2
                ? "Locked"
                : currentStep === 2
                ? "Active Phase"
                : "Complete"}
            </p>
          </div>
          <div className="border-l-2 border-outline pl-4 py-1 relative">
            <div
              className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                currentStep >= 3
                  ? "bg-primary glow-dot"
                  : "bg-primary/20"
              }`}
            />
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
              Step 3
            </p>
            <p
              className={`text-xs font-bold ${
                currentStep >= 3 ? "text-primary" : "text-on-surface-variant/60"
              }`}
            >
              Profile Created
            </p>
            <p
              className={`text-[9px] uppercase mt-1 ${
                currentStep >= 3 ? "text-on-surface-variant" : "text-on-surface-variant/50"
              }`}
            >
              {currentStep >= 3 ? "Complete" : "Locked"}
            </p>
          </div>
        </div>
      </section>

      {/* Proof Progress */}
      {completedSteps.length > 0 && (
        <section className="glass-panel p-6">
          <h4 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 matrix-glow uppercase tracking-widest">
            <Icon name="terminal" className="text-primary text-lg" />
            Proof Log
          </h4>
          <div className="space-y-2 font-mono text-[11px] max-h-64 overflow-y-auto no-scrollbar">
            {completedSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary shrink-0">&#10003;</span>
                <span className="text-on-surface-variant">{step}</span>
              </div>
            ))}
            {statusMessage && status !== "done" && status !== "error" && (
              <div className="flex items-start gap-2">
                <span className="animate-spin text-primary shrink-0">&#9696;</span>
                <span className="text-on-surface-variant">{statusMessage}</span>
              </div>
            )}
            {status === "done" && statusMessage && (
              <div className="flex items-start gap-2">
                <span className="text-primary shrink-0">&#10003;</span>
                <span className="text-primary font-bold">{statusMessage}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <section className="glass-panel p-6 border-red-500/30">
          <h4 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-widest">
            Error
          </h4>
          <p className="text-[11px] text-red-400/80 font-mono break-all">
            {error}
          </p>
        </section>
      )}

      {/* Info Card */}
      <section className="glass-panel p-6">
        <h4 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 matrix-glow uppercase tracking-widest">
          <Icon name="info" className="text-primary text-lg" />
          Protocol Logic
        </h4>
        <p className="text-[11px] leading-relaxed text-on-surface-variant font-mono">
          Our zero-knowledge architecture ensures your verified balance becomes
          your public identity without ever revealing your wallet addresses.
          <br />
          <br />
          Once proof is generated, it is cryptographically tied to your profile
          pseudonym, allowing you to interact with the elite tiers of the
          ecosystem with total privacy.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-5 text-[10px] text-on-surface-variant/50 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest font-mono">
        <p className="w-full mb-2">© 2024 TERMINAL.GHOSTBALANCE.CHAT</p>
        <a className="hover:text-primary transition-colors" href="#">
          PRIVACY_MASK
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          TERMS_OF_SERVICE
        </a>
        <a className="hover:text-primary transition-colors" href="#">
          KERNEL_STATUS
        </a>
      </footer>
    </>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { signMessageAsync } = useSignMessage();

  const [bio, setBio] = useState("");
  const [publicBalance, setPublicBalance] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isWorking =
    status !== "idle" && status !== "done" && status !== "error";

  const canGenerateProof =
    isConnected && publicBalance && parseFloat(publicBalance) > 0 && !isWorking;

  const handleProve = useCallback(async () => {
    if (!isConnected || !publicClient || !chain || !address) return;

    setStatus("signing");
    setStatusMessage("Signing identity message...");
    setCompletedSteps([]);
    setResult(null);
    setError(null);

    const addStep = (step: string) =>
      setCompletedSteps((prev) => [...prev, step]);

    try {
      const signature = await signMessageAsync({
        message: IDENTITY_MESSAGE,
      });
      addStep("Identity message signed");

      const identity = await recoverIdentity(signature as Hex);
      addStep("Public key recovered from signature");

      setStatus("fetching_data");
      setStatusMessage("Fetching latest block...");
      const blockNumber = await publicClient.getBlockNumber();
      addStep(`Block number fetched: ${blockNumber}`);

      setStatusMessage("Fetching Ethereum state proof...");
      const proofData = await fetchProofData(
        publicClient as Parameters<typeof fetchProofData>[0],
        address as Hex,
        blockNumber
      );
      addStep(
        `State proof fetched (${proofData.mpt.depth} nodes, ${proofData.header.rlpLen}B header)`
      );

      const pubBalanceWei = parseEther(publicBalance);
      const nullBalanceWei = pubBalanceWei;
      const blinding = generateBlinding();

      const inputsA: CircuitAInputs = {
        nullifier_balance: nullBalanceWei.toString(),
        signature: identity.signature,
        public_key_x: identity.pubKeyX,
        public_key_y: identity.pubKeyY,
        blinding,
      };

      setStatus("executing");
      addStep("Starting sharded proof generation (5 circuits)...");
      const proofResult = await generateShardedProof(
        inputsA,
        proofData,
        blockNumber,
        pubBalanceWei,
        nullBalanceWei,
        blinding,
        addressToByteStrings(address),
        (msg) => {
          if (msg.includes("[7/12]")) {
            setStatus("proving");
            addStep("All 5 circuits executed successfully");
          }
          if (msg.includes("[12/12]")) {
            addStep("All 5 proofs generated");
          }
          setStatusMessage(msg);
        }
      );
      addStep(
        `Proofs ready (A:${proofResult.proofA.length}B B1:${proofResult.proofB1.length}B ` +
          `B2:${proofResult.proofB2.length}B B3:${proofResult.proofB3.length}B B4:${proofResult.proofB4.length}B)`
      );

      setStatus("verifying");
      setStatusMessage("Verifying all 5 proofs on server...");

      const verifyResp = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofA: Array.from(proofResult.proofA),
          publicInputsA: proofResult.publicInputsA,
          proofB1: Array.from(proofResult.proofB1),
          publicInputsB1: proofResult.publicInputsB1,
          proofB2: Array.from(proofResult.proofB2),
          publicInputsB2: proofResult.publicInputsB2,
          proofB3: Array.from(proofResult.proofB3),
          publicInputsB3: proofResult.publicInputsB3,
          proofB4: Array.from(proofResult.proofB4),
          publicInputsB4: proofResult.publicInputsB4,
        }),
      });

      if (!verifyResp.ok) {
        const errBody = await verifyResp.text();
        throw new Error(`Verification request failed: ${errBody}`);
      }

      const verifyResult: VerifyResult = await verifyResp.json();
      setResult(verifyResult);
      setStatus("done");
      addStep("Server verification complete");
      setStatusMessage("All proofs verified!");
    } catch (err) {
      console.error("Prove error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
      setStatusMessage("");
    }
  }, [
    isConnected,
    publicClient,
    chain,
    address,
    signMessageAsync,
    publicBalance,
  ]);

  return (
    <AppLayout
      rightSidebar={
        <OnboardingSidebar
          status={status}
          completedSteps={completedSteps}
          statusMessage={statusMessage}
          error={error}
        />
      }
    >
      <PageHeader
        title="Setup Profile"
        subtitle="Initialization Phase"
        showBack
        onBack={() => router.back()}
      />

      <div className="p-6 space-y-8">
        {/* Hero */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-primary matrix-glow">
            Create Your GhostBalance Profile
          </h2>
          <p className="text-on-surface-variant text-sm font-mono">
            Your identity is your balance. Stay anonymous.
          </p>
        </div>

        <div className="space-y-10">
          {/* Banner + Avatar Upload */}
          <div className="relative group">
            <div className="h-40 w-full bg-background border border-dashed border-outline group-hover:border-primary/60 transition-colors cursor-pointer flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <Icon
                  name="add_a_photo"
                  className="text-3xl text-on-surface-variant/60 mb-1"
                />
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 group-hover:text-primary transition-colors font-bold font-mono">
                  Upload Banner Image
                </p>
              </div>
            </div>
            <div className="absolute -bottom-8 left-6">
              <div className="h-20 w-20 bg-background border-2 border-primary overflow-hidden flex items-center justify-center cursor-pointer group/avatar relative">
                <Icon name="camera" className="text-2xl text-on-surface-variant/60" />
                <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Icon name="upload" className="text-primary text-lg" />
                  <span className="text-[8px] text-primary uppercase font-bold">
                    Avatar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-6">
            {/* Bio */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest text-primary font-bold font-mono">
                  Bio
                </label>
                <span className="text-[10px] text-on-surface-variant/60 font-mono">
                  {bio.length}/240
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value.slice(0, 240))
                }
                className="w-full bg-background border border-outline focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 p-4 transition-all min-h-[100px] resize-none font-mono text-sm"
                placeholder="Tell the world something about yourself without revealing who you are"
              />
            </div>

            {/* Wallet Connection */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-primary font-bold block font-mono">
                Security &amp; Authentication
              </label>
              {isConnected ? (
                <div className="w-full bg-primary/10 border border-primary text-primary py-4 px-6 font-mono text-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="check_circle" className="text-primary" />
                    <span>
                      Wallet Connected ({address?.slice(0, 6)}...
                      {address?.slice(-4)})
                    </span>
                  </div>
                  <ConnectButton.Custom>
                    {({ openAccountModal }) => (
                      <button
                        onClick={openAccountModal}
                        className="text-[10px] uppercase tracking-widest font-bold hover:text-primary-glow transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="w-full bg-primary text-black py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-all matrix-button-glow"
                    >
                      <Icon name="wallet" className="text-black" />
                      <span>Connect Wallet</span>
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
              {isConnected && chain && (
                <p className="text-[10px] text-on-surface-variant/60 font-mono uppercase tracking-widest">
                  Network: {chain.name} (Chain {chain.id})
                </p>
              )}
            </div>

            {/* Proof Balance */}
            <div
              className={`space-y-4 transition-all ${
                !isConnected ? "opacity-40 grayscale pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-primary font-bold font-mono">
                  Proof Balance
                </label>
                {!isConnected && (
                  <span className="text-[10px] text-on-surface-variant/60 border border-outline px-2 py-1 uppercase font-mono">
                    Connect Wallet First
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={publicBalance}
                  onChange={(e) => setPublicBalance(e.target.value)}
                  disabled={!isConnected || isWorking}
                  className="w-full bg-background border border-outline focus:border-primary focus:ring-0 text-on-surface p-4 pr-16 font-mono disabled:opacity-50"
                  placeholder="0.00"
                  step="0.001"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant/60 font-mono">
                  ETH
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant/60 italic font-mono">
                This can be less than your actual balance. Your real balance stays
                private.
              </p>
            </div>

            {/* Generate Proof Button */}
            {status === "done" && result ? (
              <div className="space-y-4">
                <div className="border border-primary p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        result.valid ? "bg-primary" : "bg-red-500"
                      }`}
                      style={
                        result.valid
                          ? { boxShadow: "0 0 8px var(--glow-color)" }
                          : undefined
                      }
                    />
                    <span className="font-bold text-primary matrix-glow">
                      {result.valid
                        ? "Proof Verified Successfully"
                        : "Proof Invalid"}
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/60">Block</span>
                      <span className="text-primary">
                        {result.blockNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/60">Public Balance</span>
                      <span className="text-primary">
                        {result.publicBalance} wei
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/60">Block Hash</span>
                      <p className="text-on-surface-variant break-all mt-1">
                        {result.blockHash}
                      </p>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/60">Nullifier</span>
                      <p className="text-on-surface-variant break-all mt-1">
                        {result.nullifier}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full bg-primary text-black py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-all matrix-button-glow"
                >
                  <Icon name="verified_user" className="text-black" />
                  <span>Go to Profile</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleProve}
                disabled={!canGenerateProof}
                className={`w-full py-4 flex items-center justify-center gap-3 transition-all ${
                  canGenerateProof
                    ? "bg-primary text-black font-bold uppercase tracking-widest text-sm hover:bg-primary/90 matrix-button-glow"
                    : "bg-background border border-outline text-on-surface-variant/50 cursor-not-allowed"
                }`}
              >
                <Icon name="verified_user" />
                <span className="font-bold uppercase tracking-[0.2em] text-xs">
                  {isWorking ? "Generating Proof..." : "Generate Proof"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
