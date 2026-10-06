import { Ionicons } from '@expo/vector-icons';
import type { CategoryId, ReportStatus } from '@/types';

type IconName = keyof typeof Ionicons.glyphMap;

export interface CategoryMeta {
  id: CategoryId;
  icon: IconName;
  labelKey: string;
  examplesKey: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'crime',
    icon: 'shield-half-outline',
    labelKey: 'category.crime.label',
    examplesKey: 'category.crime.examples',
  },
  {
    id: 'suspicious',
    icon: 'eye-outline',
    labelKey: 'category.suspicious.label',
    examplesKey: 'category.suspicious.examples',
  },
  {
    id: 'vandalism',
    icon: 'hammer-outline',
    labelKey: 'category.vandalism.label',
    examplesKey: 'category.vandalism.examples',
  },
  {
    id: 'public_property',
    icon: 'business-outline',
    labelKey: 'category.public_property.label',
    examplesKey: 'category.public_property.examples',
  },
  {
    id: 'traffic',
    icon: 'car-sport-outline',
    labelKey: 'category.traffic.label',
    examplesKey: 'category.traffic.examples',
  },
  {
    id: 'other',
    icon: 'ellipsis-horizontal-circle-outline',
    labelKey: 'category.other.label',
    examplesKey: 'category.other.examples',
  },
];

export function getCategory(id: CategoryId | null): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export type StatusTone = 'neutral' | 'ochre' | 'teal' | 'green';

export interface StatusMeta {
  id: ReportStatus;
  labelKey: string;
  meaningKey: string;
  tone: StatusTone;
  /** Small icon shared by the status chip and the timeline. */
  icon: IconName;
}

/** Always shown in this order, from sending to resolved. */
export const STATUSES: StatusMeta[] = [
  {
    id: 'submitted',
    labelKey: 'status.submitted.label',
    meaningKey: 'status.submitted.meaning',
    tone: 'neutral',
    icon: 'paper-plane-outline',
  },
  {
    id: 'received',
    labelKey: 'status.received.label',
    meaningKey: 'status.received.meaning',
    tone: 'neutral',
    icon: 'mail-open-outline',
  },
  {
    id: 'under_review',
    labelKey: 'status.under_review.label',
    meaningKey: 'status.under_review.meaning',
    tone: 'ochre',
    icon: 'search-outline',
  },
  {
    id: 'verified',
    labelKey: 'status.verified.label',
    meaningKey: 'status.verified.meaning',
    tone: 'teal',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'action_taken',
    labelKey: 'status.action_taken.label',
    meaningKey: 'status.action_taken.meaning',
    tone: 'green',
    icon: 'checkmark-circle-outline',
  },
];

export function getStatus(id: ReportStatus): StatusMeta {
  return STATUSES.find((s) => s.id === id) ?? STATUSES[0];
}

export function statusIndex(id: ReportStatus): number {
  return STATUSES.findIndex((s) => s.id === id);
}
