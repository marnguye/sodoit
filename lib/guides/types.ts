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
  created_at: string;
  updated_at: string;
}

export interface GuideWithItems extends Guide {
  items: GuideItem[];
}
