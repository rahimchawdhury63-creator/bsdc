/**
 * Job Post — JobPosting schema. Salary range, location, job type, requirements.
 */
import React, { useState } from 'react';
import { MetaStrip, SubmitBar } from './_formShell.jsx';

export default function JobPost({ submitting, onSubmit, onCancel }) {
  const [data, setData] = useState({
    title: '', content: '', jobSalary: '', jobLocation: '', jobType: 'full-time',
    tags: [], language: 'en', privacy: 'public'
  });
  const change = (k, v) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }}>
      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Job title</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.title}
          onChange={(e) => change('title', e.target.value)}
          placeholder="e.g. Senior React Developer"
          maxLength={120}
          required
        />
      </div>

      <div className="bsdc-grid-2">
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Location</label>
          <input
            type="text"
            className="bsdc-input"
            value={data.jobLocation}
            onChange={(e) => change('jobLocation', e.target.value)}
            placeholder="Dhaka, Bangladesh / Remote"
            required
          />
        </div>
        <div className="bsdc-input-group">
          <label className="bsdc-input-label">Type</label>
          <select
            className="bsdc-select"
            value={data.jobType}
            onChange={(e) => change('jobType', e.target.value)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Salary range (optional)</label>
        <input
          type="text"
          className="bsdc-input"
          value={data.jobSalary}
          onChange={(e) => change('jobSalary', e.target.value)}
          placeholder="e.g. BDT 60,000 – 90,000 / month"
          maxLength={80}
        />
      </div>

      <div className="bsdc-input-group">
        <label className="bsdc-input-label">Description</label>
        <textarea
          className="bsdc-textarea"
          value={data.content}
          onChange={(e) => change('content', e.target.value)}
          placeholder="About the role, responsibilities, requirements, how to apply…"
          rows={10}
          maxLength={20000}
          required
        />
      </div>

      <MetaStrip value={data} onChange={setData} />
      <SubmitBar
        submitting={submitting}
        disabled={!data.title.trim() || !data.content.trim() || !data.jobLocation.trim()}
        onCancel={onCancel}
        label="Post job"
      />
    </form>
  );
}
