import { useRuntimeConfig } from '#app'
import { $fetch } from 'ofetch'

export async function $apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}) {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  return await $fetch<T>(path, {
    baseURL,
    ...options
  });
}