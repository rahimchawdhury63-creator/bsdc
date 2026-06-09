/**
 * src/components/posts/PostCreator.jsx
 * ---------------------------------------------------------------------------
 * Universal post composer modal — picks a post type, renders the matching
 * sub-form, then writes a fully-SEO'd post to Firestore.
 *
 * Used everywhere a "+" button needs to open the composer:
 *   - Header (+ icon)
 *   - Mobile bottom nav center button
 *   - Composer trigger card on the home feed
 *
 * Props:
 *   - open / onClose
 *   - currentUser
 *   - initialType  : optional, opens directly to that type
 *   - onCreated(postId, post) : called after successful save
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../firebase/firestore.js';
import { awardPoints } from '../../firebase/points.js';
import { POINTS_RULES } from '../../utils/pointsCalculator.js';
import { generatePostSEO, postUrl } from '../../utils/seoGenerator.js';
import { toast } from '../common/Toast.jsx';
import Spinner from '../common/Spinner.jsx';
import { bsdcLockScroll } from '../../scripts/interactions.js';
import {
  IconClose, IconText, IconImage, IconVideo, IconQuestion, IconBlog, IconDoc,
  IconWiki, IconCode, IconStory, IconProject, IconJob, IconNotice, IconPoll,
  IconEvent, IconChevronLeft, IconLightning
} from '../common/Icons.jsx';

// Sub-form components (each owns its own UI + builds a `payload` object).
import TextPostForm from './TextPost.jsx';
import ImagePostForm from './ImagePost.jsx';
import VideoPostForm from './VideoPost.jsx';
import QAPostForm from './QAPost.jsx';
import BlogPostForm from './BlogPost.jsx';
import DocPostForm from './DocPost.jsx';
import WikiPostForm from './WikiPost.jsx';
import CodeSnippetForm from './CodeSnippet.jsx';
import StoryPostForm from './StoryPost.jsx';
import ProjectPostForm from './ProjectPost.jsx';
import JobPostForm from './JobPost.jsx';
import NoticePostForm from './NoticePost.jsx';
import PollPostForm from './PollPost.jsx';
import EventPostForm from './EventPost.jsx';

/** Type catalog — drives the picker grid + form lookup + URL segments. */
const TYPES = [
  { id: 'text',    label: 'Text',          Icon: IconText,     Form: TextPostForm,   tagline: 'A short status' },
  { id: 'image',   label: 'Image',         Icon: IconImage,    Form: ImagePostForm,  tagline: 'Photos + caption' },
  { id: 'video',   label: 'Video',         Icon: IconVideo,    Form: VideoPostForm,  tagline: 'Share a clip' },
  { id: 'qa',      label: 'Q&A',           Icon: IconQuestion, Form: QAPostForm,     tagline: 'Ask the community' },
  { id: 'blog',    label: 'Blog',          Icon: IconBlog,     Form: BlogPostForm,   tagline: 'Long-form article' },
  { id: 'doc',     label: 'Documentation', Icon: IconDoc,      Form: DocPostForm,    tagline: 'API docs / how-to' },
  { id: 'wiki',    label: 'Wiki',          Icon: IconWiki,     Form: WikiPostForm,   tagline: 'Collaborative page' },
  { id: 'code',    label: 'Code Snippet',  Icon: IconCode,     Form: CodeSnippetForm,tagline: 'Highlighted code' },
  { id: 'story',   label: 'Story (24h)',   Icon: IconStory,    Form: StoryPostForm,  tagline: 'Vanishes in 24h' },
  { id: 'project', label: 'Project',       Icon: IconProject,  Form: ProjectPostForm,tagline: 'Show your build' },
  { id: 'job',     label: 'Job Posting',   Icon: IconJob,      Form: JobPostForm,    tagline: 'Hire developers' },
  { id: 'notice',  label: 'Notice',        Icon: IconNotice,   Form: NoticePostForm, tagline: 'Announcement' },
  { id: 'poll',    label: 'Poll',          Icon: IconPoll,     Form: PollPostForm,   tagline: 'Ask the crowd' },
  { id: 'event',   label: 'Event',         Icon: IconEvent,    Form: EventPostForm,  tagline: 'Meetup / webinar' }
];

export default function PostCreator({
  open,
  onClose,
  currentUser,
  initialType,
  onCreated
}) {
  const navigate = useNavigate();
  const [pickedType, setPickedType] = useState(initialType || null);
  const [submitting, setSubmitting] = useState(false);

  // Lock scroll behind the modal.
  useEffect(() => {
    bsdcLockScroll(!!open);
    return () => bsdcLockScroll(false);
  }, [open]);

  // Reset when re-opened with a fresh initialType.
  useEffect(() => {
    if (open) setPickedType(initialType || null);
  }, [open, initialType]);

  if (!open) return null;

  if (!currentUser) {
    return (
      <div className="bsdc-modal-backdrop" role="dialog" aria-label="Sign in required" onClick={onClose}>
        <div className="bsdc-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bsdc-modal__header">
            <h2 className="bsdc-modal__title">Sign in to post</h2>
            <button type="button" className="bsdc-icon-btn" onClick={onClose} aria-label="Close">
              <IconClose />
            </button>
          </div>
          <div className="bsdc-modal__body bsdc-text-center">
            <p>You need a BSDC account to create posts.</p>
            <button
              type="button"
              className="bsdc-btn bsdc-btn--primary"
              onClick={() => { onClose(); navigate('/login'); }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Submit handler — each sub-form calls this with its `payload`.
   * We attach author info + auto-SEO + persist.
   */
  const handleSubmit = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Build the base post object.
      const base = {
        type: pickedType,
        title: payload.title || '',
        content: payload.content || '',
        images: payload.images || [],
        videos: payload.videos || [],
        codeLanguage: payload.codeLanguage,
        codeContent: payload.codeContent,
        projectUrl: payload.projectUrl,
        githubUrl: payload.githubUrl,
        techStack: payload.techStack || [],
        jobSalary: payload.jobSalary,
        jobLocation: payload.jobLocation,
        jobType: payload.jobType,
        pollOptions: payload.pollOptions,
        eventDate: payload.eventDate,
        tags: payload.tags || [],
        community: payload.community || '',
        location: payload.location || '',
        language: payload.language || currentUser.language || 'en',
        privacy: payload.privacy || 'public',
        expiresAt: pickedType === 'story'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
        // Author snapshot — denormalised so feed reads don't need a join.
        authorUsername: currentUser.username,
        authorDisplayName: currentUser.displayName || currentUser.username,
        authorPhotoURL: currentUser.photoURL || '',
        authorIsVerified: !!currentUser.isVerified,
        schemaType: schemaForType(pickedType)
      };

      // Auto-generate SEO fields.
      const seo = generatePostSEO(base);
      const full = { ...base, ...seo };

      // Persist.
      const id = await createPost(currentUser.uid, full);
      const created = { ...full, id };
      // Award publishing points (skip stories — they're ephemeral).
      if (pickedType !== 'story') {
        awardPoints(currentUser.uid, POINTS_RULES.post, `published a ${pickedType} post`).catch(() => {});
      }
      toast.success('Post published.');
      if (onCreated) onCreated(id, created);
      onClose();
      // For long-form types, navigate to the post page immediately.
      if (['blog','doc','wiki','qa','project'].includes(pickedType)) {
        navigate(postUrl(created));
      }
    } catch (err) {
      toast.error(err?.message || 'Could not publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  const ActiveForm = pickedType ? TYPES.find((t) => t.id === pickedType)?.Form : null;
  const activeMeta = pickedType ? TYPES.find((t) => t.id === pickedType) : null;

  return (
    <div className="bsdc-modal-backdrop" role="dialog" aria-label="Create post" onClick={onClose}>
      <div className="bsdc-modal bsdc-modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="bsdc-modal__header">
          <div className="bsdc-flex bsdc-items-center bsdc-gap-sm">
            {pickedType && (
              <button
                type="button"
                className="bsdc-icon-btn bsdc-icon-btn--sm"
                onClick={() => setPickedType(null)}
                aria-label="Back"
              >
                <IconChevronLeft />
              </button>
            )}
            <h2 className="bsdc-modal__title">
              {pickedType ? `New ${activeMeta?.label}` : 'Create a post'}
            </h2>
          </div>
          <button type="button" className="bsdc-icon-btn" onClick={onClose} aria-label="Close" disabled={submitting}>
            <IconClose />
          </button>
        </div>

        <div className="bsdc-modal__body">
          {!pickedType ? (
            <TypePicker onPick={setPickedType} />
          ) : (
            <>
              <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-md">
                <span className="bsdc-bootstrap__icon" style={{ width: 40, height: 40, marginBottom: 0 }}>
                  <activeMeta.Icon size={20} color="#1a6b3a" />
                </span>
                <span className="bsdc-text-sm bsdc-text-muted">{activeMeta?.tagline}</span>
              </div>
              <ActiveForm
                currentUser={currentUser}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={onClose}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Grid of all 14 post types. */
function TypePicker({ onPick }) {
  return (
    <>
      <div className="bsdc-flex bsdc-items-center bsdc-gap-sm bsdc-mb-md bsdc-text-muted bsdc-text-sm">
        <IconLightning size={16} color="#1a6b3a" />
        Choose what you want to share. Every post type is SEO-optimized automatically.
      </div>
      <div className="bsdc-grid-4" style={{ gap: 8 }}>
        {TYPES.map(({ id, label, Icon, tagline }) => (
          <button
            key={id}
            type="button"
            className="bsdc-card"
            onClick={() => onPick(id)}
            style={{
              padding: 'var(--space-md)',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <span
              className="bsdc-bootstrap__icon"
              style={{ width: 44, height: 44, marginBottom: 8 }}
            >
              <Icon size={22} color="#1a6b3a" />
            </span>
            <div className="bsdc-text-bold bsdc-text-sm">{label}</div>
            <div className="bsdc-text-xs bsdc-text-muted">{tagline}</div>
          </button>
        ))}
      </div>
    </>
  );
}

/** Map post type → JSON-LD @type so SEOHead can emit the right schema. */
function schemaForType(t) {
  return ({
    blog: 'Article',
    doc: 'TechArticle',
    wiki: 'Article',
    qa: 'QAPage',
    code: 'SoftwareSourceCode',
    project: 'CreativeWork',
    job: 'JobPosting',
    event: 'Event',
    notice: 'Article',
    poll: 'CreativeWork',
    story: 'SocialMediaPosting',
    video: 'VideoObject',
    image: 'ImageObject',
    text: 'SocialMediaPosting'
  })[t] || 'Article';
}
