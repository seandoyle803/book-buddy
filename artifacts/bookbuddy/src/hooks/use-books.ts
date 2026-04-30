import { useQueryClient } from "@tanstack/react-query";
import {
  useListBooks,
  useCreateBook as useCreateBookMutation,
  useUpdateBook as useUpdateBookMutation,
  useDeleteBook as useDeleteBookMutation,
  getListBooksQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { Book } from "@workspace/api-client-react";

export function useBooks() {
  return useListBooks({
    query: { queryKey: getListBooksQueryKey() },
  });
}

export function useCurrentBook() {
  const result = useListBooks({
    query: { queryKey: getListBooksQueryKey() },
  });
  return {
    ...result,
    data: result.data?.find((b) => b.is_current) ?? null,
  };
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  const mutation = useCreateBookMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    },
  });

  return {
    ...mutation,
    mutateAsync: (book: {
      title: string;
      author?: string | null;
      total_pages: number;
      current_page?: number;
      is_current?: boolean;
      is_completed?: boolean;
      completed_at?: string | null;
      last_read_at?: string | null;
    }) =>
      mutation.mutateAsync({
        data: {
          title: book.title,
          author: book.author,
          total_pages: book.total_pages,
          current_page: book.current_page ?? 0,
          is_current: book.is_current ?? false,
        },
      }),
  };
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  const mutation = useUpdateBookMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    },
  });

  return {
    ...mutation,
    mutateAsync: (vars: Partial<Book> & { id: string }) => {
      const { id, ...body } = vars;
      return mutation.mutateAsync({ bookId: id, data: body });
    },
  };
}

export function useSetCurrentBook() {
  const queryClient = useQueryClient();
  const mutation = useUpdateBookMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      },
    },
  });

  return {
    ...mutation,
    mutateAsync: (bookId: string) =>
      mutation.mutateAsync({ bookId, data: { is_current: true } }),
  };
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const mutation = useDeleteBookMutation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      },
    },
  });

  return {
    ...mutation,
    mutateAsync: (bookId: string) => mutation.mutateAsync({ bookId }),
  };
}

export type { Book };
