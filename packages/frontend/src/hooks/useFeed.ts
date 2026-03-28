import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Post, CursorPage, TrendingPage, FeedType } from "@/lib/types";

export function useFeed(params: {
  type?: FeedType;
  author?: string;
  min_balance?: string;
}) {
  const { type, author, min_balance } = params;

  return useInfiniteQuery<CursorPage<Post>>({
    queryKey: ["feed", type, author, min_balance],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<Post>>("/posts", {
        params: {
          ...(type ? { type } : {}),
          ...(author ? { author } : {}),
          ...(min_balance ? { min_balance } : {}),
          ...(pageParam ? { cursor: pageParam as string } : {}),
        },
      }),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
  });
}

export function useTrendingFeed(params?: { min_balance?: string }) {
  const min_balance = params?.min_balance;

  return useInfiniteQuery<TrendingPage<Post>>({
    queryKey: ["feed", "trending-page", min_balance],
    queryFn: ({ pageParam }) =>
      apiFetch<TrendingPage<Post>>("/trending/posts", {
        params: {
          page: String(pageParam),
          ...(min_balance ? { min_balance } : {}),
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}
