"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { formatBalance, formatRelativeTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";

export default function ConversationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const conversations = useConversations();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/setup");
    }
  }, [authLoading, isAuthenticated, router]);

  const allConversations =
    conversations.data?.pages?.flatMap((p) => p.data) ?? [];

  if (authLoading) {
    return (
      <AppLayout>
        <PageHeader title="Messages" subtitle="Direct Messages" />
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
      <PageHeader title="Messages" subtitle="Direct Messages" />

      {/* Loading */}
      {conversations.isLoading && (
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        </div>
      )}

      {/* Empty */}
      {!conversations.isLoading && allConversations.length === 0 && (
        <div className="p-12 text-center">
          <Icon
            name="mail"
            className="text-4xl text-on-surface-variant/30 mb-4"
          />
          <p className="text-sm font-mono text-on-surface-variant/60">
            No conversations yet
          </p>
        </div>
      )}

      {/* Conversation List */}
      <div className="divide-y divide-outline/50">
        {allConversations.map((conv) => {
          const otherMembers = conv.members;
          const displayBalance =
            otherMembers.length > 0
              ? formatBalance(otherMembers[0].public_balance)
              : conv.name || "Group";
          const preview = conv.last_message_body
            ? conv.last_message_body.length > 60
              ? conv.last_message_body.slice(0, 60) + "..."
              : conv.last_message_body
            : "No messages yet";

          return (
            <Link
              key={conv.id}
              href={`/conversations/${conv.id}`}
              className="block p-4 hover:bg-primary/[0.03] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 shrink-0 border flex items-center justify-center ${
                    conv.unread_count > 0
                      ? "bg-primary/10 border-primary/30"
                      : "bg-primary/5 border-outline"
                  }`}
                >
                  <Icon
                    name={conv.is_group ? "group" : "person"}
                    className="text-on-surface-variant/60"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-primary matrix-glow truncate">
                      {conv.is_group && conv.name
                        ? conv.name
                        : displayBalance}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-[10px] text-on-surface-variant/50 font-mono shrink-0 ml-2">
                        {formatRelativeTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant/60 font-mono truncate mt-0.5">
                    {preview}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="w-5 h-5 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread_count > 9 ? "9+" : conv.unread_count}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load More */}
      {conversations.hasNextPage && (
        <div className="p-6 text-center border-t border-outline">
          <button
            onClick={() => conversations.fetchNextPage()}
            disabled={conversations.isFetchingNextPage}
            className="px-8 py-2 border border-primary text-primary text-xs font-bold font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            {conversations.isFetchingNextPage ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </AppLayout>
  );
}
