"use client";

import { Icon } from "@/components/Icon";
import { ImageDisplay } from "@/components/ImageDisplay";
import type { PostAttachment } from "@/lib/types";

interface ImageLightboxProps {
  attachments: PostAttachment[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({ attachments, openIndex, onClose, onNavigate }: ImageLightboxProps) {
  if (openIndex === null || attachments.length === 0) return null;

  const sorted = [...attachments].sort((a, b) => a.position - b.position);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
      >
        <Icon name="close" className="text-3xl" />
      </button>

      {sorted.length > 1 && openIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(openIndex - 1); }}
          className="absolute left-4 text-white/80 hover:text-white z-10"
        >
          <Icon name="chevron_left" className="text-4xl" />
        </button>
      )}

      {sorted.length > 1 && openIndex < sorted.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(openIndex + 1); }}
          className="absolute right-4 text-white/80 hover:text-white z-10"
        >
          <Icon name="chevron_right" className="text-4xl" />
        </button>
      )}

      <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <ImageDisplay
          uploadKey={sorted[openIndex].upload_key}
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>

      {sorted.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {sorted.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === openIndex ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
