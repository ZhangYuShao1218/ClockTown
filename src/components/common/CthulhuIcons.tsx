import React from 'react';

interface IconProps {
  className?: string;
}

/** 古老沙漏（計時器） */
export const HourglassIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6.5 3.5h11M6.5 20.5h11" />
    <path d="M8 3.5c0 4 4 6.5 4 8.5s-4 4.5-4 8.5" />
    <path d="M16 3.5c0 4-4 6.5-4 8.5s4 4.5 4 8.5" />
    <path d="M9.5 18.5h5" strokeOpacity="0.7" />
    <circle cx="12" cy="14.5" r="0.6" fill="currentColor" />
  </svg>
);

/** 古老鐘樓吊鐘（音效開啟） */
export const BellSoundOnIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v1.5" />
    <path d="M7.5 11.5c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 3.2 1.2 4.8 2 5.5H5.5c.8-.7 2-2.3 2-5.5z" />
    <path d="M10 17a2 2 0 004 0" />
    <path d="M19.5 8.5c.9 1.3.9 3.7 0 5" strokeOpacity="0.75" />
    <path d="M4.5 8.5c-.9 1.3-.9 3.7 0 5" strokeOpacity="0.75" />
  </svg>
);

/** 靜音吊鐘（音效關閉） */
export const BellSoundOffIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.5 11.5c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 3.2 1.2 4.8 2 5.5H5.5c.8-.7 2-2.3 2-5.5z" opacity="0.55" />
    <path d="M10 17a2 2 0 004 0" opacity="0.55" />
    <path d="M4 4l16 16" className="text-red-400" stroke="currentColor" />
  </svg>
);

/** 羊皮紙與羽毛筆（文字戰報） */
export const ParchmentQuillIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 4.5h9.5l3 3V19a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 19V6A1.5 1.5 0 016 4.5z" />
    <path d="M8 9.5h5M8 13h6M8 16.5h3.5" strokeOpacity="0.75" />
    <path d="M19.5 4.5c-2.5.5-4.5 2.5-5.5 5.5l1.5 1.5c3-1 5-3 5.5-5.5l-1.5-1.5z" />
  </svg>
);

/** 秘術骨骰（Roll 點） */
export const EldritchDiceIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2.5L20 7v10l-8 4.5L4 17V7l8-4.5z" />
    <path d="M12 2.5v9.5m0 0l8-5m-8 5L4 7m8 5v9.5" strokeOpacity="0.6" />
    <circle cx="12" cy="8.5" r="0.8" fill="currentColor" />
  </svg>
);

/** 神秘羅盤（抽座位） */
export const OccultCompassIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.2 8.8l-2 4.8-4.4 1.6 1.8-4.6 4.6-1.8z" />
    <path d="M12 2v1.5M12 20.5V22M2 12h1.5M20.5 12H22" strokeOpacity="0.65" />
  </svg>
);

/** 古老蠟封 / 標記（插入座位） */
export const WaxSealIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3.5c1.8 0 2.5 1.3 4 1.5s2.8-.2 3.5 1.2-.2 2.7.5 4 .8 2.6-.2 3.8-1.5 2-1.8 3.5-1.5 2.3-3 2.1-2.3-.9-3-.9-1.5.7-3 .9-2.7-.6-3-2.1-1-2.3-1.8-3.5-.9-2.5-.2-3.8-.2-2.6.5-4 2-1 3.5-1.2 2.2-1.5 4-1.5z" />
    <circle cx="12" cy="12" r="3.5" strokeOpacity="0.75" />
  </svg>
);

/** 羊皮卷畫軸（傳送圖片） */
export const ScrollImageIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M5.5 16.5l4-4.5 3 3 2.5-2.5 3.5 4" />
    <circle cx="9" cy="9" r="1.2" />
  </svg>
);

/** 克蘇魯觸手 / 邪眼（選單或主題符號） */
export const EldritchEyeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 12s3.8-6 9.5-6 9.5 6 9.5 6-3.8 6-9.5 6-9.5-6-9.5-6z" />
    <ellipse cx="12" cy="12" rx="1.6" ry="3.2" fill="currentColor" />
  </svg>
);
