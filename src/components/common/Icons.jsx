/**
 * src/components/common/Icons.jsx
 * ---------------------------------------------------------------------------
 * BSDC Icon System — pure inline SVG. ZERO emoji anywhere in the codebase.
 *
 * Why a single file?
 *  - Vite/Rollup tree-shakes named exports perfectly, so unused icons
 *    add ZERO bytes to the production bundle.
 *  - One consistent props API: <IconHome size={20} color="currentColor" />
 *  - Easy to audit visually — every icon lives in one place.
 *
 * Conventions:
 *  - All icons use viewBox="0 0 24 24"
 *  - Default size: 20px, color: "currentColor" (inherits text color)
 *  - stroke-based or fill-based per visual need
 *  - aria-hidden by default (icons are decorative); pass aria-label to override
 * ---------------------------------------------------------------------------
 */

import React from 'react';

/**
 * Base wrapper — every icon delegates here for consistent props handling.
 * Accepts: size, color, className, title (for accessibility), and any
 * other SVG props.
 */
function Svg({ size = 20, color = 'currentColor', title, className = '', children, ...rest }) {
  const ariaProps = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': true, focusable: false };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`bsdc-icon ${className}`.trim()}
      {...ariaProps}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ===========================================================================
 *  NAVIGATION
 * =========================================================================*/
export const IconHome = (p) => (<Svg {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></Svg>);
export const IconExplore = (p) => (<Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-3 6-6 3 3-6 6-3z"/></Svg>);
export const IconBell = (p) => (<Svg {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/></Svg>);
export const IconMessage = (p) => (<Svg {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></Svg>);
export const IconSearch = (p) => (<Svg {...p}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></Svg>);
export const IconMenu = (p) => (<Svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Svg>);
export const IconClose = (p) => (<Svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>);
export const IconBack = (p) => (<Svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Svg>);
export const IconForward = (p) => (<Svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>);
export const IconChevronDown = (p) => (<Svg {...p}><polyline points="6 9 12 15 18 9"/></Svg>);
export const IconChevronUp = (p) => (<Svg {...p}><polyline points="18 15 12 9 6 15"/></Svg>);
export const IconChevronRight = (p) => (<Svg {...p}><polyline points="9 18 15 12 9 6"/></Svg>);
export const IconChevronLeft = (p) => (<Svg {...p}><polyline points="15 18 9 12 15 6"/></Svg>);

/* ===========================================================================
 *  SOCIAL ACTIONS
 * =========================================================================*/
export const IconHeart = (p) => (<Svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></Svg>);
export const IconHeartFilled = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></Svg>);
export const IconComment = (p) => (<Svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></Svg>);
export const IconShare = (p) => (<Svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Svg>);
export const IconBookmark = (p) => (<Svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></Svg>);
export const IconBookmarkFilled = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></Svg>);
export const IconRepost = (p) => (<Svg {...p}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></Svg>);
export const IconCopy = (p) => (<Svg {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></Svg>);
export const IconLink = (p) => (<Svg {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></Svg>);
export const IconSend = (p) => (<Svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>);

/* ===========================================================================
 *  USER & ACCOUNT
 * =========================================================================*/
export const IconUser = (p) => (<Svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>);
export const IconUsers = (p) => (<Svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Svg>);
export const IconUserPlus = (p) => (<Svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></Svg>);
export const IconUserCheck = (p) => (<Svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></Svg>);
export const IconLogout = (p) => (<Svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>);
export const IconLogin = (p) => (<Svg {...p}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></Svg>);
export const IconSettings = (p) => (<Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></Svg>);
export const IconVerified = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M12 2l2.39 3.42 4.02.93.43 4.1 2.66 3.13-2.16 3.51.74 4.04-3.97 1.04L12 24l-3.11-2.83-3.97-1.04.74-4.04-2.16-3.51 2.66-3.13.43-4.1 4.02-.93L12 2z"/><polyline points="9 12 11 14 15 10" stroke="#ffffff" strokeWidth="2.5" fill="none"/></Svg>);

/* ===========================================================================
 *  POST TYPES
 * =========================================================================*/
export const IconText = (p) => (<Svg {...p}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></Svg>);
export const IconImage = (p) => (<Svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Svg>);
export const IconVideo = (p) => (<Svg {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></Svg>);
export const IconQuestion = (p) => (<Svg {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>);
export const IconBlog = (p) => (<Svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Svg>);
export const IconDoc = (p) => (<Svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></Svg>);
export const IconWiki = (p) => (<Svg {...p}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></Svg>);
export const IconCode = (p) => (<Svg {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Svg>);
export const IconStory = (p) => (<Svg {...p}><circle cx="12" cy="12" r="10" strokeDasharray="3 3"/><circle cx="12" cy="12" r="5"/></Svg>);
export const IconProject = (p) => (<Svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Svg>);
export const IconJob = (p) => (<Svg {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></Svg>);
export const IconNotice = (p) => (<Svg {...p}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14"/></Svg>);
export const IconPoll = (p) => (<Svg {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></Svg>);
export const IconEvent = (p) => (<Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>);

/* ===========================================================================
 *  MEDIA / EDITING
 * =========================================================================*/
export const IconCamera = (p) => (<Svg {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></Svg>);
export const IconUpload = (p) => (<Svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Svg>);
export const IconDownload = (p) => (<Svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>);
export const IconEdit = (p) => (<Svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>);
export const IconTrash = (p) => (<Svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></Svg>);
export const IconPlus = (p) => (<Svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>);
export const IconMinus = (p) => (<Svg {...p}><line x1="5" y1="12" x2="19" y2="12"/></Svg>);
export const IconCheck = (p) => (<Svg {...p}><polyline points="20 6 9 17 4 12"/></Svg>);
export const IconX = (p) => (<Svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>);
export const IconRefresh = (p) => (<Svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></Svg>);
export const IconMoreHorizontal = (p) => (<Svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Svg>);
export const IconMoreVertical = (p) => (<Svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></Svg>);

/* ===========================================================================
 *  COMMUNICATION / BRANDS
 * =========================================================================*/
export const IconAt = (p) => (<Svg {...p}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/></Svg>);
export const IconHash = (p) => (<Svg {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></Svg>);
export const IconMapPin = (p) => (<Svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></Svg>);
export const IconGlobe = (p) => (<Svg {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></Svg>);
export const IconGoogle = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M21.35 11.1h-9.18v2.95h5.27c-.23 1.3-1.55 3.81-5.27 3.81-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.83 3.59 14.78 2.7 12.17 2.7 6.91 2.7 2.65 6.96 2.65 12.2s4.26 9.5 9.52 9.5c5.5 0 9.13-3.86 9.13-9.3 0-.62-.07-1.1-.15-1.3z"/></Svg>);
export const IconGithub = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 015.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.66.41.35.78 1.05.78 2.11v3.13c0 .31.2.67.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></Svg>);
export const IconLinkedin = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.89 1.63-1.83 3.35-1.83 3.59 0 4.25 2.36 4.25 5.43v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></Svg>);
export const IconTwitter = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M22.46 6c-.77.35-1.6.59-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 2.99 4.79c-.37.64-.58 1.37-.58 2.16 0 1.49.76 2.81 1.91 3.58a4.27 4.27 0 01-1.94-.54v.05c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.55 1.7 2.13 2.94 4 2.97A8.59 8.59 0 012 18.57 12.13 12.13 0 008.56 20c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.13-2.22-.77.34-1.6.58-2.47.68z"/></Svg>);
export const IconYahoo = (p) => (<Svg {...p} fill="currentColor" stroke="none"><path d="M2 5h4l3 6 3-6h4l-5 9v5h-4v-5L2 5zm17 0h3l-2 6h-3l2-6zm-1 8h3v3h-3v-3z"/></Svg>);

/* ===========================================================================
 *  POINTS / REWARDS / STATUS
 * =========================================================================*/
export const IconCoin = (p) => (<Svg {...p}><circle cx="12" cy="12" r="9"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" stroke="none">B</text></Svg>);
export const IconTrophy = (p) => (<Svg {...p}><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0V4z"/><path d="M7 4H4v3a3 3 0 003 3M17 4h3v3a3 3 0 01-3 3"/></Svg>);
export const IconStar = (p) => (<Svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>);
export const IconStarFilled = (p) => (<Svg {...p} fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>);
export const IconTrending = (p) => (<Svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Svg>);
export const IconQR = (p) => (<Svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="18" y1="14" x2="18" y2="18"/><line x1="21" y1="18" x2="18" y2="18"/><line x1="21" y1="21" x2="14" y2="21"/></Svg>);

/* ===========================================================================
 *  MISC UTILITY
 * =========================================================================*/
export const IconEye = (p) => (<Svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>);
export const IconEyeOff = (p) => (<Svg {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></Svg>);
export const IconCalendar = (p) => (<Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Svg>);
export const IconClock = (p) => (<Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>);
export const IconFire = (p) => (<Svg {...p}><path d="M12 23a7.5 7.5 0 007.5-7.5c0-3-2-5.5-3-7-1 1.5-2 2-3 2.5-1 .5-2 0-2.5-1 0 0-1 1-1.5 2.5C9 13 8 14 7.5 15a4.5 4.5 0 004.5 8z"/></Svg>);
export const IconLock = (p) => (<Svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></Svg>);
export const IconUnlock = (p) => (<Svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></Svg>);
export const IconMail = (p) => (<Svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>);
export const IconPhone = (p) => (<Svg {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/></Svg>);
export const IconShield = (p) => (<Svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>);
export const IconAdmin = (p) => (<Svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></Svg>);
export const IconFlag = (p) => (<Svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Svg>);
export const IconInfo = (p) => (<Svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Svg>);
export const IconAlert = (p) => (<Svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>);
export const IconSun = (p) => (<Svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Svg>);
export const IconMoon = (p) => (<Svg {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></Svg>);
export const IconFilter = (p) => (<Svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Svg>);
export const IconBookOpen = (p) => (<Svg {...p}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></Svg>);
export const IconAward = (p) => (<Svg {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></Svg>);
export const IconBriefcase = (p) => (<Svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></Svg>);
export const IconLightning = (p) => (<Svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>);

/**
 * IconRegistry — useful when something is dynamic (e.g. post type → icon).
 * Lookup by string name. Keeps switch-case noise out of components.
 */
export const IconRegistry = {
  text: IconText,
  image: IconImage,
  video: IconVideo,
  qa: IconQuestion,
  blog: IconBlog,
  doc: IconDoc,
  wiki: IconWiki,
  code: IconCode,
  story: IconStory,
  project: IconProject,
  job: IconJob,
  notice: IconNotice,
  poll: IconPoll,
  event: IconEvent
};
