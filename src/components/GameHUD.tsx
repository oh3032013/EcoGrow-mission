import { Gamepad2, Maximize2, Minimize2, Pause, Volume2, VolumeX, ShoppingBag, Hammer, Moon, Trophy } from 'lucide-react';
import { ITEMS } from '../game/constants';
import {
  formatMorningSummaryText,
  formatTimeLocalized,
  getItemLabel,
  getNearPromptLabel,
  translateSeason,
  translateWeather,
  UI_TEXT,
  type Language,
} from '../game/i18n';
import type { DaySummary, ItemId, Season, TimePhase, WeatherType } from '../game/types';
import { BoltIcon, CoinIcon, HeartIcon, ItemIcon, TimeIcon, WeatherIcon } from './PixelIcons';

export interface HudSnapshot {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  waterLevel: number;
  maxWaterLevel: number;
  gold: number;
  day: number;
  dayOfSeason: number;
  season: Season;
  timeMinutes: number;
  timeClock: string;
  timePhase: TimePhase;
  weather: WeatherType;
  restorationPct: number;
  claimableMissions: number;
  hotbar: (ItemId | null)[];
  selectedHotbarIndex: number;
  inventory: Partial<Record<ItemId, number>>;
  nearPrompt: { action: 'sleep' | 'shop' | 'well' | 'bin'; label: string } | null;
  lowStamina: boolean;
  nightWarning: boolean;
}

interface GameHUDProps {
  hud: HudSnapshot;
  lang: Language;
  muted: boolean;
  touchControlsEnabled: boolean;
  isFullscreen: boolean;
  morningSummary: DaySummary | null;
  onSelectHotbar: (idx: number) => void;
  onTriggerNearPrompt: () => void;
  onOpenMissions: () => void;
  onOpenShop: () => void;
  onOpenCraft: () => void;
  onSleepNow: () => void;
  onToggleMute: () => void;
  onToggleTouchControls: () => void;
  onToggleFullscreen: () => void;
  onPause: () => void;
  onDismissSummary: () => void;
}

export function GameHUD({
  hud,
  lang,
  muted,
  touchControlsEnabled,
  isFullscreen,
  morningSummary,
  onSelectHotbar,
  onTriggerNearPrompt,
  onOpenMissions,
  onOpenShop,
  onOpenCraft,
  onSleepNow,
  onToggleMute,
  onToggleTouchControls,
  onToggleFullscreen,
  onPause,
  onDismissSummary,
}: GameHUDProps) {
  const t = UI_TEXT[lang];
  const activeItemId = hud.hotbar[hud.selectedHotbarIndex];
  const activeItem = activeItemId ? ITEMS[activeItemId] : null;
  const activeLabel = activeItemId ? getItemLabel(activeItemId, lang) : null;
  const healthPct = Math.max(0, Math.min(100, (hud.health / hud.maxHealth) * 100));
  const staminaPct = Math.max(0, Math.min(100, (hud.stamina / hud.maxStamina) * 100));
  const promptText = hud.nearPrompt ? getNearPromptLabel(hud.nearPrompt.action, lang) : null;

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 sm:p-4 [@media(max-height:500px)]:p-1.5"
    >
      {/* Top Perimeter Clusters */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        {/* Top-Left: Vitality, Stamina, Gold & Homestead Progress */}
        <div className="wood-panel rounded-lg px-2 sm:px-3.5 py-1.5 sm:py-2.5 [@media(max-height:500px)]:py-1.5 [@media(max-height:500px)]:px-2.5 pointer-events-auto min-w-[126px] sm:min-w-[210px] [@media(max-height:500px)]:min-w-[172px]">
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
            <div className="flex items-center gap-1">
              <CoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="font-mono-tabular font-bold text-xs sm:text-base text-[#f7d87c]" data-testid="hud-gold">
                {Math.round(hud.gold)}g
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-[#d6c2a3] font-mono-tabular" data-testid="hud-restoration">
              {Math.round(hud.restorationPct)}%
              <span className="hidden sm:inline"> {t.restored}</span>
            </div>
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <HeartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <div className="flex-1 h-2 sm:h-3 bg-[#24170f] rounded-sm border border-[#593c26] overflow-hidden">
              <div className="h-full bg-[#d94848]" style={{ width: `${healthPct}%` }} />
            </div>
            <span className="font-mono-tabular text-[10px] sm:text-xs text-[#f5ebd6] w-10 sm:w-14 text-right">
              {Math.round(hud.health)}/{hud.maxHealth}
            </span>
          </div>

          {/* Stamina Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BoltIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <div className="flex-1 h-2 sm:h-3 bg-[#24170f] rounded-sm border border-[#593c26] overflow-hidden">
              <div
                className={`${hud.lowStamina ? 'bg-[#e87c35]' : 'bg-[#ebc03f]'} h-full`}
                style={{ width: `${staminaPct}%` }}
              />
            </div>
            <span className="font-mono-tabular text-[10px] sm:text-xs text-[#f5ebd6] w-10 sm:w-14 text-right" data-testid="hud-stamina">
              {Math.round(hud.stamina)}/{hud.maxStamina}
            </span>
          </div>

          {hud.lowStamina && (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className="mt-1 flex items-center justify-between gap-2 text-[10px] sm:text-xs text-[#ffbe76]"
            >
              <span>{t.lowStam}</span>
              <button
                type="button"
                onClick={onSleepNow}
                className="underline hover:text-white cursor-pointer whitespace-nowrap"
              >
                {t.rest}
              </button>
            </div>
          )}
        </div>

        {/* Top-Right: Season, Day, Time, Weather & Utility Buttons */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2 min-w-0">
          <div className="wood-panel rounded-lg px-2 sm:px-3.5 [@media(max-height:500px)]:px-2.5 py-1.5 sm:py-2 [@media(max-height:500px)]:py-1.5 pointer-events-auto flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2.5">
            <div className="text-right shrink-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="font-display font-bold text-xs sm:text-base [@media(max-height:500px)]:text-sm text-[#fdf3dc] leading-tight whitespace-nowrap" data-testid="hud-day">
                {translateSeason(hud.season, lang)} · {t.dayWord} {hud.dayOfSeason}
              </div>
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#d6c2a3] font-mono-tabular whitespace-nowrap">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <TimeIcon phase={hud.timePhase} className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>{formatTimeLocalized(hud.timeMinutes, lang)}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 whitespace-nowrap" data-testid="hud-weather">
                  <WeatherIcon weather={hud.weather} className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>{translateWeather(hud.weather, lang)}</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-7 w-px bg-[#6b482e]" aria-hidden="true" />

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenMissions();
                }}
                aria-label="Open Farmer Missions (J)"
                title={`${t.missions} (J)`}
                className={`relative p-1 sm:px-2.5 sm:py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  hud.claimableMissions > 0 ? 'wood-button-primary' : 'wood-button'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.missions}</span>
                {hud.claimableMissions > 0 && (
                  <span className="px-1 min-w-[15px] h-4 rounded-full bg-[#f7d87c] text-[#24170f] text-[10px] font-mono-tabular font-bold flex items-center justify-center">
                    {hud.claimableMissions}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenShop();
                }}
                aria-label="Open Village Shop (B)"
                title={`${t.shop} (B)`}
                className="wood-button p-1 sm:px-2.5 sm:py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.shop}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenCraft();
                }}
                aria-label="Open Craft & Satchel (C)"
                title={`${t.craft} (C)`}
                className="wood-button p-1 sm:px-2.5 sm:py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.craft}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSleepNow();
                }}
                aria-label="Rest at Farmhouse to Next Day"
                title={t.rest}
                className="wood-button p-1 sm:p-1.5 rounded cursor-pointer shrink-0"
              >
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleMute();
                }}
                aria-label={muted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
                title="Mute / Unmute (M)"
                className="wood-button p-1 sm:p-1.5 rounded cursor-pointer shrink-0"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleTouchControls();
                }}
                aria-label={touchControlsEnabled ? 'Hide On-Screen Buttons' : 'Show On-Screen Buttons'}
                title={t.touchControlsLabel}
                className={`hidden sm:inline-flex p-1.5 rounded cursor-pointer shrink-0 ${
                  touchControlsEnabled ? 'wood-button-primary' : 'wood-button'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleFullscreen();
                }}
                aria-label={isFullscreen ? t.exitFullscreenBtn : t.fullscreenBtn}
                title={isFullscreen ? t.exitFullscreenBtn : t.fullscreenBtn}
                className="wood-button p-1 sm:p-1.5 rounded cursor-pointer shrink-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onPause();
                }}
                aria-label="Pause Game (Esc)"
                title="Pause (Esc)"
                className="wood-button p-1 sm:p-1.5 rounded cursor-pointer shrink-0"
              >
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {hud.nightWarning && (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className="wood-panel rounded-md px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-[#ff9f87] pointer-events-auto"
            >
              {t.nightWarning}
            </div>
          )}
        </div>
      </div>

      {/* Morning Report Toast (non-blocking) */}
      {morningSummary && (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="self-center pointer-events-auto wood-panel rounded-lg px-4 py-2.5 flex items-center gap-4 max-w-md"
        >
          <div>
            <div className="font-display font-bold text-sm text-[#f7d87c]">
              {translateSeason(morningSummary.season, lang)} {t.dayWord} {((morningSummary.day - 1) % 8) + 1} ·{' '}
              {translateWeather(morningSummary.weather, lang)}
            </div>
            <div className="text-xs text-[#f2e4c9]">{formatMorningSummaryText(morningSummary, lang)}</div>
          </div>
          <button
            type="button"
            onClick={onDismissSummary}
            aria-label="Dismiss morning report"
            className="wood-button px-2.5 py-1 rounded text-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            {t.ok}
          </button>
        </div>
      )}

      {/* Bottom Dock: Contextual Interaction Prompt + 9-Slot Hotbar */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        {promptText && (
          <button
            type="button"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onClick={onTriggerNearPrompt}
            className="wood-button-primary px-3.5 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold pointer-events-auto cursor-pointer whitespace-nowrap hidden sm:inline-flex"
          >
            {promptText}
          </button>
        )}

        <div className="wood-panel rounded-lg p-1.5 sm:p-2 pointer-events-auto flex flex-col items-center gap-1 sm:gap-1.5 max-w-[calc(100vw-16px)]">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full" role="toolbar" aria-label="Tool and Item Hotbar">
            {hud.hotbar.map((itemId, idx) => {
              const selected = idx === hud.selectedHotbarIndex;
              const count = itemId ? hud.inventory[itemId] ?? 0 : 0;
              const def = itemId ? ITEMS[itemId] : null;
              const label = itemId ? getItemLabel(itemId, lang) : null;
              const isCan = itemId === 'watering_can';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSelectHotbar(idx);
                  }}
                  aria-label={label ? `Slot ${idx + 1}: ${label.name}` : `Empty Slot ${idx + 1}`}
                  className={`relative w-9 h-10 sm:w-12 sm:h-12 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-9 shrink-0 rounded flex items-center justify-center cursor-pointer transition-transform ${
                    selected
                      ? 'bg-[#634128] border-2 border-[#f7d87c] -translate-y-0.5'
                      : 'bg-[#2b1c12] border border-[#5e3f27] hover:bg-[#3c2719]'
                  }`}
                >
                  <span className="hidden sm:inline absolute top-0.5 left-1 text-[10px] font-mono-tabular text-[#bfa688]">
                    {idx + 1}
                  </span>
                  {itemId && <ItemIcon id={itemId} className="w-6 h-6 sm:w-7 sm:h-7" />}
                  {itemId && def?.category !== 'tool' && count > 0 && (
                    <span className="absolute bottom-0 right-1 text-[10px] sm:text-[11px] font-mono-tabular font-bold text-[#fdf3dc]">
                      {count}
                    </span>
                  )}
                  {isCan && (
                    <div className="absolute bottom-1 left-1 right-1 h-1 bg-[#1b120b] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5cb6eb]"
                        style={{
                          width: `${Math.round((hud.waterLevel / hud.maxWaterLevel) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            className="text-[11px] sm:text-xs text-[#e6d5b8] flex items-center gap-1.5 sm:gap-2 min-h-[16px] whitespace-nowrap overflow-hidden max-w-full"
          >
            {activeLabel && activeItem ? (
              <>
                <span className="font-semibold text-[#fdf3dc] truncate">{activeLabel.name}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{activeLabel.roleClue}</span>
                {activeItem.id === 'watering_can' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular text-[#89cff5] shrink-0">
                      {hud.waterLevel}/{hud.maxWaterLevel}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[#9e866a]">{t.emptySlot}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
