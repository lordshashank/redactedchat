"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Icon } from "@/components/Icon";
import { ImageDisplay } from "@/components/ImageDisplay";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useFeedbackDetail,
  useFeedbackVote,
  useCreateFeedbackComment,
  useDeleteFeedback,
  useDeleteFeedbackComment,
} from "@/hooks/useFeedback";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/format";
import { FEEDBACK_TYPE_ICON, FEEDBACK_STATUS_LABEL, FEEDBACK_STATUS_COLOR } from "@/lib/feedback";
import type { PostAttachment } from "@/lib/types";

export default function FeedbackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: post, isLoading } = useFeedbackDetail(id);
  const vote = useFeedbackVote();
  const addComment = useCreateFeedbackComment();
  const deleteFeedback = useDeleteFeedback();
  const deleteComment = useDeleteFeedbackComment();

  const [commentBody, setCommentBody] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Feedback" showBack onBack={() => router.back()} />
        <div className="p-12 text-center">
          <p className="text-sm font-mono text-on-surface-variant/60">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <PageHeader title="Feedback" showBack onBack={() => router.back()} />
        <div className="p-12 text-center">
          <Icon name="error" className="text-4xl text-on-surface-variant/30 mb-4" />
          <p className="text-sm font-mono text-on-surface-variant/60">Not found</p>
        </div>
      </AppLayout>
    );
  }

  const isOwner = user?.nullifier === post.user_id;
  const lightboxAttachments: PostAttachment[] = (post.attachments ?? []).map(
    (att) => ({
      id: att.key,
      upload_key: att.key,
      position: att.position,
    }),
  );

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      router.push("/setup");
      return;
    }
    if (!commentBody.trim()) return;
    addComment.mutate(
      { postId: post.id, body: commentBody.trim() },
      { onSuccess: () => setCommentBody("") },
    );
  };

  const handleDelete = () => {
    deleteFeedback.mutate(post.id, {
      onSuccess: () => router.replace("/feedback"),
    });
    setDeleteConfirmOpen(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Feedback"
        showBack
        onBack={() => router.back()}
        rightContent={
          isOwner ? (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-on-surface-variant/60 hover:text-red-400 transition-colors"
            >
              <Icon name="delete" className="!text-[20px]" />
            </button>
          ) : undefined
        }
      />

      {/* Post detail */}
      <div className="p-6 border-b border-outline">
        <div className="flex gap-4">
          {/* Vote button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                router.push("/setup");
                return;
              }
              vote.mutate(post.id);
            }}
            disabled={!isAuthenticated}
            className={`flex flex-col items-center justify-center min-w-[56px] h-16 border transition-colors shrink-0 ${
              post.user_has_voted
                ? "text-primary border-primary bg-primary/10"
                : "text-on-surface-variant/60 border-outline hover:text-primary hover:border-primary/50"
            } ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <Icon name="arrow_upward" className="!text-[20px]" />
            <span className="text-sm font-bold font-mono">{post.vote_count}</span>
          </button>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono border ${FEEDBACK_STATUS_COLOR[post.status]}`}>
                {FEEDBACK_STATUS_LABEL[post.status]}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest">
                <Icon name={FEEDBACK_TYPE_ICON[post.type] || "feedback"} className="!text-[12px]" />
                {post.type}
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant/40">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold font-mono text-on-surface">
              {post.title}
            </h2>

            {/* Description */}
            <p className="text-sm font-mono text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {[...post.attachments]
                  .sort((a, b) => a.position - b.position)
                  .map((att, i) => (
                  <button
                    key={att.key}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative shrink-0 w-32 h-32 border border-outline hover:border-primary transition-colors bg-surface-variant/10 group"
                  >
                    <ImageDisplay
                      uploadKey={att.key}
                      alt="attachment"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon name="open_in_full" className="text-white !text-[20px]" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <ImageLightbox
              attachments={lightboxAttachments}
              openIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNavigate={setLightboxIndex}
            />

            {/* Admin note */}
            {post.admin_note && (
              <div className="border-l-2 border-primary pl-3 py-1">
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">
                  Admin Note
                </p>
                <p className="text-xs font-mono text-on-surface-variant">
                  {post.admin_note}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="border-b border-outline">
        <div className="px-6 py-3">
          <h3 className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest font-mono">
            Comments ({post.comments.length})
          </h3>
        </div>

        {post.comments.length === 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-mono text-on-surface-variant/40">
              No comments yet
            </p>
          </div>
        )}

        <div className="divide-y divide-outline/30">
          {post.comments.map((comment) => (
            <div key={comment.id} className="px-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                {comment.is_admin && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest font-mono text-primary border border-primary bg-primary/10">
                    Admin
                  </span>
                )}
                <span className="text-[10px] font-mono text-on-surface-variant/40">
                  {formatRelativeTime(comment.created_at)}
                </span>
                {user?.nullifier === comment.user_id && (
                  <button
                    onClick={() => deleteComment.mutate({ postId: post.id, commentId: comment.id })}
                    className="ml-auto text-on-surface-variant/30 hover:text-red-400 transition-colors"
                  >
                    <Icon name="close" className="!text-[14px]" />
                  </button>
                )}
              </div>
              <p className="text-sm font-mono text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add comment */}
      <div className="p-6">
        {isAuthenticated ? (
          <div className="flex gap-3">
            <textarea
              placeholder="Add a comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={2}
              className="flex-1 bg-transparent border border-outline px-3 py-2 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentBody.trim() || addComment.isPending}
              className="self-end px-4 py-2 bg-primary text-black text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addComment.isPending ? "..." : "Post"}
            </button>
          </div>
        ) : (
          <div className="text-xs font-mono text-on-surface-variant/60">
            Sign in to vote or comment.{" "}
            <button
              type="button"
              onClick={() => router.push("/setup")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Open setup
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Feedback"
        message="Are you sure? This will remove the post and all its comments."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        loading={deleteFeedback.isPending}
      />
    </AppLayout>
  );
}
