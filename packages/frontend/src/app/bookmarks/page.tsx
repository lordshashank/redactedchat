"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { PostItem } from "@/components/PostItem";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const bookmarks = useBookmarks();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/setup");
    }
  }, [authLoading, isAuthenticated, router]);

  const posts =
    bookmarks.data?.pages?.flatMap((p) => p.data) ?? [];

  if (authLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Bookmarks"
          subtitle="Saved Posts"
          showBack
          onBack={() => router.back()}
        />
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Bookmarks"
        subtitle="Saved Posts"
        showBack
        onBack={() => router.back()}
      />

      {/* Loading */}
      {bookmarks.isLoading && (
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        </div>
      )}

      {/* Empty */}
      {!bookmarks.isLoading && posts.length === 0 && (
        <div className="p-12 text-center">
          <Icon
            name="bookmark"
            className="text-4xl text-on-surface-variant/30 mb-4"
          />
          <p className="text-sm font-mono text-on-surface-variant/60">
            No bookmarks yet
          </p>
        </div>
      )}

      {/* Post List */}
      <div className="divide-y divide-outline/50">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      {bookmarks.hasNextPage && (
        <div className="p-6 text-center border-t border-outline">
          <button
            onClick={() => bookmarks.fetchNextPage()}
            disabled={bookmarks.isFetchingNextPage}
            className="px-8 py-2 border border-primary text-primary text-xs font-bold font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            {bookmarks.isFetchingNextPage ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </AppLayout>
  );
}
