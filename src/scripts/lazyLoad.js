/**
 * src/scripts/lazyLoad.js
 * ---------------------------------------------------------------------------
 * IntersectionObserver-based lazy loader. Modern browsers honor
 * loading="lazy" natively, but we add an explicit observer for:
 *   - decoding hint (decode async)
 *   - blur-up effect (low-res → high-res swap)
 *   - smooth fade-in on load
 *
 * Initialized once from main.jsx. Safe to call multiple times.
 * ---------------------------------------------------------------------------
 */

let observer = null;

/**
 * Initialize the lazy-load observer. Idempotent.
 */
export function initLazyLoad() {
  if (observer || typeof IntersectionObserver === 'undefined') return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const real = img.dataset.src;
        if (real && img.src !== real) {
          img.src = real;
          img.removeAttribute('data-src');
        }
        img.classList.add('bsdc-img--loaded');
        observer.unobserve(img);
      });
    },
    { rootMargin: '200px 0px', threshold: 0.01 }
  );

  // Auto-observe any existing lazy images on the page.
  observeAll();
}

/**
 * Scan the DOM and register all <img data-src="..."> for lazy load.
 * Call this after rendering large lists.
 */
export function observeAll() {
  if (!observer) return;
  document.querySelectorAll('img[data-src]:not(.bsdc-img--observed)').forEach((img) => {
    img.classList.add('bsdc-img--observed');
    observer.observe(img);
  });
}

/** Register a single element manually. */
export function observeImage(img) {
  if (!observer || !img) return;
  observer.observe(img);
}
