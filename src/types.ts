export type CategoryId =
  | 'crime'
  | 'suspicious'
  | 'vandalism'
  | 'public_property'
  | 'traffic'
  | 'other';

export type ReportStatus =
  | 'submitted'
  | 'received'
  | 'under_review'
  | 'verified'
  | 'action_taken';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface TimelineEntry {
  status: ReportStatus;
  /** ISO date string */
  date: string;
}

export interface Report {
  id: string;
  authorId: string;
  categoryId: CategoryId;
  description: string;
  photoUri?: string | null;
  location: GeoPoint;
  /** Public label, e.g. "Musanze". Exact GPS never leaves the authority. */
  area: string;
  status: ReportStatus;
  createdAt: string;
  timeline: TimelineEntry[];
  /** This report was matched with an older, similar report. */
  duplicateOfId?: string | null;
  /** How many reports are handled together with this one. */
  linkedCount?: number;
  /** Only the first valid report in a group earns points. */
  pointsEligible: boolean;
}

export type PointStatus = 'confirmed' | 'pending' | 'removed';

export interface PointEntry {
  id: string;
  reportId: string;
  /** Short plain-language label for the list. */
  label: string;
  /** Can be negative when points are taken back. */
  points: number;
  status: PointStatus;
  date: string;
}

export interface User {
  id: string;
  username: string;
  phone: string;
}

/** Draft the user builds up across the report flow. */
export interface ReportDraft {
  categoryId: CategoryId | null;
  description: string;
  photoUri: string | null;
  location: GeoPoint;
  area: string;
  isAnonymous: boolean;
  incidentDate: string;
}

export type AuthPhase = 'signedOut' | 'needsVerify' | 'signedIn';

export interface Hotline {
  number: string;
  labelKey: string;
}

// ─── Traffic Rules & Regulations ────────────────────────────────────────────

export type TrafficDocCategory =
  | 'driving_licences'
  | 'road_signs'
  | 'vehicle_regulations'
  | 'pedestrian_safety'
  | 'public_transport'
  | 'traffic_offences';

export interface TrafficDocument {
  id: string;
  title: string;
  category: TrafficDocCategory;
  summary: string;
  /** Externally hosted PDF URL (mock: placeholder string) */
  pdfUrl?: string;
  issuingAuthority: string;
  sourceUrl?: string;
  /** ISO date string */
  publishedAt: string;
  /** ISO date string */
  revisedAt?: string;
  language: 'en' | 'rw' | 'fr';
  version: string;
}

// ─── Police Announcements ────────────────────────────────────────────────────

export type AnnouncementType =
  | 'press_release'
  | 'road_closure'
  | 'public_safety'
  | 'event_notice'
  | 'urgent';

export interface PoliceAnnouncement {
  id: string;
  type: AnnouncementType;
  headline: string;
  body: string;
  authority: string;
  /** ISO date string */
  publishedAt: string;
  locations?: string[];
  mediaUris?: string[];
  sourceUrl?: string;
  isUrgent: boolean;
}

// ─── Campaigns & Advertisements ─────────────────────────────────────────────

export type CampaignSlot =
  | 'home_banner'
  | 'announcements'
  | 'traffic'
  | 'general';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  videoUri?: string;
  slot: CampaignSlot;
  /** e.g. "Road Safety", "Anti-Crime" */
  topic: string;
  /** ISO date string */
  startsAt: string;
  /** ISO date string */
  endsAt: string;
  cta?: { label: string; url: string };
  views: number;
  clicks: number;
  isActive: boolean;
}

// ─── Official Social Media Accounts ─────────────────────────────────────────

export type SocialPlatform =
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'tiktok';

export interface OfficialAccount {
  id: string;
  name: string;
  platform: SocialPlatform;
  profileUrl: string;
  description: string;
  category: 'national' | 'traffic' | 'regional' | 'unit';
  isVerified: boolean;
  thumbnailUri?: string;
}

// ─── Police Media / News Articles ───────────────────────────────────────────

export type MediaCategory =
  | 'traffic'
  | 'road_safety'
  | 'crime_prevention'
  | 'public_announcements'
  | 'community_policing'
  | 'general';

export type PublishStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export interface MediaArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: MediaCategory;
  /** Department name — not a private individual */
  author: string;
  /** ISO date string */
  publishedAt?: string;
  status: PublishStatus;
  coverImageUri?: string;
  mediaUris?: string[];
  documentUrls?: string[];
  tags: string[];
}

// ─── Newsletters ─────────────────────────────────────────────────────────────

export interface Newsletter {
  id: string;
  title: string;
  /** e.g. "October 2026" */
  edition: string;
  /** 1-12 */
  month: number;
  year: number;
  department: string;
  /** ISO date string */
  publishedAt: string;
  /** Externally hosted PDF URL */
  pdfUrl?: string;
  /** References MediaArticle IDs included in this edition */
  articleIds: string[];
}

// ─── CMS roles (used by admin portal, type-checked here) ────────────────────

export type CmsRole = 'editor' | 'reviewer' | 'publisher' | 'admin';

// ─── Police Departments ──────────────────────────────────────────────────────

export type DepartmentType =
  | 'national'
  | 'traffic'
  | 'community'
  | 'regional'
  | 'district'
  | 'specialized';

export interface PoliceDepartment {
  id: string;
  name: string;
  shortName: string;
  type: DepartmentType;
  description: string;
  location: string;
  logoUri?: string;
  coverUri?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  isVerified: boolean;
  isActive: boolean;
  /** ISO date string */
  createdAt: string;
  postCount: number;
  videoCount: number;
  photoCount: number;
  announcementCount: number;
}

// ─── Advertisements ──────────────────────────────────────────────────────────

export type AdType =
  | 'banner'
  | 'image'
  | 'video'
  | 'campaign';

export type AdTargetPage =
  | 'home'
  | 'discover'
  | 'traffic'
  | 'news'
  | 'videos'
  | 'departments'
  | 'announcements'
  | 'all';

export type AdStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'archived';

export interface Advertisement {
  id: string;
  campaignName: string;
  adType: AdType;
  title: string;
  description: string;
  imageUri?: string;
  videoUri?: string;
  destinationUrl?: string;
  /** ISO date string */
  startDate: string;
  /** ISO date string */
  endDate: string;
  targetPage: AdTargetPage;
  status: AdStatus;
  departmentId?: string;
  impressions: number;
  clicks: number;
  views: number;
  shares: number;
  /** ISO date string */
  createdAt: string;
  createdBy: string;
}

// ─── Web Banners ─────────────────────────────────────────────────────────────

export type BannerLocation =
  | 'home'
  | 'discover'
  | 'traffic'
  | 'news'
  | 'videos'
  | 'departments'
  | 'announcements';

export type BannerStatus = 'draft' | 'scheduled' | 'active' | 'inactive' | 'archived';

export interface WebBanner {
  id: string;
  title: string;
  imageUri?: string;
  bannerText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  location: BannerLocation;
  /** ISO date string */
  startDate: string;
  /** ISO date string */
  endDate: string;
  status: BannerStatus;
  /** ISO date string */
  createdAt: string;
  createdBy: string;
}

// ─── Admin Roles & Users ─────────────────────────────────────────────────────

export type AdminRole =
  | 'super_admin'
  | 'content_admin'
  | 'police_admin'
  | 'traffic_admin'
  | 'advertising_admin';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  departmentId?: string;
  isActive: boolean;
  /** ISO date string */
  createdAt: string;
  lastLoginAt?: string;
  permissions: AdminPermission[];
}

export type AdminPermission =
  | 'manage_departments'
  | 'manage_accounts'
  | 'manage_announcements'
  | 'manage_traffic_docs'
  | 'manage_posts'
  | 'manage_videos'
  | 'manage_photos'
  | 'manage_news'
  | 'manage_newsletters'
  | 'manage_ads'
  | 'manage_banners'
  | 'view_analytics'
  | 'manage_roles';

// ─── Citizen Notifications ───────────────────────────────────────────────────

export type NotificationKind =
  | 'announcement'
  | 'report_status'
  | 'points'
  | 'campaign'
  | 'newsletter'
  | 'traffic_doc';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** In-app route to open when the notification is tapped. */
  route?: string;
  /** ISO date string */
  createdAt: string;
  isRead: boolean;
  isUrgent?: boolean;
}

// ─── Administrative Activity Log ─────────────────────────────────────────────

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'unpublished'
  | 'archived'
  | 'verified'
  | 'suspended'
  | 'scheduled';

export interface AdminActivity {
  id: string;
  action: ActivityAction;
  /** Human-readable description, e.g. "Published road closure notice". */
  description: string;
  /** Which admin performed it. */
  actor: string;
  /** Area of the portal: Content, Police, Traffic, Advertising. */
  area: 'content' | 'police' | 'traffic' | 'advertising' | 'system';
  /** ISO date string */
  at: string;
}

// ─── Discover Content ────────────────────────────────────────────────────────

export interface DiscoverPost {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  body: string;
  imageUri?: string;
  tags: string[];
  /** ISO date string */
  publishedAt: string;
  views: number;
  likes: number;
  isVerified: boolean;
}

export interface DiscoverVideo {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description: string;
  thumbnailUri?: string;
  videoUri?: string;
  youtubeUrl?: string;
  duration?: string;
  /** ISO date string */
  publishedAt: string;
  views: number;
  isVerified: boolean;
}

export interface DiscoverPhoto {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  caption?: string;
  imageUri: string;
  tags: string[];
  /** ISO date string */
  publishedAt: string;
  views: number;
  isVerified: boolean;
}
