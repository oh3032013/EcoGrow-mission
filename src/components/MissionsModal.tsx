import { CheckCircle2, Trophy, X } from 'lucide-react';
import { MISSIONS } from '../game/constants';
import { getItemLabel, MISSION_TEXT, UI_TEXT, type Language } from '../game/i18n';
import type { GameWorldState, MissionId } from '../game/types';
import { getMissionProgress } from '../game/rules';
import { CoinIcon, ItemIcon } from './PixelIcons';

interface MissionsModalProps {
  world: GameWorldState;
  lang: Language;
  onClaim: (id: MissionId) => void;
  onClose: () => void;
}

export function MissionsModal({ world, lang, onClaim, onClose }: MissionsModalProps) {
  const t = UI_TEXT[lang];
  const claimedSet = new Set(world.claimedMissions ?? []);
  const completedCount = MISSIONS.filter((m) => claimedSet.has(m.id)).length;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-label={t.missionsModalTitle}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="parchment-panel rounded-xl w-full max-w-2xl max-h-[86vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#c9b086] bg-[#ebd8b5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#3d7a47] text-[#fdf3dc] flex items-center justify-center border border-[#244e2b] shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2c1e14]">
                {t.missionsModalTitle}
              </h2>
              <p className="text-xs text-[#694d36]">{t.missionsModalSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-xs font-bold px-2.5 py-1 rounded bg-[#f9eed8] border border-[#c9b086] text-[#4a3322] whitespace-nowrap">
              {completedCount}/{MISSIONS.length} {t.completedCount}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Missions"
              className="wood-button p-1.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Challenge Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {MISSIONS.map((mission) => {
            const progress = getMissionProgress(world, mission.id);
            const clamped = Math.min(mission.target, progress);
            const pct = Math.min(100, Math.round((clamped / mission.target) * 100));
            const isClaimed = claimedSet.has(mission.id);
            const isReady = !isClaimed && progress >= mission.target;
            const copy = MISSION_TEXT[mission.id][lang];
            const rewardItemLabel = mission.rewardItem
              ? getItemLabel(mission.rewardItem.id, lang).name
              : null;

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isReady
                    ? 'bg-[#fef6dc] border-[#c4922c]'
                    : isClaimed
                    ? 'bg-[#ede0c4]/75 border-[#cdb892] opacity-85'
                    : 'bg-[#fbf2e1] border-[#d6be96]'
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-[#2c1e14] truncate">
                      {copy.title}
                    </h3>
                    <span className="font-mono-tabular text-xs font-bold text-[#5c4028] shrink-0">
                      {clamped}/{mission.target}
                    </span>
                  </div>
                  <p className="text-xs text-[#694d36]">{copy.desc}</p>

                  {/* Progress bar */}
                  <div className="h-2 bg-[#e3cfa9] rounded-full overflow-hidden border border-[#c7ae82]">
                    <div
                      className={`h-full transition-all ${
                        isClaimed || isReady ? 'bg-[#3d7a47]' : 'bg-[#c98b2e]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Reward Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[#4a3322]">
                    <span className="font-semibold text-[#694d36]">{t.rewardLabel}:</span>
                    <span className="inline-flex items-center gap-1 font-mono-tabular font-bold text-[#8a5708]">
                      <CoinIcon className="w-3.5 h-3.5" />
                      +{mission.rewardGold}g
                    </span>
                    {mission.rewardItem && rewardItemLabel && (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <ItemIcon id={mission.rewardItem.id} className="w-4 h-4" />
                        +{mission.rewardItem.qty} {rewardItemLabel}
                      </span>
                    )}
                    {mission.rewardStamina && (
                      <span className="font-mono-tabular font-semibold text-[#2f6e3a]">
                        {t.staminaBonus.replace('{n}', String(mission.rewardStamina))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex sm:justify-end">
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#dfd0b1] text-[#3a5c3c] text-xs font-bold whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.claimed}
                    </span>
                  ) : isReady ? (
                    <button
                      type="button"
                      onClick={() => onClaim(mission.id)}
                      aria-label={`Claim ${copy.title}`}
                      className="wood-button-primary px-4 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      {t.claimReward}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded bg-[#efe1c4] border border-[#d4bc94] text-[#75563b] text-xs font-semibold whitespace-nowrap">
                      {t.inProgress}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
