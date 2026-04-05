"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/hooks/useUpload";
import { useToast } from "@/providers/ToastProvider";

interface FileUploaderProps {
  onComplete: (key: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploader({
  onComplete,
  onUploadingChange,
  accept = "image/*",
  maxSize = DEFAULT_MAX_SIZE,
  multiple = false,
  maxFiles,
  className,
  children,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress } = useUpload();
  const { toastError } = useToast();
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const isBusy = isBatchUploading || isUploading;

  useEffect(() => {
    onUploadingChange?.(isBusy);
  }, [isBusy, onUploadingChange]);

  useEffect(() => {
    return () => {
      onUploadingChange?.(false);
    };
  }, [onUploadingChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Reset the input so the same file can be re-selected
    e.target.value = "";

    const selectedFiles =
      typeof maxFiles === "number" ? files.slice(0, maxFiles) : files;

    if (typeof maxFiles === "number" && files.length > maxFiles) {
      toastError(
        `Only ${maxFiles} file${maxFiles === 1 ? "" : "s"} can be added at once.`,
      );
    }

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        toastError(
          `File too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`,
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsBatchUploading(true);
    try {
      await Promise.all(
        validFiles.map(async (file) => {
          try {
            const key = await upload(file);
            onComplete(key);
          } catch {
            toastError("Upload failed. Please try again.");
          }
        }),
      );
    } finally {
      setIsBatchUploading(false);
    }
  };

  return (
    <div
      onClick={() => !isBusy && inputRef.current?.click()}
      className={`relative overflow-hidden cursor-pointer ${isBusy ? "pointer-events-none opacity-50" : ""} ${className ?? ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      {children}
      {isBusy && (
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
