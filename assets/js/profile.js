// ============================================
// BSDC — Profile Page Manager
// Handles: ID Card, QR Code, Edit Profile,
//          User Posts, Share Profile
// ============================================

import { db, auth, showToast, timeAgo, sanitizeHTML, formatNum } from './firebase-init.js';
import { getCurrentUser } from './auth.js';
import {
  doc, getDoc, updateDoc, collection, query,
  where, orderBy, limit, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { uploadImage } from './upload.js';

const params = new URLSearchParams(window.location.search);
const uid = params.get('uid');

if (!uid) {
  window.location.href = '/';
} else {
  loadProfile(uid);
}

async function loadProfile(uid) {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) {
      document.getElementById('profile-skeleton').classList.add('hidden');
      document.getElementById('profile-error').classList.remove('hidden');
      return;
    }

    const user = { id: uid, ...userSnap.data() };
    renderProfile(user);
    injectProfileSEO(user);
    loadUserPosts(uid, 'all');
    generateQRCode(uid);

    // Check if own profile
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.uid === uid) {
        setupEditProfile(user, currentUser);
      }
    });

  } catch(err) {
    console.error(err);
    document.getElementById('profile-skeleton').classList.add('hidden');
    document.getElementById('profile-error').classList.remove('hidden');
  }
}

function renderProfile(user) {
  document.getElementById('profile-skeleton').classList.add('hidden');
  document.getElementById('profile-content').classList.remove('hidden');

  const profileUrl = `https://www.bsdc.info.bd/profile?uid=${user.id}`;

  // ID Card
  document.getElementById('card-avatar').src = user.photoURL || '/assets/img/avatar-placeholder.svg';
  document.getElementById('card-avatar').alt = user.displayName || 'Developer';
  document.getElementById('card-name').textContent = user.displayName || 'Developer';
  document.getElementById('card-username').textContent = `@${user.username || 'member'}`;
  document.getElementById('card-role').textContent = user.role === 'admin' ? '⚡ Admin' : user.role === 'moderator' ? '🛡️ Moderator' : '💻 Member';
  document.getElementById('card-posts').textContent = formatNum(user.postCount || 0);
  document.getElementById('card-answers').textContent = formatNum(user.answerCount || 0);
  document.getElementById('card-points').textContent = formatNum(user.points || 0);
  document.getElementById('card-solved').textContent = formatNum(user.solvedCount || 0);
  document.getElementById('card-uid').textContent = `ID: ${user.id.substring(0, 16)}...`;
  document.getElementById('card-url').textContent = `bsdc.info.bd/profile`;

  if (user.joinedAt) {
    const date = user.joinedAt.toDate ? user.joinedAt.toDate() : new Date(user.joinedAt);
    document.getElementById('card-joined').textContent = `Joined: ${date.toLocaleDateString('en-BD', { year: 'numeric', month: 'short' })}`;
  }

  // Bio & Social
  document.getElementById('profile-bio-text').textContent = user.bio || 'BSDC Community Member — Bangladesh Software Developer.';
  document.getElementById('posts-by-name').textContent = user.displayName || 'User';

  if (user.social?.github) {
    const el = document.getElementById('social-github');
    el.href = user.social.github;
    el.classList.remove('hidden');
    el.style.display = 'flex';
  }
  if (user.social?.website) {
    const el = document.getElementById('social-website');
    el.href = user.social.website;
    el.classList.remove('hidden');
    el.style.display = 'flex';
  }

  // Share button
  document.getElementById('share-profile-btn').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.displayName} — BSDC Developer Profile`,
          text: `Check out ${user.displayName}'s developer profile on BSDC — Bangladesh Software Development Community!`,
          url: profileUrl
        });
      } catch(e) {}
    } else {
      navigator.clipboard.writeText(profileUrl).then(() => showToast('Profile link copied! 🔗'));
    }
  });

  // Post type filter tabs
  document.querySelectorAll('[data-ptype]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-ptype]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadUserPosts(user.id, btn.dataset.ptype);
    });
  });
}

function injectProfileSEO(user) {
  const profileUrl = `https://www.bsdc.info.bd/profile?uid=${user.id}`;
  const displayName = user.displayName || 'Developer';
  const username = user.username || user.id;

  document.title = `BSDC — ${displayName}`;
  document.getElementById('page-title').textContent = `BSDC — ${displayName}`;
  document.getElementById('page-desc').setAttribute('content',
    `${displayName}'s developer profile on BSDC — Bangladesh Software Development Community. ${user.bio || 'Bangladeshi software developer.'} ${user.points || 0} points, ${user.postCount || 0} posts.`
  );
  document.getElementById('page-canonical').href = profileUrl;

  document.getElementById('og-title').setAttribute('content', `BSDC — ${displayName}`);
  document.getElementById('og-desc').setAttribute('content', `${displayName}'s profile on Bangladesh Software Development Community. ${user.bio || ''}`);
  document.getElementById('og-image').setAttribute('content', user.photoURL || 'https://www.bsdc.info.bd/assets/img/og-cover.png');
  document.getElementById('og-url').setAttribute('content', profileUrl);
  document.getElementById('tw-title').setAttribute('content', `BSDC — ${displayName}`);
  document.getElementById('tw-desc').setAttribute('content', `${displayName}'s developer profile on BSDC.`);
  document.getElementById('tw-image').setAttribute('content', user.photoURL || 'https://www.bsdc.info.bd/assets/img/og-cover.png');

  // Person JSON-LD
  document.getElementById('jsonld-profile').textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": `BSDC — ${displayName}`,
    "url": profileUrl,
    "description": `${displayName}'s developer profile on Bangladesh Software Development Community.`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Bangladesh Software Development Community",
      "url": "https://www.bsdc.info.bd"
    },
    "mainEntity": {
      "@type": "Person",
      "name": displayName,
      "alternateName": username,
      "url": profileUrl,
      "image": user.photoURL || '',
      "description": user.bio || 'Bangladesh Software Developer on BSDC',
      "memberOf": {
        "@type": "Organization",
        "name": "Bangladesh Software Development Community",
        "url": "https://www.bsdc.info.bd"
      },
      "sameAs": [
        user.social?.github || '',
        user.social?.website || ''
      ].filter(Boolean)
    }
  });
}

function generateQRCode(uid) {
  const container = document.getElementById('qr-code');
  if (!container || typeof QRCode === 'undefined') return;

  const profileUrl = `https://www.bsdc.info.bd/profile?uid=${uid}`;

  try {
    new QRCode(container, {
      text: profileUrl,
      width: 72,
      height: 72,
      colorDark: '#006A4E',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) {
    container.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#006A4E" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M17 14h.01M14 17h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01"/></svg>`;
  }
}

async function loadUserPosts(uid, typeFilter) {
  const container = document.getElementById('user-posts');
  container.innerHTML = `<div class="skeleton-post" aria-hidden="true"><div class="skeleton skeleton-avatar"></div><div class="skeleton-post-content" style="flex:1;"><div class="skeleton skeleton-line w-80"></div><div class="skeleton skeleton-line w-60"></div></div></div>`;

  try {
    let q;
    const postsRef = collection(db, 'posts');

    if (typeFilter === 'all') {
      q = query(postsRef, where('authorId', '==', uid), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(20));
    } else {
      q = query(postsRef, where('authorId', '==', uid), where('type', '==', typeFilter), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(20));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:#64748B;background:#fff;border-radius:12px;border:1px solid #E2E8F0;">
        <p>No ${typeFilter === 'all' ? '' : typeFilter + ' '}posts yet.</p>
      </div>`;
      return;
    }

    container.innerHTML = '';
    const typeColors = { question:'badge-question', wiki:'badge-wiki', blog:'badge-blog', snippet:'badge-snippet', project:'badge-project', post:'badge-post' };

    snap.forEach(d => {
      const p = { id: d.id, ...d.data() };
      container.insertAdjacentHTML('beforeend', `
        <article class="post-card" style="margin-bottom:10px;">
          <div class="vote-col">
            <span style="font-weight:700;font-size:0.9rem;">${formatNum(p.voteCount || 0)}</span>
            <span style="font-size:0.7rem;color:#94A3B8;">votes</span>
          </div>
          <div class="post-main">
            <div class="post-meta">
              <span class="post-type-badge ${typeColors[p.type] || 'badge-post'}">${p.type}</span>
              ${p.isSolved ? '<span class="solved-badge">✓ Solved</span>' : ''}
              <span class="post-time">${timeAgo(p.createdAt)}</span>
            </div>
            <a href="/post?slug=${encodeURIComponent(p.slug)}" class="post-title">${sanitizeHTML(p.title)}</a>
            ${p.excerpt ? `<p class="post-excerpt">${sanitizeHTML(p.excerpt)}</p>` : ''}
            <div class="post-stats">
              <span class="post-stat">${formatNum(p.answerCount || p.commentCount || 0)} ${p.type === 'question' ? 'answers' : 'comments'}</span>
              <span class="post-stat">${formatNum(p.viewCount || 0)} views</span>
            </div>
          </div>
        </article>
      `);
    });
  } catch(err) {
    container.innerHTML = '<p style="color:#EF4444;text-align:center;padding:20px;">Failed to load posts.</p>';
  }
}

function setupEditProfile(userData, firebaseUser) {
  const editSection = document.getElementById('edit-profile-section');
  editSection.classList.remove('hidden');

  // Populate fields
  document.getElementById('edit-displayname').value = userData.displayName || '';
  document.getElementById('edit-username').value = userData.username || '';
  document.getElementById('edit-bio').value = userData.bio || '';
  document.getElementById('edit-github').value = userData.social?.github || '';
  document.getElementById('edit-website').value = userData.social?.website || '';
  document.getElementById('edit-avatar-preview').src = userData.photoURL || '/assets/img/avatar-placeholder.svg';

  // Avatar preview
  document.getElementById('edit-avatar-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { document.getElementById('edit-avatar-preview').src = ev.target.result; };
    reader.readAsDataURL(file);
  });

  // Save form
  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      let photoURL = userData.photoURL || '';
      const avatarFile = document.getElementById('edit-avatar-input').files[0];
      if (avatarFile) {
        photoURL = await uploadImage(avatarFile);
      }

      const updates = {
        displayName: document.getElementById('edit-displayname').value.trim(),
        username: document.getElementById('edit-username').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: document.getElementById('edit-bio').value.trim(),
        photoURL,
        'social.github': document.getElementById('edit-github').value.trim(),
        'social.website': document.getElementById('edit-website').value.trim(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', userData.id), updates);
      if (photoURL || updates.displayName) {
        await updateProfile(firebaseUser, {
          displayName: updates.displayName,
          photoURL: photoURL || firebaseUser.photoURL
        });
      }

      showToast('Profile updated! ✅');

      // Refresh card
      document.getElementById('card-name').textContent = updates.displayName;
      document.getElementById('card-username').textContent = `@${updates.username}`;
      if (photoURL) {
        document.getElementById('card-avatar').src = photoURL;
        document.getElementById('edit-avatar-preview').src = photoURL;
      }

    } catch(err) {
      showToast('Failed to update profile. Try again.', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Save Changes';
  });
}
