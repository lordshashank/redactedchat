import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Post, ThreadPost, CreatePostRequest } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

const MAX_PARENT_DEPTH = 20;

export function useParentChain(post: Post | undefined) {
  return useQuery<Post[]>({
    queryKey: ["post", post?.id, "parents"],
    queryFn: async () => {
      const chain: Post[] = [];
      const seen = new Set<string>();
      let currentId = post?.parent_id ?? null;
      while (currentId && chain.length < MAX_PARENT_DEPTH) {
        if (seen.has(currentId)) break;
        seen.add(currentId);
        const parent = await apiFetch<Post>(`/posts/${currentId}`);
        chain.unshift(parent);
        currentId = parent.parent_id;
      }
      return chain;
    },
    enabled: !!post?.parent_id,
  });
}

export function usePost(id: string | null) {
  return useQuery<Post>({
    queryKey: ["post", id],
    queryFn: () => apiFetch<Post>(`/posts/${id}`),
    enabled: !!id,
  });
}

export function useThread(id: string | null) {
  return useQuery<ThreadPost[]>({
    queryKey: ["post", id, "thread"],
    queryFn: () => apiFetch<ThreadPost[]>(`/posts/${id}/thread`),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (data: CreatePostRequest) =>
      apiFetch<Post>("/posts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      // If this was a reply, refresh the thread and parent post
      if (variables.parent_id) {
        queryClient.invalidateQueries({ queryKey: ["post", variables.parent_id, "thread"] });
        queryClient.invalidateQueries({ queryKey: ["post", variables.parent_id] });
      }
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/posts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useRecordView() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/posts/${id}/view`, { method: "POST" }),
  });
}
