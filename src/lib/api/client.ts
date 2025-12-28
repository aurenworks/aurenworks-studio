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

// Helper to get component with ETag
export async function getComponentWithETag(
  projectId: string,
  componentId: string
): Promise<{ component: unknown; etag: string | null }> {
  // Use fetch directly to access response headers (ETag)
  const baseUrl =
    import.meta.env?.VITE_API_BASE_URL || 'https://api.auren.dev/v0';
  const url = `${baseUrl}/projects/${projectId}/components/${componentId}`;
  const authHeaders = authHeader();

  // Construct headers object explicitly to satisfy TypeScript
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if ('Authorization' in authHeaders) {
    const authValue = authHeaders.Authorization;
    if (authValue) {
      headers.Authorization = authValue;
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch component: ${response.statusText}`);
  }

  // Extract ETag from response headers
  const etag = response.headers.get('etag') || null;
  const component = await response.json();

  return {
    component,
    etag,
  };
}
