"use client";

import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/images";

interface ImageDisplayProps {
  uploadKey: string | null | undefined;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ImageDisplay({ uploadKey, alt, className, fallback }: ImageDisplayProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!uploadKey) {
      setUrl(null);
      setLoading(false);
      setErrored(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrored(false);

    getImageUrl(uploadKey)
      .then((resolved) => {
        if (!cancelled) {
          setUrl(resolved);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrored(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uploadKey]);

  if (!uploadKey || errored) {
    return <>{fallback ?? null}</>;
  }

  if (loading) {
    return <div className={`animate-pulse bg-primary/10 ${className ?? ""}`} />;
  }

  return (
    <img
      src={url!}
      alt={alt ?? ""}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
