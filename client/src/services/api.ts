import { ApiResponse } from '@ai-resume/shared';

const API_BASE = '/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // include cookies
  });

  const data = await response.json();
  if (!response.ok && !data.error) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return data;
}

