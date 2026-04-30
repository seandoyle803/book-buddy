import { useQueryClient } from "@tanstack/react-query";
import {
  useListSessions,
  useCreateSession as useCreateSessionMutation,
  getListSessionsQueryKey,
  getListBooksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { CreateSessionRequest } from "@workspace/api-client-react";

export function useSessions() {
  return useListSessions(undefined, {
    query: { queryKey: getListSessionsQueryKey() },
  });
}

export function useRecentSessions(limit = 5) {
  const params = { limit };
  return useListSessions(params, {
    query: { queryKey: getListSessionsQueryKey(params) },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const mutation = useCreateSessionMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    },
  });

  return {
    ...mutation,
    mutateAsync: (session: CreateSessionRequest) =>
      mutation.mutateAsync({ data: session }),
  };
}

export type { CreateSessionRequest };
