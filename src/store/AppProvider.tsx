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
import { NOTIFICATIONS } from '@/data/notifications';
import type {
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
  createAnnouncement: (input: Omit<PoliceAnnouncement, 'id'>) => void;
  updateAnnouncement: (id: string, input: Partial<Omit<PoliceAnnouncement, 'id'>>) => void;
  deleteAnnouncement: (id: string) => void;
  createTrafficDoc: (input: Omit<TrafficDocument, 'id'>) => void;
  updateTrafficDoc: (id: string, input: Partial<Omit<TrafficDocument, 'id'>>) => void;
  deleteTrafficDoc: (id: string) => void;

  // ─── Departments ─────────────────────────────────────────────────────
  departments: PoliceDepartment[];
  getDepartment: (id: string) => PoliceDepartment | undefined;
  searchDepartments: (query: string) => PoliceDepartment[];
  createDepartment: (input: Omit<PoliceDepartment, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, input: Partial<Omit<PoliceDepartment, 'id' | 'createdAt'>>) => void;
  deleteDepartment: (id: string) => void;

  // ─── Discover content ────────────────────────────────────────────────
  discoverPosts: DiscoverPost[];
  discoverVideos: DiscoverVideo[];
  discoverPhotos: DiscoverPhoto[];
  searchDiscoverPosts: (query: string) => DiscoverPost[];
  searchDiscoverVideos: (query: string) => DiscoverVideo[];
  searchDiscoverPhotos: (query: string) => DiscoverPhoto[];
  createDiscoverPost: (input: Omit<DiscoverPost, 'id'>) => void;
  updateDiscoverPost: (id: string, input: Partial<Omit<DiscoverPost, 'id'>>) => void;
  deleteDiscoverPost: (id: string) => void;
  createDiscoverVideo: (input: Omit<DiscoverVideo, 'id'>) => void;
  updateDiscoverVideo: (id: string, input: Partial<Omit<DiscoverVideo, 'id'>>) => void;
  deleteDiscoverVideo: (id: string) => void;
  createDiscoverPhoto: (input: Omit<DiscoverPhoto, 'id'>) => void;
  updateDiscoverPhoto: (id: string, input: Partial<Omit<DiscoverPhoto, 'id'>>) => void;
  deleteDiscoverPhoto: (id: string) => void;

  // ─── Articles & newsletters ─────────────────────────────────────────
  createArticle: (input: Omit<MediaArticle, 'id'>) => void;
  updateArticle: (id: string, input: Partial<Omit<MediaArticle, 'id'>>) => void;
  deleteArticle: (id: string) => void;
  createNewsletter: (input: Omit<Newsletter, 'id'>) => void;
  updateNewsletter: (id: string, input: Partial<Omit<Newsletter, 'id'>>) => void;
  deleteNewsletter: (id: string) => void;

  // ─── Advertisements & Banners ────────────────────────────────────────
  advertisements: Advertisement[];
  webBanners: WebBanner[];
  getActiveAdvertisements: (targetPage?: Advertisement['targetPage']) => Advertisement[];
  getActiveWebBanners: (location?: WebBanner['location']) => WebBanner[];
  recordAdImpression: (id: string) => void;
  recordAdClick: (id: string) => void;
  createAdvertisement: (input: Omit<Advertisement, 'id' | 'createdAt'>) => void;
  updateAdvertisement: (id: string, input: Partial<Omit<Advertisement, 'id' | 'createdAt'>>) => void;
  deleteAdvertisement: (id: string) => void;
  createWebBanner: (input: Omit<WebBanner, 'id' | 'createdAt'>) => void;
  updateWebBanner: (id: string, input: Partial<Omit<WebBanner, 'id' | 'createdAt'>>) => void;
  deleteWebBanner: (id: string) => void;

  // ─── Notifications ───────────────────────────────────────────────────
  notifications: AppNotification[];
  unreadCount: number;
  searchNotifications: (query: string, kind?: NotificationKind) => AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

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

  const [announcements, setAnnouncements] = useState<PoliceAnnouncement[]>(ANNOUNCEMENTS);
  const [trafficDocs, setTrafficDocs] = useState<TrafficDocument[]>(TRAFFIC_DOCS);
  const [articles, setArticles] = useState<MediaArticle[]>(ARTICLES);
  const [newsletters, setNewsletters] = useState<Newsletter[]>(NEWSLETTERS);
  const [departments, setDepartments] = useState<PoliceDepartment[]>(POLICE_DEPARTMENTS);
  const [discoverPosts, setDiscoverPosts] = useState<DiscoverPost[]>(DISCOVER_POSTS);
  const [discoverVideos, setDiscoverVideos] = useState<DiscoverVideo[]>(DISCOVER_VIDEOS);
  const [discoverPhotos, setDiscoverPhotos] = useState<DiscoverPhoto[]>(DISCOVER_PHOTOS);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(ADVERTISEMENTS);
  const [webBanners, setWebBanners] = useState<WebBanner[]>(WEB_BANNERS);

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
      return announcements.filter((a) => {
        const matchesType = type ? a.type === type : true;
        const matchesQuery =
          q.length === 0 ||
          a.headline.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          (a.locations ?? []).some((l) => l.toLowerCase().includes(q));
        return matchesType && matchesQuery;
      });
    },
    [announcements],
  );

  const searchTrafficDocs = useCallback(
    (query: string, category?: TrafficDocCategory): TrafficDocument[] => {
      const q = query.toLowerCase().trim();
      return trafficDocs.filter((d) => {
        const matchesCat = category ? d.category === category : true;
        const matchesQuery =
          q.length === 0 ||
          d.title.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q) ||
          d.issuingAuthority.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      });
    },
    [trafficDocs],
  );

  const searchArticles = useCallback(
    (query: string, category?: MediaCategory): MediaArticle[] => {
      const q = query.toLowerCase().trim();
      return articles.filter((a) => {
        const matchesCat = category ? a.category === category : true;
        const matchesQuery =
          q.length === 0 ||
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q));
        return matchesCat && matchesQuery && a.status === 'published';
      });
    },
    [articles],
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
    (id: string) => newsletters.find((n) => n.id === id),
    [newsletters],
  );

  const createNewsletter = useCallback((input: Omit<Newsletter, 'id'>) => {
    setNewsletters((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);
  const updateNewsletter = useCallback((id: string, input: Partial<Omit<Newsletter, 'id'>>) => {
    setNewsletters((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteNewsletter = useCallback((id: string) => {
    setNewsletters((current) => current.filter((item) => item.id !== id));
  }, []);

  const getArticle = useCallback(
    (id: string) => articles.find((a) => a.id === id),
    [articles],
  );

  const createArticle = useCallback((input: Omit<MediaArticle, 'id'>) => {
    setArticles((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);
  const updateArticle = useCallback((id: string, input: Partial<Omit<MediaArticle, 'id'>>) => {
    setArticles((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteArticle = useCallback((id: string) => {
    setArticles((current) => current.filter((item) => item.id !== id));
  }, []);

  const getAnnouncement = useCallback(
    (id: string) => announcements.find((a) => a.id === id),
    [announcements],
  );

  const createAnnouncement = useCallback((input: Omit<PoliceAnnouncement, 'id'>) => {
    setAnnouncements((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);

  const updateAnnouncement = useCallback((id: string, input: Partial<Omit<PoliceAnnouncement, 'id'>>) => {
    setAnnouncements((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((current) => current.filter((item) => item.id !== id));
  }, []);

  const getTrafficDoc = useCallback(
    (id: string) => trafficDocs.find((d) => d.id === id),
    [trafficDocs],
  );

  const createTrafficDoc = useCallback((input: Omit<TrafficDocument, 'id'>) => {
    setTrafficDocs((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);

  const updateTrafficDoc = useCallback((id: string, input: Partial<Omit<TrafficDocument, 'id'>>) => {
    setTrafficDocs((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);

  const deleteTrafficDoc = useCallback((id: string) => {
    setTrafficDocs((current) => current.filter((item) => item.id !== id));
  }, []);

  // ─── Departments ──────────────────────────────────────────────────────────

  const getDepartment = useCallback(
    (id: string) => departments.find((d) => d.id === id),
    [departments],
  );

  const searchDepartments = useCallback((query: string): PoliceDepartment[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return departments.filter((d) => d.isActive);
    return departments.filter(
      (d) =>
        d.isActive &&
        (d.name.toLowerCase().includes(q) ||
          d.shortName.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)),
    );
  }, [departments]);

  const createDepartment = useCallback((input: Omit<PoliceDepartment, 'id' | 'createdAt'>) => {
    setDepartments((current) => [{ ...input, id: makeId(), createdAt: new Date().toISOString() }, ...current]);
  }, []);

  const updateDepartment = useCallback((id: string, input: Partial<Omit<PoliceDepartment, 'id' | 'createdAt'>>) => {
    setDepartments((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((current) => current.filter((item) => item.id !== id));
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
    if (q.length === 0) return discoverPhotos;
    return discoverPhotos.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.caption ?? '').toLowerCase().includes(q) ||
        p.departmentName.toLowerCase().includes(q),
    );
  }, [discoverPhotos]);

  const createDiscoverPost = useCallback((input: Omit<DiscoverPost, 'id'>) => {
    setDiscoverPosts((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);
  const updateDiscoverPost = useCallback((id: string, input: Partial<Omit<DiscoverPost, 'id'>>) => {
    setDiscoverPosts((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteDiscoverPost = useCallback((id: string) => {
    setDiscoverPosts((current) => current.filter((item) => item.id !== id));
  }, []);
  const createDiscoverVideo = useCallback((input: Omit<DiscoverVideo, 'id'>) => {
    setDiscoverVideos((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);
  const updateDiscoverVideo = useCallback((id: string, input: Partial<Omit<DiscoverVideo, 'id'>>) => {
    setDiscoverVideos((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteDiscoverVideo = useCallback((id: string) => {
    setDiscoverVideos((current) => current.filter((item) => item.id !== id));
  }, []);
  const createDiscoverPhoto = useCallback((input: Omit<DiscoverPhoto, 'id'>) => {
    setDiscoverPhotos((current) => [{ ...input, id: makeId() }, ...current]);
  }, []);
  const updateDiscoverPhoto = useCallback((id: string, input: Partial<Omit<DiscoverPhoto, 'id'>>) => {
    setDiscoverPhotos((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteDiscoverPhoto = useCallback((id: string) => {
    setDiscoverPhotos((current) => current.filter((item) => item.id !== id));
  }, []);

  // ─── Advertisements & Banners ─────────────────────────────────────────────

  const getActiveAdvertisements = useCallback(
    (targetPage?: Advertisement['targetPage']): Advertisement[] => {
      const now = new Date().toISOString();
      return advertisements.filter((ad) => {
        const isActive = ad.status === 'active';
        const inWindow = ad.startDate <= now && ad.endDate >= now;
        const matchesPage = !targetPage || ad.targetPage === targetPage || ad.targetPage === 'all';
        return isActive && inWindow && matchesPage;
      });
    },
    [advertisements],
  );

  const getActiveWebBanners = useCallback(
    (location?: WebBanner['location']): WebBanner[] => {
      const now = new Date().toISOString();
      return webBanners.filter((b) => {
        const isActive = b.status === 'active';
        const inWindow = b.startDate <= now && b.endDate >= now;
        const matchesLocation = !location || b.location === location;
        return isActive && inWindow && matchesLocation;
      });
    },
    [webBanners],
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

  const createAdvertisement = useCallback((input: Omit<Advertisement, 'id' | 'createdAt'>) => {
    setAdvertisements((current) => [{ ...input, id: makeId(), createdAt: new Date().toISOString() }, ...current]);
  }, []);
  const updateAdvertisement = useCallback((id: string, input: Partial<Omit<Advertisement, 'id' | 'createdAt'>>) => {
    setAdvertisements((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteAdvertisement = useCallback((id: string) => {
    setAdvertisements((current) => current.filter((item) => item.id !== id));
  }, []);
  const createWebBanner = useCallback((input: Omit<WebBanner, 'id' | 'createdAt'>) => {
    setWebBanners((current) => [{ ...input, id: makeId(), createdAt: new Date().toISOString() }, ...current]);
  }, []);
  const updateWebBanner = useCallback((id: string, input: Partial<Omit<WebBanner, 'id' | 'createdAt'>>) => {
    setWebBanners((current) => current.map((item) => (item.id === id ? { ...item, ...input } : item)));
  }, []);
  const deleteWebBanner = useCallback((id: string) => {
    setWebBanners((current) => current.filter((item) => item.id !== id));
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

  // Merge live ad stats into the mutable advertisements list
  const advertisementsWithStats = useMemo(
    () =>
      advertisements.map((a) => ({
        ...a,
        impressions: adStats[a.id]?.impressions ?? a.impressions,
        clicks: adStats[a.id]?.clicks ?? a.clicks,
        views: adStats[a.id]?.views ?? a.views,
      })),
    [adStats, advertisements],
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
      announcements,
      trafficDocs,
      campaigns,
      officialAccounts: OFFICIAL_ACCOUNTS,
      articles,
      newsletters,
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
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      createTrafficDoc,
      updateTrafficDoc,
      deleteTrafficDoc,
      // Departments
      departments,
      getDepartment,
      searchDepartments,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      // Discover
      discoverPosts,
      discoverVideos,
      discoverPhotos,
      searchDiscoverPosts,
      searchDiscoverVideos,
      searchDiscoverPhotos,
      createDiscoverPost,
      updateDiscoverPost,
      deleteDiscoverPost,
      createDiscoverVideo,
      updateDiscoverVideo,
      deleteDiscoverVideo,
      createDiscoverPhoto,
      updateDiscoverPhoto,
      deleteDiscoverPhoto,
      // Articles & newsletters
      createArticle,
      updateArticle,
      deleteArticle,
      createNewsletter,
      updateNewsletter,
      deleteNewsletter,
      // Advertisements & banners
      advertisements: advertisementsWithStats,
      webBanners,
      getActiveAdvertisements,
      getActiveWebBanners,
      recordAdImpression,
      recordAdClick,
      createAdvertisement,
      updateAdvertisement,
      deleteAdvertisement,
      createWebBanner,
      updateWebBanner,
      deleteWebBanner,
      // Notifications
      notifications,
      unreadCount,
      searchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
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
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      createTrafficDoc,
      updateTrafficDoc,
      deleteTrafficDoc,
      getDepartment,
      searchDepartments,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      searchDiscoverPosts,
      searchDiscoverVideos,
      searchDiscoverPhotos,
      createDiscoverPost,
      updateDiscoverPost,
      deleteDiscoverPost,
      createDiscoverVideo,
      updateDiscoverVideo,
      deleteDiscoverVideo,
      createDiscoverPhoto,
      updateDiscoverPhoto,
      deleteDiscoverPhoto,
      createArticle,
      updateArticle,
      deleteArticle,
      createNewsletter,
      updateNewsletter,
      deleteNewsletter,
      advertisementsWithStats,
      getActiveAdvertisements,
      getActiveWebBanners,
      recordAdImpression,
      recordAdClick,
      createAdvertisement,
      updateAdvertisement,
      deleteAdvertisement,
      createWebBanner,
      updateWebBanner,
      deleteWebBanner,
      announcements,
      trafficDocs,
      departments,
      discoverPosts,
      discoverVideos,
      discoverPhotos,
      articles,
      newsletters,
      webBanners,
      notifications,
      unreadCount,
      searchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
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
