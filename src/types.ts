export type DestinationCategory =
  | 'Forts & Heritage'
  | 'Waterfalls & Nature'
  | 'Spiritual & Landmarks';

export interface DestinationItem {
  id: string;
  name: string;
  category: DestinationCategory;
  tags: DestinationCategory[];
  distanceFromCity: string;
  bestSeason: string;
  highlights: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export interface CultureShowcaseItem {
  id: string;
  tab: 'food' | 'art' | 'culture';
  title: string;
  metaPrimary: string;
  metaSecondary: string;
  origin: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

export type GalleryCategory =
  | 'Nature & Waterfalls'
  | 'Forts & Heritage'
  | 'Food & Sweets'
  | 'Art & Festivals';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: GalleryCategory;
  caption: string;
  imageUrl: string;
  isCustom?: boolean;
  createdAt: string;
}

export type TripDuration = '1 Day' | '2 Days / 1 Night' | '3 Days / 2 Nights';
export type TripBudget = 'Budget' | 'Standard' | 'Premium';
export type TripStatus = 'Pending' | 'Confirmed' | 'Completed';

export type ExperiencePreference =
  | 'Local Food Trail'
  | 'Heritage & Fort Walk'
  | 'Art & Handicraft Shopping'
  | 'Nature & Waterfall Trek';

export interface TripRequest {
  id: string;
  bookingId: string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: string;
  duration: TripDuration;
  travelers: number;
  budget: TripBudget;
  selectedDestinations: string[];
  experiences: ExperiencePreference[];
  notes: string;
  status: TripStatus;
  createdAt: string;
}

export interface BelagaviContentPayload {
  heroImageUrl: string;
  destinations: DestinationItem[];
  food: CultureShowcaseItem[];
  art: CultureShowcaseItem[];
  culture: CultureShowcaseItem[];
  gallery: GalleryPhoto[];
}
