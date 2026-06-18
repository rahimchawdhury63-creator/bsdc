import { SEOHead } from '@components/seo/SEOHead';
import { SearchPage } from '@components/search/SearchPage';
/** Search page with real Firestore universal search. */
export const Search = () => <><SEOHead title="Search" canonicalPath="/search" /><SearchPage /></>;
