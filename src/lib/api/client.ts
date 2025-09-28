// src/lib/api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "./types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
export const client = createClient<paths>({ baseUrl });

export function authHeader() {
  const t = localStorage.getItem("auth_token") ?? "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}
