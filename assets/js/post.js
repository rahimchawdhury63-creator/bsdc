// ============================================
// BSDC — Post Manager (FIXED VERSION)
// Handles: Create, Vote, Answer, Markdown
// ============================================

import {
  db, auth, showToast, generateSlug,
  sanitizeHTML, timeAgo
} from './firebase-init.js';

import {
  collection, doc, addDoc, updateDoc, getDoc,
  getDocs, increment, serverTimestamp, runTransaction,
  setDoc, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// ══════════════════════════════════════════
// MARKDOWN PARSER
// ══════════════════════════════════════════
export function parseMarkdown(md) {
  if (!md) return '';

  // Sanitize first
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Store code blocks to prevent inner processing
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const cleanLang = lang.trim() || 'plaintext';
    codeBlocks.push(
      `<div class="code-block-wrapper" style="position:relative;border-radius:10px;overflow:hidden;margin:16px 0;">` +
      `<button class="copy-code-btn" onclick="window.bsdcCopyCode(this)" style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.8);padding:4px 10px;border-radius:6px;font-size:0.75rem;font-weight:600;cursor:pointer;z-index:1;">Copy</button>` +
      `<pre style="margin:0;padding:20px;background:#0d1117;overflow-x:auto;"><code class="language-${cleanLang}" style="font-family:'Fira Code',monospace;font-size:0.85rem;line-height:1.7;">${code.trim()}</code></pre>` +
      `</div>`
    );
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g,
    '<code style="background:#F1F5F9;color:#006A4E;padding:2px 7px;border-radius:4px;font-family:\'Fira Code\',monospace;font-size:0.875em;">$1</code>'
  );

  // Headings
  html = html.replace(/^#{1}\s+(.+)$/gm,
    '<h2 style="font-size:1.5rem;font-weight:800;color:#1E293B;margin:28px 0 12px;padding-bottom:8px;border-bottom:2px solid #E8F5F0;">$1</h2>'
  );
  html = html.replace(/^#{2}\s+(.+)$/gm,
    '<h3 style="font-size:1.25rem;font-weight:700;color:#1E293B;margin:24px 0 10px;">$1</h3>'
  );
  html = html.replace(/^#{3}\s+(.+)$/gm,
    '<h4 style="font-size:1.05rem;font-weight:700;color:#1E293B;margin:20px 0 8px;">$1</h4>'
  );

  // Bold + Italic combined
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Blockquote
  html = html.replace(/^&gt;\s*(.+)$/gm,
    '<blockquote style="border-left:4px solid #006A4E;margin:12px 0;padding:12px 18px;background:#E8F5F0;border-radius:0 10px 10px 0;color:#1E293B;font-style:italic;">$1</blockquote>'
  );

  // Horizontal rule
  html = html.replace(/^---$/gm,
    '<hr style="border:none;border-top:2px solid #E2E8F0;margin:24px 0;"/>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#006A4E;text-decoration:underline;text-underline-offset:2px;">$1</a>'
  );

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;border-radius:10px;margin:12px 0;" loading="lazy"/>'
  );

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:5px 0;padding-left:2px;">$1</li>');
  html = html.replace(/(<li[^>]*>(?:(?!<li).)*<\/li>\s*)+/gs, (match) => {
    if (/^\d/.test(match)) return `<ol style="list-style:decimal;padding-left:22px;margin:12px 0;">${match}</ol>`;
    return match;
  });

  // Unordered lists
  html = html.replace(/^[-*+]\s+(.+)$/gm, '<li style="margin:5px 0;padding-left:2px;">$1</li>');
  html = html.replace(/(<li[^>]*>(?:(?!<li).)*<\/li>\s*)+/gs,
    '<ul style="list-style:disc;padding-left:22px;margin:12px 0;">$&</ul>'
  );

  // Paragraphs — split on double newlines
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    // Don't wrap block elements
    const blockTags = ['<h2','<h3','<h4','<ul','<ol','<blockquote','<hr','<div','<pre','%%CODEBLOCK'];
    if (blockTags.some(tag => para.startsWith(tag))) return para;
    // Single newlines become <br>
    return `<p style="margin:0 0 14px;line-height:1.8;color:#374151;">${para.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, block);
  });

  return html;
}

// Global copy code helper
window.bsdcCopyCode = function(btn) {
  const code = btn.nextElementSibling?.querySelector('code')?.textContent || '';
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.style.color = '#4ade80';
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.style.color = 'rgba(255,255,255,0.8)';
    }, 2000);
  }).catch(() => {
    showToast('Copy failed. Please select manually.', 'warning');
  });
};

// ══════════════════════════════════════════
// TAGS INPUT SYSTEM
// ══════════════════════════════════════════
const POPULAR_TAGS = [
  'python','javascript','php','django','laravel','react','flutter',
  'nodejs','mysql','postgresql','mongodb','api','firebase','html-css',
  'java','typescript','go','nextjs','vuejs','android','ios','database',
  'devops','docker','git','linux','algorithm','data-structures',
  'machine-learning','cybersecurity','blockchain','cloud','aws'
];

export function initTagsInput(wrapperId, inputId, suggestionsId) {
  const wrapper = document.getElementById(wrapperId);
  const input = document.getElementById(inputId);
  if (!wrapper || !input) return null;

  let tags = [];

  function renderTags() {
    // Remove existing pills
    wrapper.querySelectorAll('.tag-input-pill').forEach(el => el.remove());
    // Add pills before input
    tags.forEach(tag => {
      const pill = document.createElement('div');
      pill.className = 'tag-input-pill';
      pill.innerHTML = `
        <span>${sanitizeHTML(tag)}</span>
        <button type="button" class="tag-remove-btn" aria-label="Remove ${tag}">×</button>
      `;
      pill.querySelector('.tag-remove-btn').addEventListener('click', () => {
        tags = tags.filter(t => t !== tag);
        renderTags();
      });
      wrapper.insertBefore(pill, input);
    });
  }

  function addTag(rawTag) {
    const tag = rawTag.toLowerCase().trim()
      .replace(/[^a-z0-9\-\.#\+]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!tag || tag.length < 1) return;
    if (tags.includes(tag)) {
      showToast(`Tag "${tag}" already added.`, 'warning');
      return;
    }
    if (tags.length >= 5) {
      showToast('Maximum 5 tags allowed.', 'warning');
      return;
    }
    tags.push(tag);
    renderTags();
    input.value = '';
    hideSuggestions();
  }

  function hideSuggestions() {
    const suggestionsEl = suggestionsId ? document.getElementById(suggestionsId) : null;
    if (suggestionsEl) suggestionsEl.style.display = 'none';
  }

  function showSuggestions(val) {
    const suggestionsEl = suggestionsId ? document.getElementById(suggestionsId) : null;
    if (!suggestionsEl) return;

    const matches = POPULAR_TAGS.filter(t =>
      t.includes(val.toLowerCase()) && !tags.includes(t)
    ).slice(0, 6);

    if (!matches.length) { hideSuggestions(); return; }

    suggestionsEl.innerHTML = matches.map(t =>
      `<div class="suggestion-item" data-tag="${t}">
        <span class="suggestion-type-badge">tag</span>
        <span>${t}</span>
      </div>`
    ).join('');

    suggestionsEl.querySelectorAll('[data-tag]').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addTag(el.dataset.tag);
      });
    });

    suggestionsEl.style.display = 'block';
  }

  // Input events
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(input.value); }
    else if (e.key === ',') { e.preventDefault(); addTag(input.value); }
    else if (e.key === 'Backspace' && !input.value && tags.length) {
      tags.pop();
      renderTags();
    }
    else if (e.key === 'Escape') { hideSuggestions(); }
  });

  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (val.length >= 1) showSuggestions(val);
    else hideSuggestions();
  });

  input.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 200);
  });

  // Click wrapper focuses input
  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) input.focus();
  });

  // Quick-add from common tags sidebar
  document.querySelectorAll('.tag-pill[data-tag]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      addTag(el.dataset.tag);
      input.focus();
    });
  });

  return {
    getTags: () => [...tags],
    setTags: (newTags) => { tags = newTags; renderTags(); },
    reset: () => { tags = []; renderTags(); }
  };
}

// ══════════════════════════════════════════
// EDITOR TOOLBAR
// ══════════════════════════════════════════
export function initEditorToolbar(toolbarEl, textareaId, previewBtnId, previewContainerId, previewContentId) {
  const toolbar = typeof toolbarEl === 'string'
    ? document.querySelector(toolbarEl)
    : toolbarEl;
  const textarea = document.getElementById(textareaId);
  if (!toolbar || !textarea) return;

  const insertText = (before, after = '', placeholder = '') => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || placeholder;
    const replacement = before + selected + after;
    textarea.value =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);
    const cursorPos = start + before.length + selected.length + after.length;
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
    // Trigger char count update
    textarea.dispatchEvent(new Event('input'));
  };

  toolbar.querySelectorAll('.toolbar-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      const actions = {
        bold: () => insertText('**', '**', 'bold text'),
        italic: () => insertText('*', '*', 'italic text'),
        code: () => insertText('`', '`', 'code'),
        codeblock: () => insertText('```javascript\n', '\n```', '// your code here'),
        link: () => insertText('[', '](https://)', 'link text'),
        list: () => insertText('\n- ', '', 'list item'),
        blockquote: () => insertText('\n> ', '', 'quoted text'),
        h2: () => insertText('\n## ', '', 'Heading'),
        h3: () => insertText('\n### ', '', 'Sub Heading'),
        preview: () => togglePreview()
      };
      if (actions[action]) actions[action]();
    });
  });

  function togglePreview() {
    const container = document.getElementById(previewContainerId);
    const content = document.getElementById(previewContentId);
    if (!container || !content) return;

    const isHidden = container.classList.toggle('hidden');
    if (!isHidden) {
      content.innerHTML = parseMarkdown(textarea.value || '*Nothing to preview yet.*');
      content.querySelectorAll('pre code').forEach(el => {
        if (window.hljs) window.hljs.highlightElement(el);
      });
    }
  }
}

// ══════════════════════════════════════════
// CHARACTER COUNT
// ══════════════════════════════════════════
export function initCharCount(inputId, countId) {
  const input = document.getElementById(inputId);
  const countEl = document.getElementById(countId);
  if (!input || !countEl) return;
  const update = () => { countEl.textContent = input.value.length; };
  input.addEventListener('input', update);
  update();
}

// ══════════════════════════════════════════
// VOTE HANDLER
// ══════════════════════════════════════════
export async function handleVote(postId, direction) {
  // Get current user synchronously
  const user = auth.currentUser;
  if (!user) {
    showToast('Please login to vote.', 'warning');
    setTimeout(() => {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 800);
    return;
  }

  try {
    const postRef = doc(db, 'posts', postId);
    const voteRef = doc(db, 'votes', `${user.uid}_${postId}`);

    await runTransaction(db, async (transaction) => {
      const [voteSnap, postSnap] = await Promise.all([
        transaction.get(voteRef),
        transaction.get(postRef)
      ]);

      if (!postSnap.exists()) throw new Error('Post not found');

      let delta = direction;

      if (voteSnap.exists()) {
        const prevDir = voteSnap.data().direction;
        if (prevDir === direction) {
          // Undo vote
          delta = -direction;
          transaction.delete(voteRef);
        } else {
          // Flip vote
          delta = direction * 2;
          transaction.update(voteRef, {
            direction,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // New vote
        transaction.set(voteRef, {
          uid: user.uid,
          postId,
          direction,
          createdAt: serverTimestamp()
        });
      }

      transaction.update(postRef, {
        voteCount: increment(delta),
        hotScore: increment(delta)
      });
    });

    // Update UI
    const countEl = document.getElementById(`vote-${postId}`) ||
                    document.getElementById('post-vote-count');
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = current + (direction === 1 ? 1 : -1);
    }

  } catch(err) {
    console.error('Vote error:', err);
    showToast('Vote failed. Please try again.', 'error');
  }
}

// ══════════════════════════════════════════
// ASK FORM — Complete Rewrite
// ══════════════════════════════════════════
function initAskForm() {
  const askForm = document.getElementById('ask-form');
  if (!askForm) return;

  // Init helpers
  initCharCount('q-title', 'title-count');
  initCharCount('q-body', 'body-count');
  initEditorToolbar(
    document.querySelector('#ask-form .editor-toolbar'),
    'q-body', 'preview-btn', 'markdown-preview', 'preview-content'
  );

  const tagManager = initTagsInput('tags-wrapper', 'tag-input', 'tag-suggestions');

  // Image upload zone
  setupImageUpload('upload-zone', 'image-upload', 'upload-preview', 'upload-img-preview', 'remove-upload');

  // Form submit
  askForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      showToast('You must be logged in to post.', 'error');
      window.location.href = `/login?next=/ask`;
      return;
    }

    const title = document.getElementById('q-title')?.value.trim() || '';
    const body = document.getElementById('q-body')?.value.trim() || '';
    const tags = tagManager ? tagManager.getTags() : [];

    // Validate
    let valid = true;

    const titleError = document.getElementById('title-error');
    const bodyError = document.getElementById('body-error');
    const tagsError = document.getElementById('tags-error');

    if (titleError) titleError.classList.remove('visible');
    if (bodyError) bodyError.classList.remove('visible');
    if (tagsError) tagsError.classList.remove('visible');

    if (!title || title.length < 10) {
      if (titleError) titleError.classList.add('visible');
      valid = false;
    }
    if (!body || body.length < 20) {
      if (bodyError) bodyError.classList.add('visible');
      valid = false;
    }
    if (!tags.length) {
      if (tagsError) tagsError.classList.add('visible');
      valid = false;
    }

    if (!valid) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const btn = document.getElementById('ask-submit');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Posting...';

    try {
      // Get user data
      let authorName = user.displayName || 'Anonymous';
      let authorPhoto = user.photoURL || '';
      let authorUsername = '';

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const ud = userSnap.data();
          authorName = ud.displayName || user.displayName || 'Anonymous';
          authorPhoto = ud.photoURL || user.photoURL || '';
          authorUsername = ud.username || '';
        }
      } catch(e) {
        console.warn('Could not fetch user data, using auth data');
      }

      // Upload image if any
      let imageUrl = null;
      const imageFile = document.getElementById('image-upload')?.files[0];
      if (imageFile) {
        try {
          const { uploadImage } = await import('./upload.js');
          imageUrl = await uploadImage(imageFile);
        } catch(e) {
          console.warn('Image upload failed, continuing without image');
        }
      }

      const slug = generateSlug(title) + '-' + Date.now().toString(36);

      // Build post document
      const postData = {
        type: 'question',
        title: title,
        titleLower: title.toLowerCase(),
        slug: slug,
        body: body,
        excerpt: body.replace(/[#*`>\[\]]/g, '').substring(0, 200).trim(),
        seoDescription: body.replace(/[#*`>\[\]]/g, '').substring(0, 160).trim(),
        tags: tags,
        imageUrl: imageUrl || null,
        coverImage: null,
        authorId: user.uid,
        authorName: authorName,
        authorPhoto: authorPhoto,
        authorUsername: authorUsername,
        voteCount: 0,
        hotScore: 0,
        viewCount: 0,
        answerCount: 0,
        commentCount: 0,
        isSolved: false,
        acceptedAnswerId: null,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Write to Firestore
      const postRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Post created with ID:', postRef.id);

      // Update tags (non-blocking)
      tags.forEach(tag => {
        setDoc(doc(db, 'tags', tag), { count: increment(1) }, { merge: true })
          .catch(e => console.warn('Tag update failed:', e));
      });

      // Update user stats (non-blocking)
      updateDoc(doc(db, 'users', user.uid), {
        postCount: increment(1),
        points: increment(5)
      }).catch(e => console.warn('User stat update failed:', e));

      // Update meta stats (non-blocking)
      setDoc(doc(db, 'meta', 'stats'), {
        postCount: increment(1)
      }, { merge: true }).catch(e => console.warn('Meta update failed:', e));

      showToast('Question posted successfully! 🎉');

      // Redirect to post
      setTimeout(() => {
        window.location.href = `/post?slug=${encodeURIComponent(slug)}`;
      }, 1200);

    } catch(err) {
      console.error('Post creation error:', err);

      let errorMsg = 'Failed to post question. ';
      if (err.code === 'permission-denied') {
        errorMsg += 'Permission denied. Please check your login status.';
      } else if (err.code === 'unavailable') {
        errorMsg += 'Network error. Please check your connection.';
      } else {
        errorMsg += err.message || 'Please try again.';
      }

      showToast(errorMsg, 'error');
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });
}

// ══════════════════════════════════════════
// WRITE FORM — Complete Rewrite
// ══════════════════════════════════════════
function initWriteForm() {
  const writeForm = document.getElementById('write-form');
  if (!writeForm) return;

  initCharCount('w-title', 'w-title-count');
  initCharCount('w-body', 'w-body-count');
  initCharCount('w-seo-desc', 'seo-count');

  initEditorToolbar(
    document.getElementById('main-toolbar'),
    'w-body', 'w-preview-btn', 'w-preview', 'w-preview-content'
  );

  const tagManager = initTagsInput('w-tags-wrapper', 'w-tag-input', null);

  // Post type switching
  const typeInputs = document.querySelectorAll('input[name="post-type"]');
  typeInputs.forEach(input => {
    input.addEventListener('change', handleTypeChange);
  });

  function handleTypeChange() {
    const type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';

    const langGroup = document.getElementById('lang-group');
    const projectFields = document.getElementById('project-fields');
    const coverGroup = document.getElementById('cover-group');
    const bodyLabel = document.getElementById('body-label-text');

    if (langGroup) langGroup.classList.toggle('hidden', type !== 'snippet');
    if (projectFields) projectFields.classList.toggle('hidden', type !== 'project');
    if (coverGroup) coverGroup.classList.toggle('hidden', type === 'snippet');

    const labels = {
      blog: 'Blog Content', wiki: 'Wiki Content',
      snippet: 'Code', project: 'Project Description', post: 'Content'
    };
    if (bodyLabel) bodyLabel.textContent = labels[type] || 'Content';

    const textarea = document.getElementById('w-body');
    const placeholders = {
      blog: 'Write your blog post here...\n\nUse ## for headings, **bold**, *italic*, and ``` for code blocks.',
      wiki: 'Write comprehensive documentation...\n\n## Overview\n\nDescribe the topic clearly.',
      snippet: '// Write your code snippet here\n// Make sure it\'s clean and well-commented\n\nfunction example() {\n  // ...\n}',
      project: 'Describe your project...\n\n## What it does\n\n## How to run it',
      post: 'Share your thoughts with the community...'
    };
    if (textarea) textarea.placeholder = placeholders[type] || '';
  }

  // Cover image upload
  setupCoverImageUpload();

  // Draft save/restore
  setupDraftSystem(tagManager);

  // Form submit
  writeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      showToast('You must be logged in to post.', 'error');
      window.location.href = '/login?next=/write';
      return;
    }

    const type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
    const title = document.getElementById('w-title')?.value.trim() || '';
    const body = document.getElementById('w-body')?.value.trim() || '';
    const tags = tagManager ? tagManager.getTags() : [];
    const seoDesc = document.getElementById('w-seo-desc')?.value.trim() || '';

    // Validate
    let valid = true;
    const titleError = document.getElementById('w-title-error');
    const bodyError = document.getElementById('w-body-error');
    const tagsError = document.getElementById('w-tags-error');

    if (titleError) titleError.classList.remove('visible');
    if (bodyError) bodyError.classList.remove('visible');
    if (tagsError) tagsError.classList.remove('visible');

    if (!title || title.length < 3) {
      if (titleError) titleError.classList.add('visible');
      valid = false;
    }
    if (!body || body.length < 10) {
      if (bodyError) bodyError.classList.add('visible');
      valid = false;
    }
    if (!tags.length) {
      if (tagsError) tagsError.classList.add('visible');
      valid = false;
    }

    if (!valid) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const btn = document.getElementById('write-submit');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    try {
      // Get user data
      let authorName = user.displayName || 'Anonymous';
      let authorPhoto = user.photoURL || '';
      let authorUsername = '';

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const ud = userSnap.data();
          authorName = ud.displayName || user.displayName || 'Anonymous';
          authorPhoto = ud.photoURL || user.photoURL || '';
          authorUsername = ud.username || '';
        }
      } catch(e) {
        console.warn('Could not fetch user doc');
      }

      // Upload cover image
      let coverImage = window._bsdc_coverImageUrl || null;
      const coverFile = document.getElementById('cover-upload')?.files[0];
      if (coverFile && !coverImage) {
        try {
          const { uploadImage } = await import('./upload.js');
          coverImage = await uploadImage(coverFile);
        } catch(e) {
          console.warn('Cover upload failed');
        }
      }

      const slug = generateSlug(title) + '-' + Date.now().toString(36);
      const cleanBody = body.replace(/[#*`>\[\]!]/g, '').substring(0, 200).trim();

      const postData = {
        type,
        title,
        titleLower: title.toLowerCase(),
        slug,
        body,
        excerpt: seoDesc || cleanBody,
        seoDescription: seoDesc || cleanBody.substring(0, 160),
        tags,
        coverImage: coverImage || null,
        imageUrl: null,
        language: type === 'snippet'
          ? (document.getElementById('snippet-lang')?.value || 'javascript')
          : null,
        codeSnippet: type === 'snippet' ? body.substring(0, 1000) : null,
        githubUrl: type === 'project'
          ? (document.getElementById('project-github')?.value.trim() || null)
          : null,
        demoUrl: type === 'project'
          ? (document.getElementById('project-demo')?.value.trim() || null)
          : null,
        techStack: type === 'project'
          ? (document.getElementById('project-stack')?.value.trim() || null)
          : null,
        authorId: user.uid,
        authorName,
        authorPhoto,
        authorUsername,
        voteCount: 0,
        hotScore: 0,
        viewCount: 0,
        commentCount: 0,
        answerCount: 0,
        isSolved: false,
        acceptedAnswerId: null,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const postRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Post created:', postRef.id);

      // Non-blocking updates
      tags.forEach(tag => {
        setDoc(doc(db, 'tags', tag), { count: increment(1) }, { merge: true })
          .catch(() => {});
      });
      updateDoc(doc(db, 'users', user.uid), {
        postCount: increment(1),
        points: increment(10)
      }).catch(() => {});
      setDoc(doc(db, 'meta', 'stats'), {
        postCount: increment(1)
      }, { merge: true }).catch(() => {});

      // Clear draft
      localStorage.removeItem('bsdc_draft');
      window._bsdc_coverImageUrl = null;

      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      showToast(`${typeLabel} published successfully! 🚀`);
      setTimeout(() => {
        window.location.href = `/post?slug=${encodeURIComponent(slug)}`;
      }, 1200);

    } catch(err) {
      console.error('Write post error:', err);
      let msg = 'Failed to publish. ';
      if (err.code === 'permission-denied') msg += 'Permission denied — please re-login.';
      else if (err.code === 'unavailable') msg += 'Network error. Check your connection.';
      else msg += err.message || 'Try again.';
      showToast(msg, 'error');
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });

  // Save draft
  document.getElementById('save-draft-btn')?.addEventListener('click', () => {
    const draft = {
      title: document.getElementById('w-title')?.value || '',
      body: document.getElementById('w-body')?.value || '',
      type: document.querySelector('input[name="post-type"]:checked')?.value || 'blog',
      tags: tagManager?.getTags() || []
    };
    localStorage.setItem('bsdc_draft', JSON.stringify(draft));
    showToast('Draft saved! 💾');
  });
}

// ══════════════════════════════════════════
// IMAGE UPLOAD HELPERS
// ══════════════════════════════════════════
function setupImageUpload(zoneId, inputId, previewId, imgId, removeId) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const img = document.getElementById(imgId);
  const removeBtn = document.getElementById(removeId);

  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') input.click(); });

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = '#006A4E';
    zone.style.background = '#E8F5F0';
  });
  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '#E2E8F0';
    zone.style.background = '';
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = '#E2E8F0';
    zone.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) previewImage(file, img, preview);
  });

  input.addEventListener('change', (e) => {
    if (e.target.files[0]) previewImage(e.target.files[0], img, preview);
  });

  removeBtn?.addEventListener('click', () => {
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
    window._bsdc_uploadImageUrl = null;
  });
}

function setupCoverImageUpload() {
  const zone = document.getElementById('cover-upload-zone');
  const input = document.getElementById('cover-upload');
  const preview = document.getElementById('cover-preview');
  const img = document.getElementById('cover-img-preview');
  const removeBtn = document.getElementById('remove-cover');

  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      previewImage(e.target.files[0], img, null, () => {
        if (preview) preview.style.display = 'block';
        if (zone) zone.style.display = 'none';
      });
    }
  });

  removeBtn?.addEventListener('click', () => {
    if (preview) preview.style.display = 'none';
    if (zone) zone.style.display = 'block';
    if (input) input.value = '';
    window._bsdc_coverImageUrl = null;
  });
}

function previewImage(file, imgEl, previewEl, callback) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image too large. Maximum 5MB allowed.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (imgEl) imgEl.src = e.target.result;
    if (previewEl) previewEl.style.display = 'block';
    if (callback) callback();
  };
  reader.readAsDataURL(file);
}

function setupDraftSystem(tagManager) {
  const saved = localStorage.getItem('bsdc_draft');
  if (saved) {
    try {
      const d = JSON.parse(saved);
      const titleEl = document.getElementById('w-title');
      const bodyEl = document.getElementById('w-body');
      if (titleEl && d.title) titleEl.value = d.title;
      if (bodyEl && d.body) bodyEl.value = d.body;
      if (tagManager && d.tags?.length) tagManager.setTags(d.tags);

      // Restore type
      if (d.type) {
        const radio = document.querySelector(`input[name="post-type"][value="${d.type}"]`);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      }
      showToast('Draft restored 📝');
    } catch(e) {
      localStorage.removeItem('bsdc_draft');
    }
  }
}

// ══════════════════════════════════════════
// AUTO-INIT ON DOM READY
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth state before initializing forms
  onAuthStateChanged(auth, (user) => {
    // Ask form
    if (document.getElementById('ask-form')) {
      if (!user) {
        // Redirect to login
        window.location.href = `/login?next=/ask`;
        return;
      }
      initAskForm();
    }

    // Write form
    if (document.getElementById('write-form')) {
      if (!user) {
        window.location.href = `/login?next=/write`;
        return;
      }
      initWriteForm();
    }
  });
});
