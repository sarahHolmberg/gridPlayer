import React from "react";

type P = {size?: number; color?: string; style?: React.CSSProperties};

export const FolderIcon: React.FC<P> = ({size = 28, style}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={style}>
    <path d="M3 8a3 3 0 0 1 3-3h7l3 3h10a3 3 0 0 1 3 3v2H3z" fill="#5b8fd6" />
    <path d="M3 12h26v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="#7fb0f0" />
    <path d="M3 12h26v2H3z" fill="#a9cbf7" />
  </svg>
);

export const InstagramIcon: React.FC<P> = ({size = 22, color = "#c13584"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1.1" fill={color} stroke="none" />
  </svg>
);

export const CheckIcon: React.FC<P> = ({size = 18, color = "#fff", style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

export const DownloadIcon: React.FC<P> = ({size = 24, color = "#5f6368", style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M12 4v11" />
    <path d="M7 10.5l5 5 5-5" />
    <path d="M5 19.5h14" />
  </svg>
);

export const RefreshIcon: React.FC<P> = ({size = 20, color = "#77776f"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </svg>
);

export const ClipboardIcon: React.FC<P> = ({size = 16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8a8a82" strokeWidth={2} strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="17" rx="2" fill="#f3efe2" />
    <rect x="9" y="2.5" width="6" height="4" rx="1" fill="#d9d4c3" />
  </svg>
);

export const NavArrow: React.FC<{dir: "left" | "right"}> = ({dir}) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {dir === "left" ? <path d="M19 12H5m6-6l-6 6 6 6" /> : <path d="M5 12h14m-6-6l6 6-6 6" />}
  </svg>
);

export const ReloadIcon: React.FC = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </svg>
);

export const LockIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="#5f6368">
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#5f6368" strokeWidth={2.4} />
  </svg>
);

export const KebabIcon: React.FC<{color?: string; horizontal?: boolean}> = ({color = "#5f6368", horizontal}) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill={color} style={horizontal ? {transform: "rotate(90deg)"} : undefined}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export const GlobeIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
);

// A little video file "document" icon.
export const VideoFileIcon: React.FC<{size?: number}> = ({size = 40}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 40 48">
    <path d="M4 4a4 4 0 0 1 4-4h18l10 10v34a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#fff" stroke="#c9ccd3" strokeWidth={1.5} />
    <path d="M26 0v8a2 2 0 0 0 2 2h8" fill="#e8efff" stroke="#c9ccd3" strokeWidth={1.5} />
    <rect x="8" y="18" width="24" height="18" rx="3" fill="#2563eb" />
    <path d="M17 22.5v9l7.5-4.5z" fill="#fff" />
    <text x="20" y="44" textAnchor="middle" fontSize="7" fontWeight="700" fill="#2563eb" fontFamily="Inter, sans-serif">MP4</text>
  </svg>
);
