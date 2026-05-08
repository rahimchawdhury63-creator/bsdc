/**
 * BSDC Skeleton UI System
 * Shows shimmer loaders while Firebase data fetches
 */

window.BSDC = window.BSDC || {};

window.BSDC.skeleton = {

  // ---- Skeleton Templates ----
  postCard() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-row">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton skeleton-text" style="width:40%;margin-bottom:6px"></div>
            <div class="skeleton skeleton-text-sm"></div>
          </div>
        </div>
        <div class="skeleton skeleton-title" style="margin-bottom:10px"></div>
        <div class="skeleton skeleton-text" style="margin-bottom:6px"></div>
        <div class="skeleton skeleton-text" style="width:75%;margin-bottom:6px"></div>
        <div class="skeleton skeleton-text-sm" style="width:50%;margin-bottom:14px"></div>
        <div style="display:flex;gap:8px">
          <div class="skeleton skeleton-btn" style="width:80px"></div>
          <div class="skeleton skeleton-btn" style="width:80px"></div>
          <div class="skeleton skeleton-btn" style="width:80px"></div>
        </div>
      </div>
    `;
  },

  postCardWithImage() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-row">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton skeleton-text" style="width:40%;margin-bottom:6px"></div>
            <div class="skeleton skeleton-text-sm"></div>
          </div>
        </div>
        <div class="skeleton skeleton-title" style="margin-bottom:10px"></div>
        <div class="skeleton skeleton-img" style="height:180px;margin-bottom:10px;border-radius:8px"></div>
        <div class="skeleton skeleton-text" style="margin-bottom:6px"></div>
        <div class="skeleton skeleton-text-sm" style="width:50%;margin-bottom:14px"></div>
        <div style="display:flex;gap:8px">
          <div class="skeleton skeleton-btn" style="width:80px"></div>
          <div class="skeleton skeleton-btn" style="width:80px"></div>
        </div>
      </div>
    `;
  },

  feed(count = 5) {
    return Array(count).fill(this.postCard()).join('');
  },

  profile() {
    return `
      <div class="skeleton-card" style="margin-bottom:1rem">
        <div class="skeleton skeleton-img" style="height:150px;border-radius:8px 8px 0 0;margin:-1rem -1rem 0"></div>
        <div style="padding:1rem">
          <div class="skeleton skeleton-avatar-lg" style="margin-top:-30px;margin-bottom:12px;border:4px solid white"></div>
          <div class="skeleton skeleton-title" style="width:50%;margin-bottom:8px"></div>
          <div class="skeleton skeleton-text-sm" style="width:30%;margin-bottom:16px"></div>
          <div class="skeleton skeleton-text" style="margin-bottom:6px"></div>
          <div class="skeleton skeleton-text" style="width:80%;margin-bottom:6px"></div>
          <div class="skeleton skeleton-text-sm" style="width:40%"></div>
        </div>
      </div>
    `;
  },

  postDetail() {
    return `
      <div class="skeleton-card">
        <div class="skeleton" style="height:2rem;width:80%;margin-bottom:12px"></div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton skeleton-text" style="width:40%;margin-bottom:6px"></div>
            <div class="skeleton skeleton-text-sm" style="width:25%"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text" style="margin-bottom:8px"></div>
        <div class="skeleton skeleton-text" style="margin-bottom:8px"></div>
        <div class="skeleton skeleton-text" style="width:90%;margin-bottom:8px"></div>
        <div class="skeleton skeleton-text" style="width:75%;margin-bottom:8px"></div>
        <div class="skeleton skeleton-img" style="height:250px;margin:16px 0;border-radius:8px"></div>
        <div class="skeleton skeleton-text" style="margin-bottom:8px"></div>
        <div class="skeleton skeleton-text" style="margin-bottom:8px"></div>
        <div class="skeleton skeleton-text" style="width:60%"></div>
      </div>
    `;
  },

  idCard() {
    return `
      <div style="width:340px;background:white;border-radius:1.25rem;overflow:hidden;border:1px solid #E2E8F0">
        <div class="skeleton" style="height:90px;border-radius:0"></div>
        <div class="skeleton" style="height:6px;border-radius:0;margin:0"></div>
        <div style="padding:1.25rem 1.5rem">
          <div style="display:flex;gap:1rem;margin-bottom:1rem">
            <div class="skeleton" style="width:75px;height:75px;border-radius:0.75rem;flex-shrink:0"></div>
            <div style="flex:1">
              <div class="skeleton skeleton-title" style="margin-bottom:8px;width:70%"></div>
              <div class="skeleton skeleton-text-sm" style="width:50%;margin-bottom:6px"></div>
              <div class="skeleton skeleton-text-sm" style="width:40%"></div>
            </div>
          </div>
          <div class="skeleton skeleton-text" style="margin-bottom:8px"></div>
          <div class="skeleton skeleton-text" style="width:75%;margin-bottom:16px"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
        <div style="padding:0.875rem 1.5rem;background:#F8FAFC;display:flex;justify-content:space-between">
          <div class="skeleton" style="width:60px;height:60px;border-radius:0.5rem"></div>
          <div style="flex:1;margin-left:1rem">
            <div class="skeleton skeleton-text-sm" style="margin-bottom:6px;width:60%"></div>
            <div class="skeleton skeleton-text-sm" style="width:40%"></div>
          </div>
        </div>
      </div>
    `;
  },

  comment() {
    return `
      <div class="skeleton-row" style="margin-bottom:1rem">
        <div class="skeleton skeleton-avatar"></div>
        <div style="flex:1;background:#F8FAFC;border-radius:0.75rem;padding:0.75rem">
          <div class="skeleton skeleton-text-sm" style="width:30%;margin-bottom:6px"></div>
          <div class="skeleton skeleton-text" style="margin-bottom:4px"></div>
          <div class="skeleton skeleton-text" style="width:70%"></div>
        </div>
      </div>
    `;
  },

  widget() {
    return `
      <div class="widget">
        <div class="widget-header">
          <div class="skeleton skeleton-text" style="width:60%"></div>
        </div>
        <div class="widget-body">
          ${Array(5).fill(`
            <div class="skeleton-row" style="margin-bottom:10px">
              <div class="skeleton" style="width:24px;height:24px;border-radius:4px;flex-shrink:0"></div>
              <div style="flex:1">
                <div class="skeleton skeleton-text"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ---- Show skeleton in container ----
  show(containerId, type = 'feed', count = 5) {
    const el = document.getElementById(containerId);
    if (!el) return;

    let html = '';
    switch(type) {
      case 'feed': html = this.feed(count); break;
      case 'profile': html = this.profile(); break;
      case 'postDetail': html = this.postDetail(); break;
      case 'idCard': html = this.idCard(); break;
      case 'widget': html = this.widget(); break;
      default: html = this.feed(count);
    }
    el.innerHTML = html;
  },

  // ---- Clear ----
  clear(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
  }
};
