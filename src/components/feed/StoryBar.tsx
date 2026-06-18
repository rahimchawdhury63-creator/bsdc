import { useState } from 'react';
import { SVGIcon } from '@components/ui/SVGIcon';
import { useStories } from '@/hooks/useStories';
import { StoryViewer } from './StoryViewer';
import type { BSDCStory } from '@/services/story.service';

/** Horizontal story bar that renders real active Firestore stories only. */
export const StoryBar = () => {
  const { stories, isLoading, error } = useStories();
  const [selectedStory, setSelectedStory] = useState<BSDCStory | null>(null);

  if (isLoading) {
    return <section className="story-bar story-bar--status" aria-label="Stories loading">Loading stories</section>;
  }

  if (error) {
    return <section className="story-bar story-bar--status" aria-label="Stories error">{error}</section>;
  }

  return (
    <section className="story-bar" aria-label="Active 24-hour stories">
      {stories.length === 0 ? (
        <div className="story-empty"><SVGIcon name="clock" width={22} height={22} decorative /> No active stories yet.</div>
      ) : (
        stories.map((story) => (
          <button className="story-pill" type="button" key={story.id} onClick={() => setSelectedStory(story)}>
            <SVGIcon name={story.type === 'image' ? 'image' : 'clock'} width={20} height={20} decorative />
            <span>{story.textContent?.slice(0, 22) || 'Story'}</span>
          </button>
        ))
      )}
      <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />
    </section>
  );
};
