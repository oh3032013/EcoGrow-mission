import { UI_TEXT, type Language } from '../game/i18n';
import type { FarmStats } from '../game/types';
import { PWAInstallButton } from './PWAInstallButton';

interface StatusModalProps {
  mode: 'paused' | 'exhausted' | 'restored';
  lang: Language;
  stats: FarmStats;
  restorationPct: number;
  gold: number;
  touchControlsEnabled: boolean;
  onToggleTouchControls: () => void;
  onToggleLanguage: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export function StatusModal({
  mode,
  lang,
  stats,
  restorationPct,
  gold,
  touchControlsEnabled,
  onToggleTouchControls,
  onToggleLanguage,
  onResume,
  onRestart,
  onReturnTitle,
}: StatusModalProps) {
  const t = UI_TEXT[lang];

  const title =
    mode === 'paused'
      ? t.pausedTitle
      : mode === 'restored'
      ? t.restoredTitle
      : t.exhaustedTitle;

  const subtitle =
    mode === 'paused'
      ? t.pausedSub
      : mode === 'restored'
      ? t.restoredSub
      : t.exhaustedSub;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="parchment-panel rounded-xl w-full max-w-md p-6 text-center">
        <h2 className="font-display text-3xl font-bold text-[#2c1e14] mb-1.5">{title}</h2>
        <p className="text-sm text-[#694d36] mb-5">{subtitle}</p>

        {/* Mastery / Progress Metrics */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-2.5 rounded-lg bg-[#fbf2e1] border border-[#d6be96]">
            <div className="text-[11px] uppercase tracking-wide text-[#75563b]">{t.daysStat}</div>
            <div className="font-mono-tabular font-bold text-lg text-[#2c1e14]">
              {stats.daysSurvived}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#fbf2e1] border border-[#d6be96]">
            <div className="text-[11px] uppercase tracking-wide text-[#75563b]">
              {t.harvestedStat}
            </div>
            <div className="font-mono-tabular font-bold text-lg text-[#2c1e14]">
              {stats.cropsHarvested}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#fbf2e1] border border-[#d6be96]">
            <div className="text-[11px] uppercase tracking-wide text-[#75563b]">
              {mode === 'restored' ? t.gold : t.restoredStat}
            </div>
            <div className="font-mono-tabular font-bold text-lg text-[#2c1e14]">
              {mode === 'restored' ? `${Math.round(gold)}g` : `${Math.round(restorationPct)}%`}
            </div>
          </div>
        </div>

        {mode === 'paused' && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <button
              type="button"
              onClick={onToggleTouchControls}
              className="px-3.5 py-2 rounded-lg border border-[#b3925d] bg-[#ebd8b5] text-xs font-semibold text-[#2c1e14] hover:bg-[#e0c79b] cursor-pointer whitespace-nowrap"
            >
              {t.touchControlsLabel}: {touchControlsEnabled ? t.on : t.off}
            </button>
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-3.5 py-2 rounded-lg border border-[#b3925d] bg-[#ebd8b5] text-xs font-semibold text-[#2c1e14] hover:bg-[#e0c79b] cursor-pointer whitespace-nowrap"
            >
              {t.languageLabel}: {t.langSwitch}
            </button>
            <PWAInstallButton compact lang={lang} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {mode === 'paused' && (
            <button
              type="button"
              onClick={onResume}
              className="wood-button-primary w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap"
            >
              {t.resume}
            </button>
          )}
          {mode === 'restored' && (
            <button
              type="button"
              onClick={onResume}
              className="wood-button-primary w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap"
            >
              {t.continueFarming}
            </button>
          )}
          <button
            type="button"
            data-start={mode !== 'paused' ? 'true' : undefined}
            onClick={onRestart}
            className={`${
              mode === 'exhausted' ? 'wood-button-primary' : 'wood-button'
            } w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap`}
          >
            {mode === 'exhausted' ? t.tryAgain : t.restartMission}
          </button>
          <button
            type="button"
            onClick={onReturnTitle}
            className="wood-button w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer whitespace-nowrap"
          >
            {t.titleScreen}
          </button>
        </div>
      </div>
    </div>
  );
}
