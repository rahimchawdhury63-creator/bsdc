/**
 * src/scripts/interactions.js
 * ---------------------------------------------------------------------------
 * Tiny vanilla-JS helpers that run alongside React for low-level UX polish.
 *
 *  - bsdcRipple()       : material-style ripple on any element
 *  - bsdcCopyToClipboard: copy text with fallback for old browsers
 *  - bsdcDebounce       : debounce wrapper (used by search, typing indicator)
 *  - bsdcThrottle       : throttle wrapper (used by scroll listeners)
 *  - bsdcPlayPointsSound: lightweight WebAudio "ding" for BSDC Points alerts
 *  - bsdcVibrate        : safe vibration wrapper (mobile)
 *  - bsdcShare          : Web Share API with copy-link fallback
 *
 * NOTE: These are framework-agnostic so they can be re-used in admin tools,
 *       capacitor mobile shells, or future server-rendered pages.
 * ---------------------------------------------------------------------------
 */

/**
 * Inject a material-design ripple at the click position on the given element.
 * Usage: attach via React onClick={(e) => bsdcRipple(e)}.
 */
export function bsdcRipple(event) {
  const target = event.currentTarget;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  ripple.className = 'bsdc-ripple';
  ripple.style.cssText = `
    position:absolute;
    border-radius:50%;
    transform:scale(0);
    background:rgba(255,255,255,0.4);
    width:${size}px;height:${size}px;
    left:${event.clientX - rect.left - size / 2}px;
    top:${event.clientY - rect.top - size / 2}px;
    pointer-events:none;
    animation:bsdcRipple 600ms ease-out;
  `;
  if (getComputedStyle(target).position === 'static') {
    target.style.position = 'relative';
  }
  target.style.overflow = 'hidden';
  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
}

/**
 * Robust copy-to-clipboard with execCommand fallback for old browsers.
 * Returns true on success.
 */
export async function bsdcCopyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Debounce — leading=false. Cancel via .cancel(). */
export function bsdcDebounce(fn, wait = 300) {
  let timer = null;
  const wrapped = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => timer && clearTimeout(timer);
  return wrapped;
}

/** Throttle — calls fn at most once per `wait` ms. */
export function bsdcThrottle(fn, wait = 100) {
  let lastCall = 0;
  let pending = null;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else if (!pending) {
      pending = setTimeout(() => {
        lastCall = Date.now();
        pending = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Play a quick "ding" sound for BSDC Points received.
 * Uses WebAudio so we don't ship an MP3 file (saves bandwidth).
 */
let audioCtx = null;
export function bsdcPlayPointsSound() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    // Resume in case it was suspended (autoplay policy).
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    // Two-tone "ding" — E5 then A5.
    [659.25, 880].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.55);
    });
  } catch {
    /* fail silently — sound is non-critical */
  }
}

/** Safe vibration wrapper. */
export function bsdcVibrate(pattern = 30) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }
}

/**
 * Web Share API with fallback to copy-link.
 * @returns {Promise<'shared'|'copied'|'failed'>}
 */
export async function bsdcShare({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch {
      // user cancelled — fall through to copy
    }
  }
  const ok = await bsdcCopyToClipboard(url);
  return ok ? 'copied' : 'failed';
}

/** Smooth-scroll to top with reduced-motion respect. */
export function bsdcScrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

/** Lock/unlock body scroll (used when modals open). */
export function bsdcLockScroll(lock = true) {
  document.body.style.overflow = lock ? 'hidden' : '';
}

/**
 * Auto-resize a textarea to fit its content.
 * Attach via onInput={(e) => bsdcAutoGrow(e.target)}.
 */
export function bsdcAutoGrow(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}
