import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@components/ui/Input';
import { Spinner } from '@components/ui/Spinner';
import { useSearch } from '@/hooks/useSearch';
import { DidYouMean } from './DidYouMean';
import { SearchResults } from './SearchResults';
import { SearchSuggestions } from './SearchSuggestions';

/** Universal search page for Firestore posts, profiles, communities, jobs, and code. */
export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const { results, suggestion, isLoading, error } = useSearch(query);
  const updateQuery = (value: string) => { setQuery(value); setParams(value ? { q: value } : {}); };

  return <section className="search-page"><Input id="search-query" label="Search BSDC" type="search" value={query} onChange={(event) => updateQuery(event.target.value)} />{query ? <SearchSuggestions results={results} /> : null}<DidYouMean suggestion={suggestion} onUse={updateQuery} />{isLoading ? <Spinner /> : null}{error ? <p className="form-error">{error}</p> : null}<SearchResults results={results} /></section>;
};
