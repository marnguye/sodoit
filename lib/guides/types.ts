export type GuideType = "itinerary" | "collection";

export interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  city: string;
  country_code: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  duration_label: string | null;
  is_public: boolean;
  featured: boolean;
  type?: GuideType;
  city_slug?: string | null;
  sort_order?: number;
  editorial_attribution?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuideCity {
  slug: string;
  city: string;
  country_code: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  eyebrow: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface GuideItem {
  id: string;
  guide_id: string;
  position: number;
  title: string;
  description: string | null;
  place_name: string | null;
  image_url: string | null;
  image_alt: string | null;
  external_url: string | null;
  place_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuideWithItems extends Guide {
  items: GuideItem[];
}
