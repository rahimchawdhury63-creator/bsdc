import type { SVGProps } from 'react';

/**
 * Names of inline SVG symbols supported by the universal icon component.
 * Adding icons here keeps the platform emoji-free and type-safe.
 */
export type SVGIconName =
  | 'bsdc-logo'
  | 'home'
  | 'search'
  | 'feed'
  | 'shield'
  | 'bolt'
  | 'database'
  | 'wifi-off'
  | 'user'
  | 'bell'
  | 'message'
  | 'plus'
  | 'compass'
  | 'community'
  | 'wallet'
  | 'settings'
  | 'logout'
  | 'image'
  | 'clock'
  | 'heart'
  | 'comment'
  | 'share'
  | 'bookmark'
  | 'trend';

/** Props for SVGIcon, extending native SVG attributes for accessibility. */
export interface SVGIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  readonly name: SVGIconName;
  readonly title?: string;
  readonly decorative?: boolean;
}

/**
 * Returns the exact SVG geometry for an icon name.
 * The project deliberately renders inline path data instead of icon fonts,
 * external scripts, emoji, or network-loaded images.
 */
const renderIconPaths = (name: SVGIconName) => {
  switch (name) {
    case 'bsdc-logo':
      return (
        <>
          <rect width="128" height="128" rx="28" fill="currentColor" />
          <path d="M64 14 108 32v28c0 29.5-17.9 48.9-44 58-26.1-9.1-44-28.5-44-58V32l44-18Z" fill="#2D6A4F" stroke="#FFD60A" strokeWidth="5" />
          <path d="M51 46 34 64l17 18M77 46l17 18-17 18" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M69 40 58 88" fill="none" stroke="#FFD60A" strokeWidth="7" strokeLinecap="round" />
        </>
      );
    case 'home':
      return <path d="M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'search':
      return <><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
    case 'feed':
      return <path d="M5 5h14M5 12h14M5 19h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
    case 'shield':
      return <path d="M12 3 20 6v5c0 5.2-3.2 8.6-8 10-4.8-1.4-8-4.8-8-10V6l8-3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'bolt':
      return <path d="M13 2 4 14h7l-1 8 10-13h-7V2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'database':
      return <><ellipse cx="12" cy="5" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" fill="none" stroke="currentColor" strokeWidth="2" /></>;
    case 'wifi-off':
      return <><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M14 10.2A10 10 0 0 1 19 13M2 8a15 15 0 0 1 5-2.8M11.5 5a15 15 0 0 1 10.5 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="20" r="1" fill="currentColor" /></>;
    case 'user':
      return <><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
    case 'bell':
      return <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M10 21h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
    case 'message':
      return <path d="M4 5h16v11H8l-4 4V5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'plus':
      return <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
    case 'compass':
      return <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>;
    case 'community':
      return <><circle cx="8" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="16" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 21a5 5 0 0 1 10 0M11 21a5 5 0 0 1 10 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
    case 'wallet':
      return <><path d="M3 7h18v13H3V7Zm2-3h13v3H5V4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M17 14h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
    case 'settings':
      return <><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M19 12a7.7 7.7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3.1h5l.4-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></>;
    case 'logout':
      return <><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>;
    case 'image':
      return <><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m5 17 5-5 4 4 2-2 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="9" r="1" fill="currentColor" /></>;
    case 'clock':
      return <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
    case 'heart':
      return <path d="M20 8.5c0 5-8 10.5-8 10.5S4 13.5 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'comment':
      return <path d="M4 5h16v10H8l-4 4V5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'share':
      return <><circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4" fill="none" stroke="currentColor" strokeWidth="2" /></>;
    case 'bookmark':
      return <path d="M6 4h12v17l-6-4-6 4V4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />;
    case 'trend':
      return <path d="M4 16 9 11l4 4 7-8M15 7h5v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
    default:
      return null;
  }
};

/** Universal SVG icon system with accessibility controls and zero emoji usage. */
export const SVGIcon = ({ name, title, decorative = false, className, ...props }: SVGIconProps) => {
  const ariaHidden = decorative ? true : undefined;
  const role = decorative ? undefined : 'img';
  const labelledBy = title ? `${name}-icon-title` : undefined;
  const viewBox = name === 'bsdc-logo' ? '0 0 128 128' : '0 0 24 24';

  return (
    <svg className={className} aria-hidden={ariaHidden} aria-labelledby={labelledBy} role={role} viewBox={viewBox} focusable="false" {...props}>
      {title ? <title id={labelledBy}>{title}</title> : null}
      {renderIconPaths(name)}
    </svg>
  );
};
