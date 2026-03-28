"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Icon } from "@/components/Icon";
import { ImageDisplay } from "@/components/ImageDisplay";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard, useMyRank } from "@/hooks/useLeaderboard";
import { formatBalance, weiToEth } from "@/lib/format";
import { getTierName } from "@/lib/tiers";

type SortKey = "balance" | "posts" | "followers";

const SECONDS_PER_BLOCK = 12;

function formatProofAge(blockNumber: number | undefined, latestBlock: number | null): string {
  if (!blockNumber || !latestBlock || latestBlock <= blockNumber) return "Recently";
  const seconds = (latestBlock - blockNumber) * SECONDS_PER_BLOCK;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  return `${minutes}m ago`;
}

function LeaderboardRightSidebar() {
  const { isAuthenticated } = useAuth();
  const myRank = useMyRank();
  const leaderboard = useLeaderboard("balance");

  const allEntries = useMemo(
    () => leaderboard.data?.pages?.flatMap((p) => p.data) ?? [],
    [leaderboard.data],
  );

  const tierDistribution = useMemo(() => {
    if (allEntries.length === 0) return [];
    const counts: Record<string, number> = {};
    allEntries.forEach((e) => {
      const tier = getTierName(weiToEth(e.public_balance));
      counts[tier] = (counts[tier] || 0) + 1;
    });
    const total = allEntries.length;
    return Object.entries(counts)
      .map(([tier, count]) => ({
        tier,
        pct: `${((count / total) * 100).toFixed(0)}%`,
        width: `${(count / total) * 100}%`,
      }))
      .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));
  }, [allEntries]);

  return (
    <>
      {/* Your Rank */}
      <div className="glass-panel p-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-primary/40 mb-4">
          Your Rank
        </h3>
        {!isAuthenticated ? (
          <p className="text-sm font-mono text-on-surface-variant/60">
            Verify to see your rank
          </p>
        ) : myRank.isLoading ? (
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        ) : myRank.data ? (
          <>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-primary">
                {myRank.data.rank}
              </span>
              <span className="text-on-surface-variant/60 font-medium mb-1">
                of {myRank.data.total_users.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.max(2, 100 - (myRank.data.rank / myRank.data.total_users) * 100)}%`,
                  boxShadow: "0 0 12px var(--glow-color)",
                }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/60 mt-4 text-center">
              Top{" "}
              {Math.max(
                1,
                Math.round(
                  (myRank.data.rank / myRank.data.total_users) * 100,
                ),
              )}
              % of users
            </p>
          </>
        ) : null}
      </div>

      {/* Tier Distribution */}
      <div className="space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/60 flex items-center gap-2">
          <Icon name="query_stats" className="text-[14px] text-primary" />
          Tier Distribution
        </h3>
        {tierDistribution.length === 0 && (
          <p className="text-xs font-mono text-on-surface-variant/60">
            Loading...
          </p>
        )}
        <div className="space-y-4">
          {tierDistribution.map((t, i) => (
            <div key={t.tier} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span
                  className={
                    i === 0 ? "text-primary-glow" : "text-primary"
                  }
                >
                  {t.tier}
                </span>
                <span className="text-on-surface-variant/60">{t.pct}</span>
              </div>
              <div className="w-full bg-primary/10 h-1 rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: t.width,
                    opacity: i === 3 ? 0.4 : 1 - i * 0.15,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

type PeriodKey = "all" | "month";

export default function LeaderboardPage() {
  const [sort, setSort] = useState<SortKey>("balance");
  const [period, setPeriod] = useState<PeriodKey>("all");

  const timeRange = useMemo(() => {
    if (period === "all") return undefined;
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
  }, [period]);

  const { user } = useAuth();
  const leaderboard = useLeaderboard(sort, timeRange);
  const latestBlock = user?.block_number ?? null;

  const allEntries = useMemo(
    () => leaderboard.data?.pages?.flatMap((p) => p.data) ?? [],
    [leaderboard.data],
  );

  const top3 = allEntries.slice(0, Math.min(3, allEntries.length));
  const rest = allEntries.slice(Math.min(3, allEntries.length));

  return (
    <AppLayout rightSidebar={<LeaderboardRightSidebar />}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl flex items-center justify-between h-16 px-8 border-b border-outline">
        <h1 className="font-bold text-xl tracking-tight text-primary">
          Leaderboard
        </h1>
      </header>

      <div className="px-6 py-8">
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex gap-1 bg-surface-container border border-outline">
            {(["all", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest font-mono transition-colors ${
                  period === p
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant/60 hover:text-primary"
                }`}
              >
                {p === "all" ? "All Time" : "This Month"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 border border-outline">
            <span className="text-xs uppercase tracking-widest text-on-surface-variant/60">
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 text-primary py-0 appearance-none cursor-pointer"
            >
              <option value="balance">Balance</option>
              <option value="posts">Posts</option>
              <option value="followers">Followers</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {leaderboard.isLoading && (
          <div className="p-12 text-center">
            <p className="text-sm font-mono text-on-surface-variant/60">
              Loading...
            </p>
          </div>
        )}

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-16 items-end">
            {/* Rank 2 */}
            <div className="flex flex-col items-center">
              {top3[1] ? (
                <>
                  <div className="relative mb-4 group">
                    <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full" />
                    <div className="relative w-20 h-20 rounded-full border-2 border-outline p-1 bg-background flex items-center justify-center overflow-hidden">
                      {top3[1].avatar_key ? (
                        <ImageDisplay uploadKey={top3[1].avatar_key} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Icon name="person" className="text-primary/40 text-3xl" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary-dim text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
                      2
                    </div>
                  </div>
                  <Link href={`/profile/${top3[1].nullifier}`} className="text-center hover:opacity-80 transition-opacity">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-1">
                      {getTierName(weiToEth(top3[1].public_balance))}
                    </p>
                    <p className="font-bold text-primary text-lg matrix-glow">
                      {formatBalance(top3[1].public_balance)}
                    </p>
                    <p className="text-xs text-on-surface-variant/60">
                      {top3[1].post_count} posts · {top3[1].follower_count} followers
                    </p>
                    <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">
                      Verified {formatProofAge(top3[1].block_number, latestBlock)}
                    </p>
                  </Link>
                </>
              ) : <div />}
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-6 scale-110">
                <div className="absolute -inset-4 bg-primary/30 blur-2xl rounded-full" />
                <div className="relative w-28 h-28 rounded-full border-4 border-primary p-1 bg-background flex items-center justify-center overflow-hidden">
                  {top3[0].avatar_key ? (
                    <ImageDisplay uploadKey={top3[0].avatar_key} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Icon name="person" className="text-primary/60 text-5xl" />
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-black w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg shadow-primary/40 border-2 border-black">
                  1
                </div>
              </div>
              <Link href={`/profile/${top3[0].nullifier}`} className="text-center hover:opacity-80 transition-opacity">
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary-glow font-bold mb-1">
                  {getTierName(weiToEth(top3[0].public_balance))}
                </p>
                <h2 className="text-2xl font-bold text-primary tracking-tight matrix-glow">
                  {formatBalance(top3[0].public_balance)}
                </h2>
                <p className="text-xs text-on-surface-variant/60 font-medium">
                  {top3[0].post_count} posts · {top3[0].follower_count} followers
                </p>
                <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">
                  Verified {formatProofAge(top3[0].block_number, latestBlock)}
                </p>
              </Link>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center">
              {top3[2] ? (
                <>
                  <div className="relative mb-4">
                    <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full" />
                    <div className="relative w-20 h-20 rounded-full border-2 border-outline p-1 bg-background flex items-center justify-center overflow-hidden">
                      {top3[2].avatar_key ? (
                        <ImageDisplay uploadKey={top3[2].avatar_key} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Icon name="person" className="text-primary/40 text-3xl" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary-dim text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-primary/30">
                      3
                    </div>
                  </div>
                  <Link href={`/profile/${top3[2].nullifier}`} className="text-center hover:opacity-80 transition-opacity">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-1">
                      {getTierName(weiToEth(top3[2].public_balance))}
                    </p>
                    <p className="font-bold text-primary text-lg matrix-glow">
                      {formatBalance(top3[2].public_balance)}
                    </p>
                    <p className="text-xs text-on-surface-variant/60">
                      {top3[2].post_count} posts · {top3[2].follower_count} followers
                    </p>
                    <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1">
                      Verified {formatProofAge(top3[2].block_number, latestBlock)}
                    </p>
                  </Link>
                </>
              ) : <div />}
            </div>
          </div>
        )}

        {/* List Header */}
        {rest.length > 0 && (
          <div className="grid grid-cols-12 items-center px-6 mb-2 text-[10px] uppercase tracking-[0.2em] font-mono text-on-surface-variant/60">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5 pl-12">User</div>
            <div className="col-span-2 text-center">Posts</div>
            <div className="col-span-2 text-center">Followers</div>
            <div className="col-span-2 text-right">Verified</div>
          </div>
        )}

        {/* Ranked List */}
        <div className="flex flex-col gap-2">
          {rest.map((entry, i) => {
            const rank = i + top3.length + 1;
            const highlighted = rank === 4;
            const tier = getTierName(weiToEth(entry.public_balance));

            return (
              <div
                key={entry.nullifier}
                className={`grid grid-cols-12 items-center border transition-all duration-300 px-6 group ${
                  highlighted
                    ? "bg-surface-container/40 hover:bg-primary-dim/20 border-outline/50 hover:border-outline py-4"
                    : "bg-background hover:bg-primary-dim/10 border-outline/50 py-3"
                }`}
              >
                <div className="col-span-1 font-bold text-on-surface-variant/60 group-hover:text-primary transition-colors">
                  {String(rank).padStart(2, "0")}
                </div>
                <Link href={`/profile/${entry.nullifier}`} className="col-span-5 flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div
                    className={`${
                      highlighted ? "w-10 h-10" : "w-8 h-8"
                    } bg-primary/10 border border-outline flex items-center justify-center shrink-0 overflow-hidden`}
                  >
                    {entry.avatar_key ? (
                      <ImageDisplay uploadKey={entry.avatar_key} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="person" className="text-on-surface-variant/60 text-xs" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary matrix-glow">
                      {formatBalance(entry.public_balance)}
                    </p>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        highlighted
                          ? "bg-primary-dim/30 text-primary-glow"
                          : "bg-primary/10 text-primary/40"
                      }`}
                    >
                      {tier}
                    </span>
                  </div>
                </Link>
                <div className="col-span-2 text-center text-sm font-medium text-on-surface-variant/60 group-hover:text-primary">
                  {entry.post_count.toLocaleString()}
                </div>
                <div className="col-span-2 text-center text-sm font-medium text-on-surface-variant/60 group-hover:text-primary">
                  {entry.follower_count.toLocaleString()}
                </div>
                <div className="col-span-2 text-right text-[10px] font-mono text-on-surface-variant/60 group-hover:text-primary">
                  {formatProofAge(entry.block_number, latestBlock)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {!leaderboard.isLoading && allEntries.length === 0 && (
          <div className="p-12 text-center">
            <Icon
              name="leaderboard"
              className="text-4xl text-on-surface-variant/30 mb-4"
            />
            <p className="text-sm font-mono text-on-surface-variant/60">
              No leaderboard data yet
            </p>
          </div>
        )}

        {/* Load More */}
        {leaderboard.hasNextPage && (
          <div className="p-6 text-center">
            <button
              onClick={() => leaderboard.fetchNextPage()}
              disabled={leaderboard.isFetchingNextPage}
              className="px-8 py-2 border border-primary text-primary text-xs font-bold font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-40"
            >
              {leaderboard.isFetchingNextPage ? "LOADING..." : "LOAD MORE"}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
