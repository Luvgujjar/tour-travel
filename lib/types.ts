export type ItineraryDay = {
  title: string;
  detail: string;
  stay?: string;
  meals?: string;
  travel?: string;
};

export type PackageStatus = "published" | "draft";
export type Difficulty = "Easy" | "Moderate" | "Challenging";

export type TourPackage = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  days: number;
  nights: number;
  route: string[];
  price: number;
  image: string;
  gallery: string[];
  summary: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  difficulty: Difficulty;
  season: string;
  groupSize: string;
  status: PackageStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "booked", "lost"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  packageSlug: string;
  travelMonth: string;
  travellers: number;
  message: string;
  source: string;
  status: EnquiryStatus;
  notes: string;
  value: number;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: number;
  name: string;
  location: string;
  trip: string;
  quote: string;
  visible: boolean;
  createdAt: string;
};

export type Settings = {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  address: string;
  announcement: string;
};
