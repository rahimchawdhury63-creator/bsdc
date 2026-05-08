/**
 * BSDC Profile Engine
 * Developer ID Card, QR Code, Share System
 * Full SEO profile rendering
 */

window.BSDC = window.BSDC || {};

window.BSDC.profileEngine = {

  // ---- Generate QR Code (pure SVG, no library needed) ----
  generateQRCode(text, size = 60) {
    // Simple QR placeholder using a reliable CDN-free approach
    // Uses Google Charts API (free, no key needed)
    const encoded = encodeURIComponent(text);
    return `<img
      src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=006A4E&bgcolor=FFFFFF&margin=2"
      alt="QR Code for ${text}"
      width="${size}"
      height="${size}"
      style="border-radius:4px;display:block"
      loading="lazy"
    />`;
  },

  // ---- Render Developer ID Card ----
  renderIDCard(profile, container) {
    if (!container) return;
    const initials = window.BSDC.text.avatarInitials(profile.displayName || 'U');
    const profileUrl = `https://www.bsdc.info.bd/profile?u=${profile.username}`;
    const joinDate = profile.createdAt
      ? (profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt))
      : new Date();
    const joinYear = joinDate.getFullYear();
    const joinMonth = joinDate.toLocaleDateString('en-BD', { month: 'short', year: 'numeric' });
    const badgeId = 'BSDC-' + (profile.username || '').toUpperCase().slice(0, 6) + '-' + joinYear;
    const skillsDisplay = (profile.skills || []).slice(0, 3).join(' · ') || 'Developer';

    container.innerHTML = `
      <div class="id-card" id="id-card-element" role="img" aria-label="Developer ID Card for ${profile.displayName}">

        <!-- Card Header -->
        <div class="id-card-header">
          <div class="id-card-org">Bangladesh Software Development Community</div>
          <div class="id-card-org-name">BSDC</div>
        </div>

        <!-- Color Strip -->
        <div class="id-card-strip"></div>

        <!-- Card Body -->
        <div class="id-card-body">
          <div class="id-card-avatar-row">
            <!-- Avatar -->
            <div class="id-card-avatar" id="card-avatar-el">
              ${profile.photoURL
                ? `<img src="${profile.photoURL}" alt="${profile.displayName}" style="width:75px;height:75px;border-radius:0.625rem;object-fit:cover"/>`
                : `<span style="font-size:2rem;font-weight:800;color:#006A4E">${initials}</span>`}
            </div>
            <!-- Info -->
            <div class="id-card-info">
              <div class="id-card-name">${profile.displayName || 'BSDC Member'}</div>
              <div class="id-card-role">${profile.role || 'Member'}</div>
              <div class="id-card-username">@${profile.username || ''}</div>
            </div>
          </div>

          <div class="id-card-divider"></div>

          <!-- Skills/Bio -->
          ${profile.bio ? `
            <div style="font-size:0.78rem;color:#64748B;line-height:1.5;margin-bottom:0.75rem;font-style:italic">"${profile.bio.slice(0, 80)}${profile.bio.length > 80 ? '...' : ''}"</div>
          ` : ''}

          <!-- Fields Grid -->
          <div class="id-card-fields">
            <div>
              <div class="id-card-field-label">Posts</div>
              <div class="id-card-field-value">${window.BSDC.text.formatNumber(profile.postCount || 0)}</div>
            </div>
            <div>
              <div class="id-card-field-label">Reputation</div>
              <div class="id-card-field-value" style="color:#006A4E">${window.BSDC.text.formatNumber(profile.reputation || 0)}</div>
            </div>
            <div>
              <div class="id-card-field-label">Answers</div>
              <div class="id-card-field-value">${window.BSDC.text.formatNumber(profile.answerCount || 0)}</div>
            </div>
            <div>
              <div class="id-card-field-label">Location</div>
              <div class="id-card-field-value" style="font-size:0.78rem">${profile.location || 'Bangladesh'}</div>
            </div>
          </div>

          <!-- Skills -->
          ${(profile.skills || []).length > 0 ? `
            <div style="margin-top:0.5rem">
              <div class="id-card-field-label" style="margin-bottom:0.375rem">Skills</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.25rem">
                ${(profile.skills || []).slice(0, 5).map(s =>
                  `<span style="font-size:0.7rem;background:#e6f4f0;color:#006A4E;padding:0.15rem 0.5rem;border-radius:9999px;font-weight:600">${s}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}

        </div>

        <!-- Card Footer -->
        <div class="id-card-footer">
          <!-- QR Code -->
          <div class="id-card-qr" title="Scan to visit profile">
            ${this.generateQRCode(profileUrl, 56)}
          </div>
          <!-- Member Info -->
          <div>
            <div class="id-card-member-since">Member since ${joinMonth}</div>
            <div class="id-card-badge-id">${badgeId}</div>
            <div style="font-size:0.65rem;color:#006A4E;font-weight:600;text-align:right;margin-top:0.25rem">bsdc.info.bd</div>
          </div>
        </div>

      </div>

      <!-- Share Buttons -->
      <div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.5rem">
        <button class="btn btn-primary btn-full" id="share-profile-btn" aria-label="Share profile">
          🔗 Share My Profile
        </button>
        <button class="btn btn-secondary btn-full" id="download-card-btn" aria-label="Save ID card">
          💾 Save ID Card
        </button>
        ${profile.github ? `
          <a href="https://github.com/${profile.github}" target="_blank" rel="noopener noreferrer"
            class="btn btn-full" style="background:#24292e;color:white;border-color:#24292e">
            🐙 GitHub Profile
          </a>
        ` : ''}
        ${profile.website ? `
          <a href="${profile.website}" target="_blank" rel="noopener noreferrer"
            class="btn btn-secondary btn-full">
            🌐 Website
          </a>
        ` : ''}
      </div>
    `;

    // Share button
    document.getElementById('share-profile-btn')?.addEventListener('click', async () => {
      if (navigator.share) {
        navigator.share({
          title: `BSDC — ${profile.displayName} (@${profile.username})`,
          text: `Check out ${profile.displayName}'s developer profile on BSDC — Bangladesh Software Development Community`,
          url: profileUrl
        }).catch(() => {});
      } else {
        await window.BSDC.copyToClipboard(profileUrl);
        window.BSDC.toast.success('Profile link copied to clipboard! 🔗');
      }
    });

    // Download card (print-based)
    document.getElementById('download-card-btn')?.addEventListener('click', () => {
      const card = document.getElementById('id-card-element');
      if (!card) return;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>BSDC ID Card — ${profile.displayName}</title>
          <link rel="stylesheet" href="https://www.bsdc.info.bd/css/fabric.css"/>
          <link rel="stylesheet" href="https://www.bsdc.info.bd/css/main.css"/>
          <style>
            body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f1f5f9; margin:0; }
            @media print { body { background:white; } }
          </style>
        </head>
        <body>
          ${card.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); window.close(); }, 800);
            };
          <\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  },

  // ---- Render profile header ----
  renderProfileHeader(profile, isOwnProfile, container) {
    if (!container) return;
    const initials = window.BSDC.text.avatarInitials(profile.displayName || 'U');
    const joinDate = profile.createdAt
      ? (profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt))
      : new Date();

    container.innerHTML = `
      <div class="profile-header-card" itemscope itemtype="https://schema.org/Person">

        <!-- Cover -->
        <div class="profile-cover">
          ${isOwnProfile ? `
            <button id="edit-cover-btn" style="position:absolute;bottom:0.75rem;right:0.75rem;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:0.5rem;padding:0.375rem 0.75rem;cursor:pointer;font-size:0.8rem;backdrop-filter:blur(4px)">
              📷 Change Cover
            </button>
          ` : ''}
        </div>

        <div class="profile-header-body">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem">
            <!-- Avatar -->
            <div class="profile-avatar-wrapper">
              <div class="profile-avatar-img" id="profile-avatar-display" itemprop="image">
                ${profile.photoURL
                  ? `<img src="${profile.photoURL}" alt="${profile.displayName}" style="width:100px;height:100px;border-radius:1rem;object-fit:cover"/>`
                  : `<span style="font-size:2.5rem;font-weight:800">${initials}</span>`}
              </div>
              <div class="profile-online-dot" title="Online recently" aria-label="Online indicator"></div>
              ${isOwnProfile ? `
                <button id="change-avatar-btn" style="position:absolute;bottom:-6px;right:-6px;background:#006A4E;color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2)" aria-label="Change avatar">📷</button>
                <input type="file" id="avatar-upload-input" accept="image/*" style="display:none" aria-label="Upload avatar"/>
              ` : ''}
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
              ${isOwnProfile ? `
                <button class="btn btn-primary btn-sm" id="edit-profile-btn">✏️ Edit Profile</button>
                <a href="/dashboard" class="btn btn-secondary btn-sm">📊 Dashboard</a>
              ` : `
                <button class="btn btn-primary btn-sm" id="follow-btn" data-uid="${profile.uid}">
                  ${(profile.followers || []).includes(window.BSDC.auth.currentUser?.uid) ? '✓ Following' : '+ Follow'}
                </button>
                <button class="btn btn-secondary btn-sm" id="share-profile-header-btn">🔗 Share</button>
              `}
            </div>
          </div>

          <!-- Name & Info -->
          <div style="margin-top:0.875rem">
            <h1 class="profile-name" itemprop="name">${profile.displayName || 'BSDC Member'}</h1>
            <p class="profile-username" itemprop="alternateName">@${profile.username || ''}</p>
            ${profile.bio ? `<p class="profile-bio" itemprop="description">${profile.bio}</p>` : ''}

            <!-- Meta Info -->
            <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;font-size:0.875rem;color:#64748B">
              ${profile.location ? `<span>📍 ${profile.location}</span>` : ''}
              ${profile.website ? `<a href="${profile.website}" target="_blank" rel="noopener noreferrer" style="color:#006A4E;font-weight:500">🌐 Website</a>` : ''}
              ${profile.github ? `<a href="https://github.com/${profile.github}" target="_blank" rel="noopener noreferrer" style="color:#24292e;font-weight:500">🐙 GitHub</a>` : ''}
              <span itemprop="memberOf" itemscope itemtype="https://schema.org/Organization">
                <meta itemprop="name" content="Bangladesh Software Development Community"/>
                📅 Joined ${joinDate.toLocaleDateString('en-BD', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <!-- Skills -->
            ${(profile.skills || []).length > 0 ? `
              <div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-bottom:1rem">
                ${(profile.skills || []).map(s =>
                  `<a href="/tag?t=${encodeURIComponent(s.toLowerCase())}" class="tag" style="font-size:0.8rem">${s}</a>`
                ).join('')}
              </div>
            ` : ''}

            <!-- Stats -->
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-num">${window.BSDC.text.formatNumber(profile.postCount || 0)}</div>
                <div class="profile-stat-label">Posts</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">${window.BSDC.text.formatNumber(profile.answerCount || 0)}</div>
                <div class="profile-stat-label">Answers</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num" style="color:#006A4E">${window.BSDC.text.formatNumber(profile.reputation || 0)}</div>
                <div class="profile-stat-label">Reputation</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">${(profile.followers || []).length}</div>
                <div class="profile-stat-label">Followers</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">${(profile.following || []).length}</div>
                <div class="profile-stat-label">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Avatar upload
    if (isOwnProfile) {
      document.getElementById('change-avatar-btn')?.addEventListener('click', () => {
        document.getElementById('avatar-upload-input')?.click();
      });

      document.getElementById('avatar-upload-input')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        window.BSDC.toast.info('Uploading avatar...');
        try {
          const url = await window.BSDC.uploadImage(file);
          const user = window.BSDC.auth.currentUser;
          const { updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
          const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
          const { db } = await import('/js/firebase-config.js');

          await updateProfile(user, { photoURL: url });
          await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
          window.BSDC.auth.userProfile.photoURL = url;

          // Update display
          const avatarDisplay = document.getElementById('profile-avatar-display');
          if (avatarDisplay) {
            avatarDisplay.innerHTML = `<img src="${url}" alt="${profile.displayName}" style="width:100px;height:100px;border-radius:1rem;object-fit:cover"/>`;
          }
          window.BSDC.toast.success('Avatar updated successfully!');
        } catch(err) {
          window.BSDC.toast.error('Failed to upload avatar: ' + err.message);
        }
      });

      // Edit profile modal
      document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
        window.BSDC.profileEngine.openEditModal(profile);
      });
    }

    // Follow button
    const followBtn = document.getElementById('follow-btn');
    followBtn?.addEventListener('click', async () => {
      const user = window.BSDC.auth.currentUser;
      if (!user) {
        window.BSDC.toast.info('Please log in to follow users');
        window.location.href = '/login';
        return;
      }
      try {
        const { doc, updateDoc, arrayUnion, arrayRemove } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const { db } = await import('/js/firebase-config.js');
        const isFollowing = followBtn.textContent.includes('Following');
        if (isFollowing) {
          await updateDoc(doc(db, 'users', profile.uid), { followers: arrayRemove(user.uid) });
          await updateDoc(doc(db, 'users', user.uid), { following: arrayRemove(profile.uid) });
          followBtn.textContent = '+ Follow';
          window.BSDC.toast.info('Unfollowed');
        } else {
          await updateDoc(doc(db, 'users', profile.uid), { followers: arrayUnion(user.uid) });
          await updateDoc(doc(db, 'users', user.uid), { following: arrayUnion(profile.uid) });
          followBtn.textContent = '✓ Following';
          window.BSDC.toast.success('Now following ' + profile.displayName + '!');
          await window.BSDC.db.addNotification(profile.uid, {
            message: `${window.BSDC.auth.userProfile?.displayName || 'Someone'} started following you`,
            url: `/profile?u=${window.BSDC.auth.userProfile?.username || ''}`
          });
        }
      } catch(e) {
        window.BSDC.toast.error('Action failed. Please try again.');
      }
    });

    // Share profile header button
    document.getElementById('share-profile-header-btn')?.addEventListener('click', async () => {
      const url = `https://www.bsdc.info.bd/profile?u=${profile.username}`;
      if (navigator.share) {
        navigator.share({
          title: `BSDC — ${profile.displayName}`,
          text: `Check out ${profile.displayName}'s profile on BSDC`,
          url
        }).catch(() => {});
      } else {
        await window.BSDC.copyToClipboard(url);
        window.BSDC.toast.success('Profile link copied!');
      }
    });
  },

  // ---- Edit Profile Modal ----
  openEditModal(profile) {
    let modal = document.getElementById('edit-profile-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'edit-profile-modal';
    modal.innerHTML = `
      <div class="modal" style="max-width:560px">
        <button class="modal-close" id="close-edit-modal" aria-label="Close">✕</button>
        <h2 style="font-size:1.25rem;font-weight:800;color:#1E293B;margin-bottom:1.5rem">Edit Profile</h2>
        <div id="edit-profile-error" class="alert alert-error" style="display:none"></div>
        <div class="form-group">
          <label class="form-label" for="edit-displayname">Display Name</label>
          <input type="text" id="edit-displayname" class="form-input" value="${profile.displayName || ''}" maxlength="50"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-bio">Bio</label>
          <textarea id="edit-bio" class="form-textarea" placeholder="Tell the community about yourself..." maxlength="200" style="min-height:80px">${profile.bio || ''}</textarea>
          <div class="form-hint">Max 200 characters</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-role">Role / Title</label>
          <input type="text" id="edit-role" class="form-input" value="${profile.role || ''}" placeholder="e.g. Full Stack Developer" maxlength="50"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-location">Location</label>
          <input type="text" id="edit-location" class="form-input" value="${profile.location || ''}" placeholder="e.g. Dhaka, Bangladesh" maxlength="50"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-github">GitHub Username</label>
          <div style="position:relative">
            <input type="text" id="edit-github" class="form-input" value="${profile.github || ''}" placeholder="your-username" style="padding-left:2.5rem"/>
            <span style="position:absolute;left:0.875rem;top:50%;transform:translateY(-50%);color:#64748B;font-size:0.875rem">🐙</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-website">Website URL</label>
          <input type="url" id="edit-website" class="form-input" value="${profile.website || ''}" placeholder="https://yourwebsite.com"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-skills">Skills (comma separated)</label>
          <input type="text" id="edit-skills" class="form-input" value="${(profile.skills || []).join(', ')}" placeholder="JavaScript, Python, Laravel, React"/>
          <div class="form-hint">Add up to 10 skills</div>
        </div>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end">
          <button class="btn btn-ghost" id="cancel-edit-btn">Cancel</button>
          <button class="btn btn-primary" id="save-profile-btn">💾 Save Changes</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    document.getElementById('close-edit-modal')?.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });

    document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('save-profile-btn');
      const errEl = document.getElementById('edit-profile-error');
      errEl.style.display = 'none';

      const displayName = document.getElementById('edit-displayname')?.value.trim();
      const bio = document.getElementById('edit-bio')?.value.trim();
      const role = document.getElementById('edit-role')?.value.trim();
      const location = document.getElementById('edit-location')?.value.trim();
      const github = document.getElementById('edit-github')?.value.trim();
      const website = document.getElementById('edit-website')?.value.trim();
      const skillsRaw = document.getElementById('edit-skills')?.value;
      const skills = skillsRaw
        ? skillsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 10)
        : [];

      if (!displayName || displayName.length < 2) {
        errEl.textContent = 'Display name must be at least 2 characters.';
        errEl.style.display = 'block';
        return;
      }

      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const { updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const { db, auth } = await import('/js/firebase-config.js');

        const updates = { displayName, bio, role, location, github, website, skills };
        await updateDoc(doc(db, 'users', profile.uid), updates);
        await updateProfile(auth.currentUser, { displayName });

        // Update local cache
        Object.assign(window.BSDC.auth.userProfile, updates);

        window.BSDC.toast.success('Profile updated successfully!');
        modal.classList.remove('active');
        setTimeout(() => { modal.remove(); location.reload(); }, 500);
      } catch(e) {
        errEl.textContent = 'Failed to save: ' + e.message;
        errEl.style.display = 'block';
        btn.textContent = '💾 Save Changes';
        btn.disabled = false;
      }
    });
  },

  // ---- Render user's posts ----
  renderUserPosts(posts, container, username) {
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem;background:white;border:1px solid #E2E8F0;border-radius:0.75rem">
          <div style="font-size:3rem;margin-bottom:1rem">📭</div>
          <h3 style="font-weight:700;color:#1E293B;margin-bottom:0.5rem">No posts yet</h3>
          <p style="color:#64748B;margin-bottom:1rem">
            ${window.BSDC.auth.currentUser?.uid ? 'Start contributing to the community!' : `${username} hasn't posted yet.`}
          </p>
          ${window.BSDC.auth.userProfile?.username === username ? `
            <a href="/submit" class="btn btn-primary">✏️ Create First Post</a>
          ` : ''}
        </div>
      `;
      return;
    }

    const typeConfig = {
      question: { label: 'Question', cls: 'type-question', icon: '❓' },
      blog: { label: 'Blog', cls: 'type-blog', icon: '📝' },
      wiki: { label: 'Wiki', cls: 'type-wiki', icon: '📚' },
      snippet: { label: 'Snippet', cls: 'type-snippet', icon: '💻' },
      project: { label: 'Project', cls: 'type-project', icon: '🚀' },
      discussion: { label: 'Discussion', cls: 'type-discussion', icon: '💬' }
    };

    container.innerHTML = `
      <div class="feed">
        ${posts.map(post => {
          const tc = typeConfig[post.type] || { label: 'Post', cls: 'type-discussion', icon: '📄' };
          const votes = (post.upvotes || 0) - (post.downvotes || 0);
          return `
            <article class="post-card animate-fade-up">
              <div class="post-card-header">
                <div class="post-card-meta">
                  <div style="display:flex;align-items:center;gap:0.5rem">
                    <span class="post-card-type-badge ${tc.cls}">${tc.icon} ${tc.label}</span>
                    ${post.isSolved ? '<span class="badge badge-green" style="font-size:0.7rem">✅ Solved</span>' : ''}
                  </div>
                  <div class="post-card-time">${window.BSDC.time.ago(post.createdAt)}</div>
                </div>
              </div>
              <div class="post-card-body">
                <a href="/post?slug=${post.slug}" class="post-card-title">${post.title}</a>
                ${post.excerpt ? `<p class="post-card-excerpt">${post.excerpt}</p>` : ''}
              </div>
              ${post.tags?.length ? `
                <div class="post-card-tags">
                  ${post.tags.slice(0, 4).map(t => `<a href="/tag?t=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}
                </div>
              ` : ''}
              <div class="post-card-actions">
                <span class="action-btn">▲ ${votes}</span>
                <a href="/post?slug=${post.slug}" class="action-btn">💬 ${post.answerCount || post.commentCount || 0}</a>
                <span class="action-btn" style="margin-left:auto;cursor:default">👁️ ${window.BSDC.text.formatNumber(post.views || 0)}</span>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }
};
