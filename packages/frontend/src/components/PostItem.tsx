"use client";

import { Icon } from "./Icon";

export interface Post {
  id: string;
  balance: string;
  timeAgo: string;
  body: string;
  imageUrl?: string;
  comments: number;
  reposts: number;
  likes: number;
  avatarUrl?: string;
}

interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps) {
  return (
    <article className="p-6 hover:bg-primary/[0.03] transition-colors cursor-pointer group">
      <div className="flex gap-4">
        <div className="w-12 h-12 shrink-0 bg-primary/10 border border-outline flex items-center justify-center">
          <Icon name="person" className="text-on-surface-variant/60" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary matrix-glow">
                {post.balance}
              </span>
              <span className="text-on-surface-variant/50 text-xs font-mono">
                · {post.timeAgo}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/50 group-hover:text-primary transition-colors text-lg">
              more_horiz
            </span>
          </div>
          <p className="font-mono text-sm leading-relaxed text-on-surface font-medium">
            {post.body}
          </p>
          {post.imageUrl && (
            <div className="overflow-hidden border border-outline aspect-video mt-3 relative theme-avatar">
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
              <div className="w-full h-full bg-surface-container flex items-center justify-center">
                <Icon name="image" className="text-on-surface-variant/30 text-4xl" />
              </div>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 text-on-surface-variant/50 max-w-md font-mono">
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <Icon name="chat_bubble" className="text-sm" />
              <span className="text-xs">{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <Icon name="repeat" className="text-sm" />
              <span className="text-xs">{post.reposts}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <Icon name="favorite" className="text-sm" />
              <span className="text-xs">
                {post.likes >= 1000
                  ? `${(post.likes / 1000).toFixed(1)}k`
                  : post.likes}
              </span>
            </button>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <Icon name="share" className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
