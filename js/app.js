/**
 * BSDC Core App
 * Global utilities, navbar, toasts, modal, routing helpers
 * Vanilla JS — No framework — Static Cloudflare Pages compatible
 */

window.BSDC = window.BSDC || {};

// ============================================
// TOAST SYSTEM
// ============================================
window.BSDC.toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'default', duration = 3500) {
    this.init();
    const toast = document.createElement('div');
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      default: 'ℹ️'
    };
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 5000); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'default'); }
};

// ============================================
// MODAL SYSTEM
// ============================================
window.BSDC.modal = {
  _active: null,

  open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this._active = id;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(id);
    }, { once: true });
  },

  close(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    this._active = null;
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(el => {
      el.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// ============================================
// TIME UTILS
// ============================================
window.BSDC.time = {
  ago(timestamp) {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
    return date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  format(timestamp) {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-BD', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
};

// ============================================
// TEXT UTILS
// ============================================
window.BSDC.text = {
  excerpt(html, len = 150) {
    const plain = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > len ? plain.slice(0, len) + '...' : plain;
  },

  slug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
  },

  avatarInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  formatNumber(n) {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  },

  generateSearchTerms(title, tags = [], content = '') {
    const terms = new Set();
    // Add all words from title
    title.toLowerCase().split(/\W+/).filter(w => w.length > 2).forEach(w => terms.add(w));
    // Add tags
    tags.forEach(t => terms.add(t.toLowerCase()));
    // Full title variations
    terms.add(title.toLowerCase());
    return Array.from(terms).slice(0, 50);
  }
};

// ============================================
// IMGDB UPLOAD
// ============================================
window.BSDC.uploadImage = async function(file) {
  const apiKey = 'fdbfbcfd3bc5189e50a50c574515298d';

  // Validate
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10MB');
  }

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`https://api.imgdb.in/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();

  if (data.status === 200 && data.data?.url) {
    return data.data.url;
  }
  throw new Error('Image upload failed: ' + (data.message || 'Unknown error'));
};

// ============================================
// NAVBAR BUILDER
// ============================================
window.BSDC.buildNavbar = function(activePage = '') {
  const navEl = document.getElementById('navbar');
  if (!navEl) return;

  navEl.innerHTML = `
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar-inner">
        <!-- Brand -->
        <a href="/" class="navbar-brand" aria-label="BSDC Home">
          <div class="navbar-logo" aria-hidden="true">B</div>
          <div class="navbar-brand-text">
            <span class="navbar-brand-name">BSDC</span>
            <span class="navbar-brand-sub">Bangladesh Dev Community</span>
          </div>
        </a>

        <!-- Search -->
        <div class="navbar-search hide-mobile">
          <span class="navbar-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="Search posts, questions, wikis..."
            id="navbar-search-input"
            aria-label="Search BSDC"
            autocomplete="off"
          />
        </div>

        <!-- Desktop Nav -->
        <div class="navbar-nav">
          <a href="/" class="navbar-link hide-mobile ${activePage === 'home' ? 'active' : ''}" aria-label="Home">🏠 Home</a>
          <a href="/search" class="navbar-link hide-mobile ${activePage === 'search' ? 'active' : ''}" aria-label="Browse">🧭 Browse</a>

          <!-- Auth buttons (shown when logged out) -->
          <div id="nav-auth-loggedout" style="display:flex;gap:0.5rem">
            <a href="/login" class="btn btn-secondary btn-sm">Log In</a>
            <a href="/register" class="btn btn-primary btn-sm hide-mobile">Join BSDC</a>
          </div>

          <!-- User menu (shown when logged in) -->
          <div id="nav-auth-loggedin" style="display:none">
            <a href="/submit" class="btn btn-primary btn-sm hide-mobile" style="margin-right:0.5rem">
              ✏️ Post
            </a>
            <!-- Notifications -->
            <div class="dropdown relative" style="margin-right:0.5rem">
              <button class="btn btn-ghost btn-sm relative" id="notif-btn" aria-label="Notifications">
                🔔
                <span class="notif-badge" id="notif-count" style="display:none">0</span>
              </button>
              <div class="dropdown-menu" id="notif-menu" style="width:320px">
                <div style="padding:0.875rem 1rem;border-bottom:1px solid #E2E8F0;font-weight:700;font-size:0.9rem">
                  Notifications
                </div>
                <div id="notif-list" style="max-height:300px;overflow-y:auto;padding:0.5rem">
                  <p style="text-align:center;color:#64748B;padding:1rem;font-size:0.875rem">No notifications yet</p>
                </div>
              </div>
            </div>
            <!-- User dropdown -->
            <div class="dropdown">
              <button class="navbar-user-btn" id="user-menu-btn" aria-haspopup="true" aria-expanded="false">
                <div class="avatar avatar-sm" id="nav-avatar" style="width:30px;height:30px;font-size:0.75rem;background:#E2E8F0">?</div>
                <span class="text-sm font-medium hide-mobile" id="nav-username">User</span>
                <span style="font-size:0.7rem;color:#64748B">▾</span>
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item" id="nav-profile-link" href="/profile">👤 My Profile</a>
                <a class="dropdown-item" href="/dashboard">📊 Dashboard</a>
                <a class="dropdown-item" href="/submit">✏️ New Post</a>
                <div style="height:1px;background:#E2E8F0;margin:0.25rem 0"></div>
                <div class="dropdown-item danger" id="nav-signout-btn" role="button" tabindex="0">🚪 Sign Out</div>
              </div>
            </div>
          </div>

          <!-- Mobile Hamburger -->
          <button class="hamburger show-mobile" id="hamburger-btn" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu" id="mobile-menu">
      <div class="mobile-menu-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
          <strong style="font-size:1.1rem;color:#1E293B">Menu</strong>
          <button id="mobile-menu-close" style="background:#F1F5F9;border:none;width:2rem;height:2rem;border-radius:50%;cursor:pointer;font-size:1.1rem">✕</button>
        </div>
        <div style="margin-bottom:1rem">
          <input type="search" placeholder="Search..." class="form-input" id="mobile-search-input">
        </div>
        <nav style="display:flex;flex-direction:column;gap:0.25rem">
          <a href="/" class="sidebar-nav-item">🏠 Home</a>
          <a href="/search" class="sidebar-nav-item">🧭 Browse</a>
          <a href="/search?type=question" class="sidebar-nav-item">❓ Questions</a>
          <a href="/search?type=blog" class="sidebar-nav-item">📝 Blog</a>
          <a href="/search?type=snippet" class="sidebar-nav-item">💻 Code Snippets</a>
          <a href="/search?type=wiki" class="sidebar-nav-item">📚 Wiki</a>
          <a href="/about" class="sidebar-nav-item">ℹ️ About</a>
        </nav>
        <div style="margin-top:1.5rem" id="mobile-auth-section">
          <a href="/login" class="btn btn-secondary btn-full" style="margin-bottom:0.75rem">Log In</a>
          <a href="/register" class="btn btn-primary btn-full">Join BSDC</a>
        </div>
      </div>
    </div>
  `;

  // ---- Search behavior ----
  const searchInput = document.getElementById('navbar-search-input');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
      }
    });
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        // Could show suggestions
      }, 300);
    });
  }

  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = mobileSearchInput.value.trim();
        if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // ---- Hamburger ----
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-menu-close');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) mobileMenu.classList.remove('open');
    });
  }

  // ---- Dropdown toggles ----
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const btn = dropdown.querySelector('button');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
    }
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  });

  // ---- Sign out ----
  const signoutBtn = document.getElementById('nav-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', async () => {
      await window.BSDC.auth.signOut();
      window.BSDC.toast.success('Signed out successfully');
      setTimeout(() => window.location.href = '/', 500);
    });
    signoutBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') signoutBtn.click();
    });
  }

  // ---- Notification button ----
  const notifBtn = document.getElementById('notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = notifBtn.closest('.dropdown');
      if (dropdown) dropdown.classList.toggle('open');
      // Mark as read
      const user = window.BSDC.auth.currentUser;
      if (user) {
        window.BSDC.db.markNotificationsRead(user.uid).catch(() => {});
        const badge = document.getElementById('notif-count');
        if (badge) badge.style.display = 'none';
      }
    });
  }
};

// ---- Update navbar based on auth state ----
window.BSDC.updateNavAuth = function(user) {
  const loggedout = document.getElementById('nav-auth-loggedout');
  const loggedin = document.getElementById('nav-auth-loggedin');
  const navAvatar = document.getElementById('nav-avatar');
  const navUsername = document.getElementById('nav-username');
  const navProfileLink = document.getElementById('nav-profile-link');
  const mobileAuthSection = document.getElementById('mobile-auth-section');

  if (user) {
    if (loggedout) loggedout.style.display = 'none';
    if (loggedin) loggedin.style.display = 'flex';

    const profile = window.BSDC.auth.userProfile;
    const name = profile?.displayName || user.displayName || 'User';
    const username = profile?.username || '';

    if (navUsername) navUsername.textContent = profile?.displayName?.split(' ')[0] || 'User';
    if (navProfileLink) navProfileLink.href = `/profile?u=${username}`;

    if (navAvatar) {
      if (profile?.photoURL || user.photoURL) {
        navAvatar.innerHTML = `<img src="${profile?.photoURL || user.photoURL}" alt="${name}" style="width:30px;height:30px;border-radius:50%;object-fit:cover">`;
      } else {
        navAvatar.textContent = window.BSDC.text.avatarInitials(name);
        navAvatar.style.background = '#e6f4f0';
        navAvatar.style.color = '#006A4E';
      }
    }

    if (mobileAuthSection) {
      mobileAuthSection.innerHTML = `
        <a href="/profile?u=${username}" class="btn btn-secondary btn-full" style="margin-bottom:0.75rem">👤 My Profile</a>
        <a href="/submit" class="btn btn-primary btn-full">✏️ New Post</a>
      `;
    }

    // Load notifications count
    if (user.uid) {
      window.BSDC.db.getNotifications(user.uid).then(notifs => {
        const unread = notifs.filter(n => !n.isRead).length;
        const badge = document.getElementById('notif-count');
        const list = document.getElementById('notif-list');
        if (badge && unread > 0) {
          badge.style.display = 'flex';
          badge.textContent = unread > 9 ? '9+' : unread;
        }
        if (list && notifs.length > 0) {
          list.innerHTML = notifs.slice(0, 10).map(n => `
            <div style="padding:0.75rem;border-radius:0.5rem;${!n.isRead ? 'background:#f0faf7' : ''};margin-bottom:0.25rem">
              <p style="font-size:0.85rem;color:#1E293B;margin-bottom:0.25rem">${n.message || ''}</p>
              <span style="font-size:0.75rem;color:#64748B">${window.BSDC.time.ago(n.createdAt)}</span>
            </div>
          `).join('');
        }
      }).catch(() => {});
    }

  } else {
    if (loggedout) loggedout.style.display = 'flex';
    if (loggedin) loggedin.style.display = 'none';
    if (mobileAuthSection) {
      mobileAuthSection.innerHTML = `
        <a href="/login" class="btn btn-secondary btn-full" style="margin-bottom:0.75rem">Log In</a>
        <a href="/register" class="btn btn-primary btn-full">Join BSDC</a>
      `;
    }
  }
};

// ============================================
// FOOTER BUILDER
// ============================================
window.BSDC.buildFooter = function() {
  const footerEl = document.getElementById('footer');
  if (!footerEl) return;

  footerEl.innerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="footer-grid">
        <div>
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
            <div class="navbar-logo">B</div>
            <div>
              <div style="font-weight:800;color:white;font-size:1rem">BSDC</div>
              <div style="font-size:0.65rem;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em">Bangladesh Software Dev Community</div>
            </div>
          </div>
          <p class="footer-brand-text">
            Bangladesh's premier community for software developers. Ask questions, share knowledge, build projects, and grow together.
            <br><br>
            <span style="font-family:'Hind Siliguri',sans-serif;">বাংলাদেশের সফটওয়্যার ডেভেলপারদের সেরা কমিউনিটি।</span>
          </p>
        </div>
        <div>
          <div class="footer-title">Explore</div>
          <a href="/search?type=question" class="footer-link">❓ Questions</a>
          <a href="/search?type=blog" class="footer-link">📝 Blog</a>
          <a href="/search?type=wiki" class="footer-link">📚 Wiki</a>
          <a href="/search?type=snippet" class="footer-link">💻 Snippets</a>
          <a href="/search?type=project" class="footer-link">🚀 Projects</a>
        </div>
        <div>
          <div class="footer-title">Community</div>
          <a href="/about" class="footer-link">About BSDC</a>
          <a href="/register" class="footer-link">Join Community</a>
          <a href="/search" class="footer-link">Browse All</a>
          <a href="/submit" class="footer-link">Submit Post</a>
        </div>
        <div>
          <div class="footer-title">Legal</div>
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
          <a href="#" class="footer-link">Cookie Policy</a>
          <div class="footer-title" style="margin-top:1rem">Developer</div>
          <a href="/about#founder" class="footer-link">Rizwan Rahim Chowdhury</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Bangladesh Software Development Community (BSDC). All rights reserved.</p>
        <p style="margin-top:0.25rem">Built with ❤️ for Bangladeshi developers | Founder: Rizwan Rahim Chowdhury</p>
      </div>
    </footer>
  `;
};

// ============================================
// PAGE INIT HELPER
// ============================================
window.BSDC.initPage = function(options = {}) {
  const { activePage = '', onAuthReady = null } = options;

  // Build UI
  window.BSDC.buildNavbar(activePage);
  window.BSDC.buildFooter();

  // Wait for auth
  if (onAuthReady) {
    let called = false;
    window.BSDC.auth.subscribe((user, profile) => {
      if (!called) {
        called = true;
        onAuthReady(user, profile);
      }
    });
  }
};

// ============================================
// URL PARAMS HELPER
// ============================================
window.BSDC.getParam = function(name) {
  return new URLSearchParams(window.location.search).get(name);
};

// ============================================
// REQUIRE AUTH GUARD
// ============================================
// FIND and REPLACE this entire function in js/app.js

window.BSDC.requireAuth = function(redirectTo = '/login.html') {
  return new Promise((resolve) => {

    // Give Firebase max 8 seconds to restore auth state
    let resolved = false;
    let attempts = 0;
    const maxWait = 8000;
    const checkInterval = 100;

    const finish = (user) => {
      if (resolved) return;
      resolved = true;

      if (user) {
        resolve(user);
      } else {
        const currentPath = window.location.pathname + window.location.search;
        const next = encodeURIComponent(currentPath);
        window.location.href = `${redirectTo}?next=${next}`;
      }
    };

    // Check if already ready
    if (window.BSDC.auth._ready) {
      finish(window.BSDC.auth.currentUser);
      return;
    }

    // Poll until ready
    const poll = setInterval(() => {
      attempts += checkInterval;

      if (window.BSDC.auth._ready) {
        clearInterval(poll);
        finish(window.BSDC.auth.currentUser);
        return;
      }

      if (attempts >= maxWait) {
        clearInterval(poll);
        // Timeout — check localStorage for cached auth
        const hasCachedAuth = Object.keys(localStorage).some(k =>
          k.includes('firebase') || k.includes('firebaseLocalStorage')
        );
        if (hasCachedAuth) {
          // User was logged in before, wait a bit more
          setTimeout(() => {
            finish(window.BSDC.auth.currentUser);
          }, 2000);
        } else {
          finish(null);
        }
      }
    }, checkInterval);

    // Also subscribe to auth state changes as backup
    const unsubscribe = window.BSDC.auth.subscribe((user) => {
      if (window.BSDC.auth._ready) {
        clearInterval(poll);
        unsubscribe();
        finish(user);
      }
    });
  });
};

// ============================================
// DEBOUNCE
// ============================================
window.BSDC.debounce = function(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ============================================
// COPY TO CLIPBOARD
// ============================================
window.BSDC.copyToClipboard = async function(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};
