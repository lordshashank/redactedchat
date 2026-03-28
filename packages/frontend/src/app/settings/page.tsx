"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { ThemePicker } from "@/components/ThemePicker";
import { useAuth } from "@/hooks/useAuth";
import { loadNullifierSeed } from "@/lib/proofStore";

function SettingsRightSidebar() {
  return (
    <>
      <section className="glass-panel p-6">
        <h4 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 matrix-glow uppercase tracking-widest">
          <Icon name="info" className="text-primary text-lg" />
          About Themes
        </h4>
        <p className="text-[11px] leading-relaxed font-mono text-on-surface-variant">
          Themes change the entire look and feel of GhostBalance. Your
          selection is saved locally and persists across sessions.
        </p>
        <p className="text-[11px] leading-relaxed font-mono mt-3 text-on-surface-variant">
          Some themes use custom typography. Fonts are loaded on-demand when
          you switch to a theme that requires them.
        </p>
      </section>

      <section className="glass-panel p-6">
        <h4 className="text-xs font-bold text-primary mb-3 flex items-center gap-2 matrix-glow uppercase tracking-widest">
          <Icon name="palette" className="text-primary text-lg" />
          Theme Features
        </h4>
        <div className="space-y-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <Icon name="auto_awesome" className="text-primary text-sm" />
            <span className="text-on-surface-variant">Glow effects on balances</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="grain" className="text-primary text-sm" />
            <span className="text-on-surface-variant">Film grain overlay</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="filter_b_and_w" className="text-primary text-sm" />
            <span className="text-on-surface-variant">Grayscale avatars</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="blur_on" className="text-primary text-sm" />
            <span className="text-on-surface-variant">Glass panel blur</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="monitor" className="text-primary text-sm" />
            <span className="text-on-surface-variant">CRT scanlines</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 text-[10px] flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest font-mono text-on-surface-variant/50">
        <p className="w-full mb-2">&copy; 2024 TERMINAL.GHOSTBALANCE.CHAT</p>
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

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const storedNullSeed = typeof window !== "undefined" ? loadNullifierSeed() : null;

  const handleCopyNullifierSeed = () => {
    if (!storedNullSeed) return;
    navigator.clipboard.writeText(storedNullSeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout rightSidebar={<SettingsRightSidebar />}>
      <PageHeader
        title="Settings"
        subtitle="Configuration Terminal"
        showBack
        onBack={() => router.back()}
      />

      <div className="p-6 space-y-10">
        {/* Theme Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Icon name="palette" className="text-primary text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-primary matrix-glow">
                Appearance
              </h2>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                Select your visual theme
              </p>
            </div>
          </div>
          <ThemePicker />
        </section>

        {/* Placeholder for future settings */}
        <section className="opacity-40">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="notifications" className="text-primary text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-primary">
                Notifications
              </h2>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                Coming soon
              </p>
            </div>
          </div>
        </section>

        {isAuthenticated && storedNullSeed && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Icon name="security" className="text-primary text-2xl" />
              <div>
                <h2 className="text-xl font-bold text-primary matrix-glow">
                  Account Recovery
                </h2>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                  Save this to recover your account
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-primary font-bold font-mono block mb-2">
                  Recovery Nullifier Seed
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-background border border-outline p-3 font-mono text-sm text-on-surface break-all">
                    {storedNullSeed}
                  </div>
                  <button
                    onClick={handleCopyNullifierSeed}
                    className="px-4 py-3 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors"
                  >
                    <Icon name={copied ? "check" : "content_copy"} className="text-sm" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-on-surface-variant/80 font-mono leading-relaxed">
                This is your nullifier seed. Save it somewhere safe.
                You will need this value along with your wallet to recover your account on a new device.
              </p>
            </div>
          </section>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <section className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="logout" className="text-primary text-2xl" />
              <div>
                <h2 className="text-xl font-bold text-primary">Account</h2>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                  Session management
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await logout();
                router.push("/setup");
              }}
              className="px-6 py-2 border border-primary text-primary text-xs font-bold font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors"
            >
              LOGOUT
            </button>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
