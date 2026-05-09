// ============================================
// BSDC — Search Engine
// Firestore-powered full-text prefix search
// ============================================

import { db, timeAgo, sanitizeHTML, formatNum } from './firebase-init.js';
import {
  collection, query, where, orderBy, limit,
  getDocs, startAfter
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

let currentQuery = '';
let currentFilter = 'all';
let currentSort = 'relevance';
let lastDoc = null;
let isSearching = false;
const LIMIT = 15;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  if (q) {
    document.getElementById('search-input').value = q;
    currentQuery = q.toLowerCase().trim();
    document.title = `"${q}" — Search BSDC`;
    performSearch(true);
  }

  // Input handlers
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  function triggerSearch() {
    const val = searchInput.value.trim();
    if (!val) return;
    currentQuery = val.toLowerCase();
    lastDoc = null;
    const url = new URL(window.location.href);
    url.searchParams.set('q', val);
    window.history.pushState({}, '', url);
    document.title = `"${val}" — Search BSDC`;
    performSearch(true);
  }

  searchBtn.addEventListener('click', triggerSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerSearch();
  });

  // Filter buttons
  document.querySelectorAll('.search-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.search-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      lastDoc = null;
      performSearch(true);
    });
  });

  // Sort
  document.getElementById('search-sort').addEventListener('change', (e) => {
    currentSort = e.target.value;
    lastDoc = null;
    performSearch(true);
  });

  // Load more
  document.getElementById('search-load-more-btn').addEventListener('click', () => performSearch(false));
});

async function performSearch(reset = false) {
  if (isSearching || !currentQuery) return;
  isSearching = true;

  const container = document.getElementById('search-results');
  const infoEl = document.getElementById('search-results-info');
  const emptyState = document.getElementById('search-empty-state');
  const loadMoreWrapper = document.getElementById('search-load-more');

  emptyState.style.display = 'none';

  if (reset) {
    lastDoc = null;
    container.innerHTML = getSkeletons(3);
    loadMoreWrapper.classList.add('hidden');
    infoEl.textContent = 'Searching...';
  }

  try {
    const postsRef = collection(db, 'posts');
    let constraints = [where('status', '==', 'published')];

    // Type filter
    if (currentFilter !== 'all') {
      constraints.push(where('type', '==', currentFilter));
    }

    // Text search using titleLower prefix match
    constraints.push(where('titleLower', '>=', currentQuery));
    constraints.push(where('titleLower', '<=', currentQuery + '\uf8ff'));

    // Sort
    const sortMap = {
      relevance: ['titleLower', 'asc'],
      latest: ['createdAt', 'desc'],
      votes: ['voteCount', 'desc'],
      views: ['viewCount', 'desc']
    };
    const [sortField, sortDir] = sortMap[currentSort] || ['titleLower', 'asc'];

    // Note: Firestore requires index for inequality + orderBy on different field
    // Use titleLower sort when doing prefix search to avoid index issues
    let q;
    if (currentSort === 'relevance') {
      q = query(postsRef, ...constraints, orderBy('titleLower'), limit(LIMIT));
    } else {
      // For other sorts, do client-side sort after prefix fetch
      q = query(postsRef, where('status', '==', 'published'),
        ...(currentFilter !== 'all' ? [where('type', '==', currentFilter)] : []),
        where('titleLower', '>=', currentQuery),
        where('titleLower', '<=', currentQuery + '\uf8ff'),
        orderBy('titleLower'),
        limit(50)
      );
    }

    if (lastDoc && currentSort === 'relevance') q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);

    if (reset) container.innerHTML = '';

    let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Client-side sort for non-relevance sorts
    if (currentSort !== 'relevance') {
      results = results.sort((a, b) => {
        if (currentSort === 'latest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        if (currentSort === 'votes') return (b.voteCount || 0) - (a.voteCount || 0);
        if (currentSort === 'views') return (b.viewCount || 0) - (a.viewCount || 0);
        return 0;
      }).slice(0, LIMIT);
    }

    const total = results.length;
    infoEl.textContent = reset
      ? `${total > 0 ? `Found results for` : 'No results for'} "${currentQuery}"${currentFilter !== 'all' ? ` in ${currentFilter}` : ''}`
      : '';

    if (results.length === 0 && reset) {
      container.innerHTML = getNoResultsHTML(currentQuery);
      isSearching = false;
      return;
    }

    results.forEach(post => {
      container.insertAdjacentHTML('beforeend', renderSearchResult(post, currentQuery));
    });

    lastDoc = snap.docs[snap.docs.length - 1];
    loadMoreWrapper.classList.toggle('hidden', snap.docs.length < LIMIT || currentSort !== 'relevance');

  } catch(err) {
    console.error('Search error:', err);
    if (reset) container.innerHTML = `<div style="text-align:center;padding:40px;color:#EF4444;">Search failed. Please try again.</div>`;
    infoEl.textContent = '';
  }

  isSearching = false;
}

function renderSearchResult(post, query) {
  const typeColors = { question:'badge-question', wiki:'badge-wiki', blog:'badge-blog', snippet:'badge-snippet', project:'badge-project', post:'badge-post' };
  const title = highlightMatch(sanitizeHTML(post.title), query);
  const excerpt = post.excerpt ? highlightMatch(sanitizeHTML(post.excerpt), query) : '';

  return `
    <article style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:18px;margin-bottom:10px;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);"
      onmouseenter="this.style.borderColor='#006A4E';this.style.transform='translateY(-1px)'"
      onmouseleave="this.style.borderColor='#E2E8F0';this.style.transform='none'">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
        <span class="post-type-badge ${typeColors[post.type] || 'badge-post'}">${post.type}</span>
        ${post.isSolved ? '<span class="solved-badge">✓ Solved</span>' : ''}
        <span style="font-size:0.75rem;color:#94A3B8;">${timeAgo(post.createdAt)}</span>
        <div style="display:flex;align-items:center;gap:6px;font-size:0.8rem;color:#64748B;margin-left:auto;">
          <img src="${post.authorPhoto || '/assets/img/avatar-placeholder.svg'}" alt="${sanitizeHTML(post.authorName || 'User')}" width="18" height="18" style="border-radius:50%;" loading="lazy" />
          <a href="/profile?uid=${post.authorId}" style="color:#006A4E;font-weight:600;">${sanitizeHTML(post.authorName || 'Anonymous')}</a>
        </div>
      </div>
      <a href="/post?slug=${encodeURIComponent(post.slug)}" style="display:block;font-size:1rem;font-weight:700;color:#1E293B;margin-bottom:6px;line-height:1.4;text-decoration:none;" onmouseenter="this.style.color='#006A4E'" onmouseleave="this.style.color='#1E293B'">${title}</a>
      ${excerpt ? `<p style="font-size:0.875rem;color:#64748B;line-height:1.6;margin-bottom:10px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${excerpt}</p>` : ''}
      <div style="display:flex;gap:12px;font-size:0.8rem;color:#94A3B8;align-items:center;flex-wrap:wrap;">
        <span>${formatNum(post.voteCount || 0)} votes</span>
        <span>${formatNum(post.answerCount || post.commentCount || 0)} ${post.type === 'question' ? 'answers' : 'comments'}</span>
        <span>${formatNum(post.viewCount || 0)} views</span>
        <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;">
          ${(post.tags || []).slice(0, 3).map(t => `<a href="/tag?name=${encodeURIComponent(t)}" class="tag-pill" style="font-size:0.7rem;">${sanitizeHTML(t)}</a>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark style="background:#FEF9C3;color:#1E293B;border-radius:2px;padding:0 2px;">$1</mark>');
}

function getNoResultsHTML(q) {
  return `
    <div style="text-align:center;padding:60px 20px;background:#fff;border-radius:16px;border:1px solid #E2E8F0;">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" style="margin:0 auto 16px;" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h2 style="font-size:1.1rem;color:#1E293B;margin-bottom:8px;">No results for "${sanitizeHTML(q)}"</h2>
      <p style="color:#64748B;font-size:0.875rem;margin-bottom:20px;">Try different keywords or browse by category.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <a href="/ask" class="btn btn-primary btn-sm">Ask this Question</a>
        <a href="/" class="btn btn-outline btn-sm">Browse All Posts</a>
      </div>
    </div>
  `;
}

function getSkeletons(count) {
  return Array(count).fill('').map(() => `
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:18px;margin-bottom:10px;" aria-hidden="true">
      <div class="skeleton skeleton-line w-60" style="margin-bottom:10px;height:18px;"></div>
      <div class="skeleton skeleton-line w-90" style="margin-bottom:8px;"></div>
      <div class="skeleton skeleton-line w-40"></div>
    </div>
  `).join('');
}
