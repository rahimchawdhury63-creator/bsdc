/**
 * BSDC Submit Engine
 * Handles all content creation:
 * Question, Blog, Wiki, Snippet, Project, Discussion
 */

window.BSDC = window.BSDC || {};

window.BSDC.submitEngine = {

  currentType: 'question',
  editPostId: null,
  uploadedImageUrl: null,

  init() {
    const typeParam = window.BSDC.getParam('type') || 'question';
    const editParam = window.BSDC.getParam('edit');
    this.currentType = typeParam;
    this.editPostId = editParam;
    this.renderForm();
    if (editParam) this.loadEditData(editParam);
  },

  renderForm() {
    const container = document.getElementById('submit-container');
    if (!container) return;

    const typeConfig = {
      question: { label: 'Ask a Question', icon: '❓', desc: 'Get help from the Bangladesh developer community', contentLabel: 'Question Details', contentPlaceholder: 'Describe your problem in detail. What have you tried? What error are you getting?' },
      blog: { label: 'Write a Blog Post', icon: '📝', desc: 'Share your knowledge and experiences', contentLabel: 'Blog Content', contentPlaceholder: 'Write your blog post here. You can include code examples, images, and detailed explanations.' },
      wiki: { label: 'Create a Wiki Article', icon: '📚', desc: 'Contribute to the community knowledge base', contentLabel: 'Wiki Content', contentPlaceholder: 'Write clear, factual documentation that will help other developers.' },
      snippet: { label: 'Share a Code Snippet', icon: '💻', desc: 'Share reusable code with the community', contentLabel: 'Description', contentPlaceholder: 'Explain what this code does and when to use it.' },
      project: { label: 'Share a Project', icon: '🚀', desc: 'Show off your work and get feedback', contentLabel: 'Project Description', contentPlaceholder: 'Describe your project, what problem it solves, the tech stack you used, and any challenges you faced.' },
      discussion: { label: 'Start a Discussion', icon: '💬', desc: 'Start a conversation with the community', contentLabel: 'Discussion', contentPlaceholder: 'Share your thoughts, ideas, or opinions with the community.' }
    };

    const tc = typeConfig[this.currentType] || typeConfig.question;

    container.innerHTML = `
      <div style="max-width:860px;margin:0 auto">

        <!-- Type Selector -->
        <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.25rem;margin-bottom:1.5rem">
          <div style="font-size:0.8rem;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.75rem">Post Type</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
            ${Object.entries(typeConfig).map(([type, cfg]) => `
              <button class="type-select-btn ${type === this.currentType ? 'active' : ''}"
                data-type="${type}"
                style="display:flex;align-items:center;gap:0.375rem;padding:0.5rem 0.875rem;border-radius:0.5rem;border:2px solid ${type === this.currentType ? '#006A4E' : '#E2E8F0'};background:${type === this.currentType ? '#e6f4f0' : 'white'};color:${type === this.currentType ? '#006A4E' : '#64748B'};font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.2s"
                aria-pressed="${type === this.currentType}">
                ${cfg.icon} ${cfg.label.split(' ').slice(-1)[0]}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Form -->
        <form id="submit-form" novalidate>
          <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem">

            <div style="margin-bottom:1.5rem">
              <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
                <span style="font-size:1.75rem">${tc.icon}</span>
                <div>
                  <h1 style="font-size:1.25rem;font-weight:800;color:#1E293B">${tc.label}</h1>
                  <p style="font-size:0.875rem;color:#64748B">${tc.desc}</p>
                </div>
              </div>
            </div>

            <div id="submit-error" class="alert alert-error" style="display:none"></div>

            <!-- Title -->
            <div class="form-group">
              <label class="form-label" for="submit-title">
                ${this.currentType === 'question' ? 'Your Question' : 'Title'} <span style="color:#DC2626">*</span>
              </label>
              <input type="text" id="submit-title" class="form-input"
                placeholder="${this.currentType === 'question' ? 'e.g. How to connect MySQL with Laravel in Bangladesh shared hosting?' : 'Enter a clear, descriptive title'}"
                maxlength="200" required aria-required="true"/>
              <div style="display:flex;justify-content:space-between;margin-top:0.25rem">
                <div class="form-hint">Be specific and descriptive. Good titles get better answers.</div>
                <span id="title-char-count" style="font-size:0.75rem;color:#94A3B8">0/200</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-group">
              <label class="form-label" for="tag-input">Tags <span style="color:#DC2626">*</span></label>
              <div style="border:2px solid #E2E8F0;border-radius:0.5rem;padding:0.5rem;display:flex;flex-wrap:wrap;gap:0.375rem;min-height:46px;cursor:text;transition:border-color 0.2s" id="tags-container">
                <div id="selected-tags" style="display:flex;flex-wrap:wrap;gap:0.375rem"></div>
                <input type="text" id="tag-input" placeholder="Add up to 5 tags..." style="border:none;outline:none;font-size:0.9rem;min-width:120px;flex:1;background:none;padding:0.125rem 0.25rem" maxlength="30" aria-label="Add tags"/>
              </div>
              <div class="form-hint">Press Enter or comma to add a tag. Max 5 tags.</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-top:0.5rem">
                ${['javascript','python','php','laravel','react','nodejs','android','flutter','mysql','wordpress','css','html','git','docker','aws'].map(t =>
                  `<button type="button" class="tag suggest-tag" data-tag="${t}" style="font-size:0.75rem">${t}</button>`
                ).join('')}
              </div>
            </div>

          </div>

          <!-- Snippet specific: language + code -->
          ${this.currentType === 'snippet' ? `
            <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem">
              <div class="form-group">
                <label class="form-label" for="snippet-lang">Programming Language</label>
                <select id="snippet-lang" class="form-select">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="php">PHP</option>
                  <option value="java">Java</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash/Shell</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="swift">Swift</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="ruby">Ruby</option>
                  <option value="dart">Dart (Flutter)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="snippet-code">Code <span style="color:#DC2626">*</span></label>
                <textarea id="snippet-code" class="form-textarea" placeholder="Paste your code here..." style="min-height:250px;font-family:'Fira Code',monospace;font-size:0.875rem;tab-size:2" spellcheck="false" aria-label="Code content"></textarea>
              </div>
            </div>
          ` : ''}

          <!-- Project specific: URLs -->
          ${this.currentType === 'project' ? `
            <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem">
              <h3 style="font-weight:700;color:#1E293B;margin-bottom:1rem">Project Links</h3>
              <div class="form-group">
                <label class="form-label" for="project-demo">Live Demo URL</label>
                <input type="url" id="project-demo" class="form-input" placeholder="https://yourproject.com" aria-label="Demo URL"/>
              </div>
              <div class="form-group">
                <label class="form-label" for="project-repo">Repository URL</label>
                <input type="url" id="project-repo" class="form-input" placeholder="https://github.com/username/repo" aria-label="Repository URL"/>
              </div>
            </div>
          ` : ''}

          <!-- Content Editor -->
          <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">${tc.contentLabel} <span style="color:#DC2626">*</span></label>
              <div class="editor-wrapper" style="margin-top:0.5rem">
                <div class="editor-toolbar" role="toolbar">
                  <button type="button" class="editor-btn" data-cmd="bold" title="Bold"><strong>B</strong></button>
                  <button type="button" class="editor-btn" data-cmd="italic" title="Italic"><em>I</em></button>
                  <button type="button" class="editor-btn" data-cmd="underline" title="Underline"><u>U</u></button>
                  <button type="button" class="editor-btn" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
                  <div class="editor-sep"></div>
                  <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="h2" title="Heading 2">H2</button>
                  <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="h3" title="Heading 3">H3</button>
                  <div class="editor-sep"></div>
                  <button type="button" class="editor-btn" data-cmd="insertUnorderedList" title="Bullet List">• List</button>
                  <button type="button" class="editor-btn" data-cmd="insertOrderedList" title="Numbered List">1. List</button>
                  <button type="button" class="editor-btn" data-cmd="blockquote" title="Blockquote">❝</button>
                  <div class="editor-sep"></div>
                  <button type="button" class="editor-btn" id="main-code-btn" title="Code Block">&lt;/&gt;</button>
                  <button type="button" class="editor-btn" id="img-insert-btn" title="Insert Image">🖼️</button>
                  <button type="button" class="editor-btn" id="link-insert-btn" title="Insert Link">🔗</button>
                </div>
                <div class="editor-content" id="main-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${tc.contentLabel}" data-placeholder="${tc.contentPlaceholder}" style="min-height:300px"></div>
              </div>
            </div>
          </div>

          <!-- Cover Image Upload -->
          ${['blog','project','wiki'].includes(this.currentType) ? `
            <div style="background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:1.5rem;margin-bottom:1rem">
              <h3 style="font-weight:700;color:#1E293B;margin-bottom:0.75rem">Cover Image <span style="font-weight:400;color:#64748B;font-size:0.85rem">(optional)</span></h3>
              <div id="image-upload-area" style="border:2px dashed #E2E8F0;border-radius:0.75rem;padding:2rem;text-align:center;cursor:pointer;transition:all 0.2s" role="button" tabindex="0" aria-label="Upload cover image">
                <div id="upload-placeholder">
                  <div style="font-size:2.5rem;margin-bottom:0.5rem">🖼️</div>
                  <p style="color:#64748B;margin-bottom:0.5rem;font-weight:500">Click to upload cover image</p>
                  <p style="color:#94A3B8;font-size:0.8rem">PNG, JPG, GIF up to 10MB</p>
                </div>
                <div id="upload-preview" style="display:none">
                  <img id="cover-preview-img" src="" alt="Cover preview" style="max-height:200px;border-radius:0.5rem;margin:0 auto"/>
                  <button type="button" id="remove-cover-btn" class="btn btn-ghost btn-sm" style="margin-top:0.75rem;color:#DC2626">Remove Image</button>
                </div>
                <input type="file" id="cover-image-input" accept="image/*" style="display:none" aria-label="Choose cover image file"/>
              </div>
              <div id="upload-progress" style="display:none;margin-top:0.75rem">
                <div style="height:4px;background:#E2E8F0;border-radius:2px;overflow:hidden">
                  <div style="height:100%;background:#006A4E;border-radius:2px;width:0%;transition:width 0.3s" id="upload-progress-bar"></div>
                </div>
                <p style="font-size:0.8rem;color:#64748B;margin-top:0.375rem;text-align:center" id="upload-status">Uploading...</p>
              </div>
            </div>
          ` : ''}

          <!-- Submit Buttons -->
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
            <a href="/" class="btn btn-ghost">← Cancel</a>
            <div style="display:flex;gap:0.75rem">
              <button type="button" class="btn btn-secondary" id="preview-full-btn">👁️ Preview</button>
              <button type="submit" class="btn btn-primary btn-lg" id="submit-main-btn">
                ${this.editPostId ? '💾 Update Post' : '🚀 Publish Post'}
              </button>
            </div>
          </div>
        </form>

        <!-- Preview Panel -->
        <div id="full-preview-panel" style="display:none;margin-top:1.5rem;background:white;border:1px solid #E2E8F0;border-radius:0.75rem;padding:2rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
            <h2 style="font-weight:800;color:#1E293B">Preview</h2>
            <button class="btn btn-ghost btn-sm" id="close-preview-btn">✕ Close Preview</button>
          </div>
          <div id="full-preview-content"></div>
        </div>

      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    // Type selector buttons
    document.querySelectorAll('.type-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentType = btn.dataset.type;
        window.history.pushState({}, '', `/submit?type=${this.currentType}`);
        this.renderForm();
      });
    });

    // Title char count
    const titleInput = document.getElementById('submit-title');
    titleInput?.addEventListener('input', () => {
      const count = titleInput.value.length;
      const el = document.getElementById('title-char-count');
      if (el) el.textContent = `${count}/200`;
    });

    // Tags system
    this.initTagSystem();

    // Editor toolbar
    document.querySelectorAll('.editor-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val) {
          document.execCommand(btn.dataset.cmd, false, val);
        } else {
          document.execCommand(btn.dataset.cmd, false, null);
        }
        document.getElementById('main-editor')?.focus();
      });
    });

    // Code block insert
    document.getElementById('main-code-btn')?.addEventListener('click', () => {
      const lang = prompt('Language:', 'javascript') || 'javascript';
      document.execCommand('insertText', false, `\n\`\`\`${lang}\n// code here\n\`\`\`\n`);
    });

    // Image insert
    document.getElementById('img-insert-btn')?.addEventListener('click', async () => {
      const url = prompt('Enter image URL:');
      if (url) document.execCommand('insertHTML', false, `<img src="${url}" alt="image" style="max-width:100%"/>`);
    });

    // Link insert
    document.getElementById('link-insert-btn')?.addEventListener('click', () => {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    });

    // Cover image upload
    this.initImageUpload();

    // Preview
    document.getElementById('preview-full-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('full-preview-panel');
      const content = document.getElementById('main-editor')?.innerHTML || '';
      const title = document.getElementById('submit-title')?.value || 'Untitled';
      const previewEl = document.getElementById('full-preview-content');
      if (previewEl) {
        previewEl.innerHTML = `
          <h1 style="font-size:1.75rem;font-weight:900;color:#1E293B;margin-bottom:1rem">${title}</h1>
          <div style="line-height:1.85;color:#1E293B">${window.BSDC.postEngine.parseContent(content)}</div>
        `;
      }
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') panel.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('close-preview-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('full-preview-panel');
      if (panel) panel.style.display = 'none';
    });

    // Tab key in snippet code textarea
    document.getElementById('snippet-code')?.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value = e.target.value.substring(0, start) + '  ' + e.target.value.substring(end);
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }
    });

    // Form submit
    document.getElementById('submit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Suggested tags
    document.querySelectorAll('.suggest-tag').forEach(btn => {
      btn.addEventListener('click', () => this.addTag(btn.dataset.tag));
    });
  },

  initTagSystem() {
    const input = document.getElementById('tag-input');
    const tagsContainer = document.getElementById('tags-container');
    this._tags = [];

    const renderTags = () => {
      const selectedEl = document.getElementById('selected-tags');
      if (!selectedEl) return;
      selectedEl.innerHTML = this._tags.map(t => `
        <span class="tag" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0.625rem">
          ${t}
          <button type="button" class="remove-tag" data-tag="${t}" style="background:none;border:none;cursor:pointer;color:#006A4E;font-size:0.9rem;line-height:1;padding:0" aria-label="Remove tag ${t}">×</button>
        </span>
      `).join('');

      document.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', () => {
          this._tags = this._tags.filter(t => t !== btn.dataset.tag);
          renderTags();
        });
      });
    };

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        this.addTag(input.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''));
        input.value = '';
      } else if (e.key === 'Backspace' && !input.value && this._tags.length) {
        this._tags.pop();
        renderTags();
      }
    });

    tagsContainer?.addEventListener('click', () => input?.focus());
    this._renderTags = renderTags;
  },

  addTag(tag) {
    if (!tag || this._tags.length >= 5 || this._tags.includes(tag) || tag.length < 1) return;
    this._tags.push(tag);
    if (this._renderTags) this._renderTags();
    const input = document.getElementById('tag-input');
    if (input) input.value = '';
  },

  initImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('cover-image-input');
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', (e) => {
      if (e.target.id !== 'remove-cover-btn') fileInput.click();
    });

    uploadArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#006A4E';
      uploadArea.style.background = '#f0faf7';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '#E2E8F0';
      uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#E2E8F0';
      uploadArea.style.background = '';
      const file = e.dataTransfer.files[0];
      if (file) this.handleImageUpload(file);
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) this.handleImageUpload(file);
    });

    document.getElementById('remove-cover-btn')?.addEventListener('click', () => {
      this.uploadedImageUrl = null;
      document.getElementById('upload-placeholder').style.display = 'block';
      document.getElementById('upload-preview').style.display = 'none';
      fileInput.value = '';
    });
  },

  async handleImageUpload(file) {
    const progress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const statusEl = document.getElementById('upload-status');

    if (progress) progress.style.display = 'block';
    if (progressBar) progressBar.style.width = '30%';
    if (statusEl) statusEl.textContent = 'Uploading image...';

    try {
      if (progressBar) progressBar.style.width = '60%';
      const url = await window.BSDC.uploadImage(file);
      this.uploadedImageUrl = url;

      if (progressBar) progressBar.style.width = '100%';
      if (statusEl) statusEl.textContent = 'Upload complete!';

      // Show preview
      const placeholder = document.getElementById('upload-placeholder');
      const preview = document.getElementById('upload-preview');
      const previewImg = document.getElementById('cover-preview-img');

      if (placeholder) placeholder.style.display = 'none';
      if (preview) preview.style.display = 'block';
      if (previewImg) previewImg.src = url;

      setTimeout(() => {
        if (progress) progress.style.display = 'none';
      }, 1500);

      window.BSDC.toast.success('Image uploaded successfully!');
    } catch(e) {
      if (statusEl) statusEl.textContent = 'Upload failed: ' + e.message;
      if (progressBar) progressBar.style.background = '#DC2626';
      window.BSDC.toast.error('Image upload failed: ' + e.message);
    }
  },

  async handleSubmit() {
    const title = document.getElementById('submit-title')?.value.trim();
    const content = document.getElementById('main-editor')?.innerHTML || '';
    const contentText = document.getElementById('main-editor')?.innerText.trim() || '';
    const errEl = document.getElementById('submit-error');
    const btn = document.getElementById('submit-main-btn');

    // Validate
    if (!title || title.length < 10) {
      errEl.textContent = 'Please enter a more descriptive title (minimum 10 characters).';
      errEl.style.display = 'block';
      errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (!this._tags || this._tags.length === 0) {
      errEl.textContent = 'Please add at least one tag to categorize your post.';
      errEl.style.display = 'block';
      errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (this.currentType !== 'snippet' && contentText.length < 20) {
      errEl.textContent = 'Please write more detailed content (minimum 20 characters).';
      errEl.style.display = 'block';
      errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (this.currentType === 'snippet') {
      const code = document.getElementById('snippet-code')?.value.trim();
      if (!code) {
        errEl.textContent = 'Please enter your code snippet.';
        errEl.style.display = 'block';
        return;
      }
    }

    errEl.style.display = 'none';
    btn.textContent = 'Publishing...';
    btn.disabled = true;

    try {
      const postData = {
        title,
        content,
        type: this.currentType,
        tags: this._tags || [],
        searchTerms: window.BSDC.text.generateSearchTerms(title, this._tags || [], contentText),
        excerpt: window.BSDC.text.excerpt(contentText, 200),
        coverImage: this.uploadedImageUrl || null
      };

      // Type-specific fields
      if (this.currentType === 'snippet') {
        postData.code = document.getElementById('snippet-code')?.value || '';
        postData.language = document.getElementById('snippet-lang')?.value || 'javascript';
      }
      if (this.currentType === 'project') {
        postData.demoUrl = document.getElementById('project-demo')?.value || '';
        postData.repoUrl = document.getElementById('project-repo')?.value || '';
      }

      let result;
      if (this.editPostId) {
        await window.BSDC.db.updatePost(this.editPostId, postData);
        window.BSDC.toast.success('Post updated successfully!');
        result = { slug: window.BSDC.getParam('slug') };
      } else {
        result = await window.BSDC.db.createPost(postData);
        window.BSDC.toast.success('Post published successfully!');
      }

      setTimeout(() => {
        window.location.href = `/post?slug=${result.slug}`;
      }, 800);

    } catch(e) {
      errEl.textContent = e.message || 'Failed to publish post. Please try again.';
      errEl.style.display = 'block';
      btn.textContent = this.editPostId ? '💾 Update Post' : '🚀 Publish Post';
      btn.disabled = false;
    }
  },

  async loadEditData(postId) {
    try {
      const post = await window.BSDC.db.getPost(postId);
      if (!post) return;

      // Verify author
      if (post.authorId !== window.BSDC.auth.currentUser?.uid) {
        window.BSDC.toast.error('You cannot edit this post');
        window.location.href = '/';
        return;
      }

      this.currentType = post.type;
      this._tags = post.tags || [];
      if (this._renderTags) this._renderTags();

      document.getElementById('submit-title').value = post.title || '';
      document.getElementById('main-editor').innerHTML = post.content || '';

      if (post.type === 'snippet') {
        document.getElementById('snippet-code').value = post.code || '';
        document.getElementById('snippet-lang').value = post.language || 'javascript';
      }
      if (post.type === 'project') {
        document.getElementById('project-demo').value = post.demoUrl || '';
        document.getElementById('project-repo').value = post.repoUrl || '';
      }
      if (post.coverImage) {
        this.uploadedImageUrl = post.coverImage;
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('upload-preview');
        const previewImg = document.getElementById('cover-preview-img');
        if (placeholder) placeholder.style.display = 'none';
        if (preview) preview.style.display = 'block';
        if (previewImg) previewImg.src = post.coverImage;
      }
    } catch(e) {
      window.BSDC.toast.error('Failed to load post for editing');
    }
  }
};
