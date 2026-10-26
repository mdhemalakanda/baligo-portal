/**
 * Baligo demo/mock data.
 *
 * EVERYTHING in this file is illustrative sample data for the UI prototype.
 * None of it is persisted, fetched, or calculated. When the backend lands,
 * these exports will be replaced by API calls.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type HotelStatus = "active" | "draft" | "inactive";
export type RateStatus = "valid" | "expiring" | "expired" | "incomplete" | "conflict" | "draft";
export type AgentStatus = "active" | "pending" | "deactivated" | "rejected";

export interface Hotel {
  id: string;
  name: string;
  destination: string;
  country: string;
  address: string;
  category: number; // 3–5 stars
  status: HotelStatus;
  description: string;
  amenities: string[];
  inclusions: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    children: string;
    extraBed: string;
  };
  lastUpdated: string; // ISO date
  updatedBy: string;
  imageHue: number; // used to tint the CSS placeholder artwork
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  sizeSqm: number;
  bedType: string;
  standardOccupancy: { adults: number; children: number };
  maxOccupancy: { adults: number; children: number; total: number };
  extraBedEligible: boolean;
  maxExtraBeds: number;
  amenities: string[];
  meals: string;
  childPolicy: string;
  extraBedPolicy: string;
}

export interface SeasonalRate {
  id: string;
  hotelId: string;
  roomId: string;
  seasonName: string;
  startDate: string; // ISO
  endDate: string;
  netRateIdr: number; // supplier net rate per night — ADMIN ONLY, never shown to agents
  validityFrom: string;
  validityTo: string;
  minStay: number;
  status: RateStatus;
  holidaySurcharge: { enabled: boolean; percent: number; note: string };
  childCharges: { ageFrom: number; ageTo: number; charge: string }[];
  extraBedChargeIdr: number;
  inclusions: string[];
  supplements: { name: string; charge: string }[];
  updatedAt: string;
  updatedBy: string;
}

export interface Agent {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: AgentStatus;
  registeredAt: string;
  lastActivity: string;
  quotations: number;
}

export interface ContractImport {
  id: string;
  fileName: string;
  fileSizeKb: number;
  supplier: string;
  uploadedAt: string;
  status: "extracting" | "review" | "issues" | "ready" | "imported";
  progress: number;
  confidence: { field: string; label: string; value: string; confidence: number }[];
  warnings: { id: string; severity: "high" | "medium" | "low"; title: string; detail: string }[];
  rates: {
    id: string;
    room: string;
    season: string;
    dates: string;
    netIdr: number;
    flag: "ok" | "uncertain" | "conflict" | "missing";
    note?: string;
  }[];
}

export interface RateHistoryEntry {
  id: string;
  at: string;
  actor: string;
  hotelId: string;
  roomId: string;
  type: "rate" | "season" | "validity" | "fx" | "markup" | "surcharge";
  field: string;
  previous: string;
  updated: string;
}

export interface Notification {
  id: string;
  kind: "contract" | "agent" | "rate" | "system";
  title: string;
  detail: string;
  at: string;
  read: boolean;
}

export interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface QuotationBreakdownLine {
  label: string;
  detail?: string;
  amount: number; // USD, negative = discount
}

export interface Quotation {
  id: string;
  ref: string; // demo reference
  hotelId: string;
  hotelName: string;
  destination: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number[];
  extraBeds: number;
  status: "draft" | "shared";
  createdAt: string;
  validUntil: string;
  breakdown: QuotationBreakdownLine[];
  total: number; // USD — mock selling price, internally consistent with breakdown
}

export interface PortalSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  defaultCurrency: "USD";
  idrPerUsd: number;
  fxUpdatedAt: string;
  defaultMarkupPercent: number;
  rounding: "none" | "up-0.5" | "up-1" | "nearest-1";
  quotationValidityDays: number;
  dateFormat: "d MMM yyyy" | "yyyy-MM-dd" | "MM/dd/yyyy";
  timezone: string;
  defaultMinStay: number;
  defaultChildAgeMax: number;
  agentPortal: { showTaxes: boolean; showInclusions: boolean; showValidity: boolean };
  notifications: { newAgent: boolean; contractImported: boolean; rateExpiring: boolean; weeklyDigest: boolean };
  importPrefs: { autoExtract: boolean; requireReview: boolean; duplicateStrategy: "flag" | "overwrite" | "skip" };
}

/* ------------------------------------------------------------------ */
/* Hotels                                                              */
/* ------------------------------------------------------------------ */

export const hotels: Hotel[] = [
  {
    id: "htl-001",
    name: "Nusa Dua Beachfront Resort & Spa",
    destination: "Nusa Dua, Bali",
    country: "Indonesia",
    address: "Jl. Pantai Mengiat No. 9, Nusa Dua",
    category: 5,
    status: "active",
    description:
      "A refined beachfront resort set across 11 hectares of tropical gardens on the golden sands of Nusa Dua. Features three lagoon pools, a destination spa, and six dining venues ranging from beachfront grills to fine Indonesian cuisine.",
    amenities: ["Free WiFi", "3 outdoor pools", "Spa & wellness centre", "Fitness centre", "6 restaurants & bars", "Kids club", "Airport shuttle", "Beach access"],
    inclusions: ["Daily breakfast", "Welcome drink", "Free WiFi", "Bottled water daily"],
    policies: {
      checkIn: "From 14:00",
      checkOut: "Until 12:00",
      cancellation: "Free cancellation up to 7 days before check-in. 1-night charge thereafter.",
      children: "Children under 12 stay free when sharing existing bedding.",
      extraBed: "Extra bed available at IDR 450,000/night including breakfast.",
    },
    lastUpdated: "2026-10-18",
    updatedBy: "Amelia R.",
    imageHue: 210,
  },
  {
    id: "htl-002",
    name: "Ubud Valley Boutique Retreat",
    destination: "Ubud, Bali",
    country: "Indonesia",
    address: "Jl. Raya Sanggingan, Campuhan",
    category: 4,
    status: "active",
    description:
      "An intimate 42-key retreat perched above the Campuhan ridge. Balinese-style suites with private balconies, an infinity pool facing the valley, and a yoga pavilion surrounded by rice terraces.",
    amenities: ["Free WiFi", "Infinity pool", "Yoga pavilion", "Spa services", "Restaurant", "Free parking", "Rice-terrace views"],
    inclusions: ["Daily breakfast", "Afternoon tea", "Free WiFi", "Daily yoga class"],
    policies: {
      checkIn: "From 14:00",
      checkOut: "Until 12:00",
      cancellation: "Free cancellation up to 5 days before check-in.",
      children: "Children of all ages welcome; under 5 stay free.",
      extraBed: "Extra bed available at IDR 350,000/night.",
    },
    lastUpdated: "2026-10-14",
    updatedBy: "Dimas P.",
    imageHue: 130,
  },
  {
    id: "htl-003",
    name: "Seminyak Sunset Villas",
    destination: "Seminyak, Bali",
    country: "Indonesia",
    address: "Jl. Kayu Aya, Seminyak",
    category: 5,
    status: "active",
    description:
      "Private pool villas minutes from Seminyak beach and its celebrated dining scene. Each villa features a plunge pool, open-air living pavilion, and dedicated butler service.",
    amenities: ["Private pool", "Free WiFi", "Butler service", "In-villa dining", "Spa", "Free parking"],
    inclusions: ["Daily breakfast", "One-hour spa credit per stay", "Free WiFi", "Daily fruit basket"],
    policies: {
      checkIn: "From 15:00",
      checkOut: "Until 12:00",
      cancellation: "Free cancellation up to 14 days before check-in.",
      children: "Suitable for ages 12 and above; younger children on request.",
      extraBed: "Extra bed available at IDR 550,000/night.",
    },
    lastUpdated: "2026-10-21",
    updatedBy: "Amelia R.",
    imageHue: 25,
  },
  {
    id: "htl-004",
    name: "Uluwatu Clifftop Hideaway",
    destination: "Uluwatu, Bali",
    country: "Indonesia",
    address: "Jl. Labuansait, Pecatu",
    category: 5,
    status: "draft",
    description:
      "A dramatic clifftop resort overlooking the Indian Ocean, 20 minutes from Uluwatu Temple. Suites feature floor-to-ceiling ocean views, and the infinity pool appears to spill over the 70-metre cliff edge.",
    amenities: ["Free WiFi", "Clifftop infinity pool", "Fitness centre", "Two restaurants", "Spa", "Free parking"],
    inclusions: ["Daily breakfast", "Free WiFi", "Sunset mocktail"],
    policies: {
      checkIn: "From 14:00",
      checkOut: "Until 12:00",
      cancellation: "Free cancellation up to 10 days before check-in.",
      children: "Children under 12 stay free with existing bedding.",
      extraBed: "Extra bed available at IDR 500,000/night.",
    },
    lastUpdated: "2026-10-09",
    updatedBy: "Sari W.",
    imageHue: 195,
  },
  {
    id: "htl-005",
    name: "Canggu Surf Lodge",
    destination: "Canggu, Bali",
    country: "Indonesia",
    address: "Jl. Pantai Batu Bolong, Canggu",
    category: 3,
    status: "active",
    description:
      "A laid-back surf lodge a short walk from Batu Bolong beach. Bright rooms, a co-working deck, boards to borrow, and a buzzing smoothie bar popular with digital nomads and young travellers.",
    amenities: ["Free WiFi", "Pool", "Surfboard hire", "Co-working space", "Café & smoothie bar", "Scooter rental"],
    inclusions: ["Daily breakfast", "Free WiFi", "Surfboard hire (2 hours daily)"],
    policies: {
      checkIn: "From 13:00",
      checkOut: "Until 11:00",
      cancellation: "Free cancellation up to 3 days before check-in.",
      children: "Families welcome; children under 6 stay free.",
      extraBed: "Extra bed available at IDR 250,000/night.",
    },
    lastUpdated: "2026-09-30",
    updatedBy: "Dimas P.",
    imageHue: 25,
  },
  {
    id: "htl-006",
    name: "Jimbaran Bay Resort",
    destination: "Jimbaran, Bali",
    country: "Indonesia",
    address: "Jl. Bukit Permai, Jimbaran",
    category: 4,
    status: "active",
    description:
      "Family-friendly resort directly on Jimbaran Bay, famous for its sunset seafood dinners on the sand. Two pools, a kids club, and spacious rooms with balcony daybeds.",
    amenities: ["Free WiFi", "2 pools", "Kids club", "Beachfront dining", "Spa", "Airport shuttle"],
    inclusions: ["Daily breakfast", "Free WiFi", "Kids-eat-free (dinner)"],
    policies: {
      checkIn: "From 14:00",
      checkOut: "Until 12:00",
      cancellation: "Free cancellation up to 7 days before check-in.",
      children: "Children under 12 stay and eat breakfast free.",
      extraBed: "Extra bed available at IDR 400,000/night.",
    },
    lastUpdated: "2026-10-12",
    updatedBy: "Sari W.",
    imageHue: 15,
  },
  {
    id: "htl-007",
    name: "Sanur Harbourfront Hotel",
    destination: "Sanur, Bali",
    country: "Indonesia",
    address: "Jl. Danau Tamblingan, Sanur",
    category: 4,
    status: "inactive",
    description:
      "Comfortable mid-range hotel on Sanur's boardwalk, popular as a gateway to Nusa Penida. Quiet gardens, a large pool, and easy morning-boat access for island-hopping itineraries.",
    amenities: ["Free WiFi", "Pool", "Restaurant", "Bike hire", "Tour desk"],
    inclusions: ["Daily breakfast", "Free WiFi"],
    policies: {
      checkIn: "From 14:00",
      checkOut: "Until 12:00",
      cancellation: "Free cancellation up to 5 days before check-in.",
      children: "Children under 11 stay free with existing bedding.",
      extraBed: "Extra bed available at IDR 300,000/night.",
    },
    lastUpdated: "2026-08-22",
    updatedBy: "Amelia R.",
    imageHue: 185,
  },
  {
    id: "htl-008",
    name: "Amed Dive & Stay",
    destination: "Amed, Bali",
    country: "Indonesia",
    address: "Jl. Raya Amed, Bunutan",
    category: 3,
    status: "active",
    description:
      "Simple, friendly dive resort on Amed's black-sand coast with an on-site PADI centre. Ocean-view bungalows and a house reef teeming with coral just steps from the deck.",
    amenities: ["Free WiFi", "Dive centre", "Pool", "Restaurant", "Snorkel gear"],
    inclusions: ["Daily breakfast", "Free WiFi", "Snorkel gear hire"],
    policies: {
      checkIn: "From 13:00",
      checkOut: "Until 11:00",
      cancellation: "Free cancellation up to 4 days before check-in.",
      children: "Children welcome; under 7 stay free.",
      extraBed: "Extra bed available at IDR 200,000/night.",
    },
    lastUpdated: "2026-10-05",
    updatedBy: "Dimas P.",
    imageHue: 240,
  },
];

/* ------------------------------------------------------------------ */
/* Room types                                                          */
/* ------------------------------------------------------------------ */

export const roomTypes: RoomType[] = [
  {
    id: "rtm-001",
    hotelId: "htl-001",
    name: "Deluxe Garden Room",
    description: "Ground-floor room opening onto tropical gardens with a private terrace and outdoor daybed.",
    sizeSqm: 48,
    bedType: "King or 2 twins",
    standardOccupancy: { adults: 2, children: 1 },
    maxOccupancy: { adults: 3, children: 2, total: 4 },
    extraBedEligible: true,
    maxExtraBeds: 1,
    amenities: ["Rain shower", "Mini bar", "Safe", "Nespresso machine", "Smart TV"],
    meals: "Breakfast included",
    childPolicy: "Children under 12 stay free using existing bedding; ages 0–3.99 stay free including breakfast.",
    extraBedPolicy: "One extra bed permitted; IDR 450,000/night including breakfast.",
  },
  {
    id: "rtm-002",
    hotelId: "htl-001",
    name: "Ocean View Suite",
    description: "Corner suite with panoramic Indian Ocean views, separate living area, and a double vanity bathroom.",
    sizeSqm: 72,
    bedType: "King",
    standardOccupancy: { adults: 2, children: 2 },
    maxOccupancy: { adults: 3, children: 2, total: 4 },
    extraBedEligible: true,
    maxExtraBeds: 1,
    amenities: ["Living area", "Bathtub & rain shower", "Mini bar", "Espresso machine", "Club lounge access"],
    meals: "Breakfast + evening canapés",
    childPolicy: "Children under 12 stay free with existing bedding.",
    extraBedPolicy: "One extra bed permitted; IDR 450,000/night including breakfast.",
  },
  {
    id: "rtm-003",
    hotelId: "htl-002",
    name: "Ridge View Deluxe",
    description: "Upper-floor room with a private balcony overlooking the Campuhan valley and rice terraces.",
    sizeSqm: 40,
    bedType: "King or 2 twins",
    standardOccupancy: { adults: 2, children: 1 },
    maxOccupancy: { adults: 2, children: 2, total: 3 },
    extraBedEligible: false,
    maxExtraBeds: 0,
    amenities: ["Balcony", "Rain shower", "Mini bar", "Yoga mat in room"],
    meals: "Breakfast included",
    childPolicy: "Children under 5 stay free; extra child without bed charged 25% of room rate.",
    extraBedPolicy: "Not eligible for extra beds.",
  },
  {
    id: "rtm-004",
    hotelId: "htl-002",
    name: "Valley Pool Villa",
    description: "Standalone villa with private plunge pool, sun deck, and open-air shower among the treetops.",
    sizeSqm: 85,
    bedType: "King",
    standardOccupancy: { adults: 2, children: 1 },
    maxOccupancy: { adults: 2, children: 2, total: 3 },
    extraBedEligible: true,
    maxExtraBeds: 1,
    amenities: ["Private plunge pool", "Outdoor shower", "Bathtub", "Mini bar", "Bose speaker"],
    meals: "Breakfast included",
    childPolicy: "One child under 12 free with existing bedding.",
    extraBedPolicy: "One extra bed permitted; IDR 350,000/night.",
  },
  {
    id: "rtm-005",
    hotelId: "htl-003",
    name: "One-Bedroom Pool Villa",
    description: "Private walled villa with 8-metre pool, outdoor living pavilion, and butler service.",
    sizeSqm: 180,
    bedType: "King",
    standardOccupancy: { adults: 2, children: 0 },
    maxOccupancy: { adults: 3, children: 1, total: 4 },
    extraBedEligible: true,
    maxExtraBeds: 1,
    amenities: ["Private pool", "Butler service", "Kitchenette", "Outdoor bath", "Bose speaker"],
    meals: "Breakfast included",
    childPolicy: "Ages 12+ only unless the villa is booked as family-exclusive (on request).",
    extraBedPolicy: "One extra bed permitted; IDR 550,000/night.",
  },
  {
    id: "rtm-006",
    hotelId: "htl-003",
    name: "Two-Bedroom Residence Villa",
    description: "Expansive two-bedroom residence with a 15-metre pool, chef's kitchen, and private gym.",
    sizeSqm: 340,
    bedType: "2 × King",
    standardOccupancy: { adults: 4, children: 2 },
    maxOccupancy: { adults: 6, children: 2, total: 8 },
    extraBedEligible: true,
    maxExtraBeds: 2,
    amenities: ["15 m private pool", "Chef's kitchen", "Private gym", "Butler service", "Car with driver (8 h/day)"],
    meals: "Breakfast included",
    childPolicy: "Children under 12 stay free; babysitting available on request.",
    extraBedPolicy: "Up to two extra beds; IDR 550,000/night each.",
  },
  {
    id: "rtm-007",
    hotelId: "htl-005",
    name: "Garden Standard",
    description: "Bright, simple room with garden outlook and patio hammock.",
    sizeSqm: 26,
    bedType: "Queen",
    standardOccupancy: { adults: 2, children: 0 },
    maxOccupancy: { adults: 2, children: 1, total: 2 },
    extraBedEligible: false,
    maxExtraBeds: 0,
    amenities: ["Rain shower", "Fan + AC", "Lockers"],
    meals: "Breakfast included",
    childPolicy: "Children under 6 stay free sharing existing bedding.",
    extraBedPolicy: "Not eligible for extra beds.",
  },
  {
    id: "rtm-008",
    hotelId: "htl-006",
    name: "Family Bay View Room",
    description: "Connecting-style family room with two queen beds and a balcony over Jimbaran Bay.",
    sizeSqm: 56,
    bedType: "2 × Queen",
    standardOccupancy: { adults: 2, children: 3 },
    maxOccupancy: { adults: 4, children: 3, total: 5 },
    extraBedEligible: false,
    maxExtraBeds: 0,
    amenities: ["Balcony", "Mini fridge", "Kids amenities", "Smart TV"],
    meals: "Breakfast included",
    childPolicy: "Children under 12 stay and dine (breakfast) free.",
    extraBedPolicy: "Room configuration suits families; no extra beds needed.",
  },
  {
    id: "rtm-009",
    hotelId: "htl-008",
    name: "Ocean Bungalow",
    description: "Traditional bungalow with four-poster bed and veranda steps from the house reef.",
    sizeSqm: 32,
    bedType: "Queen",
    standardOccupancy: { adults: 2, children: 1 },
    maxOccupancy: { adults: 2, children: 1, total: 3 },
    extraBedEligible: true,
    maxExtraBeds: 1,
    amenities: ["Veranda", "Outdoor shower", "Snorkel kit"],
    meals: "Breakfast + dinner included",
    childPolicy: "Children under 7 stay free.",
    extraBedPolicy: "One extra bed permitted; IDR 200,000/night.",
  },
];

/* ------------------------------------------------------------------ */
/* Seasonal supplier rates (ADMIN ONLY — never render in agent portal) */
/* ------------------------------------------------------------------ */

export const seasonalRates: SeasonalRate[] = [
  {
    id: "rate-001",
    hotelId: "htl-001",
    roomId: "rtm-001",
    seasonName: "Low Season",
    startDate: "2026-01-11",
    endDate: "2026-06-30",
    netRateIdr: 1925000,
    validityFrom: "2026-01-01",
    validityTo: "2026-06-30",
    minStay: 2,
    status: "expired",
    holidaySurcharge: { enabled: false, percent: 0, note: "" },
    childCharges: [
      { ageFrom: 0, ageTo: 3.99, charge: "Free" },
      { ageFrom: 4, ageTo: 11.99, charge: "IDR 250,000/night incl. breakfast" },
      { ageFrom: 12, ageTo: 99, charge: "Adult rate (extra bed)" },
    ],
    extraBedChargeIdr: 450000,
    inclusions: ["Daily breakfast", "Welcome drink"],
    supplements: [{ name: "Peak dinner (Dec 24 & 31)", charge: "IDR 850,000/person" }],
    updatedAt: "2026-09-02",
    updatedBy: "Amelia R.",
  },
  {
    id: "rate-002",
    hotelId: "htl-001",
    roomId: "rtm-001",
    seasonName: "High Season",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    netRateIdr: 2640000,
    validityFrom: "2026-07-01",
    validityTo: "2026-08-31",
    minStay: 3,
    status: "expired",
    holidaySurcharge: { enabled: false, percent: 0, note: "" },
    childCharges: [
      { ageFrom: 0, ageTo: 3.99, charge: "Free" },
      { ageFrom: 4, ageTo: 11.99, charge: "IDR 300,000/night incl. breakfast" },
    ],
    extraBedChargeIdr: 450000,
    inclusions: ["Daily breakfast", "Welcome drink"],
    supplements: [],
    updatedAt: "2026-09-02",
    updatedBy: "Amelia R.",
  },
  {
    id: "rate-003",
    hotelId: "htl-001",
    roomId: "rtm-001",
    seasonName: "Green Season 2027",
    startDate: "2027-01-10",
    endDate: "2027-03-31",
    netRateIdr: 2050000,
    validityFrom: "2026-11-01",
    validityTo: "2027-03-31",
    minStay: 2,
    status: "valid",
    holidaySurcharge: { enabled: true, percent: 21, note: "Applies Mar 28–31 (Nyepi week)" },
    childCharges: [
      { ageFrom: 0, ageTo: 3.99, charge: "Free" },
      { ageFrom: 4, ageTo: 11.99, charge: "IDR 275,000/night incl. breakfast" },
    ],
    extraBedChargeIdr: 475000,
    inclusions: ["Daily breakfast", "Welcome drink", "1× 60-min spa credit per stay"],
    supplements: [{ name: "Nyepi full-board (compulsory)", charge: "IDR 950,000/person" }],
    updatedAt: "2026-10-18",
    updatedBy: "Amelia R.",
  },
  {
    id: "rate-004",
    hotelId: "htl-001",
    roomId: "rtm-002",
    seasonName: "Green Season 2027",
    startDate: "2027-01-10",
    endDate: "2027-03-31",
    netRateIdr: 3350000,
    validityFrom: "2026-11-01",
    validityTo: "2027-03-31",
    minStay: 2,
    status: "valid",
    holidaySurcharge: { enabled: true, percent: 21, note: "Applies Mar 28–31 (Nyepi week)" },
    childCharges: [
      { ageFrom: 0, ageTo: 5.99, charge: "Free" },
      { ageFrom: 6, ageTo: 11.99, charge: "IDR 350,000/night" },
    ],
    extraBedChargeIdr: 475000,
    inclusions: ["Daily breakfast", "Evening canapés", "Club lounge access"],
    supplements: [],
    updatedAt: "2026-10-18",
    updatedBy: "Amelia R.",
  },
  {
    id: "rate-005",
    hotelId: "htl-002",
    roomId: "rtm-003",
    seasonName: "Shoulder 2026–27",
    startDate: "2026-10-01",
    endDate: "2026-12-19",
    netRateIdr: 1450000,
    validityFrom: "2026-10-01",
    validityTo: "2026-12-19",
    minStay: 2,
    status: "valid",
    holidaySurcharge: { enabled: true, percent: 18, note: "Dec 24 & 31 compulsory gala dinner" },
    childCharges: [
      { ageFrom: 0, ageTo: 4.99, charge: "Free" },
      { ageFrom: 5, ageTo: 11.99, charge: "25% of room rate (no bed)" },
    ],
    extraBedChargeIdr: 0,
    inclusions: ["Daily breakfast", "Afternoon tea", "Daily yoga"],
    supplements: [{ name: "Gala dinner Dec 24 / 31", charge: "IDR 700,000/person" }],
    updatedAt: "2026-10-14",
    updatedBy: "Dimas P.",
  },
  {
    id: "rate-006",
    hotelId: "htl-002",
    roomId: "rtm-004",
    seasonName: "Shoulder 2026–27",
    startDate: "2026-10-01",
    endDate: "2026-12-19",
    netRateIdr: 2780000,
    validityFrom: "2026-10-01",
    validityTo: "2026-12-19",
    minStay: 2,
    status: "conflict",
    holidaySurcharge: { enabled: true, percent: 18, note: "Overlaps with 'Festive Peak' season in contract B" },
    childCharges: [{ ageFrom: 0, ageTo: 11.99, charge: "One child under 12 free" }],
    extraBedChargeIdr: 350000,
    inclusions: ["Daily breakfast", "Afternoon tea"],
    supplements: [],
    updatedAt: "2026-10-14",
    updatedBy: "Dimas P.",
  },
  {
    id: "rate-007",
    hotelId: "htl-003",
    roomId: "rtm-005",
    seasonName: "Low 2026–27",
    startDate: "2026-11-01",
    endDate: "2027-03-31",
    netRateIdr: 4900000,
    validityFrom: "2026-11-01",
    validityTo: "2027-03-31",
    minStay: 3,
    status: "valid",
    holidaySurcharge: { enabled: false, percent: 0, note: "" },
    childCharges: [{ ageFrom: 0, ageTo: 11.99, charge: "Not permitted (adults-only villa)" }],
    extraBedChargeIdr: 550000,
    inclusions: ["Daily breakfast", "1-hour spa credit", "Return airport transfer"],
    supplements: [{ name: "Romantic dinner setup", charge: "IDR 1,200,000/couple" }],
    updatedAt: "2026-10-21",
    updatedBy: "Amelia R.",
  },
  {
    id: "rate-008",
    hotelId: "htl-003",
    roomId: "rtm-006",
    seasonName: "Low 2026–27",
    startDate: "2026-11-01",
    endDate: "2027-03-31",
    netRateIdr: 8750000,
    validityFrom: "2026-11-01",
    validityTo: "2027-03-31",
    minStay: 3,
    status: "incomplete",
    holidaySurcharge: { enabled: false, percent: 0, note: "" },
    childCharges: [{ ageFrom: 0, ageTo: 11.99, charge: "Under 12 free" }],
    extraBedChargeIdr: 550000,
    inclusions: ["Daily breakfast", "Car with driver 8 h/day"],
    supplements: [],
    updatedAt: "2026-10-21",
    updatedBy: "Amelia R.",
  },
  {
    id: "rate-009",
    hotelId: "htl-005",
    roomId: "rtm-007",
    seasonName: "Year-round 2026–27",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    netRateIdr: 780000,
    validityFrom: "2026-09-01",
    validityTo: "2027-08-31",
    minStay: 1,
    status: "valid",
    holidaySurcharge: { enabled: false, percent: 0, note: "" },
    childCharges: [{ ageFrom: 0, ageTo: 5.99, charge: "Free" }],
    extraBedChargeIdr: 0,
    inclusions: ["Daily breakfast", "Surfboard hire 2 h/day"],
    supplements: [],
    updatedAt: "2026-09-30",
    updatedBy: "Dimas P.",
  },
  {
    id: "rate-010",
    hotelId: "htl-006",
    roomId: "rtm-008",
    seasonName: "Low 2026–27",
    startDate: "2026-10-01",
    endDate: "2026-12-18",
    netRateIdr: 1680000,
    validityFrom: "2026-10-01",
    validityTo: "2026-12-18",
    minStay: 2,
    status: "expiring",
    holidaySurcharge: { enabled: true, percent: 25, note: "Dec 24 & 31 gala dinner compulsory" },
    childCharges: [{ ageFrom: 0, ageTo: 11.99, charge: "Free (breakfast & dinner)" }],
    extraBedChargeIdr: 400000,
    inclusions: ["Daily breakfast", "Kids-eat-free dinner"],
    supplements: [{ name: "Gala dinner", charge: "IDR 650,000/person" }],
    updatedAt: "2026-10-12",
    updatedBy: "Sari W.",
  },
  {
    id: "rate-011",
    hotelId: "htl-008",
    roomId: "rtm-009",
    seasonName: "Year-round 2026–27",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    netRateIdr: 920000,
    validityFrom: "2026-09-01",
    validityTo: "2027-08-31",
    minStay: 1,
    status: "valid",
    holidaySurcharge: { enabled: false, percent: 0, note: "" },
    childCharges: [{ ageFrom: 0, ageTo: 6.99, charge: "Free" }],
    extraBedChargeIdr: 200000,
    inclusions: ["Breakfast & dinner", "Snorkel gear"],
    supplements: [{ name: "Discover scuba intro dive", charge: "IDR 750,000/person" }],
    updatedAt: "2026-10-05",
    updatedBy: "Dimas P.",
  },
];

/* ------------------------------------------------------------------ */
/* Agents                                                              */
/* ------------------------------------------------------------------ */

export const agents: Agent[] = [
  { id: "agt-001", name: "Hana Kobayashi", company: "Sakura Travels", email: "hana@sakuratravels.jp", phone: "+81 3 6811 2400", city: "Tokyo", country: "Japan", status: "active", registeredAt: "2026-03-04", lastActivity: "2026-10-25", quotations: 42 },
  { id: "agt-002", name: "Tom Baker", company: "Outback Journeys", email: "tom@outbackjourneys.com.au", phone: "+61 2 8014 3367", city: "Sydney", country: "Australia", status: "active", registeredAt: "2026-01-19", lastActivity: "2026-10-24", quotations: 67 },
  { id: "agt-003", name: "Lena Hoffmann", company: "Globus Tours GmbH", email: "l.hoffmann@globustours.de", phone: "+49 30 2009 5521", city: "Berlin", country: "Germany", status: "active", registeredAt: "2026-05-12", lastActivity: "2026-10-22", quotations: 23 },
  { id: "agt-004", name: "Priya Nair", company: "Jelajah Wisata", email: "priya@jelajahwisata.id", phone: "+62 21 5088 7712", city: "Jakarta", country: "Indonesia", status: "pending", registeredAt: "2026-10-23", lastActivity: "2026-10-23", quotations: 0 },
  { id: "agt-005", name: "Marcus Chen", company: "Pacific Horizons Travel", email: "marcus@pacifichorizons.com", phone: "+1 213 555 0184", city: "Los Angeles", country: "United States", status: "pending", registeredAt: "2026-10-25", lastActivity: "2026-10-25", quotations: 0 },
  { id: "agt-006", name: "Sofia Rossi", company: "Casa Viaggi", email: "sofia@casaviaggi.it", phone: "+39 06 4520 8890", city: "Rome", country: "Italy", status: "active", registeredAt: "2026-06-30", lastActivity: "2026-10-20", quotations: 31 },
  { id: "agt-007", name: "James Wright", company: "Wanderlust Co.", email: "james@wanderlustco.uk", phone: "+44 20 7946 0221", city: "London", country: "United Kingdom", status: "deactivated", registeredAt: "2025-11-08", lastActivity: "2026-07-14", quotations: 89 },
  { id: "agt-008", name: "Ayu Lestari", company: "Bali Connected DMC", email: "ayu@baliconnected.id", phone: "+62 361 209 445", city: "Denpasar", country: "Indonesia", status: "active", registeredAt: "2026-02-27", lastActivity: "2026-10-26", quotations: 118 },
];

/* ------------------------------------------------------------------ */
/* Contract imports (AI extraction demo)                               */
/* ------------------------------------------------------------------ */

export const contractImports: ContractImport[] = [
  {
    id: "imp-001",
    fileName: "Nusa-Dua-Beachfront-Rates-2027.pdf",
    fileSizeKb: 2418,
    supplier: "PT Nusa Dua Hospitality",
    uploadedAt: "2026-10-26T09:14:00",
    status: "issues",
    progress: 100,
    confidence: [
      { field: "Hotel name", label: "Hotel name", value: "Nusa Dua Beachfront Resort & Spa", confidence: 0.98 },
      { field: "Destination", label: "Destination", value: "Nusa Dua, Bali, Indonesia", confidence: 0.97 },
      { field: "Currency", label: "Currency", value: "IDR", confidence: 0.99 },
      { field: "Validity", label: "Contract validity", value: "01 Nov 2026 – 31 Mar 2028", confidence: 0.91 },
      { field: "Child policy", label: "Child policy", value: "Under 12 free with existing bedding", confidence: 0.62 },
    ],
    warnings: [
      { id: "w1", severity: "high", title: "Currency mismatch", detail: "Season 'Festive Peak' appears to be quoted in USD while the rest of the document is IDR." },
      { id: "w2", severity: "medium", title: "Unclear child policy", detail: "The child-policy sentence on page 4 is partially illegible in the scan. Extracted value needs confirmation." },
      { id: "w3", severity: "medium", title: "Overlapping season dates", detail: "'High Season' (Jul 1 – Aug 31) overlaps an existing season for Deluxe Garden Room." },
    ],
    rates: [
      { id: "xr1", room: "Deluxe Garden Room", season: "Low 2027", dates: "11 Jan – 31 Mar 2027", netIdr: 2050000, flag: "ok" },
      { id: "xr2", room: "Deluxe Garden Room", season: "High 2027", dates: "01 Jul – 31 Aug 2027", netIdr: 2745000, flag: "conflict", note: "Overlaps existing High Season — existing rate IDR 2,640,000" },
      { id: "xr3", room: "Ocean View Suite", season: "Low 2027", dates: "11 Jan – 31 Mar 2027", netIdr: 3390000, flag: "ok" },
      { id: "xr4", room: "Ocean View Suite", season: "Festive Peak", dates: "20 Dec 2027 – 05 Jan 2028", netIdr: 455, flag: "uncertain", note: "Quoted in USD (455 USD?) — confirm currency with supplier" },
      { id: "xr5", room: "Family Suite", season: "Low 2027", dates: "11 Jan – 31 Mar 2027", netIdr: 0, flag: "missing", note: "Rate table row is empty in source PDF" },
    ],
  },
  {
    id: "imp-002",
    fileName: "Ubud-Valley-Contract-2027.pdf",
    fileSizeKb: 1742,
    supplier: "Ubud Valley Retreats",
    uploadedAt: "2026-10-25T15:41:00",
    status: "ready",
    progress: 100,
    confidence: [
      { field: "Hotel name", label: "Hotel name", value: "Ubud Valley Boutique Retreat", confidence: 0.99 },
      { field: "Currency", label: "Currency", value: "IDR", confidence: 0.99 },
      { field: "Validity", label: "Contract validity", value: "01 Apr 2027 – 31 Mar 2028", confidence: 0.95 },
    ],
    warnings: [],
    rates: [
      { id: "xr6", room: "Ridge View Deluxe", season: "Low 2027–28", dates: "01 Apr – 30 Jun 2027", netIdr: 1490000, flag: "ok" },
      { id: "xr7", room: "Valley Pool Villa", season: "Low 2027–28", dates: "01 Apr – 30 Jun 2027", netIdr: 2850000, flag: "ok" },
    ],
  },
  {
    id: "imp-003",
    fileName: "Seminyak-Sunset-Villas-All-Seasons.pdf",
    fileSizeKb: 3204,
    supplier: "Seminyak Villa Collection",
    uploadedAt: "2026-10-24T11:02:00",
    status: "review",
    progress: 100,
    confidence: [
      { field: "Hotel name", label: "Hotel name", value: "Seminyak Sunset Villas", confidence: 0.96 },
      { field: "Currency", label: "Currency", value: "IDR", confidence: 0.98 },
    ],
    warnings: [
      { id: "w4", severity: "low", title: "Extra-bed charge formatting", detail: "Extra-bed charge formatted as '550k' — interpreted as IDR 550,000." },
    ],
    rates: [
      { id: "xr8", room: "One-Bedroom Pool Villa", season: "Low 2027", dates: "01 Nov 2027 – 31 Mar 2028", netIdr: 4950000, flag: "ok" },
      { id: "xr9", room: "Two-Bedroom Residence Villa", season: "Low 2027", dates: "01 Nov 2027 – 31 Mar 2028", netIdr: 8800000, flag: "ok" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Rate history (audit)                                                */
/* ------------------------------------------------------------------ */

export const rateHistory: RateHistoryEntry[] = [
  { id: "rh-01", at: "2026-10-21 16:40", actor: "Amelia R.", hotelId: "htl-003", roomId: "rtm-005", type: "rate", field: "Net rate (Low 2026–27)", previous: "IDR 4,750,000", updated: "IDR 4,900,000" },
  { id: "rh-02", at: "2026-10-21 16:38", actor: "Amelia R.", hotelId: "htl-003", roomId: "rtm-006", type: "rate", field: "Net rate (Low 2026–27)", previous: "IDR 8,500,000", updated: "IDR 8,750,000" },
  { id: "rh-03", at: "2026-10-20 09:12", actor: "System (FX sync)", hotelId: "", roomId: "", type: "fx", field: "IDR per USD", previous: "16,420", updated: "16,395" },
  { id: "rh-04", at: "2026-10-18 14:05", actor: "Amelia R.", hotelId: "htl-001", roomId: "rtm-001", type: "rate", field: "Net rate (Green Season 2027)", previous: "1,980,000", updated: "2,050,000" },
  { id: "rh-05", at: "2026-10-18 13:58", actor: "Amelia R.", hotelId: "htl-001", roomId: "rtm-001", type: "surcharge", field: "Holiday surcharge (Green Season 2027)", previous: "18%", updated: "21%" },
  { id: "rh-06", at: "2026-10-18 13:55", actor: "Amelia R.", hotelId: "htl-001", roomId: "rtm-002", type: "validity", field: "Rate validity (Green Season 2027)", previous: "01 Dec 2026 – 31 Mar 2027", updated: "01 Nov 2026 – 31 Mar 2027" },
  { id: "rh-07", at: "2026-10-14 11:22", actor: "Dimas P.", hotelId: "htl-002", roomId: "rtm-003", type: "season", field: "Season dates (Shoulder)", previous: "01 Oct – 15 Dec 2026", updated: "01 Oct – 19 Dec 2026" },
  { id: "rh-08", at: "2026-10-12 08:47", actor: "Sari W.", hotelId: "htl-006", roomId: "rtm-008", type: "rate", field: "Net rate (Low 2026–27)", previous: "1,720,000", updated: "1,680,000" },
  { id: "rh-09", at: "2026-10-06 15:31", actor: "Dimas P.", hotelId: "htl-005", roomId: "rtm-007", type: "markup", field: "Default markup", previous: "18%", updated: "20%" },
  { id: "rh-10", at: "2026-10-05 10:19", actor: "Dimas P.", hotelId: "htl-008", roomId: "rtm-009", type: "rate", field: "Net rate (Year-round)", previous: "885,000", updated: "920,000" },
  { id: "rh-11", at: "2026-09-30 09:02", actor: "System (FX sync)", hotelId: "", roomId: "", type: "fx", field: "IDR per USD", previous: "16,450", updated: "16,420" },
  { id: "rh-12", at: "2026-09-02 13:44", actor: "Amelia R.", hotelId: "htl-001", roomId: "rtm-001", type: "season", field: "Season dates (High Season)", previous: "01 Jul – 15 Aug", updated: "01 Jul – 31 Aug" },
];

/* ------------------------------------------------------------------ */
/* Notifications + activity (mock)                                     */
/* ------------------------------------------------------------------ */

export const notifications: Notification[] = [
  { id: "n1", kind: "contract", title: "Contract import needs review", detail: "Nusa-Dua-Beachfront-Rates-2027.pdf finished extracting with 3 warnings.", at: "12 min ago", read: false },
  { id: "n2", kind: "agent", title: "New agent registration", detail: "Pacific Horizons Travel (Los Angeles) is awaiting approval.", at: "1 h ago", read: false },
  { id: "n3", kind: "rate", title: "Rates expiring soon", detail: "Jimbaran Bay Resort — Family Bay View Room rates expire 18 Dec 2026.", at: "3 h ago", read: false },
  { id: "n4", kind: "rate", title: "Rate conflict detected", detail: "Ubud Valley Boutique Retreat — Valley Pool Villa has overlapping seasons.", at: "2 d ago", read: true },
  { id: "n5", kind: "system", title: "Weekly digest ready", detail: "Your weekly portal activity summary is available in Settings.", at: "5 d ago", read: true },
];

export const recentActivity: Activity[] = [
  { id: "a1", actor: "Hana Kobayashi", action: "created quotation", target: "BLG-Q-2418 · Ubud Valley Boutique Retreat", at: "25 Oct, 16:32" },
  { id: "a2", actor: "Amelia R.", action: "updated rates for", target: "Seminyak Sunset Villas · 1BR Pool Villa", at: "25 Oct, 14:05" },
  { id: "a3", actor: "Tom Baker", action: "shared quotation", target: "BLG-Q-2401 · Nusa Dua Beachfront Resort", at: "24 Oct, 09:48" },
  { id: "a4", actor: "Dimas P.", action: "resolved warning on import", target: "Ubud-Valley-Contract-2027.pdf", at: "23 Oct, 17:20" },
  { id: "a5", actor: "Sofia Rossi", action: "created quotation", target: "BLG-Q-2396 · Jimbaran Bay Resort", at: "23 Oct, 11:03" },
  { id: "a6", actor: "System (FX sync)", action: "updated exchange rate to", target: "IDR 16,395 / USD", at: "20 Oct, 09:12" },
];

/* ------------------------------------------------------------------ */
/* Quotations (agent-facing; mock selling prices only)                 */
/* ------------------------------------------------------------------ */

export const quotations: Quotation[] = [
  {
    id: "q-2418",
    ref: "BLG-Q-2418",
    hotelId: "htl-002",
    hotelName: "Ubud Valley Boutique Retreat",
    destination: "Ubud, Bali",
    roomName: "Valley Pool Villa",
    checkIn: "2027-04-12",
    checkOut: "2027-04-16",
    nights: 4,
    rooms: 1,
    adults: 2,
    children: [7],
    extraBeds: 0,
    status: "shared",
    createdAt: "2026-10-25",
    validUntil: "2026-11-08",
    breakdown: [
      { label: "Valley Pool Villa", detail: "4 nights × $238.00", amount: 952 },
      { label: "Child (age 7, sharing existing bedding)", detail: "4 nights × $32.00", amount: 128 },
      { label: "Extra bed", detail: "Not selected", amount: 0 },
    ],
    total: 1080,
  },
  {
    id: "q-2401",
    ref: "BLG-Q-2401",
    hotelId: "htl-001",
    hotelName: "Nusa Dua Beachfront Resort & Spa",
    destination: "Nusa Dua, Bali",
    roomName: "Deluxe Garden Room",
    checkIn: "2027-01-11",
    checkOut: "2027-01-17",
    nights: 6,
    rooms: 2,
    adults: 4,
    children: [5, 9],
    extraBeds: 1,
    status: "shared",
    createdAt: "2026-10-20",
    validUntil: "2026-11-03",
    breakdown: [
      { label: "Deluxe Garden Room × 2", detail: "6 nights × 2 rooms × $178.00", amount: 2136 },
      { label: "Extra bed", detail: "6 nights × $41.00", amount: 246 },
      { label: "Child age 5 (breakfast only)", detail: "6 nights × $18.00", amount: 108 },
      { label: "Child age 9 (extra bed)", detail: "Included in extra bed", amount: 0 },
    ],
    total: 2490,
  },
  {
    id: "q-2396",
    ref: "BLG-Q-2396",
    hotelId: "htl-006",
    hotelName: "Jimbaran Bay Resort",
    destination: "Jimbaran, Bali",
    roomName: "Family Bay View Room",
    checkIn: "2026-12-02",
    checkOut: "2026-12-06",
    nights: 4,
    rooms: 1,
    adults: 2,
    children: [4, 8, 11],
    extraBeds: 0,
    status: "draft",
    createdAt: "2026-10-23",
    validUntil: "2026-11-06",
    breakdown: [
      { label: "Family Bay View Room", detail: "4 nights × $142.00", amount: 568 },
      { label: "Children (breakfast & dinner included)", detail: "Included", amount: 0 },
    ],
    total: 568,
  },
  {
    id: "q-2375",
    ref: "BLG-Q-2375",
    hotelId: "htl-005",
    hotelName: "Canggu Surf Lodge",
    destination: "Canggu, Bali",
    roomName: "Garden Standard",
    checkIn: "2026-11-08",
    checkOut: "2026-11-12",
    nights: 4,
    rooms: 1,
    adults: 2,
    children: [],
    extraBeds: 0,
    status: "draft",
    createdAt: "2026-10-17",
    validUntil: "2026-10-31",
    breakdown: [
      { label: "Garden Standard", detail: "4 nights × $68.00", amount: 272 },
    ],
    total: 272,
  },
];

/* ------------------------------------------------------------------ */
/* Settings defaults (display mock)                                    */
/* ------------------------------------------------------------------ */

export const defaultSettings: PortalSettings = {
  companyName: "Baligo Travel Group",
  companyEmail: "contracts@baligo.example",
  companyPhone: "+62 361 555 010",
  defaultCurrency: "USD",
  idrPerUsd: 16395,
  fxUpdatedAt: "2026-10-20",
  defaultMarkupPercent: 20,
  rounding: "up-1",
  quotationValidityDays: 14,
  dateFormat: "d MMM yyyy",
  timezone: "Asia/Makassar (GMT+8)",
  defaultMinStay: 2,
  defaultChildAgeMax: 11,
  agentPortal: { showTaxes: true, showInclusions: true, showValidity: true },
  notifications: { newAgent: true, contractImported: true, rateExpiring: true, weeklyDigest: false },
  importPrefs: { autoExtract: true, requireReview: true, duplicateStrategy: "flag" },
};

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export const hotelById = (id: string) => hotels.find((h) => h.id === id);
export const roomsByHotel = (hotelId: string) => roomTypes.filter((r) => r.hotelId === hotelId);
export const roomById = (id: string) => roomTypes.find((r) => r.id === id);
export const ratesForRoom = (hotelId: string, roomId: string) =>
  seasonalRates.filter((r) => r.hotelId === hotelId && r.roomId === roomId);
export const agentById = (id: string) => agents.find((a) => a.id === id);
