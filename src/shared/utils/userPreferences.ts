const CAT_KEY = 'hc_cat_affinities';
const SEARCH_KEY = 'hc_recent_searches';
const SEED_KEY = 'hc_daily_seed';
const MAX_RECENT_SEARCHES = 10;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors (quota, private mode, etc.)
  }
}

export const userPreferences = {
  trackCategory(categoryId: string): void {
    if (!categoryId) return;
    const data = readJson<Record<string, number>>(CAT_KEY, {});
    data[categoryId] = (data[categoryId] ?? 0) + 1;
    writeJson(CAT_KEY, data);
  },

  getCategoryScore(categoryId: string): number {
    const data = readJson<Record<string, number>>(CAT_KEY, {});
    return data[categoryId] ?? 0;
  },

  // Returns true once at least one category has 3+ interactions
  hasPreferences(): boolean {
    const data = readJson<Record<string, number>>(CAT_KEY, {});
    return Object.values(data).some((v) => v >= 3);
  },

  // ── Search history (ranking signal + autocomplete suggestions) ────────────
  trackSearch(term: string): void {
    const clean = term.trim().toLowerCase();
    if (clean.length < 2) return;
    const list = readJson<string[]>(SEARCH_KEY, []);
    const deduped = [clean, ...list.filter((t) => t !== clean)].slice(0, MAX_RECENT_SEARCHES);
    writeJson(SEARCH_KEY, deduped);
  },

  getRecentSearches(): string[] {
    return readJson<string[]>(SEARCH_KEY, []);
  },

  hasSearchHistory(): boolean {
    return readJson<string[]>(SEARCH_KEY, []).length > 0;
  },

  // ── Daily seed for the fair "random" default catalog order ────────────────
  // Stable for the whole day (so infinite scroll pagination stays consistent),
  // regenerated the next day to keep rotation fair across stores over time.
  getDailySeed(): string {
    const today = new Date().toISOString().slice(0, 10);
    const stored = readJson<{ date: string; seed: string } | null>(SEED_KEY, null);
    if (stored?.date === today) return stored.seed;

    const seed = `${today}-${Math.random().toString(36).slice(2)}`;
    writeJson(SEED_KEY, { date: today, seed });
    return seed;
  },
};
