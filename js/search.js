/**
 * BSDC Search Engine
 * Client-side search using Firestore
 */

window.BSDC = window.BSDC || {};

window.BSDC.searchEngine = {

  currentQuery: '',
  currentType: null,
  currentSort: 'latest',
  lastDoc: null,

  async init() {
    const q = window.BSDC.getParam('q') || '';
    const type = window.BSDC.getParam('type') || null;
    const sort = window.BSDC.getParam('sort') || 'latest';
    const tag = window.BSDC.getParam('tag') || null;

    this.currentQuery = q;
    this.currentType = type;
    this.currentSort = sort;

    // Set search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = q;

    // Set active type filter
    if (type) {
      document.querySelectorAll('.search-filter-btn').forEach(btn => {
        if (btn.dataset.type === type) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    }

    // Set active sort
    document.querySelectorAll('.sort-btn').forEach(btn => {
      if (btn.dataset.sort === sort) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Update page title
    if (q) {
      document.title = `Search: "${q}" — BSDC`;
      window.BSDC.seo?.setMeta({
        title: `Search: "${q}"`,
        description: `Search results for "${q}" on Bangladesh Software Development Community`,
        url: window.location.href
      });
    }

    await this.performSearch();
  },

  async performSearch() {
    this.lastDoc = null;
    const resultsEl = document.getElementById('search-results');
    const countEl = document.getElementById('results-count');

    if (resultsEl) window.BSDC.skeleton.show('search-results', 'feed', 6);

    try {
      let results = [];
      const opts = {
        lim: 20,
        orderField: this.currentSort === 'trending' ? 'upvotes' : 'createdAt'
      };

      if (this.currentType) opts.type = this.currentType;

      if (this.currentQuery) {
        results = await window.BSDC.db.searchPosts(this.currentQuery, this.currentType);
      } else {
        results = await window.BSDC.db.getPosts(opts);
      }

      this.lastDoc = results[results.length - 1]?._snap || null;

      if (countEl) {
        countEl.textContent = results.length === 0
          ? 'No results found'
          : `${results.length}${results.length === 20 ? '+' : ''} result${results.length !== 1 ? 's' : ''}`;
      }

      if (results.length === 0) {
        resultsEl.innerHTML = this.renderEmpty();
        return;
      }

      resultsEl.innerHTML = results.map(p => this.renderSearchCard(p)).join('');

      // Load more button
      const loadMoreEl = document.getElementById('search-load-more');
      if (loadMoreEl) loadMoreEl.style.display = results.length >= 20 ? 'block' : 'none';

    } catch(e) {
      console.error(e);
      if (resultsEl) resultsEl.innerHTML = `<div class="alert alert-error">Search failed. Please try again.</div>`;
    }
  },

  renderSearchCard(post) {
    const typeConfig = {
      question: { label: 'Question', cls: 'type-question', icon: '❓' },
      blog: { label: 'Blog', cls: 'type-blog', icon: '📝' },
      wiki: { label: 'Wiki', cls: 'type-wiki', icon: '📚' },
      snippet: { label: 'Snippet', cls: 'type-snippet', icon: '💻' },
      project: { label: 'Project', cls: 'type-project', icon: '🚀' },
      discussion: { label: 'Discussion', cls: 'type-discussion', icon: '💬' }
    };
    const tc = typeConfig[post.type] || { label: post.type, cls: 'type-discussion', icon: '📄' };
    const initials = window.BSDC.text.avatarInitials(post.authorName || 'U');
    const excerpt = window.BSDC.text.excerpt(post.content || '', 160);
    const votes = (post.upvotes || 0) - (post.downvotes || 0);

    return `
      <article class="post-card animate-fade-up" itemscope itemtype="https://schema.org/Article">
        <div class="post-card-header">
          <a href="/profile?u=${post.authorUsername || ''}" style="text-decoration:none">
            <div class="avatar avatar-md" style="background:#e6f4f0;color:#006A4E">
              ${post.authorAvatar
                ? `<img src="${post.authorAvatar}" alt="${post.authorName}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
                : initials}
            </div>
          </a>
          <div class="post-card-meta">
            <a href="/profile?u=${post.authorUsername || ''}" class="post-card-author">${post.authorName || 'BSDC Member'}</a>
            <div class="post-card-time">
              ${window.BSDC.time.ago(post.createdAt)}
              ${post.isSolved ? ' · <span style="color:#006A4E;font-weight:600">✅ Solved</span>' : ''}
            </div>
          </div>
          <span class="post-card-type-badge ${tc.cls}">${tc.icon} ${tc.label}</span>
        </div>
        <div class="post-card-body">
          <a href="/post?slug=${post.slug}" class="post-card-title" itemprop="headline">${this.highlightQuery(post.title)}</a>
          ${excerpt ? `<p class="post-card-excerpt">${this.highlightQuery(excerpt)}</p>` : ''}
          ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" class="post-card-image" loading="lazy"/>` : ''}
        </div>
        ${post.tags?.length ? `
          <div class="post-card-tags">
            ${post.tags.slice(0, 5).map(t => `<a href="/tag?t=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}
          </div>
        ` : ''}
        <div class="post-card-actions">
          <span class="action-btn">▲ ${votes}</span>
          <a href="/post?slug=${post.slug}" class="action-btn">💬 ${post.answerCount || post.commentCount || 0}</a>
          <span class="action-btn" style="margin-left:auto;cursor:default">👁️ ${window.BSDC.text.formatNumber(post.views || 0)}</span>
        </div>
      </article>
    `;
  },

  highlightQuery(text) {
    if (!this.currentQuery || !text) return text;
    const regex = new RegExp(`(${this.currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:#fef9c3;border-radius:2px;padding:0 2px">$1</mark>');
  },

  renderEmpty() {
    return `
      <div style="text-align:center;padding:4rem 2rem;background:white;border:1px solid #E2E8F0;border-radius:0.75rem">
        <div style="font-size:4rem;margin-bottom:1rem">🔍</div>
        <h3 style="font-size:1.25rem;font-weight:700;color:#1E293B;margin-bottom:0.5rem">No results found</h3>
        <p style="color:#64748B;margin-bottom:1.5rem">
          ${this.currentQuery
            ? `No posts found for "<strong>${this.currentQuery}</strong>". Try different keywords or browse all posts.`
            : 'No posts found in this category yet. Be the first to post!'}
        </p>
        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
          <a href="/submit" class="btn btn-primary">✏️ Create First Post</a>
          <button class="btn btn-secondary" onclick="document.getElementById('search-input').value='';window.BSDC.searchEngine.currentQuery='';window.BSDC.searchEngine.performSearch()">Browse All</button>
        </div>
      </div>
    `;
  },

  updateURL() {
    const params = new URLSearchParams();
    if (this.currentQuery) params.set('q', this.currentQuery);
    if (this.currentType) params.set('type', this.currentType);
    if (this.currentSort !== 'latest') params.set('sort', this.currentSort);
    const newURL = `/search${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
  }
};
