"use client";

import { AppLayout } from "@/components/AppLayout";
import { Icon } from "@/components/Icon";
import { PostItem } from "@/components/PostItem";
import {
  DUMMY_POSTS,
  TRENDING_TAGS,
  WHO_TO_FOLLOW,
  LEADERBOARD_PREVIEW,
} from "@/lib/dummyData";

function FeedRightSidebar() {
  return (
    <>
      {/* Trending */}
      <section className="glass-panel p-6">
        <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow">
          Trending
        </h3>
        <div className="space-y-6">
          {TRENDING_TAGS.map((t) => (
            <div key={t.tag}>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-mono">
                {t.category}
              </p>
              <p className="font-bold text-primary hover:text-primary-glow transition-colors cursor-pointer matrix-glow">
                {t.tag}
              </p>
              <p className="text-xs text-on-surface-variant/50 mt-1 font-mono">{t.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who to Follow */}
      <section className="glass-panel p-6">
        <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow">
          Who to Follow
        </h3>
        <div className="space-y-4">
          {WHO_TO_FOLLOW.map((u) => (
            <div key={u.handle} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-outline flex items-center justify-center">
                  <Icon name="person" className="text-on-surface-variant/60 text-sm" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary matrix-glow">
                    {u.balance}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 font-mono">{u.handle}</p>
                </div>
              </div>
              <button className="px-4 py-1 border border-primary text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors">
                SYNC
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />
        <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow">
          GHOST_LEADERBOARD
        </h3>
        <div className="space-y-4 font-mono">
          {LEADERBOARD_PREVIEW.map((e) => (
            <div
              key={e.rank}
              className={`flex items-center gap-4 p-3 border ${
                e.rank === "01"
                  ? "bg-primary/10 border-outline"
                  : "border-outline/50 hover:border-outline"
              }`}
            >
              <span
                className={`text-lg font-bold ${
                  e.rank === "01" ? "text-primary matrix-glow" : "text-on-surface-variant/60"
                }`}
              >
                {e.rank}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-primary">{e.balance}</p>
                <p className="text-[10px] text-on-surface-variant/60 tracking-widest uppercase">
                  CLASS: {e.tier}
                </p>
              </div>
              <span className="text-xs text-primary-glow font-mono">{e.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 px-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] text-on-surface-variant/50 uppercase">
        <p className="w-full mb-2">© 2024 TERMINAL.GHOSTBALANCE.CHAT</p>
        <a className="hover:text-primary transition-all" href="#">
          PRIVACY_MASK
        </a>
        <a className="hover:text-primary transition-all" href="#">
          TERMS_OF_SERVICE
        </a>
        <a className="hover:text-primary transition-all" href="#">
          KERNEL_STATUS
        </a>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <AppLayout rightSidebar={<FeedRightSidebar />}>
      {/* Feed Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline h-16 flex items-center px-4">
        <div className="flex w-full justify-around text-xs uppercase tracking-widest font-mono">
          <button className="text-primary border-b-2 border-primary pb-2 font-bold matrix-glow">
            For You
          </button>
          <button className="text-on-surface-variant/60 hover:text-primary transition-opacity pb-2">
            Following
          </button>
          <button className="text-on-surface-variant/60 hover:text-primary transition-opacity pb-2">
            Trending
          </button>
        </div>
      </header>

      {/* Compose Box */}
      <div className="p-6 border-b border-outline bg-background">
        <div className="flex gap-4">
          <div className="w-12 h-12 shrink-0 bg-primary/10 border border-outline flex items-center justify-center">
            <Icon name="person" className="text-on-surface-variant/60" />
          </div>
          <div className="flex-1">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-on-surface-variant/30 text-on-surface resize-none h-12 py-2 font-mono"
              placeholder="Input cryptographic stream..."
              rows={1}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-4 text-on-surface-variant">
                <Icon name="image" className="cursor-pointer hover:text-primary transition-colors" />
                <Icon name="poll" className="cursor-pointer hover:text-primary transition-colors" />
                <Icon name="terminal" className="cursor-pointer hover:text-primary transition-colors" />
                <Icon name="lock" className="cursor-pointer hover:text-primary transition-colors" />
              </div>
              <button className="px-6 py-2 bg-primary/10 border border-primary text-primary font-bold text-xs hover:bg-primary/20 transition-all">
                BROADCAST
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="divide-y divide-outline/50">
        {DUMMY_POSTS.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </AppLayout>
  );
}
