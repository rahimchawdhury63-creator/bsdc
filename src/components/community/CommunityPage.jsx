/**
 * src/components/community/CommunityPage.jsx
 * /bsdc/:slug — community page (Reddit-style sub).
 *
 * Shows banner + meta + Join/Leave + feed of posts with `community: slug`.
 * Members are stored at /communities/{slug}/members/{uid}.
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  doc, getDoc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../hooks/useAuth.js';
import useFeed from '../../hooks/useFeed.js';
import FeedContainer from '../feed/FeedContainer.jsx';
import PostCreator from '../posts/PostCreator.jsx';
import Avatar from '../common/Avatar.jsx';
import Spinner, { LoadingCenter } from '../common/Spinner.jsx';
import { toast } from '../common/Toast.jsx';
import {
  IconUsers, IconCheck, IconPlus, IconUser, IconBookOpen
} from '../common/Icons.jsx';

export default function CommunityPage() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDoc(doc(db, 'communities', slug)).then(async (snap) => {
      if (cancelled) return;
      if (!snap.exists()) { setCommunity(null); setLoading(false); return; }
      setCommunity({ id: snap.id, ...snap.data() });
      if (profile) {
        const memberSnap = await getDoc(doc(db, 'communities', slug, 'members', profile.uid));
        setIsMember(memberSnap.exists());
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug, profile?.uid]);

  const feed = useFeed({ mode: 'community', community: slug, viewer: profile });

  const join = async () => {
    if (!profile) { toast.info('Sign in to join.'); return; }
    setJoining(true);
    try {
      const memRef = doc(db, 'communities', slug, 'members', profile.uid);
      if (isMember) {
        await deleteDoc(memRef);
        await updateDoc(doc(db, 'communities', slug), { members: increment(-1) });
        setIsMember(false);
        toast.success(`Left ${community.name}.`);
      } else {
        await setDoc(memRef, { uid: profile.uid, joinedAt: serverTimestamp(), role: 'member' });
        await updateDoc(doc(db, 'communities', slug), { members: increment(1) });
        setIsMember(true);
        toast.success(`Joined ${community.name}.`);
      }
      setCommunity((c) => c ? { ...c, members: (c.members || 0) + (isMember ? -1 : 1) } : c);
    } catch (err) {
      toast.error(err?.message || 'Could not update membership.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <LoadingCenter label="Loading community…" />;

  if (!community) {
    return (
      <div className="bsdc-empty">
        <div className="bsdc-empty__icon"><IconUsers /></div>
        <div className="bsdc-empty__title">Community not found</div>
        <Link to="/communities" className="bsdc-btn bsdc-btn--primary bsdc-mt-md">All communities</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{community.name} Community | BSDC</title>
        <meta name="description" content={community.description || `${community.name} on BSDC — Bangladesh Software Development Community.`} />
        <link rel="canonical" href={`https://www.bsdc.info.bd/bsdc/${slug}`} />
      </Helmet>

      <div
        className="bsdc-card bsdc-card--padless"
        style={{ overflow: 'hidden', marginBottom: 'var(--space-md)' }}
      >
        <div
          style={{
            height: 120,
            background: community.bannerURL
              ? `url(${community.bannerURL}) center/cover`
              : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
          }}
        />
        <div className="bsdc-p-md">
          <div className="bsdc-flex bsdc-items-center bsdc-gap-md">
            <Avatar src={community.iconURL} name={community.name} size="xl" />
            <div className="bsdc-flex-1">
              <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{community.name}</h1>
              <div className="bsdc-text-xs bsdc-text-muted">
                bsdc.info.bd/bsdc/{slug} · <IconUsers size={12} /> {community.members || 0} members · {community.posts || 0} posts
              </div>
            </div>
            <button
              type="button"
              className={`bsdc-btn ${isMember ? 'bsdc-btn--secondary' : 'bsdc-btn--primary'}`}
              onClick={join}
              disabled={joining}
            >
              {joining ? <Spinner size="sm" /> : (isMember ? <><IconCheck size={14} /> Joined</> : 'Join')}
            </button>
          </div>
          {community.description && (
            <p className="bsdc-mt-sm" style={{ margin: 'var(--space-sm) 0 0' }}>{community.description}</p>
          )}
        </div>
      </div>

      <div className="bsdc-flex bsdc-justify-between bsdc-items-center bsdc-mb-md">
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}><IconBookOpen size={16} /> Posts</h2>
        {profile && (
          <button type="button" className="bsdc-btn bsdc-btn--primary bsdc-btn--sm" onClick={() => setComposerOpen(true)}>
            <IconPlus size={14} /> Post here
          </button>
        )}
      </div>

      <FeedContainer
        {...feed}
        currentUser={profile}
        emptyTitle={`No posts in ${community.name} yet`}
        emptyBody="Be the first to start a discussion."
      />

      <PostCreator
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        currentUser={profile}
        // Pre-fill the community slug. The MetaStrip honors `community`.
        initialType={null}
        onCreated={() => {}}
      />
    </>
  );
}
