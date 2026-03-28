"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/Icon";
import { ImageDisplay } from "@/components/ImageDisplay";
import { FileUploader } from "@/components/FileUploader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ShareMenu } from "@/components/ShareMenu";
import type { Post } from "@/lib/types";
import { formatBalance, formatRelativeTime, weiToEth } from "@/lib/format";
import { getTierName } from "@/lib/tiers";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useLike, useBookmark, useFollow, useBlock } from "@/hooks/useSocial";
import { useCreateConversation } from "@/hooks/useConversations";
import { usePost, useDeletePost, useCreatePost } from "@/hooks/usePost";
import { useToast } from "@/providers/ToastProvider";

interface PostItemProps {
  post: Post;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function PostItem({ post }: PostItemProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const like = useLike();
  const bookmark = useBookmark();
  const follow = useFollow();
  const block = useBlock();
  const deletePost = useDeletePost();
  const createPost = useCreatePost();
  const createConversation = useCreateConversation();
  const { toastSuccess, toastError } = useToast();

  const { data: originalPost } = usePost(post.repost_of_id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quoteAttachments, setQuoteAttachments] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const repostMenuRef = useRef<HTMLDivElement>(null);

  const isOwn = user?.nullifier === post.author_nullifier;

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!menuOpen && !repostMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (repostMenuOpen && repostMenuRef.current && !repostMenuRef.current.contains(e.target as Node)) {
        setRepostMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, repostMenuOpen]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    like.mutate(post.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bookmark.mutate(post.id);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRepostMenuOpen(false);
    createPost.mutate(
      { repost_of_id: post.id },
      { onSuccess: () => toastSuccess("Reposted") },
    );
  };

  const handleQuoteSubmit = () => {
    if (!quoteText.trim() && quoteAttachments.length === 0) return;
    createPost.mutate(
      {
        body: quoteText || undefined,
        repost_of_id: post.id,
        attachments: quoteAttachments.length > 0 ? quoteAttachments : undefined,
      },
      {
        onSuccess: () => {
          toastSuccess("Quote posted");
          setQuoteOpen(false);
          setQuoteText("");
          setQuoteAttachments([]);
        },
      },
    );
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deletePost.mutate(post.id);
    setConfirmOpen(false);
  };

  return (
    <article className="p-6 hover:bg-primary/[0.03] transition-colors group">
      {/* Repost indicator */}
      {post.repost_of_id && !post.body && (
        <div className="flex items-center gap-2 mb-2 ml-16 text-[10px] text-on-surface-variant/50 font-mono uppercase tracking-widest">
          <Icon name="repeat" className="text-xs" />
          <span>Reposted</span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        <Link
          href={`/profile/${post.author_nullifier}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <div className="w-12 h-12 bg-primary/10 border border-outline flex items-center justify-center overflow-hidden">
            {post.avatar_key ? (
              <ImageDisplay
                uploadKey={post.avatar_key}
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="person" className="text-on-surface-variant/60" />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.author_nullifier}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-lg text-primary matrix-glow hover:underline"
              >
                {formatBalance(post.public_balance)}
              </Link>
              <span className="text-[10px] text-on-surface-variant/40 font-mono uppercase tracking-widest">
                {getTierName(weiToEth(post.public_balance))}
              </span>
              <span className="text-on-surface-variant/50 text-xs font-mono">
                · {formatRelativeTime(post.created_at)}
              </span>
            </div>

          </div>

          {/* Body */}
          <Link href={`/post/${post.id}`} onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-sm leading-relaxed text-on-surface font-medium">
              {post.body}
            </p>
          </Link>

          {/* Embedded original post (for reposts/quotes) */}
          {post.repost_of_id && originalPost && (
            <Link
              href={`/post/${originalPost.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block mt-2 border border-outline p-3 hover:border-primary/40 transition-colors space-y-1"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-primary/10 border border-outline flex items-center justify-center overflow-hidden shrink-0">
                  {originalPost.avatar_key ? (
                    <ImageDisplay uploadKey={originalPost.avatar_key} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="person" className="text-on-surface-variant/60 text-[10px]" />
                  )}
                </div>
                <span className="text-xs font-bold text-primary font-mono">
                  {formatBalance(originalPost.public_balance)}
                </span>
                <span className="text-[10px] text-on-surface-variant/40 font-mono">
                  · {formatRelativeTime(originalPost.created_at)}
                </span>
              </div>
              {originalPost.body && (
                <p className="text-xs text-on-surface-variant font-mono line-clamp-3">
                  {originalPost.body}
                </p>
              )}
              {originalPost.attachments && originalPost.attachments.length > 0 && (
                <div className="mt-1 overflow-hidden border border-outline">
                  <ImageDisplay
                    uploadKey={originalPost.attachments[0].upload_key}
                    className="w-full h-24 object-cover"
                  />
                </div>
              )}
            </Link>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div
              className={`mt-3 overflow-hidden border border-outline ${
                post.attachments.length >= 2 ? "grid grid-cols-2 gap-0.5" : ""
              }`}
            >
              {post.attachments
                .sort((a, b) => a.position - b.position)
                .map((att, i) => (
                  <div
                    key={att.id}
                    className="relative cursor-pointer"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxIndex(i); }}
                  >
                    <ImageDisplay
                      uploadKey={att.upload_key}
                      className={`w-full ${
                        post.attachments!.length >= 2
                          ? "h-48 object-cover"
                          : "max-h-96 object-contain"
                      }`}
                    />
                  </div>
                ))}
            </div>
          )}

          {/* Lightbox */}
          {lightboxIndex !== null && post.attachments && post.attachments.length > 0 && (
            <div
              className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
              >
                <Icon name="close" className="text-3xl" />
              </button>

              {post.attachments.length > 1 && lightboxIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                  className="absolute left-4 text-white/80 hover:text-white z-10"
                >
                  <Icon name="chevron_left" className="text-4xl" />
                </button>
              )}

              {post.attachments.length > 1 && lightboxIndex < post.attachments.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                  className="absolute right-4 text-white/80 hover:text-white z-10"
                >
                  <Icon name="chevron_right" className="text-4xl" />
                </button>
              )}

              <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <ImageDisplay
                  uploadKey={post.attachments.sort((a, b) => a.position - b.position)[lightboxIndex].upload_key}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                />
              </div>

              {post.attachments.length > 1 && (
                <div className="absolute bottom-4 flex gap-2">
                  {post.attachments.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === lightboxIndex ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action bar */}
          <div className="flex justify-between items-center pt-4 mt-1 text-on-surface-variant/50 max-w-md font-mono">
            {/* Comment */}
            <Link
              href={`/post/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Icon name="chat_bubble" className="!text-[18px]" />
              <span className="text-[10px]">{formatCount(post.reply_count)}</span>
            </Link>

            {/* Repost */}
            <div className="relative" ref={repostMenuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRepostMenuOpen(!repostMenuOpen);
                }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Icon name="repeat" className="!text-[18px]" />
                <span className="text-[10px]">{formatCount(post.repost_count)}</span>
              </button>
              {repostMenuOpen && (
                <div className="absolute left-0 top-full mt-1 z-40 glass-panel border border-outline py-1 min-w-[140px]">
                  <button
                    onClick={handleRepost}
                    className="w-full px-4 py-2 text-left text-xs font-mono text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                  >
                    <Icon name="repeat" className="text-sm" />
                    Repost
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRepostMenuOpen(false);
                      setQuoteOpen(true);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-mono text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                  >
                    <Icon name="edit_note" className="text-sm" />
                    Quote
                  </button>
                </div>
              )}
            </div>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                post.viewer_liked
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
            >
              <Icon
                name="favorite"
                filled={post.viewer_liked}
                className="!text-[18px]"
              />
              <span className="text-[10px]">{formatCount(post.like_count)}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 transition-colors ${
                post.viewer_bookmarked
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
            >
              <Icon
                name="bookmark"
                filled={post.viewer_bookmarked}
                className="!text-[18px]"
              />
            </button>

            {/* Share */}
            <ShareMenu
              url={`/post/${post.id}`}
              text={post.body ? post.body.slice(0, 100) : "Check out this post on GhostBalance"}
            />

            {/* More menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="hover:text-primary transition-colors"
              >
                <Icon name="more_horiz" className="!text-[18px]" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-40 bg-background border border-outline shadow-lg min-w-[180px]">
                  {isAuthenticated && !isOwn && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          follow.mutate(post.author_nullifier, {
                            onSuccess: (data) => {
                              toastSuccess(data.following ? "Followed" : "Unfollowed");
                              setMenuOpen(false);
                            },
                          });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Icon name="person_add" className="!text-[16px]" />
                        Follow User
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpen(false);
                          createConversation.mutate(
                            { participant: post.author_nullifier },
                            { onSuccess: (data) => router.push(`/conversations/${data.id}`) }
                          );
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Icon name="mail" className="!text-[16px]" />
                        Message User
                      </button>
                      <div className="border-t border-outline/50" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpen(false);
                          setBlockConfirmOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Icon name="block" className="!text-[16px]" />
                        Block User
                      </button>
                    </>
                  )}
                  {isOwn && (
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Icon name="delete" className="!text-[16px]" />
                      Delete Post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quote compose dialog */}
      {quoteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setQuoteOpen(false)}
        >
          <div
            className="glass-panel border border-outline w-full max-w-lg mx-4 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest font-mono">
                Quote Post
              </h3>
              <button
                onClick={() => setQuoteOpen(false)}
                className="text-on-surface-variant/60 hover:text-primary transition-colors"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="Add your comment..."
              className="w-full bg-background border border-outline focus:border-primary focus:ring-0 text-on-surface p-3 font-mono text-sm resize-none min-h-[80px]"
              autoFocus
            />
            {quoteAttachments.length > 0 && (
              <div className="flex gap-2">
                {quoteAttachments.map((key, i) => (
                  <div key={key} className="relative w-16 h-16 border border-outline">
                    <ImageDisplay uploadKey={key} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setQuoteAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 bg-black/60 text-white text-xs p-0.5"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-4 text-on-surface-variant">
              {quoteAttachments.length < 4 && (
                <FileUploader
                  onComplete={(key) => setQuoteAttachments((prev) => prev.length < 4 ? [...prev, key] : prev)}
                  className="inline-block"
                >
                  <Icon name="image" className="cursor-pointer hover:text-primary transition-colors" />
                </FileUploader>
              )}
            </div>
            {/* Quoted post preview */}
            <div className="border border-outline p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary font-mono">
                  {formatBalance(post.public_balance)}
                </span>
                <span className="text-[10px] text-on-surface-variant/40 font-mono">
                  · {formatRelativeTime(post.created_at)}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono line-clamp-3">
                {post.body}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleQuoteSubmit}
                disabled={(!quoteText.trim() && quoteAttachments.length === 0) || createPost.isPending}
                className="px-6 py-2 bg-primary/10 border border-primary text-primary font-bold text-xs hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest font-mono"
              >
                {createPost.isPending ? "POSTING..." : "QUOTE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deletePost.isPending}
      />
      <ConfirmDialog
        open={blockConfirmOpen}
        title="Block User"
        message="They won't be able to see your posts or interact with you. Mutual follows will be removed."
        confirmLabel="Block"
        onConfirm={() => {
          block.mutate(post.author_nullifier, {
            onSuccess: (data) => {
              toastSuccess(data.blocked ? "User blocked" : "User unblocked");
              setBlockConfirmOpen(false);
            },
            onError: (err) => toastError(err.message),
          });
        }}
        onCancel={() => setBlockConfirmOpen(false)}
        loading={block.isPending}
      />
    </article>
  );
}
