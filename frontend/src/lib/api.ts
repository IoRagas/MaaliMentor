/**
 * API URL utility for Maali Mentor frontend.
 *
 * Reads NEXT_PUBLIC_API_URL from environment so the app can talk to any
 * backend (local dev, Railway, Render, etc.) without code changes.
 *
 * Usage:
 *   import { apiUrl, wsUrl } from "@/lib/api";
 *   fetch(apiUrl("/api/auth/login"))
 *   new WebSocket(wsUrl("/api/tutor/ws"))
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

/** Build an HTTP(S) API url from a path, e.g. "/api/auth/login" */
export const apiUrl = (path: string): string => `${API_BASE}${path}`;

/** Build a WebSocket url (ws:// or wss://) from an HTTP base + path. */
export const wsUrl = (path: string): string => {
  const base = API_BASE.replace(/^http/, "ws"); // http→ws, https→wss
  return `${base}${path}`;
};

/** Get the JWT auth token from localStorage if available in browser context */
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

/** Wrapped fetch function that automatically adds the Authorization: Bearer JWT header */
export const fetchWithAuth = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(apiUrl(path), {
    ...options,
    headers,
  });
};

