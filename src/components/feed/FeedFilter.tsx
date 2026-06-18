import { Button } from '@components/ui/Button';
import type { FeedType } from '@/services/feed.service';

/** Feed filter tab metadata. */
interface FeedFilterOption {
  readonly value: FeedType;
  readonly label: string;
}

/** Feed tabs available in the current production feed foundation. */
const OPTIONS: readonly FeedFilterOption[] = [
  { value: 'for-you', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'trending', label: 'Trending' },
  { value: 'discover', label: 'Discover' },
  { value: 'nearby', label: 'Nearby' },
  { value: 'saved', label: 'Saved' }
];

/** Accessible feed type selector using real tab semantics. */
export const FeedFilter = ({ value, onChange }: { readonly value: FeedType; readonly onChange: (value: FeedType) => void }) => (
  <div className="feed-filter" role="tablist" aria-label="Feed type">
    {OPTIONS.map((option) => (
      <Button
        className="feed-filter__button"
        type="button"
        variant={value === option.value ? 'primary' : 'ghost'}
        role="tab"
        aria-selected={value === option.value}
        key={option.value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </Button>
    ))}
  </div>
);
