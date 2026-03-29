"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { ImageDisplay } from "@/components/ImageDisplay";
import { Linkify } from "@/components/Linkify";
import { FileUploader } from "@/components/FileUploader";
import type { Post } from "@/lib/types";
import { formatBalance, formatRelativeTime } from "@/lib/format";
import { useCreatePost } from "@/hooks/usePost";
import { useToast } from "@/providers/ToastProvider";

interface QuoteDialogProps {
  post: Post;
  open: boolean;
  onClose: () => void;
}

export function QuoteDialog({ post, open, onClose }: QuoteDialogProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const createPost = useCreatePost();
  const { toastSuccess } = useToast();

  if (!open) return null;

  const handleSubmit = () => {
    if (!text.trim() && attachments.length === 0) return;
    createPost.mutate(
      {
        body: text || undefined,
        repost_of_id: post.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: () => {
          toastSuccess("Quote posted");
          setText("");
          setAttachments([]);
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
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
            onClick={onClose}
            className="text-on-surface-variant/60 hover:text-primary transition-colors"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add your comment..."
          className="w-full bg-background border border-outline focus:border-primary focus:ring-0 text-on-surface p-3 font-mono text-sm resize-none min-h-[80px]"
          autoFocus
        />
        {attachments.length > 0 && (
          <div className="flex gap-2">
            {attachments.map((key, i) => (
              <div key={key} className="relative w-16 h-16 border border-outline">
                <ImageDisplay uploadKey={key} className="w-full h-full object-cover" />
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 bg-black/60 text-white text-xs p-0.5"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4 text-on-surface-variant">
          {attachments.length < 4 && (
            <FileUploader
              onComplete={(key) => setAttachments((prev) => prev.length < 4 ? [...prev, key] : prev)}
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
            {post.body && <Linkify text={post.body} nested />}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={(!text.trim() && attachments.length === 0) || createPost.isPending}
            className="px-6 py-2 bg-primary/10 border border-primary text-primary font-bold text-xs hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest font-mono"
          >
            {createPost.isPending ? "POSTING..." : "QUOTE"}
          </button>
        </div>
      </div>
    </div>
  );
}
