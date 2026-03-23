"use client";

import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { ThemePicker } from "@/components/ThemePicker";

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

export default function SettingsPage() {
  const router = useRouter();

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
              <h2 className="text-xl font-bold text-on-surface">
                Notifications
              </h2>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                Coming soon
              </p>
            </div>
          </div>
        </section>

        <section className="opacity-40">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="security" className="text-primary text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-on-surface">
                Privacy &amp; Security
              </h2>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                Coming soon
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
