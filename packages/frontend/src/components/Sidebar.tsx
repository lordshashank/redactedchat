"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useUnreadConversationsCount } from "@/hooks/useConversations";
import { formatBalance, weiToEth } from "@/lib/format";
import { getTierName } from "@/lib/tiers";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/notifications", icon: "notifications", label: "Notifications" },
  { href: "/conversations", icon: "chat", label: "Messages" },
  { href: "/profile", icon: "person", label: "Profile" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/bookmarks", icon: "bookmark", label: "Bookmarks" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { data: unread } = useUnreadCount();
  const { data: unreadConversations } = useUnreadConversationsCount();

  return (
    <aside className="w-[280px] h-screen sticky top-0 border-r border-outline flex flex-col py-8 px-6 bg-background z-50 shrink-0">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Icon name="terminal" filled className="text-primary text-3xl" />
        <span className="text-2xl font-bold tracking-tighter text-primary matrix-glow">
          GhostBalance
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          const isNotifications = item.href === "/notifications";
          const isMessages = item.href === "/conversations";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-4 py-3 text-primary font-bold border-r-2 border-primary pr-4 transition-all"
                  : "flex items-center gap-4 py-3 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300"
              }
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="font-medium">{item.label}</span>
              {isNotifications && unread && unread.count > 0 && (
                <span className="ml-auto bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center">
                  {unread.count}
                </span>
              )}
              {isMessages && unreadConversations && unreadConversations.count > 0 && (
                <span className="ml-auto bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center">
                  {unreadConversations.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {isAuthenticated && user && (
        <div className="px-6 py-4 border-t border-outline">
          <p className="text-sm font-bold text-primary matrix-glow">
            {formatBalance(user.public_balance)}
          </p>
          <p className="text-[10px] text-on-surface-variant/60 font-mono uppercase">
            {getTierName(weiToEth(user.public_balance))}
          </p>
        </div>
      )}

      <div className="mt-auto pt-6">
        <Link
          href="/setup"
          className="w-full bg-primary/10 border border-primary text-primary font-bold py-3 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-primary/20"
        >
          <Icon name="add_circle" className="text-sm" />
          <span>New Proof</span>
        </Link>
      </div>
    </aside>
  );
}
