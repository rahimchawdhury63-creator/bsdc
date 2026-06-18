import { useEffect, useState } from 'react';
import { searchBSDC } from '@/services/search.service';
import type { RankedSearchResult } from '@/utils/search.algorithm';

/** Debounced Firestore search hook for Bangla and English queries. */
export const useSearch = (query: string) => {
  const [results, setResults] = useState<readonly RankedSearchResult[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) { setResults([]); setSuggestion(null); return undefined; }
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void searchBSDC(trimmed).then((result) => {
        setIsLoading(false);
        if (result.ok) { setResults(result.data.results); setSuggestion(result.data.suggestion); setError(null); } else { setError(result.error); }
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  return { results, suggestion, isLoading, error };
};
