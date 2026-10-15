import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AppNotification } from '@/types';

export const STORAGE_KEY = 'menyesha.auth.token';
export const STAFF_STORAGE_KEY = 'menyesha.staff.token';

function getCodespacesApiUrl(): string | undefined {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
  const hostname = window.location.hostname;
  if (!hostname.endsWith('.app.github.dev')) return undefined;
  const apiHostname = hostname.replace(/-\d+\.app\.github\.dev$/, '-4000.app.github.dev');
  if (apiHostname === hostname) return undefined;
  return `${window.location.protocol}//${apiHostname}`;
}

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '')
  || getCodespacesApiUrl()
  || Platform.select({
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

export async function setStaffToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (!token) return AsyncStorage.removeItem(STAFF_STORAGE_KEY);
    return AsyncStorage.setItem(STAFF_STORAGE_KEY, token);
  }
  if (!token) return SecureStore.deleteItemAsync(STAFF_STORAGE_KEY);
  return SecureStore.setItemAsync(STAFF_STORAGE_KEY, token);
}

export async function getStaffToken() {
  if (Platform.OS === 'web') return AsyncStorage.getItem(STAFF_STORAGE_KEY);
  return SecureStore.getItemAsync(STAFF_STORAGE_KEY);
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
  async staffLogin(input: { username: string; password: string }) {
    return request<{
      account: import('@/types').StaffAccount;
      accessToken: string;
    }>('/auth/staff/login', { method: 'POST', body: JSON.stringify(input) });
  },
  async staffMe(token: string) {
    return request<{ account: import('@/types').StaffAccount }>('/auth/staff/me', { method: 'GET' }, token);
  },
  async getCmsPublic() {
    return request<{
      announcements: import('@/types').PoliceAnnouncement[];
      trafficDocs: import('@/types').TrafficDocument[];
      articles: import('@/types').MediaArticle[];
      newsletters: import('@/types').Newsletter[];
      discoverPosts: import('@/types').DiscoverPost[];
      discoverVideos: import('@/types').DiscoverVideo[];
      discoverPhotos: import('@/types').DiscoverPhoto[];
      advertisements: import('@/types').Advertisement[];
      webBanners: import('@/types').WebBanner[];
      campaigns: import('@/types').Campaign[];
      departments: import('@/types').PoliceDepartment[];
    }>('/cms/public');
  },
  async recordCmsMetric(resource: string, id: string, metric: string) {
    return request<{ record: Record<string, unknown> }>(
      `/cms/metrics/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`,
      { method: 'POST', body: JSON.stringify({ metric }) },
    );
  },
  async getCmsRecords<T>(resource: string, token: string) {
    return request<{ records: T[] }>(`/cms/${encodeURIComponent(resource)}`, { method: 'GET' }, token);
  },
  async createCmsRecord<T>(resource: string, input: object, token: string) {
    return request<{ record: T }>(`/cms/${encodeURIComponent(resource)}`, {
      method: 'POST',
      body: JSON.stringify(input),
    }, token);
  },
  async updateCmsRecord<T>(resource: string, id: string, input: object, token: string) {
    return request<{ record: T }>(`/cms/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }, token);
  },
  async deleteCmsRecord(resource: string, id: string, token: string) {
    return request<void>(`/cms/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }, token);
  },
  async getCmsDepartments(token: string) {
    return request<{ departments: import('@/types').PoliceDepartment[] }>('/cms/departments', { method: 'GET' }, token);
  },
  async createCmsDepartment(input: object, token: string) {
    return request<{ department: import('@/types').PoliceDepartment }>('/cms/departments', {
      method: 'POST',
      body: JSON.stringify(input),
    }, token);
  },
  async updateCmsDepartment(id: string, input: object, token: string) {
    return request<{ department: import('@/types').PoliceDepartment }>(`/cms/departments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }, token);
  },
  async deleteCmsDepartment(id: string, token: string) {
    return request<void>(`/cms/departments/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
  },
  async getCmsAccounts(token: string) {
    return request<{ accounts: import('@/types').AdminUser[] }>('/cms/accounts', { method: 'GET' }, token);
  },
  async createCmsAccount(input: object, token: string) {
    return request<{ account: import('@/types').AdminUser }>('/cms/accounts', {
      method: 'POST',
      body: JSON.stringify(input),
    }, token);
  },
  async updateCmsAccount(id: string, input: object, token: string) {
    return request<{ account: import('@/types').AdminUser }>(`/cms/accounts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }, token);
  },
  async deleteCmsAccount(id: string, token: string) {
    return request<void>(`/cms/accounts/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);
  },
  async getCmsDashboard(token: string) {
    return request<{
      counts: Record<string, number>;
      engagement: { views: number; downloads: number };
      activity: import('@/types').AdminActivity[];
    }>('/cms/dashboard', { method: 'GET' }, token);
  },
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
