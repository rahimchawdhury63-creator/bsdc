import { Button } from '@components/ui/Button';

/** Minimal accessible share dialog for future modal integration. */
export const ShareModal = ({ url, onClose }: { readonly url: string; readonly onClose: () => void }) => (
  <div className="story-viewer" role="dialog" aria-modal="true" aria-labelledby="share-title">
    <div className="story-viewer__panel">
      <header className="story-viewer__header"><h2 id="share-title">Share post</h2><Button type="button" variant="ghost" onClick={onClose}>Close</Button></header>
      <div className="post-share-body"><input className="form-input" value={url} readOnly /></div>
    </div>
  </div>
);
