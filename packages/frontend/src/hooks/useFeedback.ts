import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  FeedbackListResponse,
  FeedbackPostDetail,
  FeedbackPost,
  FeedbackVoteResult,
  FeedbackComment,
  CreateFeedbackRequest,
  FeedbackType,
} from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

export function useFeedbackList(params: {
  type?: FeedbackType | "";
  status?: string;
  sort?: "recent" | "votes";
  page?: number;
}) {
  return useQuery<FeedbackListResponse>({
    queryKey: ["feedback", params.type, params.status, params.sort, params.page],
    queryFn: () =>
      apiFetch<FeedbackListResponse>("/feedback", {
        params: {
          ...(params.type ? { type: params.type } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.sort ? { sort: params.sort } : {}),
          ...(params.page ? { page: String(params.page) } : {}),
        },
      }),
  });
}

export function useFeedbackDetail(id: string | null) {
  return useQuery<FeedbackPostDetail>({
    queryKey: ["feedback", id],
    queryFn: () => apiFetch<FeedbackPostDetail>(`/feedback/${id}`),
    enabled: !!id,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) =>
      apiFetch<FeedbackPost>("/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toastSuccess("Feedback submitted");
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useFeedbackVote() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<FeedbackVoteResult>(`/feedback/${postId}/vote`, {
        method: "POST",
      }),
    onSuccess: (data, postId) => {
      // Update list caches
      queryClient.setQueriesData<FeedbackListResponse>(
        { queryKey: ["feedback"], exact: false },
        (old) => {
          if (!old?.posts) return old;
          return {
            ...old,
            posts: old.posts.map((p) =>
              p.id === postId
                ? { ...p, user_has_voted: data.voted, vote_count: data.vote_count }
                : p,
            ),
          };
        },
      );
      // Update detail cache
      queryClient.setQueriesData<FeedbackPostDetail>(
        { queryKey: ["feedback", postId] },
        (old) => {
          if (!old) return old;
          return { ...old, user_has_voted: data.voted, vote_count: data.vote_count };
        },
      );
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useCreateFeedbackComment() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) =>
      apiFetch<FeedbackComment>(`/feedback/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["feedback", postId] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<{ ok: true }>(`/feedback/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      toastSuccess("Feedback deleted");
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useDeleteFeedbackComment() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      apiFetch<{ ok: true }>(`/feedback/${postId}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["feedback", postId] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}
