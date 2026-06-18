import { Button } from '@components/ui/Button';
import type { BSDCStory } from '@/services/story.service';

/** Story modal viewer for active Firestore stories. */
export const StoryViewer = ({ story, onClose }: { readonly story: BSDCStory | null; readonly onClose: () => void }) => {
  if (!story) {
    return null;
  }

  return (
    <div className="story-viewer" role="dialog" aria-modal="true" aria-labelledby="story-viewer-title">
      <div className="story-viewer__panel">
        <header className="story-viewer__header">
          <h2 id="story-viewer-title">BSDC story</h2>
          <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
        </header>
        <div className="story-viewer__content">
          {story.type === 'image' && story.imageUrl ? <img src={story.imageUrl} alt="BSDC story" /> : <p>{story.textContent}</p>}
        </div>
      </div>
    </div>
  );
};
