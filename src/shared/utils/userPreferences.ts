const CAT_KEY = 'hc_cat_affinities';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const userPreferences = {
  trackCategory(categoryId: string): void {
    if (!categoryId) return;
    const data = readJson<Record<string, number>>(CAT_KEY, {});
    data[categoryId] = (data[categoryId] ?? 0) + 1;
    localStorage.setItem(CAT_KEY, JSON.stringify(data));
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
};
