import { apiFetch } from "@/lib/api";

const urlCache = new Map<string, { url: string; expiry: number }>();

export async function getImageUrl(key: string): Promise<string> {
  const cached = urlCache.get(key);
  if (cached && cached.expiry > Date.now()) return cached.url;

  const { url } = await apiFetch<{ url: string }>(`/uploads/${key}`);
  urlCache.set(key, { url, expiry: Date.now() + 55 * 60 * 1000 }); // 55 min cache
  return url;
}
