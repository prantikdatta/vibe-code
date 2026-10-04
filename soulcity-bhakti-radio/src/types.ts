export type DeityId =
  | 'shiva'
  | 'hanuman'
  | 'ganesh'
  | 'vishnu'
  | 'durga'
  | 'shani'
  | 'surya'
  | 'krishna'
  | 'lakshmi'
  | 'saraswati';

export type AartiSourceType = 'direct' | 'youtube';

export type AartiType = 'Aarti' | 'Bhajan' | 'Mantra' | 'Chalisa' | 'Stotram' | 'Other';

export interface DeityInfo {
  id: DeityId;
  name: string;
  hindiName: string;
  day: string;
  dayHindi: string;
  mantra: string;
  title: string;
  image: string;
  significance: string;
  colorHex: string;
}

export interface Aarti {
  id: string;
  title: string;
  hindiTitle?: string;
  deityId: DeityId;
  sourceType?: AartiSourceType;
  audioUrl: string; // Direct audio URL or YouTube URL
  youtubeUrl?: string;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
  duration?: string;
  isCustom?: boolean;
  addedAt?: number;
  type?: AartiType;
  artist?: string;
  suggestedDay?: string;
  recommendedDays?: string[];
  // Navratri metadata
  festivalTags?: string[]; // e.g. ["Navratri"]
  navratriDay?: number; // 1 to 10
  deviForm?: string; // e.g. "Maa Shailputri"
  themeColor?: string; // hex
}

export interface NavratriDayConfig {
  dayNumber: number; // 1 to 10
  dateString: string; // e.g. "2026-10-11"
  dayLabel: string; // e.g. "Navratri Day 1"
  tithi: string; // e.g. "Pratipada"
  deviForm: string; // e.g. "Maa Shailputri"
  deviHindi: string; // e.g. "माँ शैलपुत्री"
  colorName: string; // e.g. "Divine Orange"
  colorHex: string; // e.g. "#f97316"
  mantra: string; // e.g. "वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम्..."
  significance: string;
  associatedCategories: AartiType[];
  artwork?: string;
}

export interface NavratriSettings {
  isEnabled: boolean;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  manualOverrideDay: number | null; // null = follow current IST date; 1-10 = preview day
  days: NavratriDayConfig[];
}

export interface ClassifiedPlaylistItem {
  videoId: string;
  originalTitle: string;
  cleanTitle: string;
  description: string;
  thumbnail: string;
  type: AartiType;
  deity: DeityId | 'Unknown';
  suggestedDays: string[];
  artist: string;
  confidence: number;
  selected: boolean;
  isEditing?: boolean;
  // Optional Navratri classification
  festivalTags?: string[];
  navratriDay?: number | null;
  deviForm?: string | null;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
