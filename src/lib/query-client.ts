import { QueryClient } from "@tanstack/react-query";

let _client: QueryClient | undefined;

export function getQueryClient() {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      },
    });
  }
  return _client;
}
