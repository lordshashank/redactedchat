"use client";

import { useRef } from "react";
import { useUpload } from "@/hooks/useUpload";
import { useToast } from "@/providers/ToastProvider";

interface FileUploaderProps {
  onComplete: (key: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploader({
  onComplete,
  accept = "image/*",
  maxSize = DEFAULT_MAX_SIZE,
  className,
  children,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress } = useUpload();
  const { toastError } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be re-selected
    e.target.value = "";

    if (file.size > maxSize) {
      toastError(`File too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }

    try {
      const key = await upload(file);
      onComplete(key);
    } catch {
      toastError("Upload failed. Please try again.");
    }
  };

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`relative overflow-hidden cursor-pointer ${isUploading ? "pointer-events-none opacity-50" : ""} ${className ?? ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      {children}
      {isUploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
