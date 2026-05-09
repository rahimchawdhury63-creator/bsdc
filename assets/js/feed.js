// ============================================
// BSDC — Homepage Feed Manager
// ============================================

import { db } from './firebase-init.js';
import { timeAgo, sanitizeHTML, formatNum } from './firebase-init.js';
import {
  collection, query, orderBy, limit, startAfter,
  getDocs, where, getDoc, doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const POSTS_PER_PAGE = 15;
let lastDoc = null;
let currentSort = 'latest';
let currentFilter = 'all';
let isLoading = false;

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  readURLParams();
  initFeedTabs();
  initSideNavFilter();
  loadFeed(true);
  loadPopularTags();
  loadTopContributors();
  loadTrendingTopics();
  loadStats();
  initSuggestionSearch();
});

// ── Read URL params ──
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const filter = params.get('filter');
  if (filter) currentFilter = filter;

  // Update active sidebar item
  document.querySelectorAll('.side-nav-item').forEach(item => {
    const f = item.dataset.filter;
    item.classList.toggle('active', f === currentFilter || (currentFilter === 'all' && f === 'all'));
  });

  // Update filter label
  const label = document.getElementById('feed-filter-label');
  if (label && currentFilter !== 'all') {
    label.textContent = `Showing: ${currentFilter}`;
  }
}

// ── Feed Tabs ──
function initFeedTabs() {
  document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feed-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentSort = tab.dataset.sort;
      lastDoc = null;
      loadFeed(true);
    });
  });
}

// ── Sidebar Filter ──
function initSideNavFilter() {
  document.querySelectorAll('.side-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.side-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentFilter = item.dataset.filter;
      lastDoc = null;

      const label = document.getElementById('feed-filter-label');
      if (label) label.textContent = currentFilter !== 'all' ? `Showing: ${currentFilter}` : '';

      // Update URL without reload
      const url = new URL(window.location.href);
      if (currentFilter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', currentFilter);
      window.history.pushState({}, '', url);

      loadFeed(true);
    });
  });
}

// ── Build Firestore Query ──
function buildQuery() {
  let q;
  const postsRef = collection(db, 'posts');

  // Filter by type
  if (currentFilter !== 'all') {
    if (currentSort === 'latest') {
      q = query(postsRef, where('type', '==', currentFilter), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE));
    } else if (currentSort === 'hot') {
      q = query(postsRef, where('type', '==', currentFilter), where('status', '==', 'published'), orderBy('hotScore', 'desc'), limit(POSTS_PER_PAGE));
    } else if (currentSort === 'top') {
      q = query(postsRef, where('type', '==', currentFilter), where('status', '==', 'published'), orderBy('voteCount', 'desc'), limit(POSTS_PER_PAGE));
    } else if (currentSort === 'solved') {
      q = query(postsRef, where('type', '==', 'question'), where('isSolved', '==', true), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE));
    }
  } else {
    if (currentSort === 'latest') {
      q = query(postsRef, where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE));
    } else if (currentSort === 'hot') {
      q = query(postsRef, where('status', '==', 'published'), orderBy('hotScore', 'desc'), limit(POSTS_PER_PAGE));
    } else if (currentSort === 'top') {
      q = query(postsRef, where('status', '==', 'published'), orderBy('voteCount', 'desc'), limit(POSTS_PER_PAGE));
    } else if (currentSort === 'solved') {
      q = query(postsRef, where('type', '==', 'question'), where('isSolved', '==', true), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(POSTS_PER_PAGE));
    }
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  return q;
}

// ── Load Feed ──
async function loadFeed(reset = false) {
  if (isLoading) return;
  isLoading = true;

  const container = document.getElementById('feed-posts');
  const loadMoreWrapper = document.getElementById('load-more-wrapper');

  if (reset) {
    lastDoc = null;
    container.innerHTML = getSkeletons(4);
    if (loadMoreWrapper) loadMoreWrapper.classList.add('hidden');
  }

  try {
    const q = buildQuery();
    const snapshot = await getDocs(q);

    if (reset) container.innerHTML = '';

    if (snapshot.empty && reset) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#64748B;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" style="margin:0 auto 16px;" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p style="font-size:1rem;font-weight:600;margin-bottom:6px;">No posts found</p>
          <p style="font-size:0.875rem;">Be the first to <a href="/ask" style="color:#006A4E;font-weight:600;">ask a question</a> or <a href="/write" style="color:#006A4E;font-weight:600;">write a post</a>!</p>
        </div>
      `;
      isLoading = false;
      return;
    }

    snapshot.forEach(docSnap => {
      const post = { id: docSnap.id, ...docSnap.data() };
      container.insertAdjacentHTML('beforeend', renderPostCard(post));
    });

    // Update last doc for pagination
    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    // Show/hide load more
    if (loadMoreWrapper) {
      loadMoreWrapper.classList.toggle('hidden', snapshot.docs.length < POSTS_PER_PAGE);
    }

    // Add event listeners
    attachPostCardListeners();

    // Highlight code snippets
    container.querySelectorAll('pre code').forEach(el => {
      if (window.hljs) window.hljs.highlightElement(el);
    });

  } catch (err) {
    console.error('Feed load error:', err);
    if (reset) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:#EF4444;">Failed to load posts. Please refresh.</div>`;
    }
  }

  isLoading = false;
}

// ── Load More Button ──
document.addEventListener('DOMContentLoaded', () => {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => loadFeed(false));
  }
});

// ── Render Post Card ──
function renderPostCard(post) {
  const typeColors = {
    question: 'badge-question',
    wiki: 'badge-wiki',
    blog: 'badge-blog',
    snippet: 'badge-snippet',
    project: 'badge-project',
    post: 'badge-post'
  };
  const typeIcons = {
    question: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    wiki: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    blog: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`,
    snippet: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    project: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>`,
    post: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  };

  const tags = (post.tags || []).slice(0, 4).map(tag =>
    `<a href="/tag?name=${encodeURIComponent(tag)}" class="tag-pill">${sanitizeHTML(tag)}</a>`
  ).join('');

  const snippetPreview = post.type === 'snippet' && post.codeSnippet
    ? `<div class="snippet-preview"><pre><code class="language-${post.language || 'javascript'}">${sanitizeHTML(post.codeSnippet.substring(0, 300))}</code></pre><div class="snippet-fade"></div></div>`
    : '';

  const coverImg = post.coverImage
    ? `<div style="margin-bottom:12px;"><img src="${sanitizeHTML(post.coverImage)}" alt="${sanitizeHTML(post.title)}" style="width:100%;max-height:160px;object-fit:cover;border-radius:10px;" loading="lazy" /></div>`
    : '';

  return `
    <article class="post-card" data-id="${post.id}" data-type="${post.type}" itemscope itemtype="https://schema.org/Article">
      <!-- Vote -->
      <div class="vote-col" aria-label="Vote">
        <button class="vote-btn upvote-btn" data-id="${post.id}" aria-label="Upvote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <span class="vote-count" id="vote-${post.id}">${formatNum(post.voteCount || 0)}</span>
        <button class="vote-btn downvote-btn" data-id="${post.id}" aria-label="Downvote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <!-- Content -->
      <div class="post-main">
        <div class="post-meta">
          <span class="post-type-badge ${typeColors[post.type] || 'badge-post'}">
            ${typeIcons[post.type] || ''}
            ${post.type}
          </span>
          ${post.isSolved ? '<span class="solved-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>Solved</span>' : ''}
          <div class="post-author">
            <img src="${post.authorPhoto || '/assets/img/avatar-placeholder.svg'}" alt="${sanitizeHTML(post.authorName || 'User')}" width="22" height="22" loading="lazy" />
            <a href="/profile?uid=${post.authorId}">${sanitizeHTML(post.authorName || 'Anonymous')}</a>
          </div>
          <span class="post-time">${timeAgo(post.createdAt)}</span>
        </div>

        ${coverImg}

        <a href="/post?slug=${encodeURIComponent(post.slug)}" class="post-title" itemprop="headline">
          ${sanitizeHTML(post.title)}
        </a>

        ${post.excerpt ? `<p class="post-excerpt" itemprop="description">${sanitizeHTML(post.excerpt)}</p>` : ''}

        ${snippetPreview}

        <div class="post-tags">${tags}</div>

        <div class="post-stats">
          <span class="post-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            ${formatNum(post.answerCount || post.commentCount || 0)} ${post.type === 'question' ? 'answers' : 'comments'}
          </span>
          <span class="post-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ${formatNum(post.viewCount || 0)} views
          </span>
          ${post.type === 'snippet' && post.language ? `<span class="post-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>${sanitizeHTML(post.language)}</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

// ── Attach Post Card Listeners (Voting) ──
function attachPostCardListeners() {
  import('./post.js').then(postModule => {
    document.querySelectorAll('.upvote-btn').forEach(btn => {
      if (btn.dataset.listenerAdded) return;
      btn.dataset.listenerAdded = 'true';
      btn.addEventListener('click', () => postModule.handleVote(btn.dataset.id, 1));
    });
    document.querySelectorAll('.downvote-btn').forEach(btn => {
      if (btn.dataset.listenerAdded) return;
      btn.dataset.listenerAdded = 'true';
      btn.addEventListener('click', () => postModule.handleVote(btn.dataset.id, -1));
    });
  });
}

// ── Skeleton HTML ──
function getSkeletons(count) {
  return Array(count).fill('').map(() => `
    <div class="skeleton-post" aria-hidden="true">
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton-post-content" style="flex:1">
        <div class="skeleton skeleton-line w-60"></div>
        <div class="skeleton skeleton-line w-90"></div>
        <div class="skeleton skeleton-line w-40"></div>
      </div>
    </div>
  `).join('');
}

// ── Load Popular Tags ──
async function loadPopularTags() {
  const container = document.getElementById('popular-tags');
  if (!container) return;

  try {
    const snap = await getDocs(query(collection(db, 'tags'), orderBy('count', 'desc'), limit(15)));
    if (snap.empty) { container.innerHTML = '<span style="font-size:0.8rem;color:#94A3B8;padding:0 14px;">No tags yet</span>'; return; }

    container.innerHTML = '';
    snap.forEach(d => {
      const t = d.data();
      container.insertAdjacentHTML('beforeend',
        `<a href="/tag?name=${encodeURIComponent(d.id)}" class="tag-pill">${sanitizeHTML(d.id)} <span style="font-size:0.7rem;opacity:0.7;">${t.count}</span></a>`
      );
    });
  } catch(e) {
    container.innerHTML = '';
  }
}

// ── Load Top Contributors ──
async function loadTopContributors() {
  const container = document.getElementById('top-contributors');
  if (!container) return;

  try {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('points', 'desc'), limit(5)));
    if (snap.empty) { container.innerHTML = '<p style="font-size:0.8rem;color:#94A3B8;">No contributors yet</p>'; return; }

    container.innerHTML = '';
    snap.forEach((d, i) => {
      const u = d.data();
      container.insertAdjacentHTML('beforeend', `
        <a href="/profile?uid=${d.id}" class="contributor-item" aria-label="${sanitizeHTML(u.displayName || 'Developer')}">
          <img src="${u.photoURL || '/assets/img/avatar-placeholder.svg'}" alt="${sanitizeHTML(u.displayName || 'Developer')}" class="contributor-avatar" loading="lazy" />
          <div class="contributor-info">
            <div class="contributor-name">${sanitizeHTML(u.displayName || 'Developer')}</div>
            <div class="contributor-points">${formatNum(u.points || 0)} pts</div>
          </div>
          <span style="font-size:0.75rem;color:#94A3B8;">#${i + 1}</span>
        </a>
      `);
    });
  } catch(e) {
    container.innerHTML = '';
  }
}

// ── Load Trending Topics ──
async function loadTrendingTopics() {
  const container = document.getElementById('trending-topics');
  if (!container) return;

  try {
    const snap = await getDocs(query(collection(db, 'posts'), where('status', '==', 'published'), orderBy('viewCount', 'desc'), limit(6)));
    if (snap.empty) { container.innerHTML = '<p style="font-size:0.8rem;color:#94A3B8;">No trending posts yet</p>'; return; }

    container.innerHTML = '';
    snap.forEach(d => {
      const p = d.data();
      container.insertAdjacentHTML('beforeend', `
        <a href="/post?slug=${encodeURIComponent(p.slug)}" class="trending-item">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">${sanitizeHTML(p.title)}</span>
          <span class="trending-count">${formatNum(p.viewCount || 0)}</span>
        </a>
      `);
    });
  } catch(e) {
    container.innerHTML = '';
  }
}

// ── Load Community Stats ──
async function loadStats() {
  try {
    const statsRef = doc(db, 'meta', 'stats');
    const snap = await getDoc(statsRef);
    if (snap.exists()) {
      const s = snap.data();
      const mEl = document.getElementById('stat-members');
      const pEl = document.getElementById('stat-posts');
      const sEl = document.getElementById('stat-solved');
      if (mEl) animateCount(mEl, s.memberCount || 0);
      if (pEl) animateCount(pEl, s.postCount || 0);
      if (sEl) animateCount(sEl, s.solvedCount || 0);
    }
  } catch(e) {}
}

function animateCount(el, target) {
  let current = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = formatNum(current);
    if (current >= target) clearInterval(interval);
  }, 20);
}

// ── Inline Search Suggestions ──
function initSuggestionSearch() {
  const input = document.getElementById('navbar-search-input');
  const suggestions = document.getElementById('search-suggestions');
  if (!input || !suggestions) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) { suggestions.classList.remove('active'); return; }

    debounceTimer = setTimeout(() => fetchSuggestions(q, suggestions), 300);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { suggestions.classList.remove('active'); input.blur(); }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) suggestions.classList.remove('active');
  });
}

async function fetchSuggestions(queryStr, container) {
  try {
    const postsRef = collection(db, 'posts');
    const snap = await getDocs(query(
      postsRef,
      where('status', '==', 'published'),
      where('titleLower', '>=', queryStr.toLowerCase()),
      where('titleLower', '<=', queryStr.toLowerCase() + '\uf8ff'),
      limit(6)
    ));

    if (snap.empty) { container.classList.remove('active'); return; }

    container.innerHTML = '';
    snap.forEach(d => {
      const p = d.data();
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <span class="suggestion-type-badge">${p.type || 'post'}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sanitizeHTML(p.title)}</span>
      `;
      item.addEventListener('click', () => {
        window.location.href = `/post?slug=${encodeURIComponent(p.slug)}`;
      });
      container.appendChild(item);
    });

    // Add "see all results" link
    container.insertAdjacentHTML('beforeend', `
      <div class="suggestion-item" style="justify-content:center;color:#006A4E;font-weight:600;cursor:pointer;" onclick="window.location.href='/search?q=${encodeURIComponent(queryStr)}'">
        See all results for "${sanitizeHTML(queryStr)}" →
      </div>
    `);

    container.classList.add('active');
  } catch(e) {
    container.classList.remove('active');
  }
}
