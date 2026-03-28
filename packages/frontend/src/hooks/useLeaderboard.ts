import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { LeaderboardProfile, CursorPage, UserRank } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

export function useLeaderboard(
  sort?: "balance" | "posts" | "followers",
  timeRange?: { start?: string; end?: string },
) {
  return useInfiniteQuery<CursorPage<LeaderboardProfile>>({
    queryKey: ["leaderboard", sort, timeRange?.start, timeRange?.end],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<LeaderboardProfile>>("/leaderboard", {
        params: {
          ...(sort ? { sort } : {}),
          ...(timeRange?.start ? { start: timeRange.start } : {}),
          ...(timeRange?.end ? { end: timeRange.end } : {}),
          ...(pageParam ? { cursor: pageParam as string } : {}),
        },
      }),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
  });
}

export function useMyRank() {
  const { isAuthenticated } = useAuth();

  return useQuery<UserRank>({
    queryKey: ["leaderboard", "rank"],
    queryFn: () => apiFetch<UserRank>("/leaderboard/rank"),
    enabled: isAuthenticated,
  });
}
