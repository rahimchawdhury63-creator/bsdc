/**
 * src/components/feed/FeedItem.jsx
 * ---------------------------------------------------------------------------
 * Universal post card. Renders the correct preview for each of the 14 post
 * types and delegates likes/share/menu to <PostActions />.
 *
 * Props:
 *   - post           : full post document
 *   - currentUser    : viewer's user document (or null)
 *   - onDeleted(id)  : optional callback so parent can remove from list
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import VerificationBadge from '../verification/VerificationBadge.jsx';
import PostActions from '../posts/PostActions.jsx';
import { relativeTime } from '../../utils/dateFormatter.js';
import { TYPE_URL_SEGMENT } from '../../utils/seoGenerator.js';
import {
  IconRegistry, IconMapPin, IconHash, IconBriefcase, IconCalendar,
  IconLink, IconGithub, IconPlay, IconBookOpen, IconClock, IconPoll, IconCode
} from '../common/Icons.jsx';

/** Build URL for the post detail page based on its type. */
function postPath(post) {
  const seg = TYPE_URL_SEGMENT[post.type] || 'post';
  const slug = post.slug || post.id;
  return `/${seg}/${slug}`;
}

export default function FeedItem({ post, currentUser, onDeleted }) {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  // Soft-hide instantly when own delete confirms (parent will also drop it).
  if (hidden) return null;

  const openPost = () => navigate(postPath(post));

  return (
    <article className="bsdc-post bsdc-anim-fade-in" itemScope itemType={`https://schema.org/${schemaFor(post.type)}`}>
      <Header post={post} />

      <div onClick={openPost} style={{ cursor: 'pointer' }}>
        <Body post={post} />
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="bsdc-post__tags">
          {post.tags.slice(0, 6).map((t) => (
            <Link key={t} to={`/tags/${encodeURIComponent(t)}`} className="bsdc-chip" onClick={(e) => e.stopPropagation()}>
              <IconHash size={12} /> {t}
            </Link>
          ))}
        </div>
      )}

      <PostActions
        post={post}
        currentUser={currentUser}
        onCommentClick={openPost}
        onDeleted={(id) => { setHidden(true); onDeleted?.(id); }}
        onEdit={() => navigate(`${postPath(post)}?edit=1`)}
      />
    </article>
  );
}

/** Header: avatar, name, verified, type pill, relative time. */
function Header({ post }) {
  const TypeIcon = IconRegistry[post.type] || IconRegistry.text;
  return (
    <div className="bsdc-post__header">
      <Link to={`/p/${post.authorUsername}`}>
        <Avatar src={post.authorPhotoURL} name={post.authorDisplayName} />
      </Link>
      <div className="bsdc-post__author">
        <div className="bsdc-post__author-name">
          <Link to={`/p/${post.authorUsername}`}>{post.authorDisplayName || post.authorUsername}</Link>
          {post.authorIsVerified && <VerificationBadge size={14} />}
        </div>
        <div className="bsdc-post__author-meta">
          <span>@{post.authorUsername}</span>
          <span aria-hidden="true">·</span>
          <span>{relativeTime(post.createdAt)}</span>
          {post.location && (
            <>
              <span aria-hidden="true">·</span>
              <span><IconMapPin size={12} /> {post.location}</span>
            </>
          )}
        </div>
      </div>
      <span className="bsdc-post__type-pill">
        <TypeIcon size={12} /> {post.type}
      </span>
    </div>
  );
}

/** Body — switches on post.type. */
function Body({ post }) {
  switch (post.type) {
    case 'text':    return <TextBody post={post} />;
    case 'image':   return <ImageBody post={post} />;
    case 'video':   return <VideoBody post={post} />;
    case 'qa':      return <QABody post={post} />;
    case 'blog':    return <BlogBody post={post} />;
    case 'doc':     return <DocBody post={post} />;
    case 'wiki':    return <BlogBody post={post} />;
    case 'code':    return <CodeBody post={post} />;
    case 'story':   return <StoryBody post={post} />;
    case 'project': return <ProjectBody post={post} />;
    case 'job':     return <JobBody post={post} />;
    case 'notice':  return <NoticeBody post={post} />;
    case 'poll':    return <PollBody post={post} />;
    case 'event':   return <EventBody post={post} />;
    default:        return <TextBody post={post} />;
  }
}

/* ---------- per-type bodies ---------- */

function TextBody({ post }) {
  return (
    <div className="bsdc-post__body">
      <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {truncate(post.content, 600)}
      </p>
    </div>
  );
}

function ImageBody({ post }) {
  const imgs = post.images || [];
  const gridClass = imgs.length === 1 ? '' : imgs.length === 2 ? 'bsdc-post__media-grid--2' : imgs.length === 3 ? 'bsdc-post__media-grid--3' : 'bsdc-post__media-grid--4';
  return (
    <>
      {post.content && (
        <div className="bsdc-post__body">
          <p style={{ margin: 0 }}>{truncate(post.content, 300)}</p>
        </div>
      )}
      <div className="bsdc-post__media">
        {imgs.length === 1 ? (
          <img src={imgs[0].url || imgs[0]} alt={post.title || 'Image'} loading="lazy" />
        ) : (
          <div className={`bsdc-post__media-grid ${gridClass}`}>
            {imgs.slice(0, 4).map((img, i) => (
              <img key={i} src={img.url || img} alt="" loading="lazy" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function VideoBody({ post }) {
  const vid = post.videos?.[0];
  return (
    <>
      {post.title && <div className="bsdc-post__body"><h3 className="bsdc-post__title">{post.title}</h3></div>}
      {vid && (
        <div className="bsdc-post__media">
          <video src={vid.url} controls playsInline preload="metadata" style={{ background: '#000' }} />
        </div>
      )}
      {post.content && (
        <div className="bsdc-post__body">
          <p style={{ margin: 0 }}>{truncate(post.content, 300)}</p>
        </div>
      )}
    </>
  );
}

function QABody({ post }) {
  return (
    <div className="bsdc-post__body">
      <h3 className="bsdc-post__title">
        <span style={{ color: 'var(--color-primary)' }}>Q. </span>{post.title}
      </h3>
      <p style={{ margin: 0 }}>{truncate(post.content, 280)}</p>
    </div>
  );
}

function BlogBody({ post }) {
  const cover = post.images?.[0];
  const readMin = Math.max(1, Math.round((post.content || '').split(/\s+/).length / 200));
  return (
    <>
      {cover && (
        <div className="bsdc-post__media">
          <img src={cover.url || cover} alt={post.title} loading="lazy" />
        </div>
      )}
      <div className="bsdc-post__body">
        <h3 className="bsdc-post__title">{post.title}</h3>
        <p style={{ margin: 0 }}>{truncate(post.excerpt || post.content, 220)}</p>
        <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-text-xs bsdc-text-muted bsdc-mt-sm">
          <IconBookOpen size={12} /> {readMin} min read
        </div>
      </div>
    </>
  );
}

function DocBody({ post }) {
  return (
    <div className="bsdc-post__body">
      <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-xs bsdc-text-muted">
        <IconBookOpen size={12} /> Documentation
      </div>
      <h3 className="bsdc-post__title">{post.title}</h3>
      <p style={{ margin: 0 }}>{truncate(post.excerpt || post.content, 240)}</p>
    </div>
  );
}

function CodeBody({ post }) {
  return (
    <>
      <div className="bsdc-post__body">
        <h3 className="bsdc-post__title">{post.title}</h3>
        {post.content && <p style={{ margin: 0 }}>{truncate(post.content, 200)}</p>}
      </div>
      <pre
        className="bsdc-post__code"
        style={{ maxHeight: 260 }}
        aria-label={`Code snippet in ${post.codeLanguage}`}
      >
        <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-xs" style={{ color: '#9aa6b2', marginBottom: 8 }}>
          <IconCode size={12} /> {post.codeLanguage || 'code'}
        </div>
        <code>{truncate(post.codeContent || '', 800)}</code>
      </pre>
    </>
  );
}

function StoryBody({ post }) {
  const img = post.images?.[0];
  return (
    <div className="bsdc-post__media" style={{ aspectRatio: '9/16', maxHeight: 480, overflow: 'hidden' }}>
      {img && <img src={img.url || img} alt={post.content || 'Story'} loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />}
      {post.content && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          color: '#fff', padding: 16
        }}>
          {post.content}
        </div>
      )}
    </div>
  );
}

function ProjectBody({ post }) {
  return (
    <>
      {post.images?.[0] && (
        <div className="bsdc-post__media">
          <img src={post.images[0].url || post.images[0]} alt={post.title} loading="lazy" />
        </div>
      )}
      <div className="bsdc-post__body">
        <h3 className="bsdc-post__title">{post.title}</h3>
        <p style={{ margin: 0 }}>{truncate(post.content, 220)}</p>
        <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-sm bsdc-mt-sm bsdc-text-sm">
          {post.projectUrl && (
            <a href={post.projectUrl} target="_blank" rel="noopener noreferrer" className="bsdc-chip" onClick={(e) => e.stopPropagation()}>
              <IconLink size={12} /> Live
            </a>
          )}
          {post.githubUrl && (
            <a href={post.githubUrl} target="_blank" rel="noopener noreferrer" className="bsdc-chip" onClick={(e) => e.stopPropagation()}>
              <IconGithub size={12} /> Source
            </a>
          )}
          {(post.techStack || []).slice(0, 5).map((t) => (
            <span key={t} className="bsdc-chip">{t}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function JobBody({ post }) {
  return (
    <div className="bsdc-post__body">
      <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-xs bsdc-text-muted">
        <IconBriefcase size={12} /> Job Posting
      </div>
      <h3 className="bsdc-post__title">{post.title}</h3>
      <div className="bsdc-flex bsdc-flex-wrap bsdc-gap-sm bsdc-text-sm bsdc-text-light">
        {post.jobLocation && <span><IconMapPin size={12} /> {post.jobLocation}</span>}
        {post.jobType && <span className="bsdc-chip">{post.jobType}</span>}
        {post.jobSalary && <span className="bsdc-text-primary bsdc-text-bold">{post.jobSalary}</span>}
      </div>
      <p style={{ margin: '8px 0 0' }}>{truncate(post.content, 220)}</p>
    </div>
  );
}

function NoticeBody({ post }) {
  return (
    <div className="bsdc-post__body" style={{ borderLeft: '4px solid var(--color-warning)', paddingLeft: 12 }}>
      <h3 className="bsdc-post__title" style={{ color: 'var(--color-warning)' }}>{post.title}</h3>
      <p style={{ margin: 0 }}>{truncate(post.content, 320)}</p>
    </div>
  );
}

function PollBody({ post }) {
  const options = post.pollOptions || [];
  const total = options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
  return (
    <div className="bsdc-post__body">
      <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-xs bsdc-text-muted">
        <IconPoll size={12} /> Poll
      </div>
      <h3 className="bsdc-post__title">{post.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {options.map((opt, i) => {
          const pct = Math.round(((opt.votes || 0) / total) * 100);
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                background: 'var(--color-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, width: `${pct}%`,
                background: 'rgba(26,107,58,0.18)'
              }} />
              <div className="bsdc-flex bsdc-justify-between" style={{ position: 'relative', zIndex: 1 }}>
                <span>{opt.text}</span>
                <span className="bsdc-text-bold">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bsdc-text-xs bsdc-text-muted bsdc-mt-sm">{total} vote{total === 1 ? '' : 's'}</div>
    </div>
  );
}

function EventBody({ post }) {
  const date = post.eventDate?.toDate ? post.eventDate.toDate() : new Date(post.eventDate || 0);
  const dateStr = !Number.isNaN(date.getTime())
    ? date.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';
  return (
    <div className="bsdc-post__body">
      <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-xs bsdc-text-muted">
        <IconCalendar size={12} /> Event
      </div>
      <h3 className="bsdc-post__title">{post.title}</h3>
      {dateStr && (
        <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-primary bsdc-text-bold">
          <IconClock size={14} /> {dateStr}
        </div>
      )}
      {post.location && (
        <div className="bsdc-flex bsdc-items-center bsdc-gap-xs bsdc-text-sm bsdc-text-light">
          <IconMapPin size={12} /> {post.location}
        </div>
      )}
      <p style={{ margin: '8px 0 0' }}>{truncate(post.content, 220)}</p>
    </div>
  );
}

/** Truncate text on word boundary. */
function truncate(s = '', max = 280) {
  s = String(s || '');
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(' ');
  return `${cut.slice(0, last > 80 ? last : max)}…`;
}

function schemaFor(type) {
  return ({
    blog: 'Article', doc: 'TechArticle', wiki: 'Article',
    qa: 'Question', code: 'SoftwareSourceCode',
    project: 'CreativeWork', job: 'JobPosting',
    event: 'Event', notice: 'Article', poll: 'CreativeWork',
    story: 'SocialMediaPosting', video: 'VideoObject',
    image: 'ImageObject', text: 'SocialMediaPosting'
  })[type] || 'Article';
}

// (IconPlay is exported from Icons.jsx — no local shim needed.)
