import { ApiResponse } from '@ai-resume/shared';

// Support production VITE_API_URL or fall back to /api proxy
const rawApiUrl = import.meta.env.VITE_API_URL || '';
export const API_BASE = rawApiUrl.replace(/\/+$/, '') + '/api';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch {
    // ignore
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach bearer token if stored in localStorage (supports cross-domain auth where cookies are blocked)
  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // include cookies
  });

  const data = await response.json();

  // If the response returned an access token, persist it
  if (data?.data?.accessToken) {
    setStoredToken(data.data.accessToken);
  }

  if (!response.ok && !data.error) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return data;
}

