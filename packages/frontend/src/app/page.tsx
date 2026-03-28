"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { Icon } from "@/components/Icon";
import { FileUploader } from "@/components/FileUploader";
import { ImageDisplay } from "@/components/ImageDisplay";
import { PostItem } from "@/components/PostItem";
import type { Post as BackendPost } from "@/lib/types";
import { formatBalance } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useFeed, useTrendingFeed } from "@/hooks/useFeed";
import { useCreatePost } from "@/hooks/usePost";
import { useSuggestedUsers } from "@/hooks/useProfile";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useFollow } from "@/hooks/useSocial";
import { getTierName } from "@/lib/tiers";
import { weiToEth } from "@/lib/format";

function FeedRightSidebar() {
  const suggested = useSuggestedUsers();
  const leaderboard = useLeaderboard("balance");
  const follow = useFollow();

  const leaderboardEntries =
    leaderboard.data?.pages?.flatMap((p) => p.data)?.slice(0, 2) ?? [];

  return (
    <>
      {/* Who to Follow */}
      <section className="glass-panel p-6">
        <h3 className="font-bold text-lg mb-6 tracking-tight text-primary matrix-glow">
          Who to Follow
        </h3>
        <div className="space-y-4">
          {suggested.isLoading && (
            <p className="text-xs font-mono text-on-surface-variant/60">
              Loading...
            </p>
          )}
          {suggested.data && suggested.data.length === 0 && (
            <p className="text-xs font-mono text-on-surface-variant/60">
              No suggestions right now
            </p>
          )}
          {suggested.data?.map((u) => (
            <div
              key={u.nullifier}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border border-outline flex items-center justify-center">
                  <Icon
                    name="person"
                    className="text-on-surface-variant/60 text-sm"
                  />
                </div>
                <p className="text-sm font-bold text-primary matrix-glow">
                  {formatBalance(u.public_balance)}
                </p>
              </div>
              <button
                onClick={() => follow.mutate(u.nullifier)}
                className="px-4 py-1 border border-primary text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
              >
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
          {leaderboardEntries.map((e, i) => (
            <div
              key={e.nullifier}
              className={`flex items-center gap-4 p-3 border ${
                i === 0
                  ? "bg-primary/10 border-outline"
                  : "border-outline/50 hover:border-outline"
              }`}
            >
              <span
                className={`text-lg font-bold ${
                  i === 0
                    ? "text-primary matrix-glow"
                    : "text-on-surface-variant/60"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-primary">
                  {formatBalance(e.public_balance)}
                </p>
                <p className="text-[10px] text-on-surface-variant/60 tracking-widest uppercase">
                  CLASS: {getTierName(weiToEth(e.public_balance))}
                </p>
              </div>
              <span className="text-xs text-primary-glow font-mono">
                {e.post_count} posts
              </span>
            </div>
          ))}
          {leaderboard.isLoading && (
            <p className="text-xs text-on-surface-variant/60">Loading...</p>
          )}
        </div>
        <Link
          href="/leaderboard"
          className="block mt-4 text-center text-[10px] font-mono uppercase tracking-widest text-primary hover:text-primary-glow transition-colors"
        >
          VIEW FULL LEADERBOARD
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-8 px-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] text-on-surface-variant/50 uppercase">
        <p className="w-full mb-2">&copy; 2024 TERMINAL.GHOSTBALANCE.CHAT</p>
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

function HomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const feedType = (searchParams.get("feed") as "latest" | "following" | "trending") || "trending";
  const setFeedType = (type: string) => {
    router.replace(type === "trending" ? "/" : `/?feed=${type}`, { scroll: false });
  };
  const [composeText, setComposeText] = useState("");
  const [attachmentKeys, setAttachmentKeys] = useState<string[]>([]);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const { user, isAuthenticated } = useAuth();
  const createPost = useCreatePost();

  const feed = useFeed({
    type: feedType === "trending" ? "latest" : feedType,
  });
  const trending = useTrendingFeed({});

  const isTrending = feedType === "trending";
  const activeFeed = isTrending ? trending : feed;

  const posts: BackendPost[] = isTrending
    ? (trending.data?.pages?.flatMap((p) => p.data) ?? [])
    : (feed.data?.pages?.flatMap((p) => p.data) ?? []);

  const hasNextPage = isTrending
    ? trending.hasNextPage
    : feed.hasNextPage;

  const fetchNextPage = isTrending
    ? trending.fetchNextPage
    : feed.fetchNextPage;

  const isFetchingNextPage = isTrending
    ? trending.isFetchingNextPage
    : feed.isFetchingNextPage;

  const handleBroadcast = () => {
    if (!composeText.trim() && attachmentKeys.length === 0) return;
    createPost.mutate(
      {
        body: composeText,
        attachments: attachmentKeys.length > 0 ? attachmentKeys : undefined,
      },
      {
        onSuccess: () => {
          setComposeText("");
          setAttachmentKeys([]);
        },
      },
    );
  };

  useEffect(() => {
    const el = composeRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [composeText]);

  const tabs: { label: string; value: "latest" | "following" | "trending" }[] =
    [
      { label: "Trending", value: "trending" },
      { label: "Latest", value: "latest" },
      { label: "Following", value: "following" },
    ];

  return (
    <AppLayout rightSidebar={<FeedRightSidebar />}>
      {/* Feed Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline h-16 flex items-center px-4">
        <div className="flex w-full justify-around text-xs uppercase tracking-widest font-mono">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFeedType(tab.value)}
              className={
                feedType === tab.value
                  ? "text-primary border-b-2 border-primary pb-2 font-bold matrix-glow"
                  : "text-on-surface-variant/60 hover:text-primary transition-opacity pb-2"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Compose Box */}
      <div className="p-6 border-b border-outline bg-background">
        <div className="flex gap-4">
          <div className="w-12 h-12 shrink-0 bg-primary/10 border border-outline flex items-center justify-center overflow-hidden">
            {user?.avatar_key ? (
              <ImageDisplay uploadKey={user.avatar_key} className="w-full h-full object-cover" />
            ) : (
              <Icon name="person" className="text-on-surface-variant/60" />
            )}
          </div>
          <div className="flex-1">
            {isAuthenticated ? (
              <>
                <textarea
                  ref={composeRef}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-on-surface-variant/30 text-on-surface resize-none overflow-hidden min-h-12 py-2 pl-2 font-mono"
                  placeholder="Input cryptographic stream..."
                  rows={1}
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                />
                {/* Attachment previews */}
                {attachmentKeys.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {attachmentKeys.map((key, i) => (
                      <div key={key} className="relative w-20 h-20 border border-outline">
                        <ImageDisplay uploadKey={key} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setAttachmentKeys((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 bg-black/60 text-white text-xs p-0.5"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-4 text-on-surface-variant">
                    {attachmentKeys.length < 4 && (
                      <FileUploader
                        onComplete={(key) => setAttachmentKeys((prev) => prev.length < 4 ? [...prev, key] : prev)}
                        className="inline-block"
                      >
                        <Icon
                          name="image"
                          className="cursor-pointer hover:text-primary transition-colors"
                        />
                      </FileUploader>
                    )}
                    <Icon
                      name="poll"
                      className="opacity-30 cursor-not-allowed"
                      title="Polls coming soon"
                    />
                  </div>
                  <button
                    onClick={handleBroadcast}
                    disabled={
                      (!composeText.trim() && attachmentKeys.length === 0) || createPost.isPending
                    }
                    className="px-6 py-2 bg-primary/10 border border-primary text-primary font-bold text-xs hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {createPost.isPending ? "SENDING..." : "BROADCAST"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center h-12 py-2">
                <p className="text-sm font-mono text-on-surface-variant/60">
                  <Link
                    href="/profile"
                    className="text-primary hover:text-primary-glow transition-colors"
                  >
                    Verify your balance
                  </Link>{" "}
                  to post
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="divide-y divide-outline/50">
        {activeFeed.isLoading && (
          <div className="p-12 text-center">
            <p className="text-sm font-mono text-on-surface-variant/60">
              Loading...
            </p>
          </div>
        )}

        {!activeFeed.isLoading && posts.length === 0 && (
          <div className="p-12 text-center">
            <Icon
              name="feed"
              className="text-4xl text-on-surface-variant/30 mb-4"
            />
            <p className="text-sm font-mono text-on-surface-variant/60">
              {feedType === "following"
                ? "Follow someone to see their posts here"
                : "No posts yet"}
            </p>
          </div>
        )}

        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="p-6 text-center border-t border-outline">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-8 py-2 border border-primary text-primary text-xs font-bold font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            {isFetchingNextPage ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </AppLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
