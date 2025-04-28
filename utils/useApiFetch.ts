import { useRuntimeConfig, useFetch } from '#app'

export function useApiFetch<T>(path: string, options = {}) {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  return useFetch<T>(path, {
    baseURL,
    ...options
  })
}