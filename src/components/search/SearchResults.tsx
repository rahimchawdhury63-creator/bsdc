import { Link } from 'react-router-dom';
import type { RankedSearchResult } from '@/utils/search.algorithm';

/** Categorized search results list with transparent score display. */
export const SearchResults = ({ results }: { readonly results: readonly RankedSearchResult[] }) => (
  <div className="search-results">
    {results.length === 0 ? <p className="text-muted">No matching real BSDC content found.</p> : results.map((result) => <article className="surface-card" key={`${result.type}-${result.id}`}><Link to={result.url}><h2>{result.title}</h2></Link><p className="text-muted">{result.type} • relevance {Math.round(result.score)}</p><p>{result.body.slice(0, 180)}</p></article>)}
  </div>
);
