import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface UploadInitResponse {
  key: string;
  uploadUrl: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Request upload URL
      const { key, uploadUrl } = await apiFetch<UploadInitResponse>(
        "/uploads",
        {
          method: "POST",
          body: JSON.stringify({
            contentType: file.type,
            filename: file.name,
            fileSize: file.size,
          }),
        },
      );

      // Step 2: Upload file to presigned URL with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Step 3: Confirm upload
      await apiFetch<void>(`/uploads/${key}/complete`, {
        method: "POST",
      });

      return key;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, progress, error };
}
