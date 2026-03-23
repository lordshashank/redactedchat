"use client";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { PostItem } from "@/components/PostItem";
import {
  PROFILE_POSTS,
  SUGGESTED_USERS,
  ACTIVITY_HISTORY,
} from "@/lib/dummyData";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TABS = ["Posts", "Replies", "Media", "Likes"] as const;

function ProfileRightSidebar() {
  return (
    <>
      {/* Suggested for You */}
      <section className="glass-panel p-6">
        <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow">
          Suggested for You
        </h3>
        <div className="space-y-4">
          {SUGGESTED_USERS.map((u) => (
            <div key={u.handle} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-outline flex items-center justify-center">
                  <Icon name="person" className="text-on-surface-variant/60 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary matrix-glow">
                    {u.balance}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 font-mono uppercase">
                    {u.handle}
                  </p>
                </div>
              </div>
              <button className="px-4 py-1 border border-primary text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors uppercase tracking-widest">
                Follow
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Activity History */}
      <section className="glass-panel p-6">
        <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow flex items-center gap-2">
          <Icon name="history" className="text-lg" />
          Activity History
        </h3>
        <div className="space-y-4 font-mono">
          {ACTIVITY_HISTORY.map((a) => (
            <div
              key={a.date}
              className="border-l-2 border-outline pl-4 py-1 relative"
            >
              <div
                className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                  a.active
                    ? "bg-primary glow-dot"
                    : "bg-primary/20"
                }`}
              />
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                {a.date}
              </p>
              <p
                className={`text-xs font-bold ${
                  a.active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {a.label}
              </p>
            </div>
          ))}
        </div>
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

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Posts");

  return (
    <AppLayout rightSidebar={<ProfileRightSidebar />}>
      <PageHeader
        title="23.1 ETH"
        subtitle="Verified Node Status"
        showBack
        onBack={() => router.back()}
        rightContent={
          <div className="flex items-center gap-4 text-primary">
            <Icon name="notifications" className="cursor-pointer text-xl" />
            <Icon name="more_vert" className="cursor-pointer text-xl" />
          </div>
        }
      />

      {/* Banner */}
      <section>
        <div className="relative h-40 w-full bg-background overflow-hidden border-b border-outline">
          <div className="w-full h-full bg-primary/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-6 -mt-12 relative">
          <div className="flex justify-between items-end">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-primary overflow-hidden bg-background shadow-2xl shadow-primary/20 flex items-center justify-center">
                <Icon name="person" className="text-on-surface-variant/60 text-4xl" />
              </div>
            </div>
            <button className="mb-2 px-4 py-1.5 border border-primary text-primary text-xs font-bold hover:bg-primary/10 transition-colors uppercase tracking-widest">
              Edit Profile
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-primary matrix-glow">
              23.1 ETH
            </h2>
            <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-widest">
              NODE_VERIFIED_BLOCK_19847231
            </p>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant font-mono italic">
            Navigating the dark forest with zero-knowledge. Architect of private
            state transitions. I build in the shadows to preserve the light of
            sovereignty.
          </p>

          <div className="mt-4 flex gap-6 text-xs font-mono uppercase tracking-wider">
            <div className="flex gap-1 items-center cursor-pointer hover:text-primary transition-colors">
              <span className="font-bold text-primary">142</span>
              <span className="text-on-surface-variant/60">Nodes</span>
            </div>
            <div className="flex gap-1 items-center cursor-pointer hover:text-primary transition-colors">
              <span className="font-bold text-primary">1.2K</span>
              <span className="text-on-surface-variant/60">Subscribers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="mt-8 flex border-b border-outline">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center text-xs font-medium uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "text-primary font-bold border-b-2 border-primary matrix-glow"
                : "text-on-surface-variant/60 hover:text-primary hover:bg-primary/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Posts */}
      <section className="divide-y divide-outline/50">
        {PROFILE_POSTS.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </section>
    </AppLayout>
  );
}
