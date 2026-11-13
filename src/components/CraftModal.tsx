import { useState } from 'react';
import { X } from 'lucide-react';
import { CRAFT_RECIPES, ITEMS } from '../game/constants';
import { getItemLabel, RECIPE_AR, UI_TEXT, type Language } from '../game/i18n';
import type { ItemId, PlaceableType } from '../game/types';
import { ItemIcon } from './PixelIcons';

interface CraftModalProps {
  lang: Language;
  gold: number;
  inventory: Partial<Record<ItemId, number>>;
  hotbar: (ItemId | null)[];
  onCraft: (id: PlaceableType) => void;
  onEatCrop: (id: ItemId) => void;
  onAssignHotbar: (id: ItemId, slotIdx: number) => void;
  onClose: () => void;
}

export function CraftModal({
  lang,
  gold,
  inventory,
  hotbar,
  onCraft,
  onEatCrop,
  onAssignHotbar,
  onClose,
}: CraftModalProps) {
  const [tab, setTab] = useState<'craft' | 'satchel'>('craft');
  const [selectedForSlot, setSelectedForSlot] = useState<ItemId | null>(null);
  const t = UI_TEXT[lang];

  const woodCount = inventory.wood ?? 0;
  const stoneCount = inventory.stone ?? 0;

  const ownedItems = (Object.entries(inventory) as [ItemId, number][]).filter(
    ([, count]) => count > 0
  );

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-label={t.craftTitle}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="parchment-panel rounded-xl w-full max-w-2xl max-h-[86vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#c9b086] bg-[#ebd8b5]">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2c1e14]">{t.craftTitle}</h2>
            <p className="text-xs text-[#694d36] font-mono-tabular">
              {t.wood}: {woodCount} · {t.stone}: {stoneCount} · {t.gold}: {Math.round(gold)}g
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Workbench"
            className="wood-button p-1.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-[#d9c39c] overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('craft')}
            className={`px-3.5 py-1.5 rounded-md text-sm font-semibold cursor-pointer whitespace-nowrap ${
              tab === 'craft' ? 'bg-[#3d7a47] text-white' : 'bg-[#e5d2af] text-[#4a3322] hover:bg-[#dbc39a]'
            }`}
          >
            {t.craftTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('satchel')}
            className={`px-3.5 py-1.5 rounded-md text-sm font-semibold cursor-pointer whitespace-nowrap ${
              tab === 'satchel' ? 'bg-[#3d7a47] text-white' : 'bg-[#e5d2af] text-[#4a3322] hover:bg-[#dbc39a]'
            }`}
          >
            {t.satchelTab} ({ownedItems.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {tab === 'craft' &&
            CRAFT_RECIPES.map((recipe) => {
              let canCraft = true;
              const reqParts: string[] = [];
              for (const [k, qty] of Object.entries(recipe.ingredients)) {
                if (!qty) continue;
                if (k === 'gold') {
                  if (gold < qty) canCraft = false;
                  reqParts.push(`${qty}g`);
                } else {
                  const owned = inventory[k as ItemId] ?? 0;
                  if (owned < qty) canCraft = false;
                  reqParts.push(`${qty} ${getItemLabel(k as ItemId, lang).name}`);
                }
              }

              const recipeName = lang === 'ar' ? RECIPE_AR[recipe.id].name : recipe.name;
              const recipeDesc = lang === 'ar' ? RECIPE_AR[recipe.id].description : recipe.description;

              return (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#fbf2e1] border border-[#d6be96]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ItemIcon id={recipe.id} className="w-9 h-9 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm text-[#2c1e14]">{recipeName}</div>
                      <div className="text-xs text-[#694d36]">{recipeDesc}</div>
                      <div className="text-xs font-mono-tabular text-[#5c4028] mt-0.5">
                        {t.requires}: {reqParts.join(' · ')}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canCraft}
                    aria-label={`Craft ${recipe.name}`}
                    onClick={() => onCraft(recipe.id)}
                    className="wood-button-primary px-4 py-1.5 rounded text-xs font-semibold disabled:opacity-45 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {t.craftBtn}
                  </button>
                </div>
              );
            })}

          {tab === 'satchel' && (
            <div className="space-y-4">
              {selectedForSlot && (
                <div className="p-3 rounded-lg bg-[#e8d6b3] border border-[#b3925d] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#2c1e14]">
                    {t.assignSlot.replace('{name}', getItemLabel(selectedForSlot, lang).name)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[3, 4, 5, 6, 7, 8].map((slotIdx) => (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => {
                          onAssignHotbar(selectedForSlot, slotIdx);
                          setSelectedForSlot(null);
                        }}
                        className="wood-button px-2.5 py-1 rounded text-xs font-mono-tabular cursor-pointer"
                      >
                        #{slotIdx + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedForSlot(null)}
                      className="text-xs underline text-[#5c4028] ml-2 cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ownedItems.map(([id, count]) => {
                  const def = ITEMS[id];
                  const label = getItemLabel(id, lang);
                  const inHotbar = hotbar.includes(id);
                  const canEquip = def.category === 'seed' || def.category === 'placeable';
                  const canEat = Boolean(def.edibleStamina);

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#fbf2e1] border border-[#d6be96]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon id={id} className="w-8 h-8 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#2c1e14] truncate">
                            {label.name} <span className="font-mono-tabular">x{count}</span>
                          </div>
                          <div className="text-[11px] text-[#694d36] truncate">{label.roleClue}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {canEat && (
                          <button
                            type="button"
                            onClick={() => onEatCrop(id)}
                            className="wood-button-primary px-2.5 py-1 rounded text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            {t.eatBtn}
                          </button>
                        )}
                        {canEquip && (
                          <button
                            type="button"
                            onClick={() => setSelectedForSlot(id)}
                            className="wood-button px-2.5 py-1 rounded text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            {inHotbar ? t.moveBtn : t.equipBtn}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
