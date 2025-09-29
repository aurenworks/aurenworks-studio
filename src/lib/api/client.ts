// src/lib/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './types';

const baseUrl =
  import.meta.env?.VITE_API_BASE_URL || 'https://api.auren.dev/v0';
export const client = createClient<paths>({ baseUrl });

export function authHeader() {
  const t =
    typeof window !== 'undefined'
      ? (localStorage.getItem('auth_token') ?? '')
      : '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Helper to make authenticated requests
export async function authenticatedRequest<T>(
  requestFn: () => Promise<T>
): Promise<T> {
  return requestFn();
}
