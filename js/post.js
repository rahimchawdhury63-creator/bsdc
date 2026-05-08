/**
 * BSDC Post Engine
 * Handles rendering of all post types:
 * Q&A, Blog, Wiki, Snippet, Project, Discussion
 */

window.BSDC = window.BSDC || {};

window.BSDC.postEngine = {

  // ---- Syntax Highlighter (Vanilla) ----
  highlight(code, lang) {
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    // Keywords by language
    const keywords = {
      javascript: ['const','let','var','function','return','if','else','for','while','class','import','export','default','async','await','try','catch','throw','new','this','typeof','instanceof','null','undefined','true','false','switch','case','break','continue','do','in','of','from','extends','super','static','get','set','yield','delete','void'],
      python: ['def','class','return','if','elif','else','for','while','import','from','as','try','except','finally','with','pass','break','continue','and','or','not','in','is','lambda','yield','global','nonlocal','True','False','None','async','await','raise','del','assert'],
      php: ['function','return','if','else','elseif','for','foreach','while','class','new','echo','print','public','private','protected','static','abstract','interface','extends','implements','namespace','use','require','include','try','catch','throw','null','true','false','array','string','int','float','bool'],
      python3: ['def','class','return','if','elif','else','for','while','import','from','as','try','except','finally','with','pass','break','continue','and','or','not','in','is','lambda','yield','True','False','None','async','await'],
      java: ['public','private','protected','class','interface','extends','implements','return','if','else','for','while','new','static','final','abstract','void','int','string','boolean','true','false','null','try','catch','throw','throws','import','package','this','super'],
      css: ['color','background','margin','padding','border','display','position','width','height','font','flex','grid','top','left','right','bottom','overflow','z-index','opacity','transform','transition','animation'],
      html: ['html','head','body','div','span','p','a','h1','h2','h3','ul','li','img','form','input','button','table','tr','td','th','script','style','link','meta','title','section','article','nav','footer','header','main','aside']
    };

    const kw = keywords[lang] || keywords['javascript'];

    // Apply highlighting
    // Strings
    escaped = escaped.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="token-string">$1$2$1</span>');
    // Comments
    escaped = escaped.replace(/(\/\/.*$)/gm,
      '<span class="token-comment">$1</span>');
    escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g,
      '<span class="token-comment">$1</span>');
    escaped = escaped.replace(/(#.*$)/gm,
      '<span class="token-comment">$1</span>');
    // Numbers
    escaped = escaped.replace(/\b(\d+\.?\d*)\b/g,
      '<span class="token-number">$1</span>');
    // Keywords
    if (kw.length) {
      const kwRegex = new RegExp(`\\b(${kw.join('|')})\\b`, 'g');
      escaped = escaped.replace(kwRegex,
        '<span class="token-keyword">$1</span>');
    }
    // Functions
    escaped = escaped.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
      '<span class="token-function">$1</span>');

    return escaped;
  },

  // ---- Render Code Block ----
  renderCodeBlock(code, lang = 'javascript') {
    const highlighted = this.highlight(code.trim(), lang);
    const id = 'cb-' + Math.random().toString(36).slice(2, 8);
    return `
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-lang">${lang}</span>
          <button class="code-copy-btn" data-code-id="${id}" aria-label="Copy code">📋 Copy</button>
        </div>
        <pre id="${id}"><code>${highlighted}</code></pre>
      </div>
    `;
  },

  // ---- Parse content for code blocks ----
  parseContent(content) {
    if (!content) return '';
    // Replace ```lang\ncode\n``` blocks
    return content.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      return this.renderCodeBlock(code, lang || 'javascript');
    });
  },

  // ---- Render full post detail ----
  renderPost(post, container) {
    const typeConfig = {
      question: { label: 'Question', cls: 'type-question', icon: '❓' },
      blog: { label: 'Blog Post', cls: 'type-blog', icon: '📝' },
      wiki: { label: 'Wiki', cls: 'type-wiki', icon: '📚' },
      snippet: { label: 'Code Snippet', cls: 'type-snippet', icon: '💻' },
      project: { label: 'Project', cls: 'type-project', icon: '🚀' },
      discussion: { label: 'Discussion', cls: 'type-discussion', icon: '💬' }
    };
    const tc = typeConfig[post.type] || { label: 'Post', cls: 'type-discussion', icon: '📄' };
    const votes = (post.upvotes || 0) - (post.downvotes || 0);
    const initials = window.BSDC.text.avatarInitials(post.authorName || 'U');
    const parsedContent = this.parseContent(post.content || '');

    container.innerHTML = `
      <article itemscope itemtype="https://schema.org/Article" class="animate-fade-up">

        <!-- Post Header -->
        <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem">

          <!-- Type + Solved Badge -->
          <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem">
            <span class="post-card-type-badge ${tc.cls}">${tc.icon} ${tc.label}</span>
            ${post.isSolved ? '<span class="badge badge-green">✅ Solved</span>' : ''}
            ${post.tags ? post.tags.map(t =>
              `<a href="/tag?t=${encodeURIComponent(t)}" class="tag" style="font-size:0.75rem">${t}</a>`
            ).join('') : ''}
          </div>

          <!-- Title -->
          <h1 itemprop="headline" style="font-size:1.75rem;font-weight:900;color:#1E293B;line-height:1.3;margin-bottom:1.25rem">${post.title}</h1>

          <!-- Author row -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
            <div style="display:flex;align-items:center;gap:0.75rem">
              <a href="/profile?u=${post.authorUsername || ''}" style="text-decoration:none;display:flex;align-items:center;gap:0.75rem">
                <div class="avatar avatar-md" style="background:#e6f4f0;color:#006A4E">
                  ${post.authorAvatar
                    ? `<img src="${post.authorAvatar}" alt="${post.authorName}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
                    : initials}
                </div>
                <div>
                  <div style="font-weight:700;color:#1E293B;font-size:0.9rem" itemprop="author">${post.authorName || 'BSDC Member'}</div>
                  <div style="font-size:0.8rem;color:#64748B">
                    ${window.BSDC.time.format(post.createdAt)}
                    · 👁️ ${window.BSDC.text.formatNumber(post.views || 0)} views
                  </div>
                </div>
              </a>
            </div>
            <!-- Actions -->
            <div style="display:flex;gap:0.5rem;align-items:center">
              <button class="btn btn-secondary btn-sm" id="post-vote-up" data-id="${post.id}" aria-label="Upvote">
                ▲ <span id="post-vote-count">${votes}</span>
              </button>
              <button class="btn btn-ghost btn-sm" id="post-share-btn" data-url="${window.location.href}" data-title="${post.title}" aria-label="Share">
                🔗 Share
              </button>
              ${window.BSDC.auth.currentUser?.uid === post.authorId ? `
                <a href="/submit?edit=${post.id}" class="btn btn-ghost btn-sm">✏️ Edit</a>
                <button class="btn btn-ghost btn-sm" id="post-delete-btn" data-id="${post.id}" style="color:#DC2626">🗑️ Delete</button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Cover Image -->
        ${post.coverImage ? `
          <div style="border-radius:0.75rem;overflow:hidden;margin-bottom:1rem">
            <img src="${post.coverImage}" alt="${post.title}" style="width:100%;max-height:400px;object-fit:cover" itemprop="image" loading="lazy"/>
          </div>
        ` : ''}

        <!-- Content -->
        <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:2rem;margin-bottom:1rem">
          <div itemprop="articleBody" style="line-height:1.85;color:#1E293B;font-size:1rem" id="post-content-body">
            ${parsedContent}
          </div>
        </div>

        <!-- Snippet specific: full code display -->
        ${post.type === 'snippet' && post.code ? `
          <div style="margin-bottom:1rem">
            <h2 style="font-size:1.1rem;font-weight:700;color:#1E293B;margin-bottom:0.75rem">💻 Code</h2>
            ${this.renderCodeBlock(post.code, post.language || 'javascript')}
          </div>
        ` : ''}

        <!-- Project links -->
        ${post.type === 'project' && (post.demoUrl || post.repoUrl) ? `
          <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;display:flex;gap:1rem;flex-wrap:wrap">
            ${post.demoUrl ? `<a href="${post.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">🌐 Live Demo</a>` : ''}
            ${post.repoUrl ? `<a href="${post.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-slate">🐙 View Repository</a>` : ''}
          </div>
        ` : ''}

      </article>
    `;

    // Code copy handler
    container.addEventListener('click', async (e) => {
      const copyBtn = e.target.closest('.code-copy-btn');
      if (copyBtn) {
        const codeId = copyBtn.dataset.codeId;
        const pre = document.getElementById(codeId);
        if (pre) {
          const text = pre.textContent;
          await window.BSDC.copyToClipboard(text);
          copyBtn.textContent = '✅ Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      }
    });

    // Vote handler
    document.getElementById('post-vote-up')?.addEventListener('click', async () => {
      const user = window.BSDC.auth.currentUser;
      if (!user) {
        window.BSDC.toast.info('Please log in to vote');
        return;
      }
      try {
        await window.BSDC.db.votePost(post.id, 'up');
        const countEl = document.getElementById('post-vote-count');
        if (countEl) countEl.textContent = parseInt(countEl.textContent || 0) + 1;
        window.BSDC.toast.success('Vote recorded!');
      } catch(e) {
        window.BSDC.toast.error('Vote failed');
      }
    });

    // Share handler
    document.getElementById('post-share-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('post-share-btn');
      const url = btn.dataset.url;
      const title = btn.dataset.title;
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else {
        await window.BSDC.copyToClipboard(url);
        window.BSDC.toast.success('Link copied to clipboard!');
      }
    });

    // Delete handler
    document.getElementById('post-delete-btn')?.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
      try {
        await window.BSDC.db.deletePost(post.id);
        window.BSDC.toast.success('Post deleted successfully');
        setTimeout(() => window.location.href = '/', 1000);
      } catch(e) {
        window.BSDC.toast.error('Failed to delete post');
      }
    });
  },

  // ---- Render Answers Section ----
  renderAnswers(answers, post, container) {
    if (!container) return;
    const isAuthor = window.BSDC.auth.currentUser?.uid === post.authorId;

    if (answers.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2rem;color:#64748B;background:white;border:1px solid #E2E8F0;border-radius:0.75rem">
          <div style="font-size:2.5rem;margin-bottom:0.75rem">💬</div>
          <h3 style="font-weight:700;color:#1E293B;margin-bottom:0.5rem">No answers yet</h3>
          <p>Be the first to answer this question and help the community!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <h2 style="font-size:1.25rem;font-weight:800;color:#1E293B;margin-bottom:1rem">
        ${answers.length} Answer${answers.length !== 1 ? 's' : ''}
      </h2>
      ${answers.map(answer => this.renderAnswerCard(answer, post, isAuthor)).join('')}
    `;

    // Accept answer buttons
    container.querySelectorAll('.accept-answer-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const answerId = btn.dataset.answerId;
        const postId = btn.dataset.postId;
        try {
          await window.BSDC.db.acceptAnswer(postId, answerId);
          window.BSDC.toast.success('Answer marked as accepted!');
          // Reload answers
          location.reload();
        } catch(e) {
          window.BSDC.toast.error('Failed to accept answer');
        }
      });
    });
  },

  renderAnswerCard(answer, post, isAuthor) {
    const votes = (answer.upvotes || 0) - (answer.downvotes || 0);
    const initials = window.BSDC.text.avatarInitials(answer.authorName || 'U');
    const parsedContent = this.parseContent(answer.content || '');

    return `
      <div class="answer-card ${answer.isAccepted ? 'accepted' : ''}" id="answer-${answer.id}" itemscope itemtype="https://schema.org/Answer">
        ${answer.isAccepted ? `
          <div class="accepted-badge">✅ Accepted Answer</div>
        ` : ''}
        <div style="display:flex;gap:1rem">
          <!-- Vote Column -->
          <div class="vote-column" style="flex-shrink:0;margin-top:0.25rem">
            <button class="vote-btn answer-vote-btn" data-answer-id="${answer.id}" data-post-id="${post.id}" aria-label="Upvote answer">▲</button>
            <span class="vote-count">${votes}</span>
            <button class="vote-btn" style="transform:rotate(180deg)" aria-label="Downvote answer">▲</button>
            ${isAuthor && !post.isSolved ? `
              <button class="accept-answer-btn" data-answer-id="${answer.id}" data-post-id="${post.id}"
                style="margin-top:0.5rem;width:32px;height:32px;border-radius:50%;border:2px solid #006A4E;background:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center"
                title="Mark as accepted answer" aria-label="Accept this answer">
                ✓
              </button>
            ` : ''}
          </div>
          <!-- Answer Content -->
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
              <a href="/profile?u=${answer.authorUsername || ''}" style="text-decoration:none;display:flex;align-items:center;gap:0.5rem">
                <div class="avatar avatar-sm" style="background:#e6f4f0;color:#006A4E">
                  ${answer.authorAvatar
                    ? `<img src="${answer.authorAvatar}" alt="${answer.authorName}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
                    : initials}
                </div>
                <span style="font-weight:600;font-size:0.875rem;color:#1E293B" itemprop="author">${answer.authorName}</span>
              </a>
              <span style="font-size:0.8rem;color:#64748B">${window.BSDC.time.ago(answer.createdAt)}</span>
            </div>
            <div style="line-height:1.85;color:#1E293B;font-size:0.95rem" itemprop="text">${parsedContent}</div>
          </div>
        </div>
      </div>
    `;
  },

  // ---- Render Comments ----
  renderComments(comments, postId, container) {
    if (!container) return;
    const commentsHtml = comments.map(c => {
      const initials = window.BSDC.text.avatarInitials(c.authorName || 'U');
      return `
        <div style="display:flex;gap:0.75rem;margin-bottom:0.875rem">
          <a href="/profile?u=${c.authorUsername || ''}" style="text-decoration:none;flex-shrink:0">
            <div class="avatar avatar-sm" style="background:#e6f4f0;color:#006A4E">
              ${c.authorAvatar
                ? `<img src="${c.authorAvatar}" alt="${c.authorName}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
                : initials}
            </div>
          </a>
          <div style="flex:1;background:#F8FAFC;border-radius:0.75rem;padding:0.75rem 1rem;border:1px solid #E2E8F0">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem">
              <a href="/profile?u=${c.authorUsername || ''}" style="font-weight:700;font-size:0.85rem;color:#1E293B;text-decoration:none">${c.authorName}</a>
              <span style="font-size:0.75rem;color:#64748B">${window.BSDC.time.ago(c.createdAt)}</span>
            </div>
            <p style="font-size:0.875rem;color:#475569;line-height:1.6;margin:0">${c.content}</p>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      ${comments.length > 0 ? `
        <div style="margin-bottom:1rem">${commentsHtml}</div>
      ` : ''}
      <div id="comment-form-area"></div>
    `;

    this.renderCommentForm(postId, document.getElementById('comment-form-area'));
  },

  renderCommentForm(postId, container) {
    if (!container) return;
    const user = window.BSDC.auth.currentUser;

    if (!user) {
      container.innerHTML = `
        <div style="text-align:center;padding:1rem;background:#F8FAFC;border-radius:0.75rem;border:1px solid #E2E8F0">
          <p style="color:#64748B;font-size:0.875rem;margin-bottom:0.75rem">Log in to leave a comment</p>
          <a href="/login" class="btn btn-primary btn-sm">Log In</a>
        </div>
      `;
      return;
    }

    const profile = window.BSDC.auth.userProfile;
    const initials = window.BSDC.text.avatarInitials(profile?.displayName || 'U');

    container.innerHTML = `
      <div style="display:flex;gap:0.75rem;align-items:flex-start">
        <div class="avatar avatar-sm" style="background:#e6f4f0;color:#006A4E;flex-shrink:0">
          ${profile?.photoURL
            ? `<img src="${profile.photoURL}" alt="${profile.displayName}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
            : initials}
        </div>
        <div style="flex:1">
          <textarea id="comment-input" class="form-textarea" placeholder="Write a comment..." style="min-height:80px;font-size:0.9rem" aria-label="Comment text"></textarea>
          <div style="display:flex;justify-content:flex-end;margin-top:0.5rem">
            <button class="btn btn-primary btn-sm" id="comment-submit-btn">Post Comment</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('comment-submit-btn')?.addEventListener('click', async () => {
      const content = document.getElementById('comment-input')?.value.trim();
      if (!content) { window.BSDC.toast.warning('Please write a comment first'); return; }
      const btn = document.getElementById('comment-submit-btn');
      btn.textContent = 'Posting...';
      btn.disabled = true;
      try {
        await window.BSDC.db.addComment(postId, content);
        window.BSDC.toast.success('Comment posted!');
        // Reload comments
        const comments = await window.BSDC.db.getComments(postId);
        this.renderComments(comments, postId, container.parentElement);
      } catch(e) {
        window.BSDC.toast.error('Failed to post comment');
        btn.textContent = 'Post Comment';
        btn.disabled = false;
      }
    });
  },

  // ---- Render Answer Form ----
  renderAnswerForm(postId, container) {
    if (!container) return;
    const user = window.BSDC.auth.currentUser;

    if (!user) {
      container.innerHTML = `
        <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;text-align:center">
          <h3 style="font-weight:700;color:#1E293B;margin-bottom:0.5rem">Your Answer</h3>
          <p style="color:#64748B;margin-bottom:1rem">You must be logged in to answer this question.</p>
          <div style="display:flex;gap:0.75rem;justify-content:center">
            <a href="/login" class="btn btn-primary">Log In to Answer</a>
            <a href="/register" class="btn btn-secondary">Create Account</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem">
        <h3 style="font-size:1.1rem;font-weight:800;color:#1E293B;margin-bottom:1rem">Your Answer</h3>
        <div id="answer-error" class="alert alert-error" style="display:none"></div>
        <div class="editor-wrapper" style="margin-bottom:1rem">
          <div class="editor-toolbar" role="toolbar" aria-label="Text editor toolbar">
            <button class="editor-btn" data-cmd="bold" title="Bold" aria-label="Bold"><strong>B</strong></button>
            <button class="editor-btn" data-cmd="italic" title="Italic" aria-label="Italic"><em>I</em></button>
            <button class="editor-btn" data-cmd="underline" title="Underline" aria-label="Underline"><u>U</u></button>
            <div class="editor-sep" aria-hidden="true"></div>
            <button class="editor-btn" data-cmd="insertUnorderedList" title="Bullet List" aria-label="Bullet list">• List</button>
            <button class="editor-btn" data-cmd="insertOrderedList" title="Numbered List" aria-label="Numbered list">1. List</button>
            <div class="editor-sep" aria-hidden="true"></div>
            <button class="editor-btn" id="insert-code-btn" title="Insert Code Block" aria-label="Code block">&lt;/&gt;</button>
          </div>
          <div class="editor-content" id="answer-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Answer content" data-placeholder="Write your detailed answer here... You can include code blocks, lists, and explanations."></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem">
          <button class="btn btn-ghost" id="preview-answer-btn">👁️ Preview</button>
          <button class="btn btn-primary" id="submit-answer-btn">Post Your Answer</button>
        </div>
        <div id="answer-preview" style="display:none;margin-top:1rem;padding:1.25rem;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:0.75rem">
          <h4 style="font-weight:700;margin-bottom:0.75rem;color:#64748B;font-size:0.875rem">PREVIEW</h4>
          <div id="answer-preview-content" style="line-height:1.85;color:#1E293B"></div>
        </div>
      </div>
    `;

    // Editor toolbar
    container.querySelectorAll('.editor-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.execCommand(btn.dataset.cmd, false, null);
        document.getElementById('answer-editor')?.focus();
      });
    });

    // Insert code block
    document.getElementById('insert-code-btn')?.addEventListener('click', () => {
      const lang = prompt('Enter language (e.g. javascript, python, php):', 'javascript') || 'javascript';
      const editor = document.getElementById('answer-editor');
      if (editor) {
        const codeBlock = `\n\`\`\`${lang}\n// Your code here\n\`\`\`\n`;
        document.execCommand('insertText', false, codeBlock);
      }
    });

    // Preview
    document.getElementById('preview-answer-btn')?.addEventListener('click', () => {
      const editor = document.getElementById('answer-editor');
      const preview = document.getElementById('answer-preview');
      const previewContent = document.getElementById('answer-preview-content');
      if (!editor || !preview || !previewContent) return;

      const content = editor.innerText;
      previewContent.innerHTML = window.BSDC.postEngine.parseContent(content);
      const isShowing = preview.style.display !== 'none';
      preview.style.display = isShowing ? 'none' : 'block';
      document.getElementById('preview-answer-btn').textContent = isShowing ? '👁️ Preview' : '✏️ Edit';
    });

    // Submit answer
    document.getElementById('submit-answer-btn')?.addEventListener('click', async () => {
      const editor = document.getElementById('answer-editor');
      const errEl = document.getElementById('answer-error');
      const content = editor?.innerText.trim();

      if (!content || content.length < 20) {
        errEl.textContent = 'Please write a more detailed answer (minimum 20 characters).';
        errEl.style.display = 'block';
        return;
      }

      errEl.style.display = 'none';
      const btn = document.getElementById('submit-answer-btn');
      btn.textContent = 'Posting...';
      btn.disabled = true;

      try {
        await window.BSDC.db.addAnswer(postId, editor.innerHTML);
        window.BSDC.toast.success('Answer posted successfully!');
        editor.innerHTML = '';
        // Reload answers
        const answers = await window.BSDC.db.getAnswers(postId);
        const answersContainer = document.getElementById('answers-container');
        if (answersContainer) {
          const post = window.BSDC._currentPost;
          window.BSDC.postEngine.renderAnswers(answers, post, answersContainer);
        }
      } catch(e) {
        errEl.textContent = 'Failed to post answer. Please try again.';
        errEl.style.display = 'block';
      } finally {
        btn.textContent = 'Post Your Answer';
        btn.disabled = false;
      }
    });
  }
};
