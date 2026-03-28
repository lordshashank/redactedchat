import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PollData } from "@/lib/types";
import { useToast } from "@/providers/ToastProvider";

export function usePoll(pollId: string | null) {
  return useQuery<PollData>({
    queryKey: ["poll", pollId],
    queryFn: () => apiFetch<PollData>(`/polls/${pollId}`),
    enabled: !!pollId,
  });
}

export function usePollVote() {
  const queryClient = useQueryClient();
  const { toastError } = useToast();

  return useMutation({
    mutationFn: ({
      pollId,
      option_id,
    }: {
      pollId: string;
      option_id: string;
    }) =>
      apiFetch<PollData>(`/polls/${pollId}/vote`, {
        method: "POST",
        body: JSON.stringify({ option_id }),
      }),
    onSuccess: (_data, { pollId }) => {
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });
}
