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
  const res = await client.GET(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    '/projects/{projectId}/components/{componentId}' as any,
    {
      params: {
        path: { projectId, componentId },
      },
      headers: authHeader(),
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((res as any).error) throw (res as any).error;

  // Extract ETag from response headers
  const etag = res.response?.headers.get('etag') || null;

  return {
    component: res.data,
    etag,
  };
}
