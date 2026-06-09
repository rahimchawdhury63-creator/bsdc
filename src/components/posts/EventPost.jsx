/**
 * Event Post — date, location, description. Event schema on detail page.
 */
import React, { useState } from 'react';
import ImageUploader from '../common/ImageUploader.jsx';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function EventPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', eventDate: '', images: [],
    location: '', tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : null
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Event name</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="bsdc-grid-2">
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Date &amp; time</label>
          <input
            type="datetime-local"
            className="bsdc-input"
            value={data.eventDate}
            onChange={(e) => change('eventDate', e.target.value)}
            required
          />
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Location / link</label>
          <input
            type="text"
            className="bsdc-input"
            value={data.location}
            onChange={(e) => change('location', e.target.value)}
            placeholder="Venue or Zoom URL"
            required
          />
        </div>
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Cover image (optional)</label>
        <ImageUploader value={data.images} onChange={(v) => change('images', v)} max={1} />
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Description</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          rows={5}
          required
        />
      </div>

      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || !data.eventDate || !data.location.trim() || !data.content.trim()}
        onCancel={onCancel}
        label="Create event"
      />
    </form>
  );
}
