"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { formatBalance, formatRelativeTime } from "@/lib/format";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  useNotifications,
  useMarkAllRead,
} from "@/hooks/useNotifications";
import type { Notification } from "@/lib/types";

function getNotificationText(n: Notification): string {
  const balance = formatBalance(n.actor_balance);
  switch (n.type) {
    case "like":
      return `${balance} liked your post`;
    case "reply":
      return `${balance} replied to your post`;
    case "repost":
      return `${balance} reposted`;
    case "follow":
      return `${balance} followed you`;
    case "dm":
      return `${balance} sent you a message`;
    case "mention":
      return `${balance} mentioned you`;
    case "poll_ended":
      return `A poll you voted on has ended`;
    case "group_invite":
      return `${balance} invited you to a group`;
    default:
      return `${balance} interacted with you`;
  }
}

function getNotificationIcon(type: Notification["type"]): string {
  switch (type) {
    case "like":
      return "favorite";
    case "reply":
      return "chat_bubble";
    case "repost":
      return "repeat";
    case "follow":
      return "person_add";
    case "dm":
      return "mail";
    case "mention":
      return "alternate_email";
    case "poll_ended":
      return "poll";
    case "group_invite":
      return "group_add";
    default:
      return "notifications";
  }
}

function getNotificationLink(n: Notification): string {
  if (n.post_id) return `/post/${n.post_id}`;
  if (n.conversation_id) return `/conversations/${n.conversation_id}`;
  if (n.type === "follow") return `/profile/${n.actor_nullifier}`;
  return "#";
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const notifications = useNotifications();
  const markAllRead = useMarkAllRead();

  const allNotifications =
    notifications.data?.pages?.flatMap((p) => p.data) ?? [];
  const hasUnread = allNotifications.some((n) => !n.read);

  useEffect(() => {
    if (!authLoading && isAuthenticated && hasUnread && !markAllRead.isPending) {
      markAllRead.mutate();
    }
  }, [authLoading, isAuthenticated, hasUnread, markAllRead]);

  if (authLoading) {
    return (
      <AppLayout>
        <PageHeader title="Notifications" subtitle="Activity Feed" />
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
        title="Notifications"
        subtitle="Activity Feed"
      />

      {/* Loading */}
      {notifications.isLoading && (
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        </div>
      )}

      {/* Empty */}
      {!notifications.isLoading && allNotifications.length === 0 && (
        <div className="p-12 text-center">
          <Icon
            name="notifications"
            className="text-4xl text-on-surface-variant/30 mb-4"
          />
          <p className="text-sm font-mono text-on-surface-variant/60">
            No notifications yet
          </p>
        </div>
      )}

      {/* Notification List */}
      <div className="divide-y divide-outline/50">
        {allNotifications.map((n) => (
          <Link
            key={n.id}
            href={getNotificationLink(n)}
            className={`block p-4 hover:bg-primary/[0.03] transition-colors ${
              !n.read ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 shrink-0 border flex items-center justify-center ${
                  !n.read
                    ? "bg-primary/10 border-primary/30"
                    : "bg-primary/5 border-outline"
                }`}
              >
                <Icon
                  name={getNotificationIcon(n.type)}
                  className={`text-sm ${
                    !n.read
                      ? "text-primary"
                      : "text-on-surface-variant/60"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-on-surface font-medium">
                  {getNotificationText(n)}
                </p>
                <p className="text-[10px] text-on-surface-variant/50 font-mono mt-1">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {notifications.hasNextPage && (
        <div className="p-6 text-center border-t border-outline">
          <button
            onClick={() => notifications.fetchNextPage()}
            disabled={notifications.isFetchingNextPage}
            className="px-8 py-2 border border-primary text-primary text-xs font-bold font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-40"
          >
            {notifications.isFetchingNextPage ? "LOADING..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </AppLayout>
  );
}
