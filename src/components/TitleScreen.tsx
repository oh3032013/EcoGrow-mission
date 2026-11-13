import { useState } from 'react';
import { Languages, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { UI_TEXT, type Language } from '../game/i18n';
import { PWAInstallButton } from './PWAInstallButton';
import { TeamModal } from './TeamModal';

interface TitleScreenProps {
  hasSavedFarm: boolean;
  lang: Language;
  isFullscreen: boolean;
  isPortraitMobile: boolean;
  onToggleLanguage: () => void;
  onToggleFullscreen: () => void;
  onRequestLandscape: () => void;
  onStartNew: () => void;
  onContinue: () => void;
}

export function TitleScreen({
  hasSavedFarm,
  lang,
  isFullscreen,
  isPortraitMobile,
  onToggleLanguage,
  onToggleFullscreen,
  onRequestLandscape,
  onStartNew,
  onContinue,
}: TitleScreenProps) {
  const [showTeam, setShowTeam] = useState(false);
  const [showExitScreen, setShowExitScreen] = useState(false);
  const t = UI_TEXT[lang];

  const handlePrimaryStart = () => {
    if (hasSavedFarm) {
      onContinue();
    } else {
      onStartNew();
    }
  };

  const handleExit = () => {
    const win = window as Window & { electronAPI?: { quit?: () => void } };
    if (win.electronAPI?.quit) {
      win.electronAPI.quit();
      return;
    }
    try {
      window.close();
    } catch {
      // Browser tab may block programmatic close; show friendly exit view
    }
    setShowExitScreen(true);
  };

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center justify-between overflow-hidden select-none"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Sunlit Pixel-Art Farm Panorama Background matching EcoGrow Mission mockup */}
      <svg
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid slice"
        className="fixed inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe599" />
            <stop offset="55%" stopColor="#fff2c2" />
            <stop offset="100%" stopColor="#fce49c" />
          </linearGradient>
          <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a7cf55" />
            <stop offset="100%" stopColor="#82b33d" />
          </linearGradient>
          <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#77b340" />
            <stop offset="100%" stopColor="#4f8f32" />
          </linearGradient>
          <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6dc8f2" />
            <stop offset="50%" stopColor="#46a3db" />
            <stop offset="100%" stopColor="#3586bd" />
          </linearGradient>
        </defs>

        {/* Sky & Sunburst Rays */}
        <rect width="1280" height="720" fill="url(#skyGrad)" />
        <g opacity="0.42" fill="#fff9df">
          <polygon points="640,110 120,0 320,0" />
          <polygon points="640,110 500,0 780,0" />
          <polygon points="640,110 960,0 1160,0" />
          <polygon points="640,110 1280,140 1280,310" />
          <polygon points="640,110 0,140 0,310" />
        </g>
        <circle cx="640" cy="130" r="95" fill="#fff7d6" opacity="0.7" />

        {/* Soft Pixel Clouds */}
        <g fill="#fff9e8" opacity="0.9">
          <rect x="140" y="95" width="120" height="24" rx="10" />
          <rect x="165" y="80" width="70" height="22" rx="10" />
          <rect x="980" y="88" width="140" height="26" rx="10" />
          <rect x="1010" y="72" width="80" height="22" rx="10" />
        </g>

        {/* Distant Rolling Hills */}
        <path d="M0,335 Q280,255 580,315 T1280,295 L1280,520 L0,520 Z" fill="url(#hillFar)" />
        <path d="M0,385 Q340,325 710,375 T1280,350 L1280,720 L0,720 Z" fill="url(#meadow)" />

        {/* Right Side Barn, Coop, Cow & Sheep */}
        <g transform="translate(880, 270)">
          {/* Fence behind pasture */}
          <rect x="-40" y="74" width="220" height="6" fill="#9c6a3e" />
          <rect x="-30" y="64" width="8" height="24" fill="#7d512d" />
          <rect x="10" y="64" width="8" height="24" fill="#7d512d" />
          <rect x="50" y="64" width="8" height="24" fill="#7d512d" />
          <rect x="160" y="64" width="8" height="24" fill="#7d512d" />
          {/* Barn */}
          <rect x="44" y="28" width="96" height="62" fill="#b85b3a" stroke="#5c2c1c" strokeWidth="3" />
          <polygon points="34,32 92,-8 150,32" fill="#8c3b25" stroke="#4f2114" strokeWidth="3" />
          <rect x="76" y="48" width="32" height="42" fill="#6b3e24" stroke="#3f2212" strokeWidth="2" />
          <line x1="76" y1="48" x2="108" y2="90" stroke="#4a2815" strokeWidth="2" />
          <line x1="108" y1="48" x2="76" y2="90" stroke="#4a2815" strokeWidth="2" />
          {/* Small Chicken Coop */}
          <rect x="152" y="54" width="44" height="36" fill="#c78a4e" stroke="#633e1f" strokeWidth="2.5" />
          <polygon points="146,56 174,36 202,56" fill="#9e5a2c" stroke="#542c13" strokeWidth="2.5" />
          {/* Shade Tree */}
          <rect x="218" y="34" width="16" height="54" fill="#6e4324" />
          <circle cx="226" cy="18" r="34" fill="#3a8037" stroke="#225224" strokeWidth="3" />
          <circle cx="206" cy="24" r="22" fill="#4f9b44" />
          <circle cx="242" cy="22" r="24" fill="#4f9b44" />
          {/* Cute Cow */}
          <g transform="translate(-15, 92)">
            <rect x="0" y="6" width="34" height="18" rx="4" fill="#fffdf8" stroke="#4a3c31" strokeWidth="2" />
            <rect x="8" y="8" width="10" height="8" fill="#3b322c" />
            <rect x="28" y="2" width="14" height="12" rx="3" fill="#fffdf8" stroke="#4a3c31" strokeWidth="2" />
            <rect x="4" y="24" width="4" height="8" fill="#4a3c31" />
            <rect x="24" y="24" width="4" height="8" fill="#4a3c31" />
          </g>
          {/* Cute Sheep */}
          <g transform="translate(88, 108)">
            <ellipse cx="14" cy="12" rx="15" ry="11" fill="#fcfaf2" stroke="#595045" strokeWidth="2" />
            <circle cx="28" cy="10" r="6" fill="#3e3630" />
            <rect x="6" y="21" width="3" height="6" fill="#3e3630" />
            <rect x="18" y="21" width="3" height="6" fill="#3e3630" />
          </g>
        </g>

        {/* Dirt Path & Winding Sparkling Stream */}
        <path
          d="M120,720 Q280,580 510,560 T760,440"
          fill="none"
          stroke="#c7955b"
          strokeWidth="58"
          strokeLinecap="round"
        />
        <path
          d="M640,720 C670,610 820,565 895,485 C960,420 1070,390 1280,365 L1280,430 C1100,455 1015,490 960,550 C885,630 790,670 760,720 Z"
          fill="url(#streamGrad)"
          stroke="#e4f5be"
          strokeWidth="6"
        />
        {/* Water sparkles & stepping stones */}
        <ellipse cx="755" cy="640" rx="18" ry="10" fill="#8f989e" stroke="#4f575c" strokeWidth="2" />
        <ellipse cx="890" cy="545" rx="14" ry="8" fill="#8f989e" stroke="#4f575c" strokeWidth="2" />
        <rect x="815" y="595" width="26" height="4" rx="2" fill="#d9f4ff" opacity="0.8" />
        <rect x="975" y="485" width="30" height="4" rx="2" fill="#d9f4ff" opacity="0.8" />

        {/* Left Golden Wheat & Green Crop Fields */}
        <g transform="translate(105, 455)">
          <rect x="0" y="38" width="250" height="125" rx="8" fill="#8c5a32" stroke="#59371b" strokeWidth="4" />
          {/* Golden Wheat Columns */}
          {[14, 38, 62, 86, 110, 134, 158, 182, 206, 228].map((wx) => (
            <g key={wx} transform={`translate(${wx}, 14)`}>
              <rect x="4" y="24" width="4" height="110" fill="#c7922c" />
              <ellipse cx="6" cy="22" rx="7" ry="14" fill="#f5cb56" stroke="#b07c1c" strokeWidth="1.5" />
              <ellipse cx="6" cy="48" rx="6" ry="12" fill="#ebc04b" />
            </g>
          ))}
        </g>

        {/* Green Vegetable Rows */}
        <g transform="translate(360, 465)">
          <rect x="0" y="0" width="165" height="92" rx="6" fill="#7a4c28" stroke="#4f2f16" strokeWidth="3" />
          {[14, 42, 70, 98, 126].map((vx) => (
            <g key={vx}>
              <circle cx={vx + 10} cy="22" r="10" fill="#4aa13f" stroke="#285e24" strokeWidth="2" />
              <circle cx={vx + 10} cy="48" r="10" fill="#5bbd4a" stroke="#285e24" strokeWidth="2" />
              <circle cx={vx + 10} cy="74" r="10" fill="#4aa13f" stroke="#285e24" strokeWidth="2" />
            </g>
          ))}
        </g>

        {/* Apple Trees (Left & Bottom-Right) */}
        {[
          { x: 160, y: 390, s: 1 },
          { x: 295, y: 375, s: 0.92 },
          { x: 1015, y: 575, s: 1.05 },
        ].map((tree, idx) => (
          <g key={idx} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}>
            <rect x="-10" y="20" width="20" height="58" fill="#6e4223" stroke="#3d2210" strokeWidth="2.5" />
            <circle cx="0" cy="-6" r="42" fill="#2f7833" stroke="#1b4d20" strokeWidth="3" />
            <circle cx="-22" cy="4" r="26" fill="#429642" />
            <circle cx="24" cy="2" r="27" fill="#429642" />
            <circle cx="-16" cy="-16" r="5" fill="#e63e3e" />
            <circle cx="14" cy="-18" r="5" fill="#e63e3e" />
            <circle cx="4" cy="8" r="5" fill="#e63e3e" />
            <circle cx="-24" cy="12" r="4.5" fill="#e63e3e" />
          </g>
        ))}
      </svg>

      {/* Lush Leafy Pixel Border Frame around all 4 edges */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          boxShadow:
            'inset 0 0 0 12px #245728, inset 0 0 0 20px #3a7d38, inset 0 0 28px 18px rgba(24, 58, 27, 0.72)',
        }}
        aria-hidden="true"
      />
      {/* Corner Leaf Clusters */}
      <div className="fixed top-2 left-2 w-12 h-12 rounded-br-full bg-[#3f8a3d] border-2 border-[#1e4d23] opacity-90 pointer-events-none z-10" />
      <div className="fixed top-2 right-2 w-12 h-12 rounded-bl-full bg-[#3f8a3d] border-2 border-[#1e4d23] opacity-90 pointer-events-none z-10" />
      <div className="fixed bottom-2 left-2 w-12 h-12 rounded-tr-full bg-[#3f8a3d] border-2 border-[#1e4d23] opacity-90 pointer-events-none z-10" />
      <div className="fixed bottom-2 right-2 w-12 h-12 rounded-tl-full bg-[#3f8a3d] border-2 border-[#1e4d23] opacity-90 pointer-events-none z-10" />

      {/* Top Utility Row (Install + Fullscreen + Language Toggle) */}
      <div className="relative z-20 w-full flex items-center justify-between px-5 sm:px-9 pt-5 sm:pt-7 [@media(max-height:500px)]:pt-3.5 pointer-events-none">
        <div className="pointer-events-auto">
          <PWAInstallButton compact lang={lang} />
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? t.exitFullscreenBtn : t.fullscreenBtn}
            title={isFullscreen ? t.exitFullscreenBtn : t.fullscreenBtn}
            className="wood-button px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? t.exitFullscreenBtn : t.fullscreenBtn}
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className="wood-button px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
          >
            <Languages className="w-3.5 h-3.5 shrink-0" />
            <span>{t.langSwitch}</span>
          </button>
        </div>
      </div>

      {/* Main Centered Content matching the Mockup */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-6 pb-6 [@media(max-height:500px)]:pb-3 text-center">
        {/* Title Row: EcoGrow Mission + Sprout Crest + أنقذ مزرعتك */}
        <div
          dir="ltr"
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 [@media(max-height:500px)]:mb-3"
        >
          <span
            className="font-display font-bold text-2xl sm:text-4xl [@media(max-height:500px)]:text-2xl text-[#1e1710] tracking-tight"
            style={{ textShadow: '0 2px 0 rgba(255, 248, 224, 0.9)' }}
          >
            EcoGrow Mission
          </span>

          {/* Sprout in Soil Crest SVG */}
          <svg
            viewBox="0 0 64 56"
            className="w-12 h-11 sm:w-16 sm:h-14 [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-9 drop-shadow-sm shrink-0"
            role="img"
            aria-label="EcoGrow Sprout"
          >
            {/* Soil mound */}
            <ellipse cx="32" cy="47" rx="20" ry="6" fill="#7d4a26" stroke="#2e190b" strokeWidth="2.5" />
            {/* Stem */}
            <path d="M32 45 L32 23" stroke="#225725" strokeWidth="4" strokeLinecap="round" />
            {/* Left Leaf */}
            <path
              d="M32 28 C20 26, 12 15, 16 7 C25 7, 32 16, 32 28 Z"
              fill="#42b849"
              stroke="#194a1f"
              strokeWidth="2.5"
            />
            {/* Right Leaf */}
            <path
              d="M32 25 C44 23, 52 12, 48 4 C39 4, 32 13, 32 25 Z"
              fill="#65d459"
              stroke="#194a1f"
              strokeWidth="2.5"
            />
          </svg>

          <span
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="font-display font-extrabold text-2xl sm:text-4xl [@media(max-height:500px)]:text-2xl text-[#1e1710]"
            style={{ textShadow: '0 2px 0 rgba(255, 248, 224, 0.9)' }}
          >
            {t.saveYourFarm}
          </span>
        </div>

        {/* Three Stacked Emerald Green Main Menu Buttons */}
        <div className="w-full max-w-[270px] sm:max-w-[300px] [@media(max-height:500px)]:max-w-[250px] flex flex-col items-stretch gap-3 sm:gap-3.5 [@media(max-height:500px)]:gap-2">
          <button
            type="button"
            data-start="true"
            onClick={handlePrimaryStart}
            className="w-full min-h-[54px] sm:min-h-[60px] [@media(max-height:500px)]:min-h-[42px] px-6 py-3 [@media(max-height:500px)]:py-1.5 rounded-2xl bg-gradient-to-b from-[#1ad16a] to-[#0ca14c] hover:from-[#23df75] hover:to-[#10b356] active:translate-y-0.5 text-white font-display font-extrabold text-2xl sm:text-[28px] [@media(max-height:500px)]:text-xl border-2 border-[#0b4d27] shadow-[0_5px_0_#0a6130,0_10px_22px_rgba(12,48,24,0.35)] cursor-pointer transition-all"
            style={{
              textShadow:
                '-2px -2px 0 #162419, 2px -2px 0 #162419, -2px 2px 0 #162419, 2px 2px 0 #162419, 0 3px 0 #162419',
            }}
          >
            {t.startNow}
          </button>

          {hasSavedFarm && (
            <button
              type="button"
              onClick={onStartNew}
              className="self-center px-3.5 py-1 rounded-lg bg-[#2e2116]/80 hover:bg-[#3f2d1f] text-[#fdf3dc] text-xs font-semibold border border-[#8f6742] cursor-pointer"
            >
              {t.newFarm}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowTeam(true)}
            className="w-full min-h-[54px] sm:min-h-[60px] [@media(max-height:500px)]:min-h-[42px] px-6 py-3 [@media(max-height:500px)]:py-1.5 rounded-2xl bg-gradient-to-b from-[#1ad16a] to-[#0ca14c] hover:from-[#23df75] hover:to-[#10b356] active:translate-y-0.5 text-white font-display font-extrabold text-2xl sm:text-[28px] [@media(max-height:500px)]:text-xl border-2 border-[#0b4d27] shadow-[0_5px_0_#0a6130,0_10px_22px_rgba(12,48,24,0.35)] cursor-pointer transition-all"
            style={{
              textShadow:
                '-2px -2px 0 #162419, 2px -2px 0 #162419, -2px 2px 0 #162419, 2px 2px 0 #162419, 0 3px 0 #162419',
            }}
          >
            {t.teamBtn}
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="w-full min-h-[50px] sm:min-h-[56px] [@media(max-height:500px)]:min-h-[40px] max-w-[210px] self-center px-8 py-2.5 [@media(max-height:500px)]:py-1.5 rounded-2xl bg-gradient-to-b from-[#1ad16a] to-[#0ca14c] hover:from-[#23df75] hover:to-[#10b356] active:translate-y-0.5 text-white font-display font-extrabold text-xl sm:text-[26px] [@media(max-height:500px)]:text-lg border-2 border-[#0b4d27] shadow-[0_5px_0_#0a6130,0_10px_22px_rgba(12,48,24,0.35)] cursor-pointer transition-all"
            style={{
              textShadow:
                '-2px -2px 0 #162419, 2px -2px 0 #162419, -2px 2px 0 #162419, 2px 2px 0 #162419, 0 3px 0 #162419',
            }}
          >
            {t.exitBtn}
          </button>
        </div>

        {isPortraitMobile && (
          <div className="mt-4 px-3.5 py-2 rounded-xl bg-[#24170f]/90 border border-[#9c6f46] text-[#f5ebd6] flex items-center gap-2.5 max-w-xs shadow-lg">
            <RotateCw className="w-4 h-4 text-[#f7d87c] shrink-0" />
            <span className="text-[11px] font-medium text-start leading-snug">
              {t.rotateLandscapeHint}
            </span>
            <button
              type="button"
              onClick={onRequestLandscape}
              className="wood-button-primary px-2.5 py-1 rounded text-[11px] font-bold shrink-0 cursor-pointer whitespace-nowrap"
            >
              {t.enableLandscapeBtn}
            </button>
          </div>
        )}
      </div>

      {/* Team Credits Modal */}
      {showTeam && <TeamModal lang={lang} onClose={() => setShowTeam(false)} />}

      {/* Graceful Exit Dialog */}
      {showExitScreen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t.exitTitle}
        >
          <div className="parchment-panel rounded-xl w-full max-w-sm p-6 text-center">
            <h2 className="font-display text-2xl font-bold text-[#2c1e14] mb-2">{t.exitTitle}</h2>
            <p className="text-sm text-[#5c4028] mb-5 leading-relaxed">{t.exitBody}</p>
            <button
              type="button"
              onClick={() => setShowExitScreen(false)}
              className="wood-button-primary w-full py-2.5 rounded-lg text-sm font-bold cursor-pointer"
            >
              {t.backToMenu}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
