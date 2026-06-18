import { Link } from 'react-router-dom';
import type { RankedSearchResult } from '@/utils/search.algorithm';

/** Live autocomplete suggestions from ranked Firestore search results. */
export const SearchSuggestions = ({ results }: { readonly results: readonly RankedSearchResult[] }) => (
  <div className="search-suggestions" role="listbox" aria-label="Search suggestions">
    {results.slice(0, 5).map((result) => <Link role="option" className="search-suggestion" to={result.url} key={`${result.type}-${result.id}`}>{result.title}<span>{result.type}</span></Link>)}
  </div>
);
