"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { ComposeBox } from "@/components/ComposeBox";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { PostItem } from "@/components/PostItem";
import { ImageDisplay } from "@/components/ImageDisplay";
import type { Post as BackendPost } from "@/lib/types";
import { formatBalance, formatRelativeTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { usePost, useThread, useCreatePost, useRecordView } from "@/hooks/usePost";

function PostRightSidebar({ post }: { post: BackendPost | undefined }) {
  if (!post) return null;

  return (
    <>
      <section className="glass-panel p-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-primary/40 mb-4">
          Post Stats
        </h3>
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant/60">Views</span>
            <span className="text-sm font-bold text-primary">
              {post.view_count.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant/60">Likes</span>
            <span className="text-sm font-bold text-primary">
              {post.like_count.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant/60">Replies</span>
            <span className="text-sm font-bold text-primary">
              {post.reply_count.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant/60">Reposts</span>
            <span className="text-sm font-bold text-primary">
              {post.repost_count.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-primary/40 mb-4">
          Author
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-outline flex items-center justify-center overflow-hidden">
            {post.avatar_key ? (
              <ImageDisplay uploadKey={post.avatar_key} className="w-full h-full object-cover" />
            ) : (
              <Icon name="person" className="text-on-surface-variant/60" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-primary matrix-glow">
              {formatBalance(post.public_balance)}
            </p>
            <p className="text-[10px] text-on-surface-variant/60 font-mono">
              {formatRelativeTime(post.created_at)}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const post = usePost(id);
  const thread = useThread(id);
  const recordView = useRecordView();
  const createPost = useCreatePost();

  useEffect(() => {
    if (id) {
      recordView.mutate(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AppLayout rightSidebar={<PostRightSidebar post={post.data} />}>
      <PageHeader
        title="Thread"
        subtitle="Post Detail"
        showBack
        onBack={() => router.back()}
      />

      {/* Loading */}
      {post.isLoading && (
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">
            Loading...
          </p>
        </div>
      )}

      {/* Root Post */}
      {post.data && (
        <div className="border-b border-outline">
          <PostItem post={post.data} />
        </div>
      )}

      {/* Reply Compose */}
      {isAuthenticated && post.data && (
        <div className="p-4 border-b border-outline bg-background">
          <ComposeBox
            compact
            placeholder="Post your reply..."
            submitLabel="REPLY"
            avatarKey={user?.avatar_key}
            onSubmit={async (body, attachments) => {
              await createPost.mutateAsync({
                body,
                parent_id: id,
                attachments: attachments.length > 0 ? attachments : undefined,
              });
            }}
          />
        </div>
      )}

      {/* Thread / Replies */}
      {thread.isLoading && (
        <div className="p-8 text-center">
          <p className="text-xs font-mono text-on-surface-variant/60">
            Loading replies...
          </p>
        </div>
      )}

      <div className="divide-y divide-outline/50">
        {thread.data && thread.data.length === 0 && (
          <div className="p-12 text-center">
            <Icon
              name="chat_bubble"
              className="text-4xl text-on-surface-variant/30 mb-4"
            />
            <p className="text-sm font-mono text-on-surface-variant/60">
              No replies yet
            </p>
          </div>
        )}

        {thread.data
          ?.filter((reply) => reply.id !== id)
          .map((reply) => (
            <div
              key={reply.id}
              style={{ marginLeft: reply.depth * 24 }}
            >
              <PostItem post={reply} />
            </div>
          ))}
      </div>
    </AppLayout>
  );
}
