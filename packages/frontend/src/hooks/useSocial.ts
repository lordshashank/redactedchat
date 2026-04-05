import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  LikeToggleResult,
  BookmarkToggleResult,
  FollowToggleResult,
  BlockToggleResult,
} from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

export function useLike() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<LikeToggleResult>(
        `/posts/${postId}/like`,
        { method: "POST" },
      ),
    onSuccess: (data, postId) => {
      // Optimistically update all feed caches
      queryClient.setQueriesData(
        { queryKey: ["feed"], exact: false },
        (old: { pages?: { data?: { id: string }[] }[] }) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data?.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      viewer_liked: data.liked,
                      like_count: data.like_count,
                    }
                  : post,
              ),
            })),
          };
        },
      );

      // Invalidate single post + all thread caches
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "post" && query.queryKey[2] === "thread",
      });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useBookmark() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<BookmarkToggleResult>(
        `/posts/${postId}/bookmark`,
        { method: "POST" },
      ),
    onSuccess: (data, postId) => {
      // Update all feed caches
      queryClient.setQueriesData(
        { queryKey: ["feed"], exact: false },
        (old: { pages?: { data?: { id: string }[] }[] }) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data?.map((post) =>
                post.id === postId
                  ? { ...post, viewer_bookmarked: data.bookmarked }
                  : post,
              ),
            })),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "post" && query.queryKey[2] === "thread",
      });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useFollow() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (nullifier: string) =>
      apiFetch<FollowToggleResult>(
        `/profiles/${nullifier}/follow`,
        { method: "POST" },
      ),
    onSuccess: (_data, nullifier) => {
      queryClient.invalidateQueries({ queryKey: ["profile", nullifier] });
      queryClient.invalidateQueries({ queryKey: ["profiles", "suggested"] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}

export function useBlock() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: (nullifier: string) =>
      apiFetch<BlockToggleResult>(
        `/profiles/${nullifier}/block`,
        { method: "POST" },
      ),
    onSuccess: (_data, nullifier) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile", nullifier] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}
