/**
 * Video Post — single Cloudinary video + title + caption.
 */
import React, { useState } from 'react';
import VideoUploader from '../common/VideoUploader.jsx';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function VideoPost({ submitting, onSubmit, onCancel }) {
  const [video, setVideo] = useState(null);
  const [data, setData] = useState({
    title: '', content: '', tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...data, videos: video ? [video] : [] });
      }}
    >
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Video</label>
        <VideoUploader value={video} onChange={setVideo} />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Title</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Description</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          rows={3}
        />
      </div>
      <MetaStrip value={data} onChange={setData} />
      <SubmitBar submitting={submitting} disabled={!video || !data.title.trim()} onCancel={onCancel} />
    </form>
  );
}
