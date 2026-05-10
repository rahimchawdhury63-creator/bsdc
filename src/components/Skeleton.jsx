import React from 'react';

export function SkeletonPostCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text" style={{ width: '25%' }} />
        </div>
      </div>
      <div className="skeleton skeleton-title" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '100%' }} />
      <div className="skeleton skeleton-text" style={{ width: '65%' }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
        <div className="skeleton skeleton-text" style={{ width: 60, marginBottom: 0 }} />
        <div className="skeleton skeleton-text" style={{ width: 60, marginBottom: 0 }} />
        <div className="skeleton skeleton-text" style={{ width: 80, marginBottom: 0 }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPostCard key={i} />
      ))}
    </>
  );
}

export function SkeletonProfile() {
  return (
    <div style={{ padding: 24 }} aria-hidden="true">
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-title" style={{ width: '50%' }} />
          <div className="skeleton skeleton-text" style={{ width: '35%' }} />
          <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        </div>
      </div>
      <div className="skeleton skeleton-text" style={{ width: '100%' }} />
      <div className="skeleton skeleton-text" style={{ width: '90%' }} />
      <div className="skeleton skeleton-text" style={{ width: '75%' }} />
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div style={{ padding: 24 }} aria-hidden="true">
      <div className="skeleton skeleton-title" style={{ width: '75%' }} />
      <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 24 }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: `${80 + Math.random() * 20}%` }} />
      ))}
    </div>
  );
}
