"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useUnreadConversationsCount } from "@/hooks/useConversations";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatBalance, weiToEth } from "@/lib/format";
import { getTierName } from "@/lib/tiers";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/notifications", icon: "notifications", label: "Notifications" },
  { href: "/conversations", icon: "chat", label: "Messages" },
  { href: "/profile", icon: "person", label: "Profile" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/bookmarks", icon: "bookmark", label: "Bookmarks" },
];

const MORE_ITEMS = [
  { href: "/feedback", icon: "feedback", label: "Feedback" },
  { href: "/about", icon: "info", label: "About" },
  { href: "/settings", icon: "settings", label: "Settings" },
  { href: "https://t.me/+TXVTCJC4cuZhYWU9", icon: "help", label: "Help", external: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { data: unread } = useUnreadCount();
  const { data: unreadConversations } = useUnreadConversationsCount();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const moreIsActive = MORE_ITEMS.some((item) => !item.external && pathname.startsWith(item.href));

  const closeMore = useCallback(() => setMoreOpen(false), []);
  useClickOutside(moreRef, closeMore, moreOpen);

  return (
    <aside className="hidden md:flex md:w-[72px] lg:w-[280px] h-screen sticky top-0 border-r border-outline flex-col py-8 md:px-2 lg:px-6 md:items-center lg:items-stretch bg-background z-50 shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 md:justify-center lg:justify-start">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 12" className="w-7 h-7 text-primary" shapeRendering="crispEdges">
          {/* Row 0 */}<rect x="4" y="0" width="6" height="1" fill="currentColor"/>
          {/* Row 1 */}<rect x="3" y="1" width="8" height="1" fill="currentColor"/>
          {/* Row 2 */}<rect x="2" y="2" width="10" height="1" fill="currentColor"/>
          {/* Row 3 */}<rect x="1" y="3" width="12" height="1" fill="currentColor"/>
          {/* Row 4 - eyes */}<rect x="1" y="4" width="2" height="1" fill="currentColor"/><rect x="5" y="4" width="4" height="1" fill="currentColor"/><rect x="11" y="4" width="2" height="1" fill="currentColor"/>
          {/* Row 5 - eyes */}<rect x="1" y="5" width="2" height="1" fill="currentColor"/><rect x="5" y="5" width="4" height="1" fill="currentColor"/><rect x="11" y="5" width="2" height="1" fill="currentColor"/>
          {/* Row 6-9 body */}<rect x="0" y="6" width="14" height="4" fill="currentColor"/>
          {/* Row 10 - legs */}<rect x="0" y="10" width="2" height="1" fill="currentColor"/><rect x="3" y="10" width="3" height="1" fill="currentColor"/><rect x="8" y="10" width="3" height="1" fill="currentColor"/><rect x="12" y="10" width="2" height="1" fill="currentColor"/>
          {/* Row 11 - feet */}<rect x="0" y="11" width="1" height="1" fill="currentColor"/><rect x="4" y="11" width="2" height="1" fill="currentColor"/><rect x="8" y="11" width="2" height="1" fill="currentColor"/><rect x="13" y="11" width="1" height="1" fill="currentColor"/>
        </svg>
        <span className="hidden lg:inline text-2xl font-bold tracking-tighter text-primary matrix-glow">
          GhostBalance
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          const badgeCount =
            item.href === "/notifications" ? unread?.count :
            item.href === "/conversations" ? unreadConversations?.count :
            0;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-tooltip={item.label}
              className={`relative sidebar-tooltip ${
                isActive
                  ? "flex items-center gap-4 py-3 text-primary font-bold lg:border-r-2 lg:border-primary lg:pr-4 md:justify-center lg:justify-start md:bg-primary/10 lg:bg-transparent transition-all"
                  : "flex items-center gap-4 py-3 text-on-surface-variant hover:text-primary hover:bg-primary/5 md:justify-center lg:justify-start transition-all duration-300"
              }`}
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="hidden lg:inline font-medium">{item.label}</span>

              {badgeCount != null && badgeCount > 0 && (
                <>
                  <span className="hidden lg:inline ml-auto bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center">
                    {badgeCount}
                  </span>
                  <span className="hidden md:block lg:hidden absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
                </>
              )}
            </Link>
          );
        })}

        {/* More menu */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            data-tooltip="More"
            className={`w-full sidebar-tooltip ${
              moreIsActive
                ? "flex items-center gap-4 py-3 text-primary font-bold md:justify-center lg:justify-start transition-all"
                : "flex items-center gap-4 py-3 text-on-surface-variant hover:text-primary hover:bg-primary/5 md:justify-center lg:justify-start transition-all duration-300"
            }`}
          >
            <span className="w-[26px] h-[26px] flex items-center justify-center border-2 border-current rounded-full">
              <Icon name="more_horiz" filled={moreIsActive} className="text-[16px]" />
            </span>
            <span className="hidden lg:inline font-medium">More</span>
          </button>

          {moreOpen && (
            <div className="absolute left-0 lg:left-0 bottom-full mb-1 md:min-w-[200px] bg-surface border border-outline shadow-lg z-50">
              {MORE_ITEMS.map((item) => {
                const isActive = !item.external && pathname.startsWith(item.href);
                const className = `flex items-center gap-3 px-4 py-3 ${
                  isActive
                    ? "text-primary font-bold bg-primary/10"
                    : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                } transition-all duration-200`;

                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreOpen(false)}
                    className={className}
                  >
                    <Icon name={item.icon} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={className}
                  >
                    <Icon name={item.icon} filled={isActive} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User info — hidden in icon-only mode */}
      {isAuthenticated && user && (
        <div className="hidden lg:block px-6 py-4 border-t border-outline">
          <p className="text-sm font-bold text-primary matrix-glow">
            {formatBalance(user.public_balance)}
          </p>
          <p className="text-[10px] text-on-surface-variant/60 font-mono uppercase">
            {getTierName(weiToEth(user.public_balance))}
          </p>
        </div>
      )}

      {/* New Proof / Login CTA */}
      <div className="mt-auto pt-6">
        <Link
          href="/setup"
          data-tooltip={isAuthenticated ? "New Profile" : "Login"}
          className="sidebar-tooltip w-full bg-primary/10 border border-primary text-primary font-bold py-3 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-primary/20"
        >
          <Icon name={isAuthenticated ? "add_circle" : "login"} className="text-sm md:text-xl lg:text-sm" />
          <span className="hidden lg:inline">{isAuthenticated ? "New Profile" : "Login"}</span>
        </Link>
      </div>
    </aside>
  );
}
