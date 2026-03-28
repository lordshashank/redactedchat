import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Post, CursorPage } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

export function useBookmarks() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery<CursorPage<Post>>({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<Post>>("/bookmarks", {
        params: {
          ...(pageParam ? { cursor: pageParam as string } : {}),
        },
      }),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: isAuthenticated,
  });
}
