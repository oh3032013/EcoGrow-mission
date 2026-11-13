import type { ActionFeedback } from './rules';
import type {
  DaySummary,
  ItemId,
  MissionId,
  PlaceableType,
  Season,
  WeatherType,
} from './types';
import { ITEMS } from './constants';

export type Language = 'en' | 'ar';

const LANG_STORAGE_KEY = 'ecogrow_lang';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param === 'ar' || param === 'en') return param;
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // Ignore storage access errors
  }
  return 'ar';
}

export function saveLanguagePreference(lang: Language): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore storage access errors
  }
}

export function formatTimeLocalized(timeMinutes: number, lang: Language): string {
  const clamped = Math.floor(timeMinutes) % 1440;
  const hrs24 = Math.floor(clamped / 60);
  const mins = Math.floor((clamped % 60) / 10) * 10;
  const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
  const period = lang === 'ar' ? (hrs24 >= 12 ? 'م' : 'ص') : hrs24 >= 12 ? 'PM' : 'AM';
  return `${hrs12}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function translateSeason(season: Season, lang: Language): string {
  if (lang === 'en') return season;
  switch (season) {
    case 'Spring':
      return 'الربيع';
    case 'Summer':
      return 'الصيف';
    case 'Autumn':
      return 'الخريف';
    case 'Winter':
      return 'الشتاء';
  }
}

export function translateWeather(weather: WeatherType, lang: Language): string {
  if (lang === 'en') return weather;
  switch (weather) {
    case 'Clear':
      return 'صحو';
    case 'Drought':
      return 'جفاف';
    case 'Rainstorm':
      return 'عاصفة';
  }
}

export const ITEM_AR: Record<
  ItemId,
  { name: string; description: string; roleClue: string }
> = {
  hoe: {
    name: 'مجرفة حديدية',
    description: 'تحرث العشب ليصبح تربة خصبة وتزيل المحاصيل الذابلة.',
    roleClue: 'حراثة التربة · -4 طاقة',
  },
  watering_can: {
    name: 'مرش المياه',
    description: 'يسقي المحاصيل المزروعة. أعد تعبئته من البئر الحجري.',
    roleClue: 'سقي المحاصيل · -3 طاقة',
  },
  axe: {
    name: 'فأس المزرعة',
    description: 'يزيل الأعشاب والصخور والجذوع، ويدفع الحيوانات البرية ليلاً.',
    roleClue: 'تنظيف / دفاع · -5 طاقة',
  },
  wheat_seed: {
    name: 'بذور القمح',
    description: 'حبوب سريعة النمو. تنضج خلال يومين.',
    roleClue: 'نمو يومين · بيع 26g',
  },
  carrot_seed: {
    name: 'بذور الجزر',
    description: 'جذور مغذية ومقرمشة. تنضج خلال 3 أيام.',
    roleClue: 'نمو 3 أيام · بيع 48g',
  },
  tomato_seed: {
    name: 'بذور الطماطم',
    description: 'ثمار صيفية لذيذة. تنضج خلال 4 أيام.',
    roleClue: 'نمو 4 أيام · بيع 78g',
  },
  strawberry_seed: {
    name: 'بذور الفراولة',
    description: 'توت حلو عالي القيمة. ينضج خلال 3 أيام.',
    roleClue: 'نمو 3 أيام · بيع 96g',
  },
  pumpkin_seed: {
    name: 'بذور اليقطين',
    description: 'ثمرة موسمية فاخرة تتحمل البرد. تنضج خلال 5 أيام.',
    roleClue: 'نمو 5 أيام · بيع 160g',
  },
  fence: {
    name: 'سياج خشبي',
    description: 'يصد الأرانب ويبطئ الخنازير البرية ويحمي التربة المجاورة من الغمر.',
    roleClue: 'يصد الحيوانات',
  },
  scarecrow: {
    name: 'فزاعة الحقل',
    description: 'تبعد الأرانب وتبطئ الخنازير البرية ضمن نطاق 4 مربعات.',
    roleClue: 'حماية 4 مربعات',
  },
  lantern: {
    name: 'فانوس حجري',
    description: 'ينير الليل ويدفئ المحاصيل القريبة من الصقيع والعواصف.',
    roleClue: 'إضاءة ليلية + دفء',
  },
  flowerbed: {
    name: 'حوض زهور',
    description: 'زينة جميلة للمزرعة ترفع نسبة استصلاح الأرض.',
    roleClue: 'زينة بيئية',
  },
  stone_path: {
    name: 'ممر حجري',
    description: 'ممر مرتب يمنع نمو الأعشاب الضارة.',
    roleClue: 'ممر حديقة',
  },
  sprinkler: {
    name: 'مرشة شمسية ذكية',
    description: 'مرشة تعمل بالطاقة الشمسية تسقي التربة المحروثة حولها تلقائياً كل صباح.',
    roleClue: 'سقي تلقائي 3×3',
  },
  sensor: {
    name: 'حساس رطوبة التربة',
    description: 'حساس ذكي يمنع جفاف التربة ضمن 3.5 مربعات ويضاعف فرص البذور عند الحصاد.',
    roleClue: 'حماية من الجفاف + بذور',
  },
  compost: {
    name: 'صندوق السماد العضوي',
    description: 'يحول المخلفات الزراعية إلى سماد غني يسرّع نمو المحاصيل القريبة.',
    roleClue: 'تسريع النمو 2.2 مربع',
  },
  egg: {
    name: 'بيض مزرعة طازج',
    description: 'تضعه دجاجات المزرعة كل صباح. تناوله لاستعادة +30 طاقة أو بِعه.',
    roleClue: 'بيع 38g · +30 طاقة',
  },
  wheat: {
    name: 'قمح ذهبي',
    description: 'حزمة قمح محصودة حديثاً.',
    roleClue: 'بيع 26g',
  },
  carrot: {
    name: 'جزر طازج',
    description: 'جزر حلو ومقرمش. تناوله لاستعادة +18 طاقة.',
    roleClue: 'بيع 48g · +18 طاقة',
  },
  tomato: {
    name: 'طماطم ناضجة',
    description: 'طماطم عصيرية. تناولها لاستعادة +22 طاقة.',
    roleClue: 'بيع 78g · +22 طاقة',
  },
  strawberry: {
    name: 'فراولة حلوة',
    description: 'فراولة عطرة. تناولها لاستعادة +26 طاقة.',
    roleClue: 'بيع 96g · +26 طاقة',
  },
  pumpkin: {
    name: 'يقطين الحصاد',
    description: 'يقطين كبير ذو قيمة سوقية عالية!',
    roleClue: 'بيع 160g · +35 طاقة',
  },
  wood: {
    name: 'خشب طبيعي',
    description: 'يُجمع من تكسير الجذوع. يُستخدم في التصنيع.',
    roleClue: 'مادة تصنيع',
  },
  stone: {
    name: 'حجر الحقل',
    description: 'يُجمع من تكسير الصخور. يُستخدم للفوانيس والممرات.',
    roleClue: 'مادة تصنيع',
  },
};

export function getItemLabel(id: ItemId, lang: Language) {
  if (lang === 'ar') return ITEM_AR[id];
  const def = ITEMS[id];
  return {
    name: def.name,
    description: def.description,
    roleClue: def.roleClue,
  };
}

export const RECIPE_AR: Record<PlaceableType, { name: string; description: string }> = {
  fence: {
    name: 'سياج خشبي (×2)',
    description: 'يمنع الأرانب ويبطئ الخنازير البرية ليلاً.',
  },
  scarecrow: {
    name: 'فزاعة الحقل',
    description: 'تحمي المحاصيل ضمن نطاق 4 مربعات من الحيوانات الليلية.',
  },
  lantern: {
    name: 'فانوس حجري',
    description: 'يضيء دافئاً في الليل ويحمي المحاصيل القريبة من الصقيع والفيضان.',
  },
  stone_path: {
    name: 'ممر حجري (×2)',
    description: 'ممر حجري أنيق لفناء المزرعة.',
  },
  flowerbed: {
    name: 'حوض زهور',
    description: 'يجمل المزرعة ويرفع نسبة الإعمار البيئي.',
  },
  sprinkler: {
    name: 'مرشة شمسية ذكية',
    description: 'تسقي التربة المحروثة حولها تلقائياً كل صباح بالطاقة الشمسية.',
  },
  sensor: {
    name: 'حساس رطوبة التربة',
    description: 'يحمي التربة القريبة من الجفاف ويزيد فرص سقوط البذور.',
  },
  compost: {
    name: 'صندوق السماد العضوي',
    description: 'يسرّع نمو المحاصيل المسقية ضمن نطاق 2.2 مربع.',
  },
};

export const MISSION_TEXT: Record<
  MissionId,
  { en: { title: string; desc: string }; ar: { title: string; desc: string } }
> = {
  first_sow: {
    en: {
      title: 'First Green Sprouts',
      desc: 'Plant 4 seeds in tilled farm soil.',
    },
    ar: {
      title: 'البذور الخضراء الأولى',
      desc: 'ازرع 4 بذور في تربة محروثة.',
    },
  },
  eco_water: {
    en: {
      title: 'Morning Dew Keeper',
      desc: 'Water 6 tilled crop plots with your watering can.',
    },
    ar: {
      title: 'السقي المستدام',
      desc: 'اسقِ 6 مربعات مزروعة بمرش المياه.',
    },
  },
  land_steward: {
    en: {
      title: 'Land Steward',
      desc: 'Clear 6 weeds, rocks, or stumps from the field.',
    },
    ar: {
      title: 'استصلاح الأرض',
      desc: 'أزل 6 أعشاب أو صخور أو جذوع من الحقل.',
    },
  },
  first_harvest: {
    en: {
      title: 'Bountiful Basket',
      desc: 'Grow and harvest 3 ripe crops.',
    },
    ar: {
      title: 'الحصاد الأول',
      desc: 'ازرع واحصد 3 محاصيل ناضجة.',
    },
  },
  night_guard: {
    en: {
      title: 'Homestead Perimeter',
      desc: 'Place 4 fences, scarecrows, lanterns, or decor.',
    },
    ar: {
      title: 'حارس المزرعة الليلي',
      desc: 'ضع 4 أسيجة أو فزاعات أو فوانيس أو زينة.',
    },
  },
  soil_sensor: {
    en: {
      title: 'Smart Moisture Monitor',
      desc: 'Place 1 Eco Soil Sensor to protect crops from drought.',
    },
    ar: {
      title: 'مراقب رطوبة التربة',
      desc: 'ضع حساس رطوبة التربة لحماية محاصيلك من الجفاف.',
    },
  },
  smart_sprinkler: {
    en: {
      title: 'Solar Irrigation',
      desc: 'Place 1 Solar Auto-Sprinkler for automatic morning watering.',
    },
    ar: {
      title: 'الري الشمسي الذكي',
      desc: 'ضع مرشة شمسية ذكية لسقي التربة تلقائياً كل صباح.',
    },
  },
  happy_flock: {
    en: {
      title: 'Farmyard Flock',
      desc: 'Collect 3 Fresh Farm Eggs from adopted chickens.',
    },
    ar: {
      title: 'طيور المزرعة المنتجة',
      desc: 'اجمع 3 بيضات طازجة من دجاج المزرعة.',
    },
  },
  wild_defender: {
    en: {
      title: 'Night Watch',
      desc: 'Repel 2 prowling rabbits or boars with your axe.',
    },
    ar: {
      title: 'صدّ الحياة البرية',
      desc: 'أبعد حيوانين بريين متسللين ليلاً باستخدام الفأس.',
    },
  },
  market_trader: {
    en: {
      title: 'Eco-Market Trader',
      desc: 'Earn 250 Gold from harvests, quests, and defense.',
    },
    ar: {
      title: 'تاجر السوق البيئي',
      desc: 'اجمع 250 قطعة ذهبية من البيع والمهام.',
    },
  },
  climate_survivor: {
    en: {
      title: 'Weathering the Seasons',
      desc: 'Survive through Day 5 on your homestead.',
    },
    ar: {
      title: 'تحدي الفصول والمناخ',
      desc: 'واصل البقاء حتى اليوم الخامس في مزرعتك.',
    },
  },
  ecogrow_master: {
    en: {
      title: 'EcoGrow Mission Champion',
      desc: 'Reach 100% farm restoration progress.',
    },
    ar: {
      title: 'بطل مهمة EcoGrow',
      desc: 'أكمل استصلاح المزرعة بنسبة 100%.',
    },
  },
};

export function formatMorningSummaryText(summary: DaySummary, lang: Language): string {
  if (lang === 'en') return summary.message;
  const notes: string[] = [];
  if (summary.cropsGrown > 0) notes.push(`نما ${summary.cropsGrown} محصول`);
  if ((summary.sprinklerWatered ?? 0) > 0) notes.push(`سقت المرشة ${summary.sprinklerWatered} تربة`);
  if ((summary.eggsCollected ?? 0) > 0) notes.push(`+${summary.eggsCollected} بيض طازج`);
  if (summary.cropsWithered > 0) notes.push(`ذبل ${summary.cropsWithered}`);
  if (summary.wildlifeDamage > 0) notes.push(`أكلت الحيوانات ${summary.wildlifeDamage}`);
  if (notes.length === 0) {
    notes.push(`بدأ صباح جديد في فصل ${translateSeason(summary.season, 'ar')}`);
  }
  return notes.join(' · ');
}

export function formatFeedbackMessage(res: ActionFeedback, lang: Language): string | undefined {
  if (!res.message && res.kind !== 'harvest') return undefined;
  if (lang === 'en') return res.message;

  if (res.kind === 'harvest' && res.cropHarvested) {
    return `+1 ${ITEM_AR[res.cropHarvested].name}`;
  }
  switch (res.message) {
    case 'Move closer to reach that tile':
      return 'اقترب أكثر للوصول إلى هذا المربع';
    case 'Too exhausted! Rest or eat':
      return 'طاقتك نفدت! استرح أو تناول محصولاً';
    case 'Watering Can refilled':
      return 'تمت تعبئة مرش المياه';
    case 'Low Stamina — Rest at Farmhouse':
      return 'طاقة منخفضة — استرح في المنزل';
    case 'Cleared withered crop':
      return 'تمت إزالة المحصول الذابل';
    case 'Cleared weeds':
      return 'تمت إزالة الأعشاب';
    case 'Use Axe to clear rocks & stumps':
      return 'استخدم الفأس لتكسير الصخور والجذوع';
    case 'Can empty! Refill at the Well':
      return 'المرش فارغ! املأه من البئر';
    case 'Till soil first before watering':
      return 'احرث التربة بالمجرفة أولاً قبل السقي';
    case 'Repelled wildlife!':
      return 'تم صدّ الحيوان البري!';
    case '+3 Timber Wood':
      return '+3 خشب طبيعي';
    case '+2 Field Stone':
      return '+2 حجر الحقل';
    case 'Cleared weed (+1 Wood)':
      return 'إزالة عشب (+1 خشب)';
    case 'Repaired structure':
      return 'تم إصلاح البناء';
    case 'Till soil with Hoe first':
      return 'احرث التربة بالمجرفة أولاً';
    case 'A crop is already planted here':
      return 'يوجد محصول مزروع هنا بالفعل';
    case 'Out of seeds':
      return 'نفدت البذور';
    case 'Cannot build on this terrain':
      return 'لا يمكن البناء على هذه الأرض';
    case 'Tile is occupied':
      return 'هذا المربع مشغول';
    case 'Step off tile to build':
      return 'ابتعد عن المربع للبناء عليه';
    case 'None left in inventory':
      return 'لا توجد قطع متبقية في الحقيبة';
    default:
      if (res.message?.startsWith('Placed ')) {
        const raw = res.message.replace('Placed ', '');
        const match = (Object.keys(ITEMS) as ItemId[]).find((k) => ITEMS[k].name === raw);
        return match ? `تم وضع ${ITEM_AR[match].name}` : res.message;
      }
      return res.message;
  }
}

export function getNearPromptLabel(
  action: 'sleep' | 'shop' | 'well' | 'bin',
  lang: Language
): string {
  if (lang === 'en') {
    switch (action) {
      case 'sleep':
        return 'Press E or Tap to Sleep in Farmhouse';
      case 'shop':
        return 'Press E or Tap to Open Village Shop';
      case 'well':
        return 'Use Watering Can or E at Well to Refill';
      case 'bin':
        return 'Press E or Tap to Sell at Shipping Bin';
    }
  }
  switch (action) {
    case 'sleep':
      return 'اضغط E أو تفاعل للنوم في المنزل';
    case 'shop':
      return 'اضغط E أو تفاعل لفتح سوق القرية';
    case 'well':
      return 'املأ مرش المياه من البئر';
    case 'bin':
      return 'اضغط E أو تفاعل للبيع في الصندوق';
  }
}

export const UI_TEXT = {
  en: {
    brandTitle: 'EcoGrow Mission',
    saveYourFarm: 'Save Your Farm',
    startNow: 'Start Now',
    teamBtn: 'Preparation Team',
    exitBtn: 'Exit',
    teamTitle: 'Preparation Team — EcoGrow Mission',
    teamSubtitle: 'Meet the interdisciplinary team behind the EcoGrow Mission project.',
    exitTitle: 'See You Soon on the Farm!',
    exitBody: 'Your EcoGrow Mission progress is saved locally. You can close this tab or return to the main menu.',
    backToMenu: 'Back to Main Menu',
    tagline:
      'Restore an overgrown farm, complete EcoGrow farmer challenges, weather sudden storms, and guard your harvest through the night.',
    continueFarm: 'Continue Farm',
    newFarm: 'New Mission',
    startFarming: 'Start Mission',
    controlsDesktop:
      'WASD Move · Click Use Tool · 1-9 Select Slot · E Interact · J Missions · B Shop · C Craft · Esc Pause',
    controlsMobile:
      'D-Pad / Stick Move · Tap Tile or USE to Farm · Tap Hotbar to Switch Tools',
    langSwitch: 'العربية',
    restored: 'Restored',
    lowStam: 'Low Stam',
    rest: 'Rest',
    dayWord: 'Day',
    nightWarning: 'Nightfall — Wildlife prowling!',
    emptySlot: 'Empty Slot',
    ok: 'OK',
    shop: 'Shop',
    craft: 'Craft',
    missions: 'Missions',
    droughtHit: 'Midday drought dried out watered soil!',
    stormProtectionHint: 'Rainstorm! Fences & lanterns shield nearby crops.',
    staminaLowHint: 'Stamina low — rest at Farmhouse or eat a crop!',
    exhaustedToast: 'You collapsed from exhaustion in the field!',
    missionClaimed: 'Mission Reward Claimed!',
    missionsModalTitle: 'EcoGrow Farmer Challenges',
    missionsModalSub: 'Complete farm milestones to earn Gold, bonus seeds, and supplies.',
    completedCount: 'Completed',
    claimReward: 'Claim Reward',
    claimed: 'Claimed',
    inProgress: 'In Progress',
    rewardLabel: 'Reward',
    staminaBonus: '+{n} Stam',
    shopTitle: 'Village Market Stall',
    shopSub: '{season} Market · In-season crops sell for +25% bonus Gold',
    seedsTab: 'Seeds & Supplies',
    sellTab: 'Sell Harvest',
    upgradesTab: 'Tools & Decor',
    inSeason: '· In Season',
    owned: 'Owned',
    buy1: 'Buy 1',
    buy: 'Buy',
    emptyBasket: 'Your harvest basket is empty. Grow and harvest crops on your farm to sell them here!',
    seasonBonus: '+25% Season Bonus',
    sellsFor: 'Sells for',
    each: 'each',
    sell1: 'Sell 1',
    sellAll: 'Sell All',
    toolUpgrades: 'Tool Upgrades',
    defensesDecor: 'Defenses & Cozy Decorations',
    tierIron: 'Iron Tier',
    tierCopper: 'Copper Tier',
    tierMaster: 'Master Tier',
    maxTier: 'Max Tier',
    upgrade: 'Upgrade',
    hoeName: 'Homestead Hoe',
    hoeBenefit: '-1 Stamina cost per till',
    canName: 'Watering Can',
    canBenefit: 'Larger tank & -1 Stamina',
    axeName: 'Homestead Axe',
    axeBenefit: '+1 Wildlife damage & -1 Stamina',
    craftTitle: 'EcoGrow Workbench',
    wood: 'Wood',
    stone: 'Stone',
    gold: 'Gold',
    craftTab: 'Craft Defenses & Decor',
    satchelTab: 'Satchel & Hotbar',
    requires: 'Requires',
    craftBtn: 'Craft',
    assignSlot: 'Assign {name} to Hotbar Slot:',
    cancel: 'Cancel',
    eatBtn: 'Eat',
    moveBtn: 'Move',
    equipBtn: 'Equip',
    pausedTitle: 'Mission Paused',
    pausedSub: 'Your farm is safe while you catch your breath.',
    restoredTitle: 'EcoGrow Restored!',
    restoredSub: 'Your farm is flourishing at 100%! Keep completing challenges endlessly or start anew.',
    exhaustedTitle: 'Exhausted in the Field',
    exhaustedSub: 'You collapsed before reaching the farmhouse. Rest well and begin again.',
    daysStat: 'Days',
    harvestedStat: 'Harvested',
    restoredStat: 'Restored',
    touchControlsLabel: 'Phone Buttons',
    on: 'On',
    off: 'Off',
    languageLabel: 'Language',
    resume: 'Resume',
    continueFarming: 'Continue Farming',
    tryAgain: 'Try Again',
    restartMission: 'New Farm',
    titleScreen: 'Title Screen',
    installAndroid: 'Install on Android',
    addToIphone: 'Add to iPhone',
    installTitleAndroid: 'Install on Android',
    installTitleIOS: 'Install on iPhone / iPad',
    offlineBanner: 'Offline Mode · Local Farm Save Active',
    gotIt: 'Got it',
    dpadLabel: 'D-Pad',
    stickLabel: 'Stick',
    actLabel: 'ACT',
    useLabel: 'USE',
    livestockHeader: 'Eco Livestock & Tech',
    chickenName: 'Farmyard Chicken',
    chickenDesc: 'Wanders your homestead and lays 1 Fresh Egg every morning (sell 38g or eat +30 Stam).',
    adoptChicken: 'Adopt',
    coopFull: 'Flock Full',
    fullscreenBtn: 'Fullscreen',
    exitFullscreenBtn: 'Exit Fullscreen',
    rotateLandscapeHint: 'Rotate or switch to Landscape for best mobile play',
    enableLandscapeBtn: 'Go Landscape',
  },
  ar: {
    brandTitle: 'EcoGrow Mission',
    saveYourFarm: 'أنقذ مزرعتك',
    startNow: 'ابدأ الآن',
    teamBtn: 'فريق الاعداد',
    exitBtn: 'الخروج',
    teamTitle: 'فريق الإعداد — EcoGrow Mission',
    teamSubtitle: 'أعضاء فريق العمل القائمون على البحث والتطوير وتنفيذ مشروع EcoGrow Mission.',
    exitTitle: 'إلى اللقاء في المزرعة!',
    exitBody: 'تم حفظ تقدمك في EcoGrow Mission محلياً. يمكنك إغلاق التطبيق أو العودة إلى الواجهة الرئيسية.',
    backToMenu: 'العودة للواجهة الرئيسية',
    tagline:
      'أعد إعمار المزرعة المهجورة، وأكمل تحديات المزارع في EcoGrow، وواجه العواصف والجفاف، واحمِ محاصيلك ليلاً.',
    continueFarm: 'متابعة المزرعة',
    newFarm: 'مهمة جديدة',
    startFarming: 'ابدأ المهمة',
    controlsDesktop:
      'WASD للحركة · النقر للأداة · 1-9 شريط الأدوات · E تفاعل · J التحديات · B المتجر · C التصنيع · Esc إيقاف',
    controlsMobile:
      'أزرار الأسهم أو العصا للحركة · زر USE للزراعة والحصاد · اضغط على الشريط لتبديل الأدوات',
    langSwitch: 'English',
    restored: 'استصلاح',
    lowStam: 'طاقة منخفضة',
    rest: 'راحة',
    dayWord: 'اليوم',
    nightWarning: 'حلول الليل — حيوانات برية متسللة!',
    emptySlot: 'خانة فارغة',
    ok: 'حسناً',
    shop: 'المتجر',
    craft: 'التصنيع',
    missions: 'التحديات',
    droughtHit: 'جفاف منتصف النهار جفّف التربة المسقية!',
    stormProtectionHint: 'عاصفة مطرية! الأسيجة والفوانيس تحمي المحاصيل القريبة.',
    staminaLowHint: 'طاقتك منخفضة — استرح في المنزل أو تناول محصولاً!',
    exhaustedToast: 'سقطت من الإرهاق في الحقل!',
    missionClaimed: 'تم استلام مكافأة التحدي!',
    missionsModalTitle: 'تحديات المزارع — EcoGrow',
    missionsModalSub: 'أنجز مهام المزرعة لربح الذهب والبذور المجانية والمواد.',
    completedCount: 'مكتمل',
    claimReward: 'استلام المكافأة',
    claimed: 'تم الاستلام',
    inProgress: 'قيد التنفيذ',
    rewardLabel: 'المكافأة',
    staminaBonus: '+{n} طاقة',
    shopTitle: 'سوق القرية',
    shopSub: 'سوق {season} · المحاصيل الموسمية تُباع بمكافأة +25% ذهب',
    seedsTab: 'البذور والإمدادات',
    sellTab: 'بيع الحصاد',
    upgradesTab: 'الأدوات والزينة',
    inSeason: '· موسمي',
    owned: 'لديك',
    buy1: 'شراء 1',
    buy: 'شراء',
    emptyBasket: 'سلة الحصاد فارغة. ازرع المحاصيل واحصدها ثم عد لبيعها هنا!',
    seasonBonus: '+25% مكافأة الموسم',
    sellsFor: 'سعر البيع',
    each: 'للواحدة',
    sell1: 'بيع 1',
    sellAll: 'بيع الكل',
    toolUpgrades: 'ترقية الأدوات',
    defensesDecor: 'الدفاعات والزينة البيئية',
    tierIron: 'المستوى الحديدي',
    tierCopper: 'المستوى النحاسي',
    tierMaster: 'المستوى المتقن',
    maxTier: 'أعلى مستوى',
    upgrade: 'ترقية',
    hoeName: 'مجرفة المزرعة',
    hoeBenefit: '-1 تكلفة طاقة لكل حراثة',
    canName: 'مرش المياه',
    canBenefit: 'خزان أكبر و -1 طاقة',
    axeName: 'فأس المزرعة',
    axeBenefit: '+1 ضرر للحيوانات و -1 طاقة',
    craftTitle: 'طاولة التصنيع والحقيبة',
    wood: 'خشب',
    stone: 'حجر',
    gold: 'ذهب',
    craftTab: 'صناعة الدفاعات والزينة',
    satchelTab: 'الحقيبة وشريط الأدوات',
    requires: 'يتطلب',
    craftBtn: 'صناعة',
    assignSlot: 'تعيين {name} إلى الخانة:',
    cancel: 'إلغاء',
    eatBtn: 'تناول',
    moveBtn: 'نقل',
    equipBtn: 'تجهيز',
    pausedTitle: 'اللعبة متوقفة مؤقتاً',
    pausedSub: 'مزرعتك بأمان أثناء استراحتك.',
    restoredTitle: 'تم إعمار EcoGrow!',
    restoredSub: 'مزرعتك مزدهرة بنسبة 100%! يمكنك متابعة التحديات أو بدء مزرعة جديدة.',
    exhaustedTitle: 'نفدت طاقتك في الحقل',
    exhaustedSub: 'انهرت قبل الوصول للمنزل. استرح جيداً وابدأ من جديد.',
    daysStat: 'الأيام',
    harvestedStat: 'الحصاد',
    restoredStat: 'الاستصلاح',
    touchControlsLabel: 'أزرار الهاتف',
    on: 'مفعّلة',
    off: 'معطّلة',
    languageLabel: 'اللغة',
    resume: 'استئناف اللعب',
    continueFarming: 'متابعة الزراعة',
    tryAgain: 'حاول مجدداً',
    restartMission: 'مزرعة جديدة',
    titleScreen: 'الشاشة الرئيسية',
    installAndroid: 'تثبيت على أندرويد',
    addToIphone: 'إضافة للآيفون',
    installTitleAndroid: 'التثبيت على أندرويد',
    installTitleIOS: 'التثبيت على آيفون / آيباد',
    offlineBanner: 'وضع بدون إنترنت · الحفظ المحلي نشط',
    gotIt: 'فهمت',
    dpadLabel: 'أسهم',
    stickLabel: 'عصا',
    actLabel: 'تفاعل',
    useLabel: 'استخدام',
    livestockHeader: 'حيوانات المزرعة والري الذكي',
    chickenName: 'دجاجة المزرعة',
    chickenDesc: 'تتجول في الفناء وتضع بيضة طازجة كل صباح (تُباع بـ 38g أو تمنح +30 طاقة).',
    adoptChicken: 'تبنّي',
    coopFull: 'مكتمل',
    fullscreenBtn: 'ملء الشاشة',
    exitFullscreenBtn: 'إنهاء ملء الشاشة',
    rotateLandscapeHint: 'يفضّل تشغيل اللعبة بالعرض (Landscape) على الهاتف',
    enableLandscapeBtn: 'وضع أفقي',
  },
} as const;
