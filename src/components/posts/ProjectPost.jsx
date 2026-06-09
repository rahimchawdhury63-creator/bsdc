/**
 * Project Post — showcase. Live URL + repo + tech stack.
 */
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader.jsx';
import TagInput from '../common/TagInput.jsx';
import { MetaStrip, SubmitBar } from './_formShell.jsx';
import { isValidUrl } from '../../utils/validators.js';
import { toast } from '../common/Toast.jsx';

export default function ProjectPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', images: [], projectUrl: '', githubUrl: '',
    techStack: [], tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (data.projectUrl && !isValidUrl(data.projectUrl)) return toast.error('Live URL is invalid.');
    if (data.githubUrl && !isValidUrl(data.githubUrl)) return toast.error('GitHub URL is invalid.');
    onSubmit(data);
  };

  return (
    <form onSubmit={submit}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Project name</label>
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
        <label className="bsdc-input-label">Screenshots</label>
        <ImageUploader value={data.images} onChange={(v) => change('images', v)} max={6} />
      </div>

      <div className="bsdc-grid-2">
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Live URL</label>
          <input
            type="url"
            className="bsdc-input"
            value={data.projectUrl}
            onChange={(e) => change('projectUrl', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">GitHub / Source URL</label>
          <input
            type="url"
            className="bsdc-input"
            value={data.githubUrl}
            onChange={(e) => change('githubUrl', e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Tech stack</label>
        <TagInput
          value={data.techStack}
          onChange={(v) => change('techStack', v)}
          max={12}
          placeholder="react, firebase, tailwind…"
        />
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Description</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder="What does your project do? What problem does it solve?"
          rows={5}
          required
        />
      </div>

      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || !data.content.trim()}
        onCancel={onCancel}
        label="Share project"
      />
    </form>
  );
}
