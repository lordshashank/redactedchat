"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/Icon";
import { ImageDisplay } from "@/components/ImageDisplay";
import { FileUploader } from "@/components/FileUploader";
import { useAttachments } from "@/hooks/useAttachments";

interface ComposeBoxProps {
  placeholder?: string;
  submitLabel?: string;
  pendingLabel?: string;
  avatarKey?: string | null;
  compact?: boolean;
  onSubmit: (body: string, attachments: string[]) => Promise<void>;
}

export function ComposeBox({
  placeholder = "What's on your mind, anon?",
  submitLabel = "BROADCAST",
  pendingLabel = "SENDING...",
  avatarKey,
  compact = false,
  onSubmit,
}: ComposeBoxProps) {
  const [text, setText] = useState("");
  const att = useAttachments();
  const [isPending, setIsPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const handleSubmit = async () => {
    if (att.isUploading) return;
    if (!text.trim() && att.keys.length === 0) return;
    setIsPending(true);
    try {
      await onSubmit(text, att.keys);
      setText("");
      att.clear();
    } finally {
      setIsPending(false);
    }
  };

  const avatarSize = compact ? "w-10 h-10" : "w-12 h-12";
  const textSize = compact ? "text-sm" : "text-lg";

  return (
    <div className="flex gap-4">
      <div className={`${avatarSize} shrink-0 bg-primary/10 border border-outline flex items-center justify-center overflow-hidden`}>
        {avatarKey ? (
          <ImageDisplay uploadKey={avatarKey} className="w-full h-full object-cover" />
        ) : (
          <Icon name="person" className={`text-on-surface-variant/60 ${compact ? "text-sm" : ""}`} />
        )}
      </div>
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          className={`w-full bg-transparent border-none focus:ring-0 ${textSize} placeholder:text-on-surface-variant/30 text-on-surface resize-none overflow-hidden min-h-12 py-2 pl-2 font-mono`}
          placeholder={placeholder}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {att.keys.length > 0 && (
          <div className="flex gap-2 mt-2">
            {att.keys.map((key) => (
              <div key={key} className="relative w-20 h-20 border border-outline">
                <ImageDisplay uploadKey={key} className="w-full h-full object-cover" />
                <button
                  onClick={() => att.remove(key)}
                  className="absolute top-0 right-0 bg-black/60 text-white text-xs p-0.5"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 text-on-surface-variant">
            {att.remaining > 0 && (
              <FileUploader
                onComplete={att.add}
                onUploadingChange={att.setIsUploading}
                multiple
                maxFiles={att.remaining}
                className="inline-block"
              >
                <Icon
                  name="image"
                  className="cursor-pointer hover:text-primary transition-colors"
                />
              </FileUploader>
            )}
            <Icon
              name="poll"
              className="opacity-30 cursor-not-allowed"
              title="Polls coming soon"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={(!text.trim() && att.keys.length === 0) || isPending || att.isUploading}
            className="px-6 py-2 bg-primary/10 border border-primary text-primary font-bold text-xs hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest font-mono"
          >
            {isPending ? pendingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
