import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AppNotification } from '@/types';

export const STORAGE_KEY = 'menyesha.auth.token';

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '') || Platform.select({
  web: 'http://localhost:4000',
  ios: 'http://localhost:4000',
  android: 'http://10.0.2.2:4000',
  default: 'http://localhost:4000',
});

export async function setAuthToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (!token) return AsyncStorage.removeItem(STORAGE_KEY);
    return AsyncStorage.setItem(STORAGE_KEY, token);
  }
  if (!token) {
    return SecureStore.deleteItemAsync(STORAGE_KEY);
  }
  return SecureStore.setItemAsync(STORAGE_KEY, token);
}

export async function getAuthToken() {
  if (Platform.OS === 'web') return AsyncStorage.getItem(STORAGE_KEY);
  return SecureStore.getItemAsync(STORAGE_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  async signup(input: { username: string; phone: string; password: string }) {
    return request<{ pendingPhone?: string }>(`/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async login(input: { phone: string; password: string }) {
    return request<{ user: { id: string; username: string; phone: string }; accessToken: string }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async verify(input: { phone: string; code: string }) {
    return request<{ user: { id: string; username: string; phone: string }; accessToken: string }>(`/auth/verify`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  async me(token: string) {
    return request<{ user: { id: string; username: string; phone: string } }>(`/auth/me`, {
      method: 'GET',
    }, token);
  },
  async getReports(token: string) {
    return request<{ reports: any[] }>(`/reports/me/reports`, { method: 'GET' }, token);
  },
  async getPoints(token: string) {
    return request<{ points: any[] }>(`/reports/me/points`, { method: 'GET' }, token);
  },
  async getWeeklyStats(token: string) {
    return request<{ filed: number; resolved: number }>(`/reports/stats/kigali-week`, { method: 'GET' }, token);
  },
  async getNotifications(token: string) {
    return request<{ notifications: AppNotification[] }>(`/notifications`, { method: 'GET' }, token);
  },
  async markNotificationRead(id: string, token: string) {
    return request<{ notification: AppNotification }>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    }, token);
  },
  async markAllNotificationsRead(token: string) {
    return request<{ updated: number }>(`/notifications/read-all`, { method: 'PATCH' }, token);
  },
  async submitReport(input: {
    categoryId: string;
    description: string;
    latitude: number;
    longitude: number;
    area: string;
    isAnonymous?: boolean;
    incidentAt?: string;
    photoUrl?: string;
  }, token: string) {
    return request<{ report: any }>(`/reports`, {
      method: 'POST',
      body: JSON.stringify(input),
    }, token);
  },
};
