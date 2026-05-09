// ============================================
// BSDC — Post Manager
// Handles: Create, Read, Vote, Answer, Solve
// ============================================

import { db, auth, showToast, generateSlug, sanitizeHTML } from './firebase-init.js';
import { requireAuth, getCurrentUser } from './auth.js';
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  increment, serverTimestamp, arrayUnion, arrayRemove,
  query, where, orderBy, limit, runTransaction, setDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ── COMMON: Simple Markdown Parser ──
export function parseMarkdown(md) {
  if (!md) return '';
  let html = sanitizeHTML(md);

  // Code blocks first (prevent inner processing)
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<div class="code-block-wrapper"><button class="copy-code-btn" onclick="bsdcCopyCode(this)">Copy</button><pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre></div>`);
    return `%%CODE_${idx}%%`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="font-mono" style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font-size:0.875em;">$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;color:#1E293B;margin:20px 0 8px;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:1.3rem;font-weight:700;color:#1E293B;margin:24px 0 10px;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:1.6rem;font-weight:800;color:#1E293B;margin:28px 0 12px;">$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:4px solid #006A4E;margin:12px 0;padding:10px 16px;background:#E8F5F0;border-radius:0 8px 8px 0;color:#1E293B;">$1</blockquote>');

  // Links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#006A4E;text-decoration:underline;">$1</a>');

  // Lists
  html = html.replace(/^[-*] (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="list-style:disc;padding-left:20px;margin:12px 0;">$&</ul>');

  // Paragraphs
  html = html.split(/\n\n+/).map(para => {
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<blockquote') || para.startsWith('%%CODE')) return para;
    return `<p style="margin:0 0 12px;line-height:1.7;">${para.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODE_${idx}%%`, block);
  });

  return html;
}

// ── Global copy code helper ──
window.bsdcCopyCode = function(btn) {
  const code = btn.nextElementSibling.querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
};

// ── TAGS SYSTEM ──
const MAX_TAGS = 5;
const POPULAR_TAGS = ['python','javascript','php','django','laravel','react','flutter','nodejs','mysql','api','firebase','html-css','java','typescript','go','nextjs','vuejs','android','ios','database'];

export function initTagsInput(wrapperId, inputId, suggestionsId) {
  const wrapper = document.getElementById(wrapperId);
  const input = document.getElementById(inputId);
  const suggestionsEl = document.getElementById(suggestionsId);
  if (!wrapper || !input) return;

  let tags = [];

  function renderTags() {
    wrapper.querySelectorAll('.tag-input-pill').forEach(el => el.remove());
    tags.forEach(tag => {
      const pill = document.createElement('div');
      pill.className = 'tag-input-pill';
      pill.innerHTML = `${sanitizeHTML(tag)}<button class="tag-remove-btn" data-tag="${sanitizeHTML(tag)}" aria-label="Remove tag ${tag}">×</button>`;
      wrapper.insertBefore(pill, input);
    });
  }

  function addTag(tag) {
    tag = tag.toLowerCase().trim().replace(/[^a-z0-9-#.+]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    tags.push(tag);
    renderTags();
    input.value = '';
    if (suggestionsEl) suggestionsEl.style.display = 'none';
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value);
    } else if (e.key === 'Backspace' && !input.value && tags.length) {
      tags.pop();
      renderTags();
    }
  });

  input.addEventListener('input', () => {
    if (!suggestionsEl) return;
    const val = input.value.toLowerCase();
    if (!val) { suggestionsEl.style.display = 'none'; return; }

    const matches = POPULAR_TAGS.filter(t => t.includes(val) && !tags.includes(t));
    if (!matches.length) { suggestionsEl.style.display = 'none'; return; }

    suggestionsEl.innerHTML = matches.slice(0, 6).map(t =>
      `<div class="suggestion-item" data-tag="${t}"><span class="suggestion-type-badge">tag</span>${t}</div>`
    ).join('');
    suggestionsEl.style.display = 'block';

    suggestionsEl.querySelectorAll('[data-tag]').forEach(el => {
      el.addEventListener('click', () => addTag(el.dataset.tag));
    });
  });

  wrapper.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-remove-btn')) {
      const t = e.target.dataset.tag;
      tags = tags.filter(x => x !== t);
      renderTags();
    }
    input.focus();
  });

  // Click common tags
  document.querySelectorAll('.tag-pill[data-tag]').forEach(el => {
    el.addEventListener('click', () => addTag(el.dataset.tag));
  });

  return { getTags: () => tags };
}

// ── EDITOR TOOLBAR ──
export function initEditorToolbar(toolbarSelector, textareaId, previewBtnId, previewContainerId, previewContentId) {
  const textarea = document.getElementById(textareaId);
  const previewBtn = document.getElementById(previewBtnId);
  const previewContainer = document.getElementById(previewContainerId);
  const previewContent = document.getElementById(previewContentId);
  if (!textarea) return;

  document.querySelectorAll(`${toolbarSelector} .toolbar-btn[data-action]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'preview') { togglePreview(); return; }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      let replacement = '';

      const actions = {
        bold: `**${selected || 'bold text'}**`,
        italic: `*${selected || 'italic text'}*`,
        code: `\`${selected || 'code'}\``,
        codeblock: `\`\`\`javascript\n${selected || '// your code here'}\n\`\`\``,
        link: `[${selected || 'link text'}](https://)`,
        list: `- ${selected || 'list item'}`,
        blockquote: `> ${selected || 'quote'}`,
        h2: `## ${selected || 'Heading'}`,
        h3: `### ${selected || 'Sub Heading'}`
      };

      replacement = actions[action] || selected;
      textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
      textarea.focus();
      textarea.selectionStart = start + replacement.length;
      textarea.selectionEnd = start + replacement.length;
    });
  });

  function togglePreview() {
    if (!previewContainer || !previewContent) return;
    const isHidden = previewContainer.classList.toggle('hidden');
    if (!isHidden) {
      previewContent.innerHTML = parseMarkdown(textarea.value);
      if (window.hljs) previewContent.querySelectorAll('pre code').forEach(el => window.hljs.highlightElement(el));
    }
  }
}

// ── CHAR COUNT ──
export function initCharCount(inputId, countId) {
  const input = document.getElementById(inputId);
  const count = document.getElementById(countId);
  if (!input || !count) return;
  input.addEventListener('input', () => { count.textContent = input.value.length; });
}

// ── HANDLE VOTE ──
export async function handleVote(postId, direction) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to vote.', 'warning');
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  try {
    const postRef = doc(db, 'posts', postId);
    const voteRef = doc(db, 'votes', `${user.uid}_${postId}`);

    await runTransaction(db, async (transaction) => {
      const voteSnap = await transaction.get(voteRef);
      const postSnap = await transaction.get(postRef);

      if (!postSnap.exists()) throw new Error('Post not found');

      let delta = direction;
      if (voteSnap.exists()) {
        const prev = voteSnap.data().direction;
        if (prev === direction) {
          delta = -direction; // undo vote
          transaction.delete(voteRef);
        } else {
          delta = direction * 2; // flip vote
          transaction.set(voteRef, { uid: user.uid, postId, direction, updatedAt: serverTimestamp() });
        }
      } else {
        transaction.set(voteRef, { uid: user.uid, postId, direction, createdAt: serverTimestamp() });
      }

      transaction.update(postRef, {
        voteCount: increment(delta),
        hotScore: increment(delta)
      });

      // Update vote count display
      const countEl = document.getElementById(`vote-${postId}`);
      if (countEl) {
        const current = parseInt(countEl.textContent) || 0;
        countEl.textContent = current + delta;
      }
    });
  } catch(err) {
    showToast('Vote failed. Please try again.', 'error');
  }
}

// ── ASK FORM INIT ──
document.addEventListener('DOMContentLoaded', () => {
  const askForm = document.getElementById('ask-form');
  if (!askForm) return;

  // Check auth
  requireAuth('/ask').catch(() => {});

  // Init helpers
  initCharCount('q-title', 'title-count');
  initCharCount('q-body', 'body-count');
  initEditorToolbar('.editor-toolbar', 'q-body', 'preview-btn', 'markdown-preview', 'preview-content');
  const tagManager = initTagsInput('tags-wrapper', 'tag-input', 'tag-suggestions');

  // Image upload zone
  const uploadZone = document.getElementById('upload-zone');
  const uploadInput = document.getElementById('image-upload');
  if (uploadZone && uploadInput) {
    uploadZone.addEventListener('click', () => uploadInput.click());
    uploadZone.addEventListener('keydown', (e) => { if (e.key === 'Enter') uploadInput.click(); });
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = '#006A4E'; });
    uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = '#E2E8F0'; });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '#E2E8F0';
      if (e.dataTransfer.files[0]) handleImagePreview(e.dataTransfer.files[0]);
    });
    uploadInput.addEventListener('change', (e) => { if (e.target.files[0]) handleImagePreview(e.target.files[0]); });
  }

  document.getElementById('remove-upload')?.addEventListener('click', () => {
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('image-upload').value = '';
    window._uploadedImageUrl = null;
  });

  // Submit
  askForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { showToast('Please login first.', 'warning'); return; }

    const title = document.getElementById('q-title').value.trim();
    const body = document.getElementById('q-body').value.trim();
    const tags = tagManager ? tagManager.getTags() : [];

    let valid = true;
    if (!title) { document.getElementById('title-error').classList.add('visible'); valid = false; }
    else document.getElementById('title-error').classList.remove('visible');
    if (body.length < 30) { document.getElementById('body-error').classList.add('visible'); valid = false; }
    else document.getElementById('body-error').classList.remove('visible');
    if (!tags.length) { document.getElementById('tags-error').classList.add('visible'); valid = false; }
    else document.getElementById('tags-error').classList.remove('visible');
    if (!valid) return;

    const btn = document.getElementById('ask-submit');
    btn.disabled = true;
    btn.textContent = 'Posting...';

    try {
      // Upload image if any
      let imageUrl = window._uploadedImageUrl || null;
      if (!imageUrl && document.getElementById('image-upload').files[0]) {
        const { uploadImage } = await import('./upload.js');
        imageUrl = await uploadImage(document.getElementById('image-upload').files[0]);
      }

      const slug = generateSlug(title) + '-' + Date.now().toString(36);
      const userRef = await getDoc(doc(db, 'users', user.uid));
      const userData = userRef.data() || {};

      const postData = {
        type: 'question',
        title,
        titleLower: title.toLowerCase(),
        slug,
        body,
        excerpt: body.substring(0, 200).replace(/\n/g, ' '),
        tags,
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || userData.displayName || 'Anonymous',
        authorPhoto: user.photoURL || userData.photoURL || '',
        authorUsername: userData.username || '',
        voteCount: 0,
        hotScore: 0,
        viewCount: 0,
        answerCount: 0,
        isSolved: false,
        acceptedAnswerId: null,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const postRef = await addDoc(collection(db, 'posts'), postData);

      // Update tags collection
      for (const tag of tags) {
        const tagRef = doc(db, 'tags', tag);
        await setDoc(tagRef, { count: increment(1) }, { merge: true });
      }

      // Update user post count
      await updateDoc(doc(db, 'users', user.uid), {
        postCount: increment(1),
        points: increment(5)
      });

      // Update meta stats
      await setDoc(doc(db, 'meta', 'stats'), {
        postCount: increment(1)
      }, { merge: true });

      showToast('Question posted successfully! 🎉');
      setTimeout(() => { window.location.href = `/post?slug=${encodeURIComponent(slug)}`; }, 1000);

    } catch(err) {
      showToast('Failed to post question. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Post Question';
    }
  });
});

// ── WRITE FORM INIT ──
document.addEventListener('DOMContentLoaded', () => {
  const writeForm = document.getElementById('write-form');
  if (!writeForm) return;

  requireAuth('/write').catch(() => {});

  initCharCount('w-title', 'w-title-count');
  initCharCount('w-body', 'w-body-count');
  initCharCount('w-seo-desc', 'seo-count');
  initEditorToolbar('#main-toolbar', 'w-body', 'w-preview-btn', 'w-preview', 'w-preview-content');
  const tagManager = initTagsInput('w-tags-wrapper', 'w-tag-input', null);

  // Post type switching
  const typeInputs = document.querySelectorAll('input[name="post-type"]');
  typeInputs.forEach(input => {
    input.addEventListener('change', () => {
      const type = input.value;
      document.getElementById('lang-group').classList.toggle('hidden', type !== 'snippet');
      document.getElementById('project-fields').classList.toggle('hidden', type !== 'project');
      document.getElementById('cover-group').classList.toggle('hidden', type === 'snippet');

      const bodyLabel = document.getElementById('body-label-text');
      const labels = { blog: 'Blog Content', wiki: 'Wiki Content', snippet: 'Code', project: 'Project Description', post: 'Content' };
      if (bodyLabel) bodyLabel.textContent = labels[type] || 'Content';

      const textarea = document.getElementById('w-body');
      const placeholders = {
        blog: 'Write your blog post here. Use ## for headings, ``` for code blocks.',
        wiki: 'Write comprehensive wiki documentation here.',
        snippet: '// Paste or write your code snippet here\n// Make sure it\'s clean and well-commented',
        project: 'Describe your project, its features, tech stack, and how to run it.',
        post: 'Share your thoughts with the community...'
      };
      if (textarea) textarea.placeholder = placeholders[type] || 'Start writing...';
    });
  });

  // Cover image
  const coverZone = document.getElementById('cover-upload-zone');
  const coverInput = document.getElementById('cover-upload');
  if (coverZone && coverInput) {
    coverZone.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          document.getElementById('cover-img-preview').src = ev.target.result;
          document.getElementById('cover-preview').style.display = 'block';
          document.getElementById('cover-upload-zone').style.display = 'none';
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
    document.getElementById('remove-cover')?.addEventListener('click', () => {
      document.getElementById('cover-preview').style.display = 'none';
      document.getElementById('cover-upload-zone').style.display = 'block';
      coverInput.value = '';
      window._coverImageUrl = null;
    });
  }

  // Draft save
  document.getElementById('save-draft-btn')?.addEventListener('click', () => {
    const draft = {
      title: document.getElementById('w-title').value,
      body: document.getElementById('w-body').value,
      type: document.querySelector('input[name="post-type"]:checked')?.value
    };
    localStorage.setItem('bsdc_draft', JSON.stringify(draft));
    showToast('Draft saved locally! 💾');
  });

  // Restore draft
  const savedDraft = localStorage.getItem('bsdc_draft');
  if (savedDraft) {
    try {
      const d = JSON.parse(savedDraft);
      const titleEl = document.getElementById('w-title');
      const bodyEl = document.getElementById('w-body');
      if (titleEl && d.title) titleEl.value = d.title;
      if (bodyEl && d.body) bodyEl.value = d.body;
    } catch(e) {}
  }

  // Submit
  writeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { showToast('Please login first.', 'warning'); return; }

    const type = document.querySelector('input[name="post-type"]:checked')?.value || 'blog';
    const title = document.getElementById('w-title').value.trim();
    const body = document.getElementById('w-body').value.trim();
    const tags = tagManager ? tagManager.getTags() : [];
    const seoDesc = document.getElementById('w-seo-desc').value.trim();

    let valid = true;
    if (!title) { document.getElementById('w-title-error').classList.add('visible'); valid = false; }
    else document.getElementById('w-title-error').classList.remove('visible');
    if (!body) { document.getElementById('w-body-error').classList.add('visible'); valid = false; }
    else document.getElementById('w-body-error').classList.remove('visible');
    if (!tags.length) { document.getElementById('w-tags-error').classList.add('visible'); valid = false; }
    else document.getElementById('w-tags-error').classList.remove('visible');
    if (!valid) return;

    const btn = document.getElementById('write-submit');
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    try {
      // Upload cover image
      let coverImage = window._coverImageUrl || null;
      if (!coverImage && document.getElementById('cover-upload')?.files[0]) {
        const { uploadImage } = await import('./upload.js');
        coverImage = await uploadImage(document.getElementById('cover-upload').files[0]);
      }

      const slug = generateSlug(title) + '-' + Date.now().toString(36);
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnap.data() || {};

      const postData = {
        type,
        title,
        titleLower: title.toLowerCase(),
        slug,
        body,
        excerpt: (seoDesc || body.substring(0, 200)).replace(/\n/g, ' '),
        seoDescription: seoDesc || body.substring(0, 160).replace(/\n/g, ' '),
        tags,
        coverImage,
        language: type === 'snippet' ? (document.getElementById('snippet-lang')?.value || 'javascript') : null,
        codeSnippet: type === 'snippet' ? body.substring(0, 500) : null,
        githubUrl: type === 'project' ? document.getElementById('project-github')?.value : null,
        demoUrl: type === 'project' ? document.getElementById('project-demo')?.value : null,
        techStack: type === 'project' ? document.getElementById('project-stack')?.value : null,
        authorId: user.uid,
        authorName: user.displayName || userData.displayName || 'Anonymous',
        authorPhoto: user.photoURL || userData.photoURL || '',
        authorUsername: userData.username || '',
        voteCount: 0,
        hotScore: 0,
        viewCount: 0,
        commentCount: 0,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), postData);

      // Tags
      for (const tag of tags) {
        await setDoc(doc(db, 'tags', tag), { count: increment(1) }, { merge: true });
      }

      // User stats
      await updateDoc(doc(db, 'users', user.uid), {
        postCount: increment(1),
        points: increment(10)
      });

      await setDoc(doc(db, 'meta', 'stats'), { postCount: increment(1) }, { merge: true });

      // Clear draft
      localStorage.removeItem('bsdc_draft');

      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} published! 🚀`);
      setTimeout(() => { window.location.href = `/post?slug=${encodeURIComponent(slug)}`; }, 1000);

    } catch(err) {
      showToast('Failed to publish. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Publish Post';
    }
  });
});

// ── Handle Image Preview ──
function handleImagePreview(file) {
  if (file.size > 5 * 1024 * 1024) { showToast('Image too large. Max 5MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('upload-preview');
    const img = document.getElementById('upload-img-preview');
    if (preview && img) {
      img.src = e.target.result;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}
