import { useState, useCallback } from "react";

const DEFAULT_MAX = 4;

export function useAttachments(max = DEFAULT_MAX) {
  const [keys, setKeys] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const add = useCallback(
    (key: string) => {
      setKeys((prev) => {
        if (prev.includes(key) || prev.length >= max) return prev;
        return [...prev, key];
      });
    },
    [max],
  );

  const remove = useCallback((key: string) => {
    setKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const clear = useCallback(() => setKeys([]), []);

  const remaining = Math.max(0, max - keys.length);

  return { keys, add, remove, clear, remaining, isUploading, setIsUploading } as const;
}
