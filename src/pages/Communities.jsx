/**
 * src/pages/Communities.jsx
 * /communities — directory of all communities + "Create new" button.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useAuth } from '../hooks/useAuth.js';
import CreateCommunity from '../components/community/CreateCommunity.jsx';
import Avatar from '../components/common/Avatar.jsx';
import { LoadingCenter } from '../components/common/Spinner.jsx';
import { IconUsers, IconPlus, IconBookOpen } from '../components/common/Icons.jsx';

export default function Communities() {
  const { profile } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, 'communities'), orderBy('members', 'desc'), limit(60)))
      .then((snap) => {
        if (cancelled) return;
        setCommunities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Helmet>
        <title>Communities | BSDC — Bangladesh Software Development Community</title>
        <meta name="description" content="Discover BSDC communities — Reddit-style subs for Bangladeshi developers covering React, Node.js, Laravel, mobile, AI, and more." />
        <link rel="canonical" href="https://www.bsdc.info.bd/communities" />
      </Helmet>

      <div className="bsdc-flex bsdc-justify-between bsdc-items-center bsdc-mb-md">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem' }}><IconUsers size={20} /> Communities</h1>
          <p className="bsdc-text-muted bsdc-text-sm" style={{ margin: 0 }}>
            Join sub-communities by interest. Anyone can create one — start yours.
          </p>
        </div>
        {profile && (
          <button type="button" className="bsdc-btn bsdc-btn--primary" onClick={() => setCreateOpen(true)}>
            <IconPlus size={16} /> New community
          </button>
        )}
      </div>

      {loading ? (
        <LoadingCenter />
      ) : communities.length === 0 ? (
        <div className="bsdc-empty">
          <div className="bsdc-empty__icon"><IconUsers /></div>
          <div className="bsdc-empty__title">No communities yet</div>
          <div className="bsdc-empty__body">Be the first to create one.</div>
        </div>
      ) : (
        <div className="bsdc-grid-2">
          {communities.map((c) => (
            <Link
              key={c.id}
              to={`/bsdc/${c.slug}`}
              className="bsdc-card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="bsdc-flex bsdc-gap-md bsdc-items-center">
                <Avatar src={c.iconURL} name={c.name} size="lg" />
                <div className="bsdc-flex-1" style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </h3>
                  <p className="bsdc-text-xs bsdc-text-muted" style={{ margin: '4px 0 0' }}>
                    <IconUsers size={11} /> {c.members || 0} members · <IconBookOpen size={11} /> {c.posts || 0} posts
                  </p>
                  {c.description && (
                    <p className="bsdc-text-sm" style={{ margin: '6px 0 0', color: 'var(--color-text-light)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateCommunity open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
