import type { Gem } from "../data/stationData";

type GenericRow = Record<string, unknown>;

export type TransitLine = "kajang" | "kelana";

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY?.trim();
const SUPABASE_PAGE_SIZE = 1000;

class SupabaseHttpError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Supabase query failed (${status}): ${body}`);
    this.status = status;
    this.body = body;
  }
}

const LINE_TABLE_CANDIDATES: Record<TransitLine, string[]> = {
  kajang: [
    ((import.meta as any).env.VITE_SUPABASE_TABLE_KAJANG || "").trim(),
    "mrt_kajang_line_2",
    "mrt_kajang_line",
    "mrt_kajang_line (1.2)",
    "mrt_kajang_line (1.1)",
  ],
  kelana: [
    ((import.meta as any).env.VITE_SUPABASE_TABLE_KELANA || "").trim(),
    "mrt_kelanajaya_line_2",
    "mrt_kelanajaya_line",
    "mrt_kelanajaya_line (1.2)",
    "mrt_kelanajaya_line (1.1)",
  ],
};

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function hashText(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

function normalizeCategory(rawValue: unknown): string {
  const raw = asText(rawValue, "others");
  return raw.toLowerCase().replace(/\s+/g, "_");
}

function normalizeCo2(rawValue: unknown): string {
  const co2 = asText(rawValue, "0.00kg");
  if (!co2) return "0.00kg";
  if (/kg|g/i.test(co2)) return co2;
  return `${co2}kg`;
}

function normalizeGem(row: GenericRow, line: TransitLine): Gem | null {
  const lat = parseNumber(row.lat) ?? parseNumber(row.latitude);
  const lng = parseNumber(row.lng) ?? parseNumber(row.lon) ?? parseNumber(row.longitude);

  if (lat === null || lng === null) return null;

  const name = asText(row.Name ?? row.name, "Unnamed Place");
  const idRaw = asText(row.ID ?? row.id);
  const idNumber = parseNumber(row.ID ?? row.id);
  const fallbackId = hashText(`${line}:${idRaw || name}:${lat}:${lng}`);
  const subcategory = asText(row.Subcategory ?? row.subcategory);
  const nearestStation = asText(
    row["Nearest Station"] ?? row.nearest_station ?? row.nearestStation
  );
  const distanceMeters =
    parseNumber(row["Distance (m)"] ?? row.distance_m ?? row.distanceMeters) ?? undefined;

  return {
    id: idNumber ?? fallbackId,
    name,
    category: normalizeCategory(row.Category ?? row.category),
    lat,
    lng,
    description: subcategory || "No description provided.",
    co2Saved: normalizeCo2(row.co2Saved ?? row.co2_saved ?? row.co2),
    nearestStation: nearestStation || undefined,
    distanceMeters,
  };
}

async function queryRows(url: URL): Promise<GenericRow[]> {
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY!}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new SupabaseHttpError(response.status, body);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? (payload as GenericRow[]) : [];
}

async function queryAllRows(baseUrl: URL): Promise<GenericRow[]> {
  const allRows: GenericRow[] = [];
  let offset = 0;

  while (true) {
    const pagedUrl = new URL(baseUrl.toString());
    pagedUrl.searchParams.set("limit", String(SUPABASE_PAGE_SIZE));
    pagedUrl.searchParams.set("offset", String(offset));

    const pageRows = await queryRows(pagedUrl);
    allRows.push(...pageRows);

    if (pageRows.length < SUPABASE_PAGE_SIZE) break;
    offset += SUPABASE_PAGE_SIZE;
  }

  return allRows;
}

export async function fetchGemsForLine(line: TransitLine): Promise<Gem[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.");
  }

  const tableCandidates = LINE_TABLE_CANDIDATES[line].filter(Boolean);
  let lastError: unknown = null;

  for (const tableName of tableCandidates) {
    const endpoint = `${SUPABASE_URL}/rest/v1/${encodeURIComponent(tableName)}`;
    const primaryUrl = new URL(endpoint);
    primaryUrl.searchParams.set("select", "*");

    try {
      const rows = await queryAllRows(primaryUrl);
      return rows
        .map((row) => normalizeGem(row, line))
        .filter((gem): gem is Gem => gem !== null);
    } catch (error) {
      // If columns are different casing, retry with wildcard.
      const fallbackUrl = new URL(endpoint);
      fallbackUrl.searchParams.set("select", "*");
      try {
        const fallbackRows = await queryAllRows(fallbackUrl);
        return fallbackRows
          .map((row) => normalizeGem(row, line))
          .filter((gem): gem is Gem => gem !== null);
      } catch (fallbackError) {
        const maybeHttpError = fallbackError as SupabaseHttpError;
        const tableNotFound = maybeHttpError?.status === 404 && maybeHttpError?.body?.includes("PGRST205");

        if (tableNotFound) {
          lastError = fallbackError;
          continue;
        }

        throw fallbackError;
      }
    }
  }

  throw lastError || new Error(`No matching Supabase table found for line: ${line}`);
}
