import { useQuery, useQueryClient, UseQueryOptions, QueryKey, UseQueryResult } from "@tanstack/react-query";

// The shape of the callbacks object that will be passed to your streaming function.
export type StreamCallbacks<TData> = {
  onData: (data: TData) => void;
  onEnd: () => void;
  onError: (error: any) => void;
};

// The signature of the streaming function. It only needs to know about callbacks.
export type QueryStreamingFn<TData> = (callbacks: StreamCallbacks<TData>) => void;

// The options for our custom hook, with the new deduplicationMethod option.
export type UseQueryStreamingOptions<
  // The type for a single data chunk from the stream.
  TStreamingData,
  TError = unknown,
  // The final resolved data type, which defaults to an array of chunks.
  TData = TStreamingData[],
  TQueryKey extends QueryKey = QueryKey
> = Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, "queryFn" | "queryKey"> & {
  queryKey: TQueryKey;
  queryStreamingFn: QueryStreamingFn<TStreamingData>;
  deduplicationMethod?: "id" | "value" | "none";
};

/**
 * A custom React Query hook for handling streaming APIs.
 *
 * @param {UseQueryStreamingOptions} options - The query options, with `queryFn` replaced by `streamingQueryFn`.
 * @returns {UseQueryResult} The result of the useQuery hook.
 */
export const useQueryStreaming = <TStreamingData, TError = unknown, TData = TStreamingData[], TQueryKey extends QueryKey = QueryKey>({
  queryStreamingFn,
  queryKey,
  deduplicationMethod = "id", // Default to 'id' based deduplication
  ...options
}: UseQueryStreamingOptions<TStreamingData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> => {
  const queryClient = useQueryClient();

  const queryFn = () => {
    return new Promise<TData>((resolve, reject) => {
      const onData = (data: TStreamingData) => {
        queryClient.setQueryData<TData>(queryKey, (oldData: any = []) => {
          let itemExists = false;
          switch (deduplicationMethod) {
            case "id":
              // Assumes the item has an 'id' property
              itemExists = oldData.some(
                (item: any) =>
                  data && typeof data === "object" && data.hasOwnProperty("id") && item && item.hasOwnProperty("id") && item?.id === (data as any).id
              );
              break;
            case "value":
              // Strict equality check, good for primitives
              itemExists = oldData.includes(data);
              break;
            case "none":
              // No deduplication, always add the new data
              itemExists = false;
              break;
          }

          if (itemExists) {
            return oldData;
          }
          return [...oldData, data] as TData;
        });
      };

      const onEnd = () => {
        const finalData = queryClient.getQueryData<TData>(queryKey);
        resolve(finalData || ([] as TData));
      };

      const onError = (error: any) => {
        reject(error);
      };

      // Set initial data to an empty array so `isLoading` is true on first fetch
      queryClient.setQueryData(queryKey, []);

      // Call the user's streaming function with our internal callbacks
      queryStreamingFn({ onData, onEnd, onError });
    });
  };

  return useQuery<TData, TError, TData, TQueryKey>({
    ...options,
    queryKey,
    queryFn,
    // Sensible defaults for streaming queries to prevent re-fetching
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
