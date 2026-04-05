"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useFeedbackList, useFeedbackVote } from "@/hooks/useFeedback";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/format";
import { FEEDBACK_TYPE_ICON, FEEDBACK_STATUS_LABEL, FEEDBACK_STATUS_COLOR } from "@/lib/feedback";
import type { FeedbackType } from "@/lib/types";

const TYPE_TABS: { value: FeedbackType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "feature", label: "Features" },
  { value: "bug", label: "Bugs" },
  { value: "improvement", label: "Improvements" },
  { value: "question", label: "Questions" },
];

export default function FeedbackPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [type, setType] = useState<FeedbackType | "">("");
  const [sort, setSort] = useState<"votes" | "recent">("votes");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useFeedbackList({ type, sort, page });
  const vote = useFeedbackVote();

  const posts = data?.posts ?? [];

  return (
    <AppLayout>
      <PageHeader
        title="Feedback"
        subtitle="Feature requests & bug reports"
        showBack
        onBack={() => router.back()}
        rightContent={
          <button
            onClick={() => {
              if (!isAuthenticated) {
                router.push("/setup");
                return;
              }
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-primary text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors"
          >
            <Icon name="add" className="!text-[16px]" />
            {isAuthenticated ? "New" : "Sign In"}
          </button>
        }
      />

      {/* Type filter tabs */}
      <div className="border-b border-outline px-4">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-3">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setType(tab.value); setPage(1); }}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono whitespace-nowrap transition-colors ${
                type === tab.value
                  ? "bg-primary/10 text-primary border border-primary"
                  : "text-on-surface-variant/60 border border-outline hover:text-primary hover:border-primary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Sort toggle */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setSort("votes"); setPage(1); }}
              className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${
                sort === "votes" ? "text-primary" : "text-on-surface-variant/40 hover:text-primary"
              }`}
            >
              Top
            </button>
            <span className="text-outline text-[10px]">/</span>
            <button
              onClick={() => { setSort("recent"); setPage(1); }}
              className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono transition-colors ${
                sort === "recent" ? "text-primary" : "text-on-surface-variant/40 hover:text-primary"
              }`}
            >
              New
            </button>
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="divide-y divide-outline/50">
        {isLoading && (
          <div className="p-12 text-center">
            <p className="text-sm font-mono text-on-surface-variant/60">Loading...</p>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="feedback" className="text-4xl text-on-surface-variant/30 mb-4" />
            <p className="text-sm font-mono text-on-surface-variant/60">
              No feedback yet. Be the first to share!
            </p>
          </div>
        )}

        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/feedback/${post.id}`}
            className="flex gap-4 p-5 hover:bg-primary/[0.03] transition-colors"
          >
            {/* Vote column */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  router.push("/setup");
                  return;
                }
                vote.mutate(post.id);
              }}
              disabled={!isAuthenticated}
              className={`flex flex-col items-center justify-center min-w-[48px] h-14 border transition-colors ${
                post.user_has_voted
                  ? "text-primary border-primary bg-primary/10"
                  : "text-on-surface-variant/60 border-outline hover:text-primary hover:border-primary/50"
              } ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Icon name="arrow_upward" className="!text-[16px]" />
              <span className="text-xs font-bold font-mono">{post.vote_count}</span>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono border ${FEEDBACK_STATUS_COLOR[post.status]}`}>
                  {FEEDBACK_STATUS_LABEL[post.status]}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">
                  <Icon name={FEEDBACK_TYPE_ICON[post.type] || "feedback"} className="!text-[12px]" />
                  {post.type}
                </span>
              </div>
              <h3 className="text-sm font-bold font-mono text-on-surface line-clamp-1">
                {post.title}
              </h3>
              <p className="text-xs font-mono text-on-surface-variant/60 line-clamp-1">
                {post.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-on-surface-variant/40">
                  {formatRelativeTime(post.created_at)}
                </span>
                {post.attachments && post.attachments.length > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] font-mono text-primary uppercase tracking-widest">
                    <Icon name="attachment" className="!text-[12px]" />
                    {post.attachments.length}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-6 border-t border-outline">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 border border-outline text-xs font-bold font-mono uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-[10px] font-mono text-on-surface-variant/60">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1.5 border border-outline text-xs font-bold font-mono uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {isAuthenticated && (
        <FeedbackModal open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </AppLayout>
  );
}
