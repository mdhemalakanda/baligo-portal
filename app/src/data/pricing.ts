/**
 * Demo selling-price helper for the agent portal.
 *
 * NOT the production pricing engine: it deterministically derives
 * illustrative USD selling prices from the mock supplier rates so that the
 * agent-facing breakdown is internally consistent — INCLUDING stays that
 * cross season boundaries (each night is priced against the season that
 * covers it). The formula, the net rates and the markup are never rendered
 * on agent screens — only the resulting numbers, clearly marked as demo data.
 *
 * Production formula (for the backend phase):
 *   USD selling rate = IDR net rate / IDR-per-USD × (1 + markup %)
 *   then rounded per the configured rounding rule.
 */

import { ratesForRoom, seasonalRates } from "./mock";

const MOCK_IDR_PER_USD = 16395;
const MOCK_MARKUP = 1.2; // internal only — never displayed to agents

function roundUpTo(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

export function sellingFromNet(netIdr: number) {
  return roundUpTo((netIdr / MOCK_IDR_PER_USD) * MOCK_MARKUP, 1);
}

/** Nightly selling rate (USD) for a room on a specific date, with its season. */
export function demoNightlyForDate(hotelId: string, roomId: string, dateIso: string) {
  for (const r of ratesForRoom(hotelId, roomId)) {
    const inSeason = dateIso >= r.startDate && dateIso <= r.endDate;
    const contractValid = dateIso <= r.validityTo;
    if (inSeason && contractValid) {
      return { nightly: sellingFromNet(r.netRateIdr), seasonName: r.seasonName, surchargePct: r.holidaySurcharge.enabled ? r.holidaySurcharge.percent : 0 };
    }
  }
  return null; // no applicable demo rate
}

/** Back-compat helper: nightly selling rate only. */
export function demoNightlyUsd(hotelId: string, roomId: string, dateIso: string) {
  return demoNightlyForDate(hotelId, roomId, dateIso)?.nightly ?? null;
}

export type StayState =
  | "valid"
  | "missing-rate"
  | "expired-rate"
  | "unresolved-rate"
  | "occupancy-limit"
  | "invalid-dates"
  | "more-info";

export interface StayInput {
  hotelId: string;
  roomId: string;
  checkIn: string; // ISO
  checkOut: string;
  rooms: number;
  adults: number;
  children: number[];
  extraBeds: number;
}

export interface StaySegment {
  seasonName: string;
  nights: number;
  nightly: number;
  amount: number;
  surchargeAmount: number;
}

export interface DemoStaySummary {
  state: StayState;
  stateMessage?: string;
  nightlyUsd: number | null;
  nights: number;
  segments: StaySegment[];
  roomLines: { label: string; detail: string; amount: number }[];
  extras: { label: string; detail: string; amount: number }[];
  total: number;
}

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(a: string, b: string) {
  const ms = new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Build an illustrative, internally consistent stay summary.
 * Each night is priced against the season covering that date, so stays that
 * cross a season boundary produce one line per season segment.
 * `forcedState` lets the UI reach demo states (expired, unresolved…) on demand.
 */
export function demoStaySummary(input: StayInput, forcedState?: StayState): DemoStaySummary {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights <= 0) {
    return {
      state: "invalid-dates",
      stateMessage: "The check-out date must be after the check-in date.",
      nightlyUsd: null,
      nights,
      segments: [],
      roomLines: [],
      extras: [],
      total: 0,
    };
  }

  // Price every night, grouping consecutive nights that share a season.
  const segments: StaySegment[] = [];
  let uncoveredBeforeContractEnd = false;
  for (let i = 0; i < nights; i++) {
    const date = addDays(input.checkIn, i);
    const hit = demoNightlyForDate(input.hotelId, input.roomId, date);
    if (!hit) {
      uncoveredBeforeContractEnd = true;
      break;
    }
    const last = segments[segments.length - 1];
    if (last && last.seasonName === hit.seasonName && last.nightly === hit.nightly) {
      last.nights += 1;
      last.amount += hit.nightly;
      last.surchargeAmount += hit.surchargePct > 0 ? (hit.nightly * hit.surchargePct) / 100 : 0;
    } else {
      segments.push({
        seasonName: hit.seasonName,
        nights: 1,
        nightly: hit.nightly,
        amount: hit.nightly,
        surchargeAmount: hit.surchargePct > 0 ? (hit.nightly * hit.surchargePct) / 100 : 0,
      });
    }
  }

  const nightlyUsd = segments[0]?.nightly ?? null;

  let state: StayState = "valid";
  let stateMessage: string | undefined;
  if (forcedState && forcedState !== "valid") {
    state = forcedState;
    stateMessage = {
      "missing-rate": "There is no contracted rate configured for this hotel and room type yet.",
      "expired-rate": "The contract covering this stay has expired. Ask us for a fresh quotation.",
      "unresolved-rate": "This rate has unresolved warnings in the latest contract review.",
      "occupancy-limit": "The selected number of guests exceeds this room type's maximum occupancy.",
      "more-info": "A few more details are needed before we can price this stay.",
      valid: undefined,
      "invalid-dates": undefined,
    }[forcedState];
  } else if (segments.length === 0) {
    // Nights uncovered: expired contract vs missing season — pick an honest message.
    const room = seasonalRates.find((r) => r.hotelId === input.hotelId && r.roomId === input.roomId);
    state = room ? "expired-rate" : "missing-rate";
    stateMessage =
      state === "expired-rate"
        ? "The contract covering this stay has expired. Ask us for a fresh quotation."
        : "There is no contracted rate configured for this hotel and room type yet.";
  }
  void uncoveredBeforeContractEnd;

  if (state !== "valid") {
    return {
      state,
      stateMessage,
      nightlyUsd,
      nights,
      segments: [],
      roomLines: [],
      extras: [],
      total: 0,
    };
  }

  const roomLines = segments.map((s) => ({
    label:
      segments.length > 1
        ? `${s.seasonName} (${s.nights} night${s.nights > 1 ? "s" : ""})`
        : `Room${input.rooms > 1 ? ` × ${input.rooms}` : ""}`,
    detail: `${s.nights} night${s.nights > 1 ? "s" : ""} × $${s.nightly.toFixed(2)}${
      input.rooms > 1 ? ` × ${input.rooms} rooms` : ""
    }`,
    amount: s.amount * input.rooms,
  }));

  // Mock extra-bed charge: USD 41/night (consistent with BLG-Q-2401).
  const extras: { label: string; detail: string; amount: number }[] = [];
  if (input.extraBeds > 0) {
    const bed = 41 * nights * input.extraBeds;
    extras.push({
      label: `Extra bed${input.extraBeds > 1 ? ` × ${input.extraBeds}` : ""}`,
      detail: `${nights} nights × $41.00${input.extraBeds > 1 ? ` × ${input.extraBeds}` : ""} incl. breakfast`,
      amount: bed,
    });
  }

  // Mock child charge: USD 32/night per child aged 4–11 sharing with bedding (demo).
  const payableChildren = input.children.filter((a) => a >= 4 && a <= 11);
  if (payableChildren.length > 0) {
    const child = 32 * nights * payableChildren.length;
    extras.push({
      label: `Child${payableChildren.length > 1 ? "ren" : ""} age ${payableChildren.join(", ")}`,
      detail: `${nights} nights × $32.00 × ${payableChildren.length} incl. breakfast`,
      amount: child,
    });
  }

  // Holiday surcharges, shown per season segment where configured (demo).
  for (const s of segments) {
    if (s.surchargeAmount > 0) {
      const pct = Math.round((s.surchargeAmount / (s.nightly * s.nights)) * 100);
      extras.push({
        label: `Holiday surcharge — ${s.seasonName}`,
        detail: `${pct}% × ${s.nights} night${s.nights > 1 ? "s" : ""} × $${s.nightly.toFixed(2)}`,
        amount: s.surchargeAmount,
      });
    }
  }

  const total =
    roomLines.reduce((sum, l) => sum + l.amount, 0) + extras.reduce((sum, e) => sum + e.amount, 0);

  return { state, stateMessage, nightlyUsd, nights, segments, roomLines, extras, total };
}

/** Demo quotation reference for newly configured stays (clearly marked demo). */
export function demoRef() {
  return "BLG-Q-DEMO";
}
