/** Searchable entity categories returned by BSDC universal search. */
export type SearchEntityType = 'post' | 'profile' | 'community' | 'tag' | 'job' | 'code';

/** Normalized search document used by the Bangla and English ranking algorithm. */
export interface SearchDocument {
  readonly id: string;
  readonly type: SearchEntityType;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly url: string;
  readonly createdAtSeconds: number;
  readonly popularity: number;
}

/** Search result with transparent relevance score. */
export interface RankedSearchResult extends SearchDocument {
  readonly score: number;
}

/** Bangla vowel and punctuation normalizer for fair matching. */
export const normalizeSearchText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[।,.;:!?()[\]{}"'`~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Tokenizes mixed Bangla and English text without requiring external services. */
export const tokenizeSearchText = (value: string): readonly string[] => normalizeSearchText(value).split(' ').filter((token) => token.length > 1);

/** Calculates edit distance for did-you-mean suggestions. */
export const calculateLevenshteinDistance = (a: string, b: string): number => {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let j = 1; j <= b.length; j += 1) rows[0]![j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i]![j] = a[i - 1] === b[j - 1] ? rows[i - 1]![j - 1]! : Math.min(rows[i - 1]![j - 1]!, rows[i]![j - 1]!, rows[i - 1]![j]!) + 1;
    }
  }
  return rows[a.length]![b.length]!;
};

/** Ranks real Firestore-derived documents for a query. */
export const rankSearchResults = (query: string, documents: readonly SearchDocument[]): readonly RankedSearchResult[] => {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = tokenizeSearchText(normalizedQuery);
  if (queryTokens.length === 0) return [];

  return documents
    .map((document) => {
      const title = normalizeSearchText(document.title);
      const body = normalizeSearchText(document.body);
      const tagText = normalizeSearchText(document.tags.join(' '));
      const exactTitle = title.includes(normalizedQuery) ? 120 : 0;
      const tokenScore = queryTokens.reduce((score, token) => score + (title.includes(token) ? 35 : 0) + (tagText.includes(token) ? 25 : 0) + (body.includes(token) ? 10 : 0), 0);
      const freshness = document.createdAtSeconds ? Math.max(0, 30 - (Date.now() / 1000 - document.createdAtSeconds) / 86400) : 0;
      const score = exactTitle + tokenScore + Math.log10(document.popularity + 1) * 12 + freshness;
      return { ...document, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

/** Suggests the nearest known token for typo correction. */
export const didYouMean = (query: string, vocabulary: readonly string[]): string | null => {
  const token = tokenizeSearchText(query)[0];
  if (!token) return null;
  const ranked = vocabulary.map((word) => ({ word, distance: calculateLevenshteinDistance(token, normalizeSearchText(word)) })).sort((a, b) => a.distance - b.distance);
  const best = ranked[0];
  return best && best.distance > 0 && best.distance <= 2 ? best.word : null;
};
