import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

/** Common error type used by API-aware hooks. */
export type QueryError = ApiError | Error;

/**
 * Thin wrapper around React Query's `useQuery` with our shared error type.
 *
 * Example:
 * const query = useApiQuery(
 *   ["articles", params],
 *   () => getArticles(params),
 *   { keepPreviousData: true }
 * );
 */
export function useApiQuery<TData, TKey extends readonly unknown[]>(
  key: TKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, QueryError, TData, TKey>, "queryKey" | "queryFn">
): UseQueryResult<TData, QueryError> {
  return useQuery<TData, QueryError, TData, TKey>({
    queryKey: key,
    queryFn,
    ...options,
  });
}

/**
 * Thin wrapper around React Query's `useMutation` with our shared error type.
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, QueryError, TVariables>
): UseMutationResult<TData, QueryError, TVariables> {
  return useMutation<TData, QueryError, TVariables>({
    mutationFn,
    ...options,
  });
}

