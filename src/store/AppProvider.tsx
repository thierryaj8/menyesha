import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEMO_USER,
  DEMO_VERIFY_CODE,
  SEED_POINTS,
  SEED_REPORTS,
  SEED_WEEKLY,
} from '@/data/mock';
import { KIGALI_CENTER } from '@/data/kigali';
import { ANNOUNCEMENTS } from '@/data/announcements';
import { ARTICLES } from '@/data/articles';
import { CAMPAIGNS, getActiveBannerCampaign } from '@/data/campaigns';
import { NEWSLETTERS } from '@/data/newsletters';
import { OFFICIAL_ACCOUNTS } from '@/data/officialAccounts';
import { TRAFFIC_DOCS } from '@/data/trafficDocs';
import { POLICE_DEPARTMENTS } from '@/data/policeDepartments';
import { ADVERTISEMENTS } from '@/data/advertisements';
import { WEB_BANNERS } from '@/data/webBanners';
import { DISCOVER_POSTS, DISCOVER_VIDEOS, DISCOVER_PHOTOS } from '@/data/discoverContent';
import { ADMIN_USERS, DEMO_ADMIN } from '@/data/adminUsers';
import { NOTIFICATIONS } from '@/data/notifications';
import { ADMIN_ACTIVITY } from '@/data/activity';
import type {
  AdminActivity,
  AdminPermission,
  AdminUser,
  Advertisement,
  AnnouncementType,
  AppNotification,
  AuthPhase,
  Campaign,
  DiscoverPhoto,
  DiscoverPost,
  DiscoverVideo,
  GeoPoint,
  MediaArticle,
  MediaCategory,
  Newsletter,
  NotificationKind,
  OfficialAccount,
  PointEntry,
  PoliceAnnouncement,
  PoliceDepartment,
  Report,
  ReportDraft,
  ReportStatus,
  TrafficDocCategory,
  TrafficDocument,
  User,
  WebBanner,
} from '@/types';
import { isSameDay, makeId } from '@/utils/format';
import { findNearbyDuplicate, isRateLimited } from './rules';

export interface SubmitResult {
  ok: boolean;
  reportId?: string;
  duplicateOf?: Report | null;
  errorKey?: string;
}

interface AppValue {
  phase: AuthPhase;
  user: User | null;
  pendingPhone: string | null;

  reports: Report[];
  myReports: Report[];
  points: PointEntry[];
  balance: number;
  pendingPoints: number;
  weekly: { filed: number; resolved: number };

  draft: ReportDraft;
  updateDraft: (patch: Partial<ReportDraft>) => void;
  resetDraft: () => void;

  login: (phone: string, password: string) => { ok: boolean; errorKey?: string };
  signup: (input: {
    username: string;
    phone: string;
    password: string;
  }) => { ok: boolean; errorKey?: string };
  verify: (code: string) => { ok: boolean; errorKey?: string };
  logout: () => void;

  submitReport: (data?: {
    categoryId: string;
    description: string;
    isAnonymous: boolean;
    incidentDate: string;
    incidentTime: string;
  }) => Promise<SubmitResult>;
  getReport: (id: string) => Report | undefined;

  // ─── Police hub data ────────────────────────────────────────────────
  announcements: PoliceAnnouncement[];
  trafficDocs: TrafficDocument[];
  campaigns: Campaign[];
  officialAccounts: OfficialAccount[];
  articles: MediaArticle[];
  newsletters: Newsletter[];

  // ─── Police hub actions ─────────────────────────────────────────────
  getActiveBanner: () => Campaign | null;
  searchAnnouncements: (query: string, type?: AnnouncementType) => PoliceAnnouncement[];
  searchTrafficDocs: (query: string, category?: TrafficDocCategory) => TrafficDocument[];
  searchArticles: (query: string, category?: MediaCategory) => MediaArticle[];
  recordCampaignView: (id: string) => void;
  recordCampaignClick: (id: string) => void;
  getNewsletter: (id: string) => Newsletter | undefined;
  getArticle: (id: string) => MediaArticle | undefined;
  getAnnouncement: (id: string) => PoliceAnnouncement | undefined;
  getTrafficDoc: (id: string) => TrafficDocument | undefined;

  // ─── Departments ─────────────────────────────────────────────────────
  departments: PoliceDepartment[];
  getDepartment: (id: string) => PoliceDepartment | undefined;
  searchDepartments: (query: string) => PoliceDepartment[];

  // ─── Discover content ────────────────────────────────────────────────
  discoverPosts: DiscoverPost[];
  discoverVideos: DiscoverVideo[];
  discoverPhotos: DiscoverPhoto[];
  searchDiscoverPosts: (query: string) => DiscoverPost[];
  searchDiscoverVideos: (query: string) => DiscoverVideo[];
  searchDiscoverPhotos: (query: string) => DiscoverPhoto[];

  // ─── Advertisements & Banners ────────────────────────────────────────
  advertisements: Advertisement[];
  webBanners: WebBanner[];
  getActiveAdvertisements: (targetPage?: Advertisement['targetPage']) => Advertisement[];
  getActiveWebBanners: (location?: WebBanner['location']) => WebBanner[];
  recordAdImpression: (id: string) => void;
  recordAdClick: (id: string) => void;

  // ─── Notifications ───────────────────────────────────────────────────
  notifications: AppNotification[];
  unreadCount: number;
  searchNotifications: (query: string, kind?: NotificationKind) => AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // ─── Admin ───────────────────────────────────────────────────────────
  adminUser: AdminUser | null;
  isAdmin: boolean;
  adminUsers: AdminUser[];
  recentActivity: AdminActivity[];
  /** Role-based gate — Super Admin always passes. */
  can: (permission: AdminPermission) => boolean;
  /** Sum of views + downloads across every managed content type. */
  contentEngagement: { views: number; downloads: number };
}

const emptyDraft: ReportDraft = {
  categoryId: null,
  description: '',
  photoUri: null,
  location: KIGALI_CENTER,
  area: 'Musanze',
  isAnonymous: false,
  incidentDate: '',
};

const AppContext = createContext<AppValue | null>(null);

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+250')) return `+250${digits.slice(4).replace(/\D/g, '')}`;
  if (digits.startsWith('250')) return `+250${digits.slice(3)}`;
  if (digits.startsWith('0')) return `+250${digits.slice(1)}`;
  return `+250${digits}`;
}

function isValidPhone(raw: string): boolean {
  return /^\+250\d{9}$/.test(normalizePhone(raw));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>('signedOut');
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<{ username: string; phone: string } | null>(null);

  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [points] = useState<PointEntry[]>(SEED_POINTS);
  const [weekly, setWeekly] = useState(SEED_WEEKLY);
  const [sentToday, setSentToday] = useState<string[]>([]);
  const [draft, setDraft] = useState<ReportDraft>(emptyDraft);

  // Police hub state
  const [campaignStats, setCampaignStats] = useState<
    Record<string, { views: number; clicks: number }>
  >(() =>
    Object.fromEntries(CAMPAIGNS.map((c) => [c.id, { views: c.views, clicks: c.clicks }])),
  );

  // Advertisement stats
  const [adStats, setAdStats] = useState<
    Record<string, { impressions: number; clicks: number; views: number }>
  >(() =>
    Object.fromEntries(
      ADVERTISEMENTS.map((a) => [
        a.id,
        { impressions: a.impressions, clicks: a.clicks, views: a.views },
      ]),
    ),
  );

  const updateDraft = useCallback(
    (patch: Partial<ReportDraft>) => setDraft((current) => ({ ...current, ...patch })),
    [],
  );

  const resetDraft = useCallback(() => setDraft(emptyDraft), []);

  const login = useCallback((phone: string, password: string) => {
    if (!phone.trim()) return { ok: false, errorKey: 'auth.errPhone' };
    if (!isValidPhone(phone)) return { ok: false, errorKey: 'auth.errPhoneFormat' };
    if (!password) return { ok: false, errorKey: 'auth.errPassword' };

    const normalized = normalizePhone(phone);
    const username =
      normalized === DEMO_USER.phone
        ? DEMO_USER.username
        : `Citizen ${normalized.slice(-4)}`;

    setUser({ id: 'me', username, phone: normalized });
    setPhase('signedIn');
    setPending(null);
    return { ok: true };
  }, []);

  const signup = useCallback(
    (input: { username: string; phone: string; password: string }) => {
      const username = input.username.trim();
      if (username.length < 3) return { ok: false, errorKey: 'auth.errUsernameShort' };
      if (!input.phone.trim()) return { ok: false, errorKey: 'auth.errPhone' };
      if (!isValidPhone(input.phone)) return { ok: false, errorKey: 'auth.errPhoneFormat' };
      if (input.password.length < 6) return { ok: false, errorKey: 'auth.errPasswordShort' };

      const phone = normalizePhone(input.phone);
      setPending({ username, phone });
      setUser({ id: 'me', username, phone });
      setPhase('needsVerify');
      return { ok: true };
    },
    [],
  );

  const verify = useCallback((code: string) => {
    if (code.trim().length < 6) return { ok: false, errorKey: 'verify.errCode' };
    if (code.trim() !== DEMO_VERIFY_CODE) return { ok: false, errorKey: 'verify.errCodeWrong' };
    setPhase('signedIn');
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setPhase('signedOut');
    setUser(null);
    setPending(null);
  }, []);

  const submitReport = useCallback(async (data?: {
    categoryId: string;
    description: string;
    isAnonymous: boolean;
    incidentDate: string;
    incidentTime: string;
  }): Promise<SubmitResult> => {
    const description = (data?.description ?? draft.description).trim();
    const categoryId = (data?.categoryId ?? draft.categoryId) as Report['categoryId'];
    if (!description || !categoryId) return { ok: false, errorKey: 'report.errDesc' };
    if (isRateLimited(sentToday)) return { ok: false, errorKey: 'report.errRateLimit' };

    const duplicate = findNearbyDuplicate(reports, {
      categoryId,
      location: draft.location,
    });

    const now = new Date().toISOString();
    const report: Report = {
      id: makeId(),
      authorId: user?.id ?? 'me',
      categoryId,
      description,
      photoUri: draft.photoUri,
      location: draft.location,
      area: draft.area,
      status: 'submitted',
      createdAt: now,
      timeline: [{ status: 'submitted', date: now }],
      duplicateOfId: duplicate ? duplicate.id : null,
      linkedCount: 1,
      pointsEligible: !duplicate,
    };

    setReports((current) => [
      report,
      ...current.map((r) =>
        duplicate && r.id === duplicate.id
          ? { ...r, linkedCount: (r.linkedCount ?? 1) + 1 }
          : r,
      ),
    ]);
    setWeekly((current) => ({ ...current, filed: current.filed + 1 }));
    setSentToday((current) => [...current, now]);
    setDraft(emptyDraft);

    return { ok: true, reportId: report.id, duplicateOf: duplicate };
  }, [draft, reports, sentToday, user]);

  const getReport = useCallback(
    (id: string) => reports.find((r) => r.id.toUpperCase() === id.toUpperCase()),
    [reports],
  );

  // ─── Police hub actions ──────────────────────────────────────────────────

  const getActiveBanner = useCallback(() => getActiveBannerCampaign(), []);

  const searchAnnouncements = useCallback(
    (query: string, type?: AnnouncementType): PoliceAnnouncement[] => {
      const q = query.toLowerCase().trim();
      return ANNOUNCEMENTS.filter((a) => {
        const matchesType = type ? a.type === type : true;
        const matchesQuery =
          q.length === 0 ||
          a.headline.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          (a.locations ?? []).some((l) => l.toLowerCase().includes(q));
        return matchesType && matchesQuery;
      });
    },
    [],
  );

  const searchTrafficDocs = useCallback(
    (query: string, category?: TrafficDocCategory): TrafficDocument[] => {
      const q = query.toLowerCase().trim();
      return TRAFFIC_DOCS.filter((d) => {
        const matchesCat = category ? d.category === category : true;
        const matchesQuery =
          q.length === 0 ||
          d.title.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q) ||
          d.issuingAuthority.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      });
    },
    [],
  );

  const searchArticles = useCallback(
    (query: string, category?: MediaCategory): MediaArticle[] => {
      const q = query.toLowerCase().trim();
      return ARTICLES.filter((a) => {
        const matchesCat = category ? a.category === category : true;
        const matchesQuery =
          q.length === 0 ||
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q));
        return matchesCat && matchesQuery && a.status === 'published';
      });
    },
    [],
  );

  const recordCampaignView = useCallback((id: string) => {
    setCampaignStats((prev) => ({
      ...prev,
      [id]: { views: (prev[id]?.views ?? 0) + 1, clicks: prev[id]?.clicks ?? 0 },
    }));
  }, []);

  const recordCampaignClick = useCallback((id: string) => {
    setCampaignStats((prev) => ({
      ...prev,
      [id]: { views: prev[id]?.views ?? 0, clicks: (prev[id]?.clicks ?? 0) + 1 },
    }));
  }, []);

  const getNewsletter = useCallback(
    (id: string) => NEWSLETTERS.find((n) => n.id === id),
    [],
  );

  const getArticle = useCallback(
    (id: string) => ARTICLES.find((a) => a.id === id),
    [],
  );

  const getAnnouncement = useCallback(
    (id: string) => ANNOUNCEMENTS.find((a) => a.id === id),
    [],
  );

  const getTrafficDoc = useCallback(
    (id: string) => TRAFFIC_DOCS.find((d) => d.id === id),
    [],
  );

  // ─── Departments ──────────────────────────────────────────────────────────

  const getDepartment = useCallback(
    (id: string) => POLICE_DEPARTMENTS.find((d) => d.id === id),
    [],
  );

  const searchDepartments = useCallback((query: string): PoliceDepartment[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return POLICE_DEPARTMENTS.filter((d) => d.isActive);
    return POLICE_DEPARTMENTS.filter(
      (d) =>
        d.isActive &&
        (d.name.toLowerCase().includes(q) ||
          d.shortName.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)),
    );
  }, []);

  // ─── Discover search ──────────────────────────────────────────────────────

  const searchDiscoverPosts = useCallback((query: string): DiscoverPost[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return DISCOVER_POSTS;
    return DISCOVER_POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.departmentName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, []);

  const searchDiscoverVideos = useCallback((query: string): DiscoverVideo[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return DISCOVER_VIDEOS;
    return DISCOVER_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.departmentName.toLowerCase().includes(q),
    );
  }, []);

  const searchDiscoverPhotos = useCallback((query: string): DiscoverPhoto[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return DISCOVER_PHOTOS;
    return DISCOVER_PHOTOS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.caption ?? '').toLowerCase().includes(q) ||
        p.departmentName.toLowerCase().includes(q),
    );
  }, []);

  // ─── Advertisements & Banners ─────────────────────────────────────────────

  const getActiveAdvertisements = useCallback(
    (targetPage?: Advertisement['targetPage']): Advertisement[] => {
      const now = new Date().toISOString();
      return ADVERTISEMENTS.filter((ad) => {
        const isActive = ad.status === 'active';
        const inWindow = ad.startDate <= now && ad.endDate >= now;
        const matchesPage = !targetPage || ad.targetPage === targetPage || ad.targetPage === 'all';
        return isActive && inWindow && matchesPage;
      });
    },
    [],
  );

  const getActiveWebBanners = useCallback(
    (location?: WebBanner['location']): WebBanner[] => {
      const now = new Date().toISOString();
      return WEB_BANNERS.filter((b) => {
        const isActive = b.status === 'active';
        const inWindow = b.startDate <= now && b.endDate >= now;
        const matchesLocation = !location || b.location === location;
        return isActive && inWindow && matchesLocation;
      });
    },
    [],
  );

  const recordAdImpression = useCallback((id: string) => {
    setAdStats((prev) => ({
      ...prev,
      [id]: {
        impressions: (prev[id]?.impressions ?? 0) + 1,
        clicks: prev[id]?.clicks ?? 0,
        views: prev[id]?.views ?? 0,
      },
    }));
  }, []);

  const recordAdClick = useCallback((id: string) => {
    setAdStats((prev) => ({
      ...prev,
      [id]: {
        impressions: prev[id]?.impressions ?? 0,
        clicks: (prev[id]?.clicks ?? 0) + 1,
        views: prev[id]?.views ?? 0,
      },
    }));
  }, []);

  // ─── Notifications ────────────────────────────────────────────────────────

  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);

  const searchNotifications = useCallback(
    (query: string, kind?: NotificationKind): AppNotification[] => {
      const q = query.toLowerCase().trim();
      return notifications.filter((n) => {
        const matchesKind = kind ? n.kind === kind : true;
        const matchesQuery =
          q.length === 0 ||
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q);
        return matchesKind && matchesQuery;
      });
    },
    [notifications],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
  }, []);

  // ─── Admin helpers ─────────────────────────────────────────────────────────

  const can = useCallback(
    (permission: AdminPermission) => {
      const admin = DEMO_ADMIN;
      if (admin.role === 'super_admin') return true;
      return admin.permissions.includes(permission);
    },
    [],
  );

  const contentEngagement = useMemo(() => {
    const views =
      DISCOVER_POSTS.reduce((s, p) => s + p.views, 0) +
      DISCOVER_VIDEOS.reduce((s, v) => s + v.views, 0) +
      DISCOVER_PHOTOS.reduce((s, p) => s + p.views, 0);

    // Document downloads are tracked per published PDF.
    const downloads =
      TRAFFIC_DOCS.filter((d) => d.pdfUrl).length * 148 +
      NEWSLETTERS.filter((n) => n.pdfUrl).length * 96;

    return { views, downloads };
  }, []);

  // Merge live campaign stats into CAMPAIGNS list
  const campaigns = useMemo(
    () =>
      CAMPAIGNS.map((c) => ({
        ...c,
        views: campaignStats[c.id]?.views ?? c.views,
        clicks: campaignStats[c.id]?.clicks ?? c.clicks,
      })),
    [campaignStats],
  );

  // Merge live ad stats into ADVERTISEMENTS list
  const advertisements = useMemo(
    () =>
      ADVERTISEMENTS.map((a) => ({
        ...a,
        impressions: adStats[a.id]?.impressions ?? a.impressions,
        clicks: adStats[a.id]?.clicks ?? a.clicks,
        views: adStats[a.id]?.views ?? a.views,
      })),
    [adStats],
  );

  const myReports = useMemo(
    () => reports.filter((r) => r.authorId === (user?.id ?? 'me')),
    [reports, user],
  );

  const balance = useMemo(
    () => points.filter((p) => p.status === 'confirmed').reduce((sum, p) => sum + p.points, 0),
    [points],
  );

  const pendingPoints = useMemo(
    () => points.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.points, 0),
    [points],
  );

  const value = useMemo<AppValue>(
    () => ({
      phase,
      user,
      pendingPhone: pending?.phone ?? null,
      reports,
      myReports,
      points,
      balance,
      pendingPoints,
      weekly,
      draft,
      updateDraft,
      resetDraft,
      login,
      signup,
      verify,
      logout,
      submitReport,
      getReport,
      // Police hub
      announcements: ANNOUNCEMENTS,
      trafficDocs: TRAFFIC_DOCS,
      campaigns,
      officialAccounts: OFFICIAL_ACCOUNTS,
      articles: ARTICLES,
      newsletters: NEWSLETTERS,
      getActiveBanner,
      searchAnnouncements,
      searchTrafficDocs,
      searchArticles,
      recordCampaignView,
      recordCampaignClick,
      getNewsletter,
      getArticle,
      getAnnouncement,
      getTrafficDoc,
      // Departments
      departments: POLICE_DEPARTMENTS,
      getDepartment,
      searchDepartments,
      // Discover
      discoverPosts: DISCOVER_POSTS,
      discoverVideos: DISCOVER_VIDEOS,
      discoverPhotos: DISCOVER_PHOTOS,
      searchDiscoverPosts,
      searchDiscoverVideos,
      searchDiscoverPhotos,
      // Advertisements & banners
      advertisements,
      webBanners: WEB_BANNERS,
      getActiveAdvertisements,
      getActiveWebBanners,
      recordAdImpression,
      recordAdClick,
      // Notifications
      notifications,
      unreadCount,
      searchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      // Admin
      adminUser: DEMO_ADMIN,
      isAdmin: true,
      adminUsers: ADMIN_USERS,
      recentActivity: ADMIN_ACTIVITY,
      can,
      contentEngagement,
    }),
    [
      phase,
      user,
      pending,
      reports,
      myReports,
      points,
      balance,
      pendingPoints,
      weekly,
      draft,
      updateDraft,
      resetDraft,
      login,
      signup,
      verify,
      logout,
      submitReport,
      getReport,
      campaigns,
      getActiveBanner,
      searchAnnouncements,
      searchTrafficDocs,
      searchArticles,
      recordCampaignView,
      recordCampaignClick,
      getNewsletter,
      getArticle,
      getAnnouncement,
      getTrafficDoc,
      getDepartment,
      searchDepartments,
      searchDiscoverPosts,
      searchDiscoverVideos,
      searchDiscoverPhotos,
      advertisements,
      getActiveAdvertisements,
      getActiveWebBanners,
      recordAdImpression,
      recordAdClick,
      notifications,
      unreadCount,
      searchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      can,
      contentEngagement,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

/** Helper for timelines: does this report have an entry for a status? */
export function hasStatus(report: Report, status: ReportStatus): boolean {
  return report.timeline.some((entry) => entry.status === status);
}

export function isToday(iso: string): boolean {
  return isSameDay(iso);
}

export type { GeoPoint };
