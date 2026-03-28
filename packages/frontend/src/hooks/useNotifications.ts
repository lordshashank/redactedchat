import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Notification, CursorPage } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/providers/AuthProvider";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery<CursorPage<Notification>>({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<Notification>>("/notifications", {
        params: {
          ...(pageParam ? { cursor: pageParam as string } : {}),
        },
      }),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      apiFetch<{ count: number }>("/notifications/unread-count"),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: () =>
      apiFetch<void>("/notifications/read", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}
