import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { KIGALI_CENTER } from '@/data/kigali';
import { OFFICIAL_ACCOUNTS } from '@/data/officialAccounts';
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
  StaffAccount,
  TrafficDocCategory,
  TrafficDocument,
  User,
  WebBanner,
} from '@/types';
import { api, getAuthToken, getStaffToken, setAuthToken, setStaffToken } from '@/utils/api';
import { isSameDay, makeId } from '@/utils/format';
import { isValidRwandaPhone, normalizeRwandaPhone } from '@/utils/phone';
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

  login: (phone: string, password: string) => Promise<{ ok: boolean; errorKey?: string }>;
  signup: (input: {
    username: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; errorKey?: string }>;
  verify: (code: string) => Promise<{ ok: boolean; errorKey?: string }>;
  logout: () => void;
  staffAccount: StaffAccount | null;
  staffReady: boolean;
  staffLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  staffLogout: () => Promise<void>;

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
  recordCampaignView: (id: string) => Promise<void>;
  recordCampaignClick: (id: string) => Promise<void>;
  getNewsletter: (id: string) => Newsletter | undefined;
  getArticle: (id: string) => MediaArticle | undefined;
  getAnnouncement: (id: string) => PoliceAnnouncement | undefined;
  getTrafficDoc: (id: string) => TrafficDocument | undefined;
  createAnnouncement: (input: Omit<PoliceAnnouncement, 'id'>) => Promise<void>;
  updateAnnouncement: (id: string, input: Partial<Omit<PoliceAnnouncement, 'id'>>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  createTrafficDoc: (input: Omit<TrafficDocument, 'id'>) => Promise<void>;
  updateTrafficDoc: (id: string, input: Partial<Omit<TrafficDocument, 'id'>>) => Promise<void>;
  deleteTrafficDoc: (id: string) => Promise<void>;

  // ─── Departments ─────────────────────────────────────────────────────
  departments: PoliceDepartment[];
  getDepartment: (id: string) => PoliceDepartment | undefined;
  searchDepartments: (query: string) => PoliceDepartment[];
  createDepartment: (input: Omit<PoliceDepartment, 'id' | 'createdAt'> & { password?: string }) => Promise<void>;
  updateDepartment: (id: string, input: Partial<Omit<PoliceDepartment, 'id' | 'createdAt'>> & { password?: string }) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  // ─── Discover content ────────────────────────────────────────────────
  discoverPosts: DiscoverPost[];
  discoverVideos: DiscoverVideo[];
  discoverPhotos: DiscoverPhoto[];
  searchDiscoverPosts: (query: string) => DiscoverPost[];
  searchDiscoverVideos: (query: string) => DiscoverVideo[];
  searchDiscoverPhotos: (query: string) => DiscoverPhoto[];
  createDiscoverPost: (input: Omit<DiscoverPost, 'id'>) => Promise<void>;
  updateDiscoverPost: (id: string, input: Partial<Omit<DiscoverPost, 'id'>>) => Promise<void>;
  deleteDiscoverPost: (id: string) => Promise<void>;
  createDiscoverVideo: (input: Omit<DiscoverVideo, 'id'>) => Promise<void>;
  updateDiscoverVideo: (id: string, input: Partial<Omit<DiscoverVideo, 'id'>>) => Promise<void>;
  deleteDiscoverVideo: (id: string) => Promise<void>;
  createDiscoverPhoto: (input: Omit<DiscoverPhoto, 'id'>) => Promise<void>;
  updateDiscoverPhoto: (id: string, input: Partial<Omit<DiscoverPhoto, 'id'>>) => Promise<void>;
  deleteDiscoverPhoto: (id: string) => Promise<void>;

  // ─── Articles & newsletters ─────────────────────────────────────────
  createArticle: (input: Omit<MediaArticle, 'id'>) => Promise<void>;
  updateArticle: (id: string, input: Partial<Omit<MediaArticle, 'id'>>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  createNewsletter: (input: Omit<Newsletter, 'id'>) => Promise<void>;
  updateNewsletter: (id: string, input: Partial<Omit<Newsletter, 'id'>>) => Promise<void>;
  deleteNewsletter: (id: string) => Promise<void>;

  // ─── Advertisements & Banners ────────────────────────────────────────
  advertisements: Advertisement[];
  webBanners: WebBanner[];
  getActiveAdvertisements: (targetPage?: Advertisement['targetPage']) => Advertisement[];
  getActiveWebBanners: (location?: WebBanner['location']) => WebBanner[];
  recordAdImpression: (id: string) => Promise<void>;
  recordAdClick: (id: string) => Promise<void>;
  createAdvertisement: (input: Omit<Advertisement, 'id' | 'createdAt'>) => Promise<void>;
  updateAdvertisement: (id: string, input: Partial<Omit<Advertisement, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAdvertisement: (id: string) => Promise<void>;
  createWebBanner: (input: Omit<WebBanner, 'id' | 'createdAt'>) => Promise<void>;
  updateWebBanner: (id: string, input: Partial<Omit<WebBanner, 'id' | 'createdAt'>>) => Promise<void>;
  deleteWebBanner: (id: string) => Promise<void>;
  createCampaign: (input: Omit<Campaign, 'id' | 'views' | 'clicks'>) => Promise<void>;
  updateCampaign: (id: string, input: Partial<Omit<Campaign, 'id'>>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // ─── Notifications ───────────────────────────────────────────────────
  notifications: AppNotification[];
  unreadCount: number;
  searchNotifications: (query: string, kind?: NotificationKind) => AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // ─── Admin ───────────────────────────────────────────────────────────
  adminUser: AdminUser | null;
  isAdmin: boolean;
  adminUsers: AdminUser[];
  createAdminUser: (input: Omit<AdminUser, 'id' | 'createdAt' | 'lastLoginAt'> & { password: string }) => Promise<void>;
  updateAdminUser: (id: string, input: Partial<Omit<AdminUser, 'id' | 'createdAt'>> & { password?: string }) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  recentActivity: AdminActivity[];
  /** Role-based gate — Super Admin always passes. */
  can: (permission: AdminPermission) => boolean;
  /** Sum of views + downloads across every managed content type. */
  contentEngagement: { views: number; downloads: number };
  cmsReady: boolean;
  cmsError: string | null;
  refreshCms: () => Promise<void>;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>('signedOut');
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<{ username: string; phone: string } | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [points, setPoints] = useState<PointEntry[]>([]);
  const [weekly, setWeekly] = useState({ filed: 0, resolved: 0 });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [sentToday, setSentToday] = useState<string[]>([]);
  const [draft, setDraft] = useState<ReportDraft>(emptyDraft);

  const [announcements, setAnnouncements] = useState<PoliceAnnouncement[]>([]);
  const [trafficDocs, setTrafficDocs] = useState<TrafficDocument[]>([]);
  const [articles, setArticles] = useState<MediaArticle[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [departments, setDepartments] = useState<PoliceDepartment[]>([]);
  const [discoverPosts, setDiscoverPosts] = useState<DiscoverPost[]>([]);
  const [discoverVideos, setDiscoverVideos] = useState<DiscoverVideo[]>([]);
  const [discoverPhotos, setDiscoverPhotos] = useState<DiscoverPhoto[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [webBanners, setWebBanners] = useState<WebBanner[]>([]);
  const [campaignRecords, setCampaignRecords] = useState<Campaign[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [staffAccount, setStaffAccount] = useState<StaffAccount | null>(null);
  const [staffReady, setStaffReady] = useState(false);
  const [cmsReady, setCmsReady] = useState(false);
  const [cmsError, setCmsError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<AdminActivity[]>([]);
  const [contentEngagement, setContentEngagement] = useState({ views: 0, downloads: 0 });

  const updateDraft = useCallback(
    (patch: Partial<ReportDraft>) => setDraft((current) => ({ ...current, ...patch })),
    [],
  );

  const resetDraft = useCallback(() => setDraft(emptyDraft), []);

  const syncPublicCmsData = useCallback(async () => {
    const remote = await api.getCmsPublic();
    if (await getStaffToken()) return;
    setAnnouncements(remote.announcements);
    setTrafficDocs(remote.trafficDocs);
    setArticles(remote.articles);
    setNewsletters(remote.newsletters);
    setDepartments(remote.departments);
    setDiscoverPosts(remote.discoverPosts);
    setDiscoverVideos(remote.discoverVideos);
    setDiscoverPhotos(remote.discoverPhotos);
    setAdvertisements(remote.advertisements);
    setWebBanners(remote.webBanners);
    setCampaignRecords(remote.campaigns);
  }, []);

  const syncAdminCmsData = useCallback(async (token: string, account: StaffAccount) => {
    setCmsReady(false);
    setCmsError(null);
    setAnnouncements([]);
    setTrafficDocs([]);
    setArticles([]);
    setNewsletters([]);
    setDepartments([]);
    setDiscoverPosts([]);
    setDiscoverVideos([]);
    setDiscoverPhotos([]);
    setAdvertisements([]);
    setWebBanners([]);
    setCampaignRecords([]);
    setAdminUsers([]);
    setRecentActivity([]);
    setContentEngagement({ views: 0, downloads: 0 });
    const permissions = account.permissions;
    const canManage = (permission: AdminPermission) => permissions.includes(permission);
    const tasks: Promise<void>[] = [];

    const loadRecords = <T,>(resource: string, permission: AdminPermission, apply: (rows: T[]) => void) => {
      if (!canManage(permission)) return;
      tasks.push(api.getCmsRecords<T>(resource, token).then(({ records }) => apply(records)));
    };

    loadRecords('announcement', 'manage_announcements', setAnnouncements);
    loadRecords('traffic_doc', 'manage_traffic_docs', setTrafficDocs);
    loadRecords('article', 'manage_news', setArticles);
    loadRecords('newsletter', 'manage_newsletters', setNewsletters);
    loadRecords('discover_post', 'manage_posts', setDiscoverPosts);
    loadRecords('discover_video', 'manage_videos', setDiscoverVideos);
    loadRecords('discover_photo', 'manage_photos', setDiscoverPhotos);
    loadRecords('advertisement', 'manage_ads', setAdvertisements);
    loadRecords('web_banner', 'manage_banners', setWebBanners);
    loadRecords('campaign', 'manage_ads', setCampaignRecords);

    if (canManage('manage_departments')) {
      tasks.push(api.getCmsDepartments(token).then(({ departments: rows }) => setDepartments(rows)));
    }
    if (canManage('manage_accounts')) {
      tasks.push(api.getCmsAccounts(token).then(({ accounts }) => setAdminUsers(accounts)));
    }
    const dashboardTask = canManage('view_analytics')
      ? api.getCmsDashboard(token).then(({ activity, engagement }) => {
          setRecentActivity(activity);
          setContentEngagement(engagement);
        })
      : Promise.resolve();

    try {
      await Promise.all([...tasks, dashboardTask]);
      setCmsReady(true);
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to load CMS data');
      setCmsReady(true);
      throw error;
    }
  }, []);

  const refreshCms = useCallback(async () => {
    const token = await getStaffToken();
    if (!token || !staffAccount) throw new Error('Sign in as staff to load CMS data');
    await syncAdminCmsData(token, staffAccount);
  }, [staffAccount, syncAdminCmsData]);

  const staffLogin = useCallback(async (username: string, password: string) => {
    if (!username.trim() || !password) return { ok: false, error: 'Enter your staff username and password' };
    try {
      const { account, accessToken } = await api.staffLogin({ username: username.trim(), password });
      await setStaffToken(accessToken);
      setStaffAccount(account);
      await syncAdminCmsData(accessToken, account);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Staff sign-in failed';
      setStaffAccount(null);
      await setStaffToken(null);
      return { ok: false, error: message };
    }
  }, [syncAdminCmsData]);

  const staffLogout = useCallback(async () => {
    await setStaffToken(null);
    setStaffAccount(null);
    setAdminUsers([]);
    setRecentActivity([]);
    setContentEngagement({ views: 0, downloads: 0 });
    setCmsReady(false);
    setCmsError(null);
    try {
      await syncPublicCmsData();
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to load public CMS data');
    }
  }, [syncPublicCmsData]);

  useEffect(() => {
    let active = true;
    const hydrateStaff = async () => {
      try {
        await syncPublicCmsData();
      } catch (error) {
        if (active) {
          setCmsError(error instanceof Error ? error.message : 'Unable to load public CMS data');
        }
      }
      const token = await getStaffToken();
      if (token) {
        try {
          const { account } = await api.staffMe(token);
          if (!active) return;
          setStaffAccount(account);
          await syncAdminCmsData(token, account);
        } catch (error) {
          if (!active) return;
          await setStaffToken(null);
          setCmsError(error instanceof Error ? error.message : 'Unable to restore staff session');
        }
      }
      if (active) setStaffReady(true);
    };
    void hydrateStaff();
    return () => { active = false; };
  }, [syncAdminCmsData, syncPublicCmsData]);

  const syncRemoteData = useCallback(async (token: string) => {
    try {
      const [reportsResponse, pointsResponse, statsResponse] = await Promise.all([
        api.getReports(token),
        api.getPoints(token),
        api.getWeeklyStats(token),
      ]);
      const notificationsResponse = await api.getNotifications(token);

      const nextReports = (reportsResponse.reports ?? []).map((report) => ({
        id: report.id,
        authorId: report.authorId,
        categoryId: report.categoryId,
        description: report.description,
        photoUri: report.photoUri ?? null,
        location: {
          latitude: Number(report.location?.latitude ?? 0),
          longitude: Number(report.location?.longitude ?? 0),
        },
        area: report.area ?? 'Kigali',
        status: report.status,
        createdAt: report.createdAt,
        timeline: (report.timeline ?? []).map((entry: any) => ({
          status: entry.status,
          date: entry.date,
        })),
        duplicateOfId: report.duplicateOfId ?? null,
        linkedCount: report.linkedCount ?? 1,
        pointsEligible: report.pointsEligible ?? true,
      }));

      const nextPoints = (pointsResponse.points ?? []).map((point) => ({
        id: point.id,
        reportId: point.reportId,
        label: point.label,
        points: Number(point.points ?? 0),
        status: point.status,
        date: point.date,
      }));

      setReports(nextReports);
      setPoints(nextPoints);
      setWeekly({
        filed: Number(statsResponse.filed ?? 0),
        resolved: Number(statsResponse.resolved ?? 0),
      });
      setNotifications(notificationsResponse.notifications);
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to load account data');
    }
  }, []);

  const getStaffAccessToken = useCallback(async () => {
    const token = await getStaffToken();
    if (!token) throw new Error('Your staff session has expired. Sign in again to continue.');
    return token;
  }, []);

  const refreshDashboard = useCallback(async (token: string) => {
    if (!staffAccount?.permissions.includes('view_analytics')) return;
    const dashboard = await api.getCmsDashboard(token);
    setRecentActivity(dashboard.activity);
    setContentEngagement(dashboard.engagement);
  }, [staffAccount]);

  useEffect(() => {
    const hydrateSession = async () => {
      const token = await getAuthToken();
      if (!token) return;

      try {
        const { user: remoteUser } = await api.me(token);
        setUser({ id: remoteUser.id, username: remoteUser.username, phone: remoteUser.phone });
        setPhase('signedIn');
        await syncRemoteData(token);
      } catch {
        await setAuthToken(null);
        setUser(null);
        setPhase('signedOut');
      }
    };

    void hydrateSession();
  }, [syncRemoteData]);

  const login = useCallback(async (phone: string, password: string) => {
    if (!phone.trim()) return { ok: false, errorKey: 'auth.errPhone' };
    if (!isValidRwandaPhone(phone)) return { ok: false, errorKey: 'auth.errPhoneFormat' };
    if (!password) return { ok: false, errorKey: 'auth.errPassword' };

    try {
      const normalized = normalizeRwandaPhone(phone);
      const { user, accessToken } = await api.login({ phone: normalized, password });
      await setAuthToken(accessToken);
      setUser({ id: user.id, username: user.username, phone: user.phone });
      setPhase('signedIn');
      setPending(null);
      await syncRemoteData(accessToken);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const lower = message.toLowerCase();
      if (error instanceof TypeError) return { ok: false, errorKey: 'auth.errConnection' };
      if (lower.includes('incorrect')) return { ok: false, errorKey: 'auth.errLogin' };
      if (lower.includes('verify')) return { ok: false, errorKey: 'auth.errNotVerified' };
      return { ok: false, errorKey: 'auth.errUnexpected' };
    }
  }, [syncRemoteData]);

  const signup = useCallback(
    async (input: { username: string; phone: string; password: string }) => {
      const username = input.username.trim();
      if (username.length < 3) return { ok: false, errorKey: 'auth.errUsernameShort' };
      if (!input.phone.trim()) return { ok: false, errorKey: 'auth.errPhone' };
      if (!isValidRwandaPhone(input.phone)) return { ok: false, errorKey: 'auth.errPhoneFormat' };
      if (input.password.length < 6) return { ok: false, errorKey: 'auth.errPasswordShort' };

      try {
        const phone = normalizeRwandaPhone(input.phone);
        await api.signup({ username, phone, password: input.password });
        setPending({ username, phone });
        setUser({ id: 'local', username, phone });
        setPhase('needsVerify');
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.toLowerCase().includes('exists')) return { ok: false, errorKey: 'auth.errPhone' };
        return { ok: false, errorKey: 'auth.errPhoneFormat' };
      }
    },
    [],
  );

  const verify = useCallback(async (code: string) => {
    if (code.trim().length < 6) return { ok: false, errorKey: 'verify.errCode' };

    const phone = pending?.phone ?? user?.phone;
    if (!phone) return { ok: false, errorKey: 'verify.errCodeWrong' };

    try {
      const { accessToken, user: remoteUser } = await api.verify({ phone, code: code.trim() });
      await setAuthToken(accessToken);
      setUser({ id: remoteUser.id, username: remoteUser.username, phone: remoteUser.phone });
      setPending(null);
      setPhase('signedIn');
      await syncRemoteData(accessToken);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.toLowerCase().includes('too many')) return { ok: false, errorKey: 'verify.errCodeWrong' };
      return { ok: false, errorKey: 'verify.errCodeWrong' };
    }
  }, [pending, syncRemoteData, user]);

  const logout = useCallback(() => {
    void setAuthToken(null);
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
    const incidentDate = data?.incidentDate ?? draft.incidentDate;
    const incidentTime = data?.incidentTime ?? '';
    if (!description || !categoryId) return { ok: false, errorKey: 'report.errDesc' };
    if (isRateLimited(sentToday)) return { ok: false, errorKey: 'report.errRateLimit' };

    const token = await getAuthToken();
    if (token) {
      const now = new Date().toISOString();
      const photoUrl = draft.photoUri && /^https?:\/\//i.test(draft.photoUri)
        ? draft.photoUri
        : undefined;
      if (draft.photoUri && !photoUrl) return { ok: false, errorKey: 'report.errSend' };

      const incidentAt = (() => {
        if (!incidentDate) return undefined;
        const time = incidentTime || '00:00';
        const candidate = new Date(`${incidentDate}T${time}:00`);
        return Number.isNaN(candidate.getTime()) ? undefined : candidate.toISOString();
      })();

      try {
        const response = await api.submitReport(
          {
            categoryId,
            description,
            latitude: draft.location.latitude,
            longitude: draft.location.longitude,
            area: draft.area || 'Kigali',
            isAnonymous: data?.isAnonymous ?? draft.isAnonymous,
            incidentAt,
            photoUrl,
          },
          token,
        );

        const report = response.report as Report | undefined;
        const duplicateOf = report?.duplicateOfId
          ? reports.find((entry) => entry.id === report.duplicateOfId) ?? null
          : null;

        setSentToday((current) => [...current, now]);
        setDraft(emptyDraft);
        await syncRemoteData(token);
        return { ok: true, reportId: report?.id, duplicateOf };
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        return {
          ok: false,
          errorKey: message.includes('daily report limit') ? 'report.errRateLimit' : 'report.errSend',
        };
      }
    }

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
  }, [draft, reports, sentToday, syncRemoteData, user]);

  const getReport = useCallback(
    (id: string) => reports.find((r) => r.id.toUpperCase() === id.toUpperCase()),
    [reports],
  );

  // ─── Police hub actions ──────────────────────────────────────────────────

  const getActiveBanner = useCallback(() => {
    const now = Date.now();
    return campaignRecords
      .filter((campaign) =>
        campaign.isActive
        && campaign.slot === 'home_banner'
        && new Date(campaign.startsAt).getTime() <= now
        && new Date(campaign.endsAt).getTime() >= now,
      )
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())[0] ?? null;
  }, [campaignRecords]);

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

  const recordCampaignView = useCallback(async (id: string) => {
    try {
      const { record } = await api.recordCmsMetric('campaign', id, 'views');
      setCampaignRecords((current) => current.map((item) => item.id === id ? { ...item, views: Number(record.views) } : item));
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to record campaign view');
    }
  }, []);

  const recordCampaignClick = useCallback(async (id: string) => {
    try {
      const { record } = await api.recordCmsMetric('campaign', id, 'clicks');
      setCampaignRecords((current) => current.map((item) => item.id === id ? { ...item, clicks: Number(record.clicks) } : item));
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to record campaign click');
    }
  }, []);

  const getNewsletter = useCallback(
    (id: string) => newsletters.find((n) => n.id === id),
    [newsletters],
  );

  const createNewsletter = useCallback(async (input: Omit<Newsletter, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<Newsletter>('newsletter', input, token);
    setNewsletters((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateNewsletter = useCallback(async (id: string, input: Partial<Omit<Newsletter, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<Newsletter>('newsletter', id, input, token);
    setNewsletters((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteNewsletter = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('newsletter', id, token);
    setNewsletters((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const getArticle = useCallback(
    (id: string) => articles.find((a) => a.id === id),
    [articles],
  );

  const createArticle = useCallback(async (input: Omit<MediaArticle, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<MediaArticle>('article', input, token);
    setArticles((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateArticle = useCallback(async (id: string, input: Partial<Omit<MediaArticle, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<MediaArticle>('article', id, input, token);
    setArticles((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteArticle = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('article', id, token);
    setArticles((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const getAnnouncement = useCallback(
    (id: string) => announcements.find((a) => a.id === id),
    [announcements],
  );

  const createAnnouncement = useCallback(async (input: Omit<PoliceAnnouncement, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<PoliceAnnouncement>('announcement', input, token);
    setAnnouncements((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const updateAnnouncement = useCallback(async (id: string, input: Partial<Omit<PoliceAnnouncement, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<PoliceAnnouncement>('announcement', id, input, token);
    setAnnouncements((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('announcement', id, token);
    setAnnouncements((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const getTrafficDoc = useCallback(
    (id: string) => trafficDocs.find((d) => d.id === id),
    [trafficDocs],
  );

  const createTrafficDoc = useCallback(async (input: Omit<TrafficDocument, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<TrafficDocument>('traffic_doc', input, token);
    setTrafficDocs((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const updateTrafficDoc = useCallback(async (id: string, input: Partial<Omit<TrafficDocument, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<TrafficDocument>('traffic_doc', id, input, token);
    setTrafficDocs((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const deleteTrafficDoc = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('traffic_doc', id, token);
    setTrafficDocs((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

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

  const createDepartment = useCallback(async (input: Omit<PoliceDepartment, 'id' | 'createdAt'> & { password?: string }) => {
    const token = await getStaffAccessToken();
    const { department } = await api.createCmsDepartment(input, token);
    setDepartments((current) => [department, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const updateDepartment = useCallback(async (id: string, input: Partial<Omit<PoliceDepartment, 'id' | 'createdAt'>> & { password?: string }) => {
    const token = await getStaffAccessToken();
    const { department } = await api.updateCmsDepartment(id, input, token);
    setDepartments((current) => current.map((item) => (item.id === id ? department : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const deleteDepartment = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsDepartment(id, token);
    setDepartments((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  // ─── Discover search ──────────────────────────────────────────────────────

  const searchDiscoverPosts = useCallback((query: string): DiscoverPost[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return discoverPosts;
    return discoverPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.departmentName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [discoverPosts]);

  const searchDiscoverVideos = useCallback((query: string): DiscoverVideo[] => {
    const q = query.toLowerCase().trim();
    if (q.length === 0) return discoverVideos;
    return discoverVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.departmentName.toLowerCase().includes(q),
    );
  }, [discoverVideos]);

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

  const createDiscoverPost = useCallback(async (input: Omit<DiscoverPost, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<DiscoverPost>('discover_post', input, token);
    setDiscoverPosts((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateDiscoverPost = useCallback(async (id: string, input: Partial<Omit<DiscoverPost, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<DiscoverPost>('discover_post', id, input, token);
    setDiscoverPosts((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteDiscoverPost = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('discover_post', id, token);
    setDiscoverPosts((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const createDiscoverVideo = useCallback(async (input: Omit<DiscoverVideo, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<DiscoverVideo>('discover_video', input, token);
    setDiscoverVideos((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateDiscoverVideo = useCallback(async (id: string, input: Partial<Omit<DiscoverVideo, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<DiscoverVideo>('discover_video', id, input, token);
    setDiscoverVideos((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteDiscoverVideo = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('discover_video', id, token);
    setDiscoverVideos((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const createDiscoverPhoto = useCallback(async (input: Omit<DiscoverPhoto, 'id'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<DiscoverPhoto>('discover_photo', input, token);
    setDiscoverPhotos((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateDiscoverPhoto = useCallback(async (id: string, input: Partial<Omit<DiscoverPhoto, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<DiscoverPhoto>('discover_photo', id, input, token);
    setDiscoverPhotos((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteDiscoverPhoto = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('discover_photo', id, token);
    setDiscoverPhotos((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  // ─── Advertisements & Banners ─────────────────────────────────────────────

  const getActiveAdvertisements = useCallback(
    (targetPage?: Advertisement['targetPage']): Advertisement[] => {
      const now = Date.now();
      return advertisements.filter((ad) => {
        const isActive = ad.status === 'active';
        const startsAt = Date.parse(ad.startDate);
        const endsAt = Date.parse(ad.endDate);
        const inWindow = Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt <= now && endsAt >= now;
        const matchesPage = !targetPage || ad.targetPage === targetPage || ad.targetPage === 'all';
        return isActive && inWindow && matchesPage;
      });
    },
    [advertisements],
  );

  const getActiveWebBanners = useCallback(
    (location?: WebBanner['location']): WebBanner[] => {
      const now = Date.now();
      return webBanners.filter((b) => {
        const isActive = b.status === 'active';
        const startsAt = Date.parse(b.startDate);
        const endsAt = Date.parse(b.endDate);
        const inWindow = Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt <= now && endsAt >= now;
        const matchesLocation = !location || b.location === location;
        return isActive && inWindow && matchesLocation;
      });
    },
    [webBanners],
  );

  const recordAdImpression = useCallback(async (id: string) => {
    try {
      const { record } = await api.recordCmsMetric('advertisement', id, 'impressions');
      setAdvertisements((current) => current.map((item) => item.id === id
        ? { ...item, impressions: Number(record.impressions) }
        : item));
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to record advertisement impression');
    }
  }, []);

  const recordAdClick = useCallback(async (id: string) => {
    try {
      const { record } = await api.recordCmsMetric('advertisement', id, 'clicks');
      setAdvertisements((current) => current.map((item) => item.id === id
        ? { ...item, clicks: Number(record.clicks) }
        : item));
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Unable to record advertisement click');
    }
  }, []);

  const createAdvertisement = useCallback(async (input: Omit<Advertisement, 'id' | 'createdAt'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<Advertisement>('advertisement', input, token);
    setAdvertisements((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateAdvertisement = useCallback(async (id: string, input: Partial<Omit<Advertisement, 'id' | 'createdAt'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<Advertisement>('advertisement', id, input, token);
    setAdvertisements((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteAdvertisement = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('advertisement', id, token);
    setAdvertisements((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const createWebBanner = useCallback(async (input: Omit<WebBanner, 'id' | 'createdAt'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<WebBanner>('web_banner', input, token);
    setWebBanners((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateWebBanner = useCallback(async (id: string, input: Partial<Omit<WebBanner, 'id' | 'createdAt'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<WebBanner>('web_banner', id, input, token);
    setWebBanners((current) => current.map((item) => (item.id === id ? record : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteWebBanner = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('web_banner', id, token);
    setWebBanners((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const createAdminUser = useCallback(async (
    input: Omit<AdminUser, 'id' | 'createdAt' | 'lastLoginAt'> & { password: string },
  ) => {
    const token = await getStaffAccessToken();
    const { account } = await api.createCmsAccount(input, token);
    setAdminUsers((current) => [account, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateAdminUser = useCallback(async (
    id: string,
    input: Partial<Omit<AdminUser, 'id' | 'createdAt'>> & { password?: string },
  ) => {
    const token = await getStaffAccessToken();
    const { account } = await api.updateCmsAccount(id, input, token);
    setAdminUsers((current) => current.map((item) => (item.id === id ? account : item)));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteAdminUser = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsAccount(id, token);
    setAdminUsers((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  // ─── Notifications ────────────────────────────────────────────────────────

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

  const markNotificationRead = useCallback(async (id: string) => {
    const token = await getAuthToken();
    if (token) {
      try {
        await api.markNotificationRead(id, token);
      } catch {
        return;
      }
    }
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const token = await getAuthToken();
    if (token) {
      try {
        await api.markAllNotificationsRead(token);
      } catch {
        return;
      }
    }
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
  }, []);

  // ─── Admin helpers ─────────────────────────────────────────────────────────

  const can = useCallback(
    (permission: AdminPermission) => staffAccount?.permissions.includes(permission) ?? false,
    [staffAccount],
  );

  const campaigns = useMemo(
    () => campaignRecords.map((c) => ({
      ...c,
    })),
    [campaignRecords],
  );

  const createCampaign = useCallback(async (input: Omit<Campaign, 'id' | 'views' | 'clicks'>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.createCmsRecord<Campaign>('campaign', { ...input, views: 0, clicks: 0 }, token);
    setCampaignRecords((current) => [record, ...current]);
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const updateCampaign = useCallback(async (id: string, input: Partial<Omit<Campaign, 'id'>>) => {
    const token = await getStaffAccessToken();
    const { record } = await api.updateCmsRecord<Campaign>('campaign', id, input, token);
    setCampaignRecords((current) => current.map((item) => item.id === id ? record : item));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);
  const deleteCampaign = useCallback(async (id: string) => {
    const token = await getStaffAccessToken();
    await api.deleteCmsRecord('campaign', id, token);
    setCampaignRecords((current) => current.filter((item) => item.id !== id));
    await refreshDashboard(token);
  }, [getStaffAccessToken, refreshDashboard]);

  const advertisementsWithStats = advertisements;

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

  const adminUser = useMemo<AdminUser | null>(() => {
    if (!staffAccount) return null;
    if (staffAccount.accountType === 'admin') {
      return {
        id: staffAccount.id,
        username: staffAccount.username,
        email: staffAccount.email,
        role: staffAccount.role,
        departmentId: staffAccount.departmentId ?? undefined,
        isActive: staffAccount.isActive,
        createdAt: staffAccount.createdAt,
        lastLoginAt: staffAccount.lastLoginAt,
        permissions: staffAccount.permissions,
      };
    }
    return {
      id: staffAccount.id,
      username: staffAccount.username,
      email: '',
      role: 'police_admin',
      departmentId: staffAccount.departmentId,
      isActive: true,
      createdAt: '',
      permissions: staffAccount.permissions,
    };
  }, [staffAccount]);

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
      staffAccount,
      staffReady,
      staffLogin,
      staffLogout,
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
      createCampaign,
      updateCampaign,
      deleteCampaign,
      // Notifications
      notifications,
      unreadCount,
      searchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      // Admin
      adminUser,
      isAdmin: staffAccount !== null,
      adminUsers,
      createAdminUser,
      updateAdminUser,
      deleteAdminUser,
      recentActivity,
      can,
      contentEngagement,
      cmsReady,
      cmsError,
      refreshCms,
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
      staffAccount,
      staffReady,
      staffLogin,
      staffLogout,
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
      createCampaign,
      updateCampaign,
      deleteCampaign,
      announcements,
      trafficDocs,
      departments,
      discoverPosts,
      discoverVideos,
      discoverPhotos,
      articles,
      newsletters,
      webBanners,
      adminUsers,
      adminUser,
      recentActivity,
      createAdminUser,
      updateAdminUser,
      deleteAdminUser,
      notifications,
      unreadCount,
      searchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      can,
      contentEngagement,
      cmsReady,
      cmsError,
      refreshCms,
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
