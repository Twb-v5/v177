import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SINS, CATEGORY_META, SEVERITY_META,
  type Sin, type SinCategory, type SinSeverity, type ApiSinCategory,
} from "@/lib/sins-data";

export { SINS, CATEGORY_META, SEVERITY_META };
export type { Sin, SinCategory, SinSeverity, ApiSinCategory };

const STORAGE_KEY = "tawbah_selected_sins";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SinSelection {
  sinIds: string[];
  apiCategory: ApiSinCategory;
  selectedAt: number;
}

export type SinFilter = "all" | SinCategory;

// ─── Persistence ──────────────────────────────────────────────────────────────

export async function loadSelectedSins(): Promise<SinSelection | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSelectedSins(selection: SinSelection): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {}
}

export async function clearSelectedSins(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── Sin Logic ────────────────────────────────────────────────────────────────

export function filterSins(filter: SinFilter, query: string): Sin[] {
  let result = SINS;
  if (filter !== "all") result = result.filter(s => s.category === filter);
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        (s.note || "").toLowerCase().includes(q)
    );
  }
  return result;
}

export function getSinById(id: string): Sin | undefined {
  return SINS.find(s => s.id === id);
}

export function getSinsByIds(ids: string[]): Sin[] {
  return ids.map(id => getSinById(id)).filter(Boolean) as Sin[];
}

export function getApiCategoryFromSins(selectedIds: string[]): ApiSinCategory {
  const sins = getSinsByIds(selectedIds);
  if (!sins.length) return "other";
  const counts: Record<ApiSinCategory, number> = {
    khilwat: 0, mali: 0, huquq_nas: 0, taqsir_faraid: 0, other: 0,
  };
  sins.forEach(s => counts[s.apiCategory]++);
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as ApiSinCategory;
}

export function getHasKaffarah(selectedIds: string[]): boolean {
  return getSinsByIds(selectedIds).some(s => s.category === "with_kaffarah");
}

export function getMostSevereSin(selectedIds: string[]): Sin | null {
  const sins = getSinsByIds(selectedIds);
  return sins.find(s => s.severity === "kabira") || sins[0] || null;
}

export const ALL_FILTERS: SinFilter[] = ["all", "with_kaffarah", "major", "huquq_ibad", "common"];
export const FILTER_LABELS: Record<SinFilter, string> = {
  all: "الكل",
  with_kaffarah: "لها كفارة",
  major: "كبائر",
  huquq_ibad: "حقوق العباد",
  common: "ذنوب شائعة",
};
