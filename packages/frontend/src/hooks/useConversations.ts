import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Conversation, Message, CursorPage } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/providers/AuthProvider";

export function useConversations() {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery<CursorPage<Conversation>>({
    queryKey: ["conversations"],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<Conversation>>("/conversations", {
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

export function useUnreadConversationsCount() {
  const { isAuthenticated } = useAuth();
  return useQuery<{ count: number }>({
    queryKey: ["conversations", "unread-count"],
    queryFn: () => apiFetch<{ count: number }>("/conversations/unread-count"),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
}

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery<CursorPage<Message>>({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: ({ pageParam }) =>
      apiFetch<CursorPage<Message>>(
        `/conversations/${conversationId}/messages`,
        {
          params: {
            ...(pageParam ? { cursor: pageParam as string } : {}),
          },
        },
      ),
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: null as string | null,
    refetchInterval: 10000,
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (data: { body?: string; attachment_key?: string }) =>
      apiFetch<Message>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversations", "unread-count"],
      });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (data: {
      participant?: string;
      participants?: string[];
      is_group?: boolean;
      name?: string;
    }) =>
      apiFetch<Conversation>("/conversations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<void>(`/conversations/${conversationId}/read`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversations", "unread-count"],
      });
    },
  });
}
