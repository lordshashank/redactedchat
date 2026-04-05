"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import { FileUploader } from "./FileUploader";
import { ImageDisplay } from "./ImageDisplay";
import { useCreateFeedback } from "@/hooks/useFeedback";
import { useAttachments } from "@/hooks/useAttachments";
import type { FeedbackType } from "@/lib/types";

const TYPES: { value: FeedbackType; label: string; icon: string }[] = [
  { value: "feature", label: "Feature", icon: "lightbulb" },
  { value: "bug", label: "Bug", icon: "bug_report" },
  { value: "improvement", label: "Improvement", icon: "auto_awesome" },
  { value: "question", label: "Question", icon: "help" },
];

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const att = useAttachments();
  const createFeedback = useCreateFeedback();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [description]);

  if (!open) return null;

  const handleSubmit = () => {
    if (att.isUploading) return;
    if (!title.trim() || !description.trim()) return;
    createFeedback.mutate(
      {
        type,
        title: title.trim(),
        description: description.trim(),
        attachment_keys: att.keys,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setType("feature");
          att.clear();
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="absolute inset-0 z-[100] flex items-start justify-center p-4 bg-black/10 backdrop-blur-sm"
      style={{ minHeight: '100%' }}
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-md w-full p-6 space-y-5 mt-20 shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest">
            Submit Feedback
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant/60 hover:text-primary transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-bold uppercase tracking-widest font-mono transition-colors border ${
                type === t.value
                  ? "bg-primary/10 text-primary border-primary"
                  : "text-on-surface-variant/60 border-outline hover:text-primary hover:border-primary/50"
              }`}
            >
              <Icon name={t.icon} className="!text-[14px]" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full bg-transparent border border-outline px-3 py-2 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
        />

        {/* Description */}
        <textarea
          ref={textareaRef}
          placeholder="Describe your feedback..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={5000}
          className="w-full bg-transparent border border-outline px-3 py-2 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors resize-none overflow-hidden min-h-[100px]"
        />

        {/* Attachments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest font-mono">
              Attachments ({att.keys.length}/4)
            </span>
            {att.remaining > 0 && (
              <FileUploader
                onComplete={att.add}
                onUploadingChange={att.setIsUploading}
                multiple
                maxFiles={att.remaining}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest font-mono">
                  <Icon name="add_a_photo" className="!text-[14px]" />
                  Add
                </div>
              </FileUploader>
            )}
          </div>

          {att.keys.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {att.keys.map((key) => (
                <div
                  key={key}
                  className="relative group shrink-0 w-16 h-16 border border-outline bg-surface-variant/10"
                >
                  <ImageDisplay
                    uploadKey={key}
                    alt="attachment"
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                        <Icon name="image" className="!text-[14px]" />
                      </div>
                    }
                  />
                  <button
                    onClick={() => att.remove(key)}
                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="close" className="!text-[12px]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-outline text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !title.trim() || !description.trim() || createFeedback.isPending || att.isUploading
            }
            className="px-4 py-2 bg-primary text-black text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createFeedback.isPending ? "..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
