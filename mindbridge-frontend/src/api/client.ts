// MindBridge — Axios API Client
// All API calls go through this client — token injected automatically

import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token helpers ─────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return localStorage.getItem('mindbridge_token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('mindbridge_refresh_token');
}

function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('mindbridge_token', accessToken);
  localStorage.setItem('mindbridge_refresh_token', refreshToken);
}

function clearSession(): void {
  localStorage.removeItem('mindbridge_token');
  localStorage.removeItem('mindbridge_refresh_token');
  localStorage.removeItem('mindbridge_user');
}

// ── Request interceptor: inject Bearer token ──────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent token refresh on 401 ────────────────────────
//
// When a 401 is received:
//   1. If no token was present → fresh login failure; propagate so the
//      Login/Register page can show the error message (don't redirect).
//   2. If we have a refresh token → try /auth/refresh silently.
//      On success: save the new tokens, replay the original request.
//      On failure: clear session and redirect to /login.
//   3. If no refresh token but had an access token → expired session,
//      redirect to /login immediately.
//
// isRetry flag prevents infinite loops if /auth/refresh itself returns 401.

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      // No token at all → fresh login attempt with wrong credentials.
      // Let the error propagate normally so the UI can display it.
      if (!accessToken && !refreshToken) {
        return Promise.reject(error);
      }

      // Have a refresh token — try a silent refresh.
      if (refreshToken) {
        originalRequest._retry = true;

        // Deduplicate concurrent refresh attempts: all queue behind one promise.
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
            .then((res) => {
              const { access_token, refresh_token: newRefresh } = res.data;
              storeTokens(access_token, newRefresh);
              return access_token;
            })
            .catch((refreshError) => {
              // Refresh token is also expired/invalid — force re-login.
              clearSession();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        try {
          const newAccessToken = await refreshPromise;
          // Replay the original request with the fresh token.
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          // refreshPromise already handled redirect above.
          return Promise.reject(error);
        }
      }

      // Had an access token but no refresh token → old session format or
      // refresh token was never issued. Clear and redirect.
      clearSession();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; university?: string; year_of_study?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: { name?: string; bio?: string; university?: string; year_of_study?: string; notif_mood_reminder?: boolean; notif_forum_replies?: boolean }) =>
    api.put('/auth/me', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post('/auth/reset-password', data),
  deleteMe: () => api.delete('/auth/me'),
  googleAuth: (access_token: string) =>
    api.post('/auth/google', { access_token }),
};

// ── Mood ──────────────────────────────────────────────────────────────────────
export const moodApi = {
  checkin: (data: { mood_score: number; energy_level: number; note?: string }) =>
    api.post('/mood/checkin', data),
  history: () => api.get('/mood/history'),
  trends: () => api.get('/mood/trends'),
};

// ── Journal ───────────────────────────────────────────────────────────────────
export const journalApi = {
  create: (data: { title: string; body: string }) =>
    api.post('/journal/entry', data),
  list: () => api.get('/journal/entries'),
  get: (id: string) => api.get(`/journal/entry/${id}`),
  update: (id: string, data: { title?: string; body?: string }) =>
    api.put(`/journal/entry/${id}`, data),
  delete: (id: string) => api.delete(`/journal/entry/${id}`),
};

// ── Forum ─────────────────────────────────────────────────────────────────────
export const forumApi = {
  list: (params?: { category?: string; page?: number }) =>
    api.get('/forum/posts', { params }),
  getPost: (id: string) => api.get(`/forum/post/${id}`),
  create: (data: { body: string; category?: string }) =>
    api.post('/forum/post', data),
  reply: (postId: string, data: { body: string }) =>
    api.post(`/forum/post/${postId}/reply`, data),
  like: (postId: string) => api.post(`/forum/post/${postId}/like`),
  delete: (id: string) => api.delete(`/forum/post/${id}`),
};

// ── Crisis ────────────────────────────────────────────────────────────────────
export const crisisApi = {
  submit: (data: { severity: string; message?: string }) =>
    api.post('/crisis/flag', data),
  list: (params?: { resolved?: boolean }) =>
    api.get('/crisis/alerts', { params }),
  resolve: (id: string, data: { resolution_note?: string }) =>
    api.put(`/crisis/alerts/${id}/resolve`, data),
};

// ── Resources ─────────────────────────────────────────────────────────────────
export const resourcesApi = {
  list: (params?: { category?: string }) =>
    api.get('/resources', { params }),
  create: (data: { title: string; category: string; description?: string; url?: string }) =>
    api.post('/resources', data),
  update: (id: string, data: object) => api.put(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
};

// ── AI Companion ──────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (data: { message: string; history: Array<{ role: string; content: string }> }) =>
    api.post('/ai/chat', data),
};
