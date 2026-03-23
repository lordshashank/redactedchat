"use client";

import { AppLayout } from "@/components/AppLayout";
import { Icon } from "@/components/Icon";
import {
  LEADERBOARD_TOP3,
  LEADERBOARD_LIST,
  TIER_DISTRIBUTION,
  RECENT_MOVERS,
} from "@/lib/dummyData";

function LeaderboardRightSidebar() {
  return (
    <>
      {/* Your Rank */}
      <div className="glass-panel p-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-primary/40 mb-4">
          Your Rank
        </h3>
        <p className="text-lg font-bold text-primary matrix-glow">0.24 ETH</p>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-primary">47</span>
          <span className="text-on-surface-variant/60 font-medium mb-1">of 2,341</span>
        </div>
        <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-primary w-[47%] rounded-full"
            style={{ boxShadow: "0 0 12px var(--glow-color)" }}
          />
        </div>
        <p className="text-[10px] text-on-surface-variant/60 mt-4 text-center">
          Top 2% of users this month
        </p>
      </div>

      {/* Tier Distribution */}
      <div className="space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/60 flex items-center gap-2">
          <Icon name="query_stats" className="text-[14px] text-primary" />
          Tier Distribution
        </h3>
        <div className="space-y-4">
          {TIER_DISTRIBUTION.map((t, i) => (
            <div key={t.balance} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className={i === 0 ? "text-primary-glow" : "text-primary"}>
                  {t.balance}
                </span>
                <span className="text-on-surface-variant/60">{t.pct}</span>
              </div>
              <div className="w-full bg-primary/10 h-1 rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: t.width,
                    opacity: i === 3 ? 0.4 : 1 - i * 0.2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Movers */}
      <div className="space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/60 flex items-center gap-2">
          <Icon name="trending_up" className="text-[14px] text-primary" />
          Recent Movers
        </h3>
        <div className="space-y-3">
          {RECENT_MOVERS.map((m) => (
            <div
              key={m.balance}
              className="flex items-center justify-between p-3 bg-surface-container/50 border border-outline/50 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 border border-outline flex items-center justify-center">
                  <Icon name="person" className="text-on-surface-variant/60 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{m.balance}</p>
                  <p
                    className={`text-[10px] uppercase font-bold ${
                      m.direction === "up"
                        ? "text-primary-glow"
                        : "text-primary-dim"
                    }`}
                  >
                    {m.change}
                  </p>
                </div>
              </div>
              <Icon
                name={
                  m.direction === "up" ? "arrow_upward" : "arrow_downward"
                }
                className={`text-sm ${
                  m.direction === "up" ? "text-primary" : "text-primary-dim"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  return (
    <AppLayout rightSidebar={<LeaderboardRightSidebar />}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl flex items-center justify-between h-16 px-8 border-b border-outline">
        <h1 className="font-bold text-xl tracking-tight text-on-surface">
          Leaderboard
        </h1>
        <nav className="flex gap-4 text-sm font-medium tracking-wider uppercase">
          <a className="text-primary border-b-2 border-primary pb-1" href="#">
            Global
          </a>
          <a className="text-on-surface-variant/60 hover:text-primary transition-colors" href="#">
            Friends
          </a>
          <a className="text-on-surface-variant/60 hover:text-primary transition-colors" href="#">
            Local
          </a>
        </nav>
      </header>

      <div className="px-6 py-8">
        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex gap-6 border-b border-outline">
            <button className="pb-3 text-primary border-b-2 border-primary font-medium">
              All Time
            </button>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 border border-outline">
            <span className="text-xs uppercase tracking-widest text-on-surface-variant/60">
              Sort:
            </span>
            <select className="bg-transparent border-none text-xs font-bold focus:ring-0 text-primary py-0 appearance-none cursor-pointer">
              <option>Balance</option>
              <option>Posts</option>
              <option>Followers</option>
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-16 items-end">
          {/* Rank 2 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full" />
              <div className="relative w-20 h-20 rounded-full border-2 border-outline p-1 bg-background flex items-center justify-center">
                <Icon name="person" className="text-primary/40 text-3xl" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary-dim text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
                2
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-1">
                {LEADERBOARD_TOP3[1].tier}
              </p>
              <p className="font-bold text-primary text-lg matrix-glow">
                {LEADERBOARD_TOP3[1].balance}
              </p>
              <p className="text-xs text-on-surface-variant/60">{LEADERBOARD_TOP3[1].posts}</p>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6 scale-110">
              <div className="absolute -inset-4 bg-primary/30 blur-2xl rounded-full" />
              <div className="relative w-28 h-28 rounded-full border-4 border-primary p-1 bg-background flex items-center justify-center">
                <Icon name="person" className="text-primary/60 text-5xl" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-black w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg shadow-primary/40 border-2 border-black">
                1
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary-glow font-bold mb-1">
                {LEADERBOARD_TOP3[0].tier}
              </p>
              <h2 className="text-2xl font-bold text-primary tracking-tight matrix-glow">
                {LEADERBOARD_TOP3[0].balance}
              </h2>
              <p className="text-xs text-on-surface-variant/60 font-medium">
                {LEADERBOARD_TOP3[0].followers}
              </p>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full" />
              <div className="relative w-20 h-20 rounded-full border-2 border-outline p-1 bg-background flex items-center justify-center">
                <Icon name="person" className="text-primary/40 text-3xl" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary-dim text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
                3
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-1">
                {LEADERBOARD_TOP3[2].tier}
              </p>
              <p className="font-bold text-primary text-lg matrix-glow">
                {LEADERBOARD_TOP3[2].balance}
              </p>
              <p className="text-xs text-on-surface-variant/60">{LEADERBOARD_TOP3[2].posts}</p>
            </div>
          </div>
        </div>

        {/* List Header */}
        <div className="grid grid-cols-12 px-6 mb-2 text-[10px] uppercase tracking-[0.2em] font-mono text-on-surface-variant/60">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Identity (Balance)</div>
          <div className="col-span-2 text-center">Posts</div>
          <div className="col-span-2 text-center">Followers</div>
          <div className="col-span-2" />
        </div>

        {/* Ranked List */}
        <div className="flex flex-col gap-2">
          {LEADERBOARD_LIST.map((entry) => (
            <div
              key={entry.rank}
              className={`grid grid-cols-12 items-center border transition-all duration-300 px-6 group ${
                entry.highlighted
                  ? "bg-surface-container/40 hover:bg-primary-dim/20 border-outline/50 hover:border-outline py-4"
                  : "bg-background hover:bg-primary-dim/10 border-outline/50 py-3"
              }`}
            >
              <div className="col-span-1 font-bold text-on-surface-variant/60 group-hover:text-primary transition-colors">
                {String(entry.rank).padStart(2, "0")}
              </div>
              <div className="col-span-5 flex items-center gap-4">
                <div
                  className={`${
                    entry.highlighted ? "w-10 h-10" : "w-8 h-8"
                  } bg-primary/10 border border-outline flex items-center justify-center shrink-0`}
                >
                  <Icon
                    name="person"
                    className="text-on-surface-variant/60 text-xs"
                  />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary matrix-glow">
                    {entry.balance}
                  </p>
                  {entry.tier && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        entry.highlighted
                          ? "bg-primary-dim/30 text-primary-glow"
                          : "bg-primary/10 text-primary/40"
                      }`}
                    >
                      {entry.tier}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-2 text-center text-sm font-medium text-on-surface-variant/60 group-hover:text-primary">
                {entry.posts.toLocaleString()}
              </div>
              <div className="col-span-2 text-center text-sm font-medium text-on-surface-variant/60 group-hover:text-primary">
                {entry.followers.toLocaleString()}
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  className={`text-[10px] font-bold px-4 py-1.5 transition-all uppercase tracking-widest ${
                    entry.highlighted
                      ? "border border-primary text-primary hover:bg-primary hover:text-black"
                      : "text-primary hover:text-primary-glow"
                  }`}
                >
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
