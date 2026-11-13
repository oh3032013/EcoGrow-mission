import {
  CHICKEN_PRICE,
  COMPOST_RADIUS,
  CRAFT_RECIPES,
  CROPS,
  DAYS_PER_SEASON,
  DAY_START_MINUTES,
  FARMHOUSE_DOOR,
  FARMHOUSE_POS,
  GRID_HEIGHT,
  GRID_WIDTH,
  ITEMS,
  MAX_CHICKENS,
  MISSIONS,
  NIGHT_START_MINUTES,
  PLACEABLE_MAX_HP,
  SCARECROW_RADIUS,
  SEASONS,
  SENSOR_RADIUS,
  SHIPPING_BIN_POS,
  SHOP_STALL_POS,
  SPRINKLER_RADIUS,
  SUNSET_START_MINUTES,
  WELL_POS,
} from './constants';
import type {
  CropType,
  DaySummary,
  FarmChicken,
  FarmTile,
  GameWorldState,
  ItemId,
  MissionId,
  ObstacleType,
  PlaceableType,
  Season,
  TimePhase,
  ToolType,
  WeatherType,
  WildlifeEntity,
} from './types';

export function getSeason(seasonIndex: number): Season {
  return SEASONS[((seasonIndex % SEASONS.length) + SEASONS.length) % SEASONS.length];
}

export function getDayOfSeason(day: number): number {
  return ((day - 1) % DAYS_PER_SEASON) + 1;
}

export function getTimePhase(timeMinutes: number): TimePhase {
  if (timeMinutes >= NIGHT_START_MINUTES) return 'Night';
  if (timeMinutes >= SUNSET_START_MINUTES) return 'Sunset';
  return 'Day';
}

export function formatTimeClock(timeMinutes: number): string {
  const clamped = Math.floor(timeMinutes) % 1440;
  const hrs24 = Math.floor(clamped / 60);
  const mins = Math.floor((clamped % 60) / 10) * 10;
  const period = hrs24 >= 12 ? 'PM' : 'AM';
  const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
  return `${hrs12}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function getTileIndex(x: number, y: number, width = GRID_WIDTH): number {
  return y * width + x;
}

export function getTile(state: GameWorldState, x: number, y: number): FarmTile | null {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) return null;
  return state.tiles[y * state.width + x] ?? null;
}

export function isTileWalkable(state: GameWorldState, tx: number, ty: number): boolean {
  const tile = getTile(state, tx, ty);
  if (!tile) return false;
  if (
    tile.terrain === 'forest_edge' ||
    tile.terrain === 'water' ||
    tile.terrain === 'farmhouse' ||
    tile.terrain === 'shop_stall' ||
    tile.terrain === 'shipping_bin' ||
    tile.terrain === 'well'
  ) {
    return false;
  }
  if (tile.obstacle === 'rock' || tile.obstacle === 'stump') return false;
  if (tile.structure && tile.structure.type !== 'stone_path' && tile.structure.type !== 'flowerbed') {
    return false;
  }
  return true;
}

export function isNearFarmhouse(state: GameWorldState): boolean {
  const dx = state.player.x - (FARMHOUSE_DOOR.x + 0.5);
  const dy = state.player.y - (FARMHOUSE_DOOR.y + 0.5);
  return Math.hypot(dx, dy) <= 1.85;
}

export function isNearShopStall(state: GameWorldState): boolean {
  const cx = SHOP_STALL_POS.x + SHOP_STALL_POS.w / 2;
  const cy = SHOP_STALL_POS.y + SHOP_STALL_POS.h + 0.5;
  return Math.hypot(state.player.x - cx, state.player.y - cy) <= 2.3;
}

export function isNearShippingBin(state: GameWorldState): boolean {
  return Math.hypot(state.player.x - (SHIPPING_BIN_POS.x + 0.5), state.player.y - (SHIPPING_BIN_POS.y + 0.5)) <= 1.8;
}

export function isNearWell(state: GameWorldState): boolean {
  return Math.hypot(state.player.x - (WELL_POS.x + 0.5), state.player.y - (WELL_POS.y + 0.5)) <= 1.9;
}

export function createInitialFarmState(seed = 42): GameWorldState {
  // Deterministic LCG PRNG for reproducible initial neglected farm
  let s = seed >>> 0;
  const rand = () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const tiles: FarmTile[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      let terrain: FarmTile['terrain'] = 'grass';
      let tillable = false;
      let obstacle: ObstacleType | null = null;
      let structure: FarmTile['structure'] = null;
      let tilled = false;

      // Perimeter forest border
      if (x === 0 || y === 0 || x === GRID_WIDTH - 1 || y === GRID_HEIGHT - 1) {
        terrain = 'forest_edge';
      } else if (
        x >= FARMHOUSE_POS.x &&
        x < FARMHOUSE_POS.x + FARMHOUSE_POS.w &&
        y >= FARMHOUSE_POS.y &&
        y < FARMHOUSE_POS.y + FARMHOUSE_POS.h
      ) {
        terrain = 'farmhouse';
      } else if (
        x >= SHOP_STALL_POS.x &&
        x < SHOP_STALL_POS.x + SHOP_STALL_POS.w &&
        y >= SHOP_STALL_POS.y &&
        y < SHOP_STALL_POS.y + SHOP_STALL_POS.h
      ) {
        terrain = 'shop_stall';
      } else if (x === WELL_POS.x && y === WELL_POS.y) {
        terrain = 'well';
      } else if (x === SHIPPING_BIN_POS.x && y === SHIPPING_BIN_POS.y) {
        terrain = 'shipping_bin';
      } else if (x >= 22 && x <= 25 && y >= 14 && y <= 17) {
        // Cozy natural pond in bottom-right corner
        terrain = 'water';
      } else if (
        // Dirt path from farmhouse door to central farm & shop
        (y === 7 && x >= 6 && x <= 22) ||
        (x === 14 && y >= 7 && y <= 9) ||
        (y === 6 && x === 22)
      ) {
        terrain = 'dirt_path';
      }

      // Central farm plot zone (x: 5..20, y: 9..17)
      const inFarmPlot = terrain === 'grass' && x >= 5 && x <= 20 && y >= 9 && y <= 17;
      if (inFarmPlot) {
        tillable = true;
      }

      // Starter cleared square around (13..15, 9..11) so player has clear space
      const inStarterClearing = x >= 11 && x <= 16 && y >= 7 && y <= 11;

      if (terrain === 'grass' && !inStarterClearing) {
        const r = rand();
        if (inFarmPlot) {
          if (r < 0.24) obstacle = 'weed';
          else if (r < 0.34) obstacle = 'rock';
          else if (r < 0.42) obstacle = 'stump';
        } else if (x >= 2 && x <= 25 && y >= 2 && y <= 18) {
          if (r < 0.14) obstacle = 'weed';
          else if (r < 0.20) obstacle = 'rock';
          else if (r < 0.27) obstacle = 'stump';
        }
      }

      // 3 starter tilled tiles right below the starter path so player immediately sees fertile soil
      if ((x === 13 || x === 14 || x === 15) && y === 10) {
        tilled = true;
        obstacle = null;
      }

      // A couple of weathered starter fences on the west edge of the plot
      if (x === 5 && (y === 10 || y === 11)) {
        structure = { type: 'fence', hp: PLACEABLE_MAX_HP.fence, maxHp: PLACEABLE_MAX_HP.fence };
        obstacle = null;
      }

      tiles.push({
        x,
        y,
        terrain,
        tillable,
        tilled,
        watered: false,
        droughtDriedToday: false,
        obstacle,
        crop: null,
        structure,
      });
    }
  }

  return {
    day: 1,
    seasonIndex: 0,
    timeMinutes: DAY_START_MINUTES,
    weather: 'Clear',
    droughtMiddayTriggered: false,
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    tiles,
    player: {
      x: 14.5,
      y: 9.2, // Open clearing right above starter tilled plots (13..15, 10)
      facingX: 0,
      facingY: 1,
      walkCycle: 0,
      swingTimer: 0,
      swingTool: null,
      hitFlashTimer: 0,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      waterLevel: 12,
      maxWaterLevel: 12,
      gold: 85,
      selectedHotbarIndex: 0,
    },
    hotbar: [
      'hoe',
      'watering_can',
      'axe',
      'wheat_seed',
      'carrot_seed',
      'fence',
      'scarecrow',
      null,
      null,
    ],
    inventory: {
      hoe: 1,
      watering_can: 1,
      axe: 1,
      wheat_seed: 6,
      carrot_seed: 2,
      fence: 4,
      scarecrow: 1,
      wood: 6,
      stone: 2,
    },
    upgrades: {
      hoeLevel: 1,
      canLevel: 1,
      axeLevel: 1,
    },
    wildlife: [],
    chickens: [],
    stats: {
      daysSurvived: 1,
      cropsHarvested: 0,
      totalGoldEarned: 0,
      wildlifeRepelled: 0,
      obstaclesCleared: 0,
      seedsPlanted: 0,
      cropsWatered: 0,
      defensesPlaced: 0,
      sprinklersPlaced: 0,
      sensorsPlaced: 0,
      eggsCollected: 0,
    },
    claimedMissions: [],
    lastSummary: null,
    restorationVictoryDismissed: false,
    outcome: 'none',
  };
}

export function getToolStaminaCost(tool: ToolType, state: GameWorldState): number {
  if (tool === 'hoe') return Math.max(2, 5 - state.upgrades.hoeLevel);
  if (tool === 'watering_can') return Math.max(1, 4 - state.upgrades.canLevel);
  return Math.max(2, 6 - state.upgrades.axeLevel);
}

export function addInventoryItem(state: GameWorldState, id: ItemId, amount: number): void {
  state.inventory[id] = (state.inventory[id] ?? 0) + amount;
  // Auto-slot seeds and placeables into an empty hotbar slot if not already present
  const def = ITEMS[id];
  if ((def.category === 'seed' || def.category === 'placeable') && !state.hotbar.includes(id)) {
    const emptyIdx = state.hotbar.findIndex((slot) => slot === null);
    if (emptyIdx !== -1) {
      state.hotbar[emptyIdx] = id;
    }
  }
}

export function consumeInventoryItem(state: GameWorldState, id: ItemId, amount = 1): boolean {
  const current = state.inventory[id] ?? 0;
  if (current < amount) return false;
  const next = current - amount;
  if (next <= 0) {
    delete state.inventory[id];
    // Clear from hotbar if empty and not a core tool
    if (ITEMS[id].category !== 'tool') {
      state.hotbar = state.hotbar.map((slot) => (slot === id ? null : slot));
    }
  } else {
    state.inventory[id] = next;
  }
  return true;
}

export interface ActionFeedback {
  performed: boolean;
  kind:
    | 'none'
    | 'till'
    | 'plant'
    | 'water'
    | 'refill'
    | 'harvest'
    | 'clear'
    | 'place'
    | 'repair'
    | 'defend'
    | 'error';
  message?: string;
  tileX?: number;
  tileY?: number;
  cropHarvested?: CropType;
  goldDelta?: number;
}

export function isProtectedByScarecrow(state: GameWorldState, x: number, y: number): boolean {
  for (const tile of state.tiles) {
    if (tile.structure?.type === 'scarecrow') {
      const dist = Math.hypot(tile.x + 0.5 - (x + 0.5), tile.y + 0.5 - (y + 0.5));
      if (dist <= SCARECROW_RADIUS) return true;
    }
  }
  return false;
}

export function isProtectedFromFlood(state: GameWorldState, x: number, y: number): boolean {
  // Protected if adjacent (radius 1.5) to a fence, stone_path, or radius 3.5 to a lantern
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const t = getTile(state, x + dx, y + dy);
      if (!t?.structure) continue;
      const d = Math.hypot(dx, dy);
      if (t.structure.type === 'lantern' && d <= 3.2) return true;
      if ((t.structure.type === 'fence' || t.structure.type === 'stone_path') && d <= 1.5) return true;
    }
  }
  return false;
}

export function isCoveredByStructureRadius(
  state: GameWorldState,
  x: number,
  y: number,
  type: PlaceableType,
  radius: number
): boolean {
  for (const tile of state.tiles) {
    if (tile.structure?.type === type) {
      const dist = Math.hypot(tile.x - x, tile.y - y);
      if (dist <= radius) return true;
    }
  }
  return false;
}

export function isCoveredBySprinkler(state: GameWorldState, x: number, y: number): boolean {
  return isCoveredByStructureRadius(state, x, y, 'sprinkler', SPRINKLER_RADIUS);
}

export function isCoveredBySensor(state: GameWorldState, x: number, y: number): boolean {
  return isCoveredByStructureRadius(state, x, y, 'sensor', SENSOR_RADIUS);
}

export function isCoveredByCompost(state: GameWorldState, x: number, y: number): boolean {
  return isCoveredByStructureRadius(state, x, y, 'compost', COMPOST_RADIUS);
}

export function performTileAction(
  state: GameWorldState,
  tileX: number,
  tileY: number
): ActionFeedback {
  const tile = getTile(state, tileX, tileY);
  if (!tile) return { performed: false, kind: 'none' };

  // Check reach distance (within 2.1 tiles of player center)
  const dist = Math.hypot(state.player.x - (tileX + 0.5), state.player.y - (tileY + 0.5));
  if (dist > 2.25) {
    return { performed: false, kind: 'error', message: 'Move closer to reach that tile' };
  }

  // Face toward target
  const dx = tileX + 0.5 - state.player.x;
  const dy = tileY + 0.5 - state.player.y;
  if (Math.hypot(dx, dy) > 0.05) {
    state.player.facingX = dx;
    state.player.facingY = dy;
  }

  // Priority 1: Harvest ripe crop regardless of selected tool (cozy QoL!)
  if (tile.crop && !tile.crop.withered) {
    const def = CROPS[tile.crop.type];
    if (tile.crop.growthDays >= def.daysToGrow) {
      if (state.player.stamina < 1) {
        return { performed: false, kind: 'error', message: 'Too exhausted! Rest or eat' };
      }
      state.player.stamina = Math.max(0, state.player.stamina - 1);
      const harvestedType = tile.crop.type;
      addInventoryItem(state, harvestedType, 1);
      // 25% chance for bonus seed drop on harvest (50% when monitored by Eco Soil Sensor)
      const mod = isCoveredBySensor(state, tileX, tileY) ? 2 : 4;
      if ((tileX + tileY + state.day) % mod === 0) {
        addInventoryItem(state, def.seedId, 1);
      }
      tile.crop = null;
      state.stats.cropsHarvested += 1;
      return {
        performed: true,
        kind: 'harvest',
        tileX,
        tileY,
        cropHarvested: harvestedType,
        message: `+1 ${def.name}`,
      };
    }
  }

  const selectedId = state.hotbar[state.player.selectedHotbarIndex];
  if (!selectedId) {
    return { performed: false, kind: 'none' };
  }
  const itemDef = ITEMS[selectedId];

  // Refill watering can on well or water
  if (selectedId === 'watering_can' && (tile.terrain === 'well' || tile.terrain === 'water')) {
    state.player.waterLevel = state.player.maxWaterLevel;
    state.player.swingTimer = 0.22;
    state.player.swingTool = 'watering_can';
    return {
      performed: true,
      kind: 'refill',
      tileX,
      tileY,
      message: 'Watering Can refilled',
    };
  }

  // Tool actions
  if (itemDef.category === 'tool') {
    const tool = selectedId as ToolType;
    const cost = getToolStaminaCost(tool, state);

    if (tool === 'hoe') {
      if (state.player.stamina < cost) {
        return { performed: false, kind: 'error', message: 'Low Stamina — Rest at Farmhouse' };
      }
      // Clear withered crop
      if (tile.crop?.withered) {
        state.player.stamina -= cost;
        state.player.swingTimer = 0.22;
        state.player.swingTool = 'hoe';
        tile.crop = null;
        return { performed: true, kind: 'clear', tileX, tileY, message: 'Cleared withered crop' };
      }
      // Clear weed with hoe too
      if (tile.obstacle === 'weed') {
        state.player.stamina -= cost;
        state.player.swingTimer = 0.22;
        state.player.swingTool = 'hoe';
        tile.obstacle = null;
        state.stats.obstaclesCleared += 1;
        return { performed: true, kind: 'clear', tileX, tileY, message: 'Cleared weeds' };
      }
      if (tile.tillable && !tile.tilled && !tile.obstacle && !tile.structure) {
        state.player.stamina -= cost;
        state.player.swingTimer = 0.24;
        state.player.swingTool = 'hoe';
        tile.tilled = true;
        if (state.weather === 'Rainstorm') {
          tile.watered = true;
        }
        return { performed: true, kind: 'till', tileX, tileY };
      }
      if (tile.obstacle) {
        return { performed: false, kind: 'error', message: 'Use Axe to clear rocks & stumps' };
      }
      return { performed: false, kind: 'none' };
    }

    if (tool === 'watering_can') {
      if (state.player.waterLevel <= 0) {
        return { performed: false, kind: 'error', message: 'Can empty! Refill at the Well' };
      }
      if (state.player.stamina < cost) {
        return { performed: false, kind: 'error', message: 'Low Stamina — Rest at Farmhouse' };
      }
      if (tile.tilled) {
        state.player.stamina -= cost;
        state.player.waterLevel = Math.max(0, state.player.waterLevel - 1);
        state.player.swingTimer = 0.24;
        state.player.swingTool = 'watering_can';
        if (!tile.watered) {
          state.stats.cropsWatered = (state.stats.cropsWatered ?? 0) + 1;
        }
        tile.watered = true;
        tile.droughtDriedToday = false;
        return { performed: true, kind: 'water', tileX, tileY };
      }
      return { performed: false, kind: 'error', message: 'Till soil first before watering' };
    }

    if (tool === 'axe') {
      if (state.player.stamina < cost) {
        return { performed: false, kind: 'error', message: 'Low Stamina — Rest at Farmhouse' };
      }
      state.player.swingTimer = 0.24;
      state.player.swingTool = 'axe';

      // Check if wildlife is near the target tile to repel!
      let hitWildlife = false;
      for (const w of state.wildlife) {
        if (w.state === 'ko' || w.state === 'fleeing') continue;
        const wDist = Math.hypot(w.x - (tileX + 0.5), w.y - (tileY + 0.5));
        if (wDist <= 1.45) {
          w.hp -= 1 + (state.upgrades.axeLevel - 1);
          w.hitFlashTimer = 0.14;
          hitWildlife = true;
          if (w.hp <= 0) {
            w.state = 'ko';
            w.stateTimer = 0.45;
            state.stats.wildlifeRepelled += 1;
            state.player.gold += w.kind === 'boar' ? 20 : 10;
            state.stats.totalGoldEarned += w.kind === 'boar' ? 20 : 10;
          } else {
            w.state = 'fleeing';
            w.stateTimer = 1.6;
          }
        }
      }
      if (hitWildlife) {
        state.player.stamina -= cost;
        return { performed: true, kind: 'defend', tileX, tileY, message: 'Repelled wildlife!' };
      }

      if (tile.obstacle) {
        state.player.stamina -= cost;
        const obs = tile.obstacle;
        tile.obstacle = null;
        state.stats.obstaclesCleared += 1;
        if (obs === 'stump') {
          addInventoryItem(state, 'wood', 3);
          return { performed: true, kind: 'clear', tileX, tileY, message: '+3 Timber Wood' };
        }
        if (obs === 'rock') {
          addInventoryItem(state, 'stone', 2);
          return { performed: true, kind: 'clear', tileX, tileY, message: '+2 Field Stone' };
        }
        addInventoryItem(state, 'wood', 1);
        return { performed: true, kind: 'clear', tileX, tileY, message: 'Cleared weed (+1 Wood)' };
      }

      // Repair damaged fence with axe/mallet if damaged
      if (tile.structure && tile.structure.hp < tile.structure.maxHp) {
        state.player.stamina -= 2;
        tile.structure.hp = tile.structure.maxHp;
        return { performed: true, kind: 'repair', tileX, tileY, message: 'Repaired structure' };
      }

      // Remove own structure if player axes a stone_path or fence intentionally? Keep safe: only clear obstacles/wildlife
      return { performed: true, kind: 'defend', tileX, tileY };
    }
  }

  // Seed planting
  if (itemDef.category === 'seed' && itemDef.cropType) {
    if (!tile.tilled) {
      return { performed: false, kind: 'error', message: 'Till soil with Hoe first' };
    }
    if (tile.crop) {
      return { performed: false, kind: 'error', message: 'A crop is already planted here' };
    }
    if (state.player.stamina < 1) {
      return { performed: false, kind: 'error', message: 'Low Stamina — Rest at Farmhouse' };
    }
    if (!consumeInventoryItem(state, selectedId, 1)) {
      return { performed: false, kind: 'error', message: 'Out of seeds' };
    }
    state.player.stamina -= 1;
    state.stats.seedsPlanted = (state.stats.seedsPlanted ?? 0) + 1;
    tile.crop = {
      type: itemDef.cropType,
      growthDays: 0,
      daysUnwatered: 0,
      withered: false,
      floodedDays: 0,
    };
    return { performed: true, kind: 'plant', tileX, tileY };
  }

  // Placeable structures (Fence, Scarecrow, Lantern, Flowerbed, Cobble Path)
  if (itemDef.category === 'placeable' && itemDef.placeableType) {
    if (
      tile.terrain !== 'grass' &&
      tile.terrain !== 'dirt_path'
    ) {
      return { performed: false, kind: 'error', message: 'Cannot build on this terrain' };
    }
    if (tile.obstacle || tile.crop || tile.structure) {
      return { performed: false, kind: 'error', message: 'Tile is occupied' };
    }
    // Prevent blocking player's current tile with solid structures
    const ptx = Math.floor(state.player.x);
    const pty = Math.floor(state.player.y);
    const pType = itemDef.placeableType;
    if (ptx === tileX && pty === tileY && pType !== 'stone_path' && pType !== 'flowerbed') {
      return { performed: false, kind: 'error', message: 'Step off tile to build' };
    }
    if (!consumeInventoryItem(state, selectedId, 1)) {
      return { performed: false, kind: 'error', message: 'None left in inventory' };
    }
    tile.tilled = false;
    tile.watered = false;
    tile.structure = {
      type: pType,
      hp: PLACEABLE_MAX_HP[pType],
      maxHp: PLACEABLE_MAX_HP[pType],
    };
    state.stats.defensesPlaced = (state.stats.defensesPlaced ?? 0) + 1;
    if (pType === 'sprinkler') {
      state.stats.sprinklersPlaced = (state.stats.sprinklersPlaced ?? 0) + 1;
    } else if (pType === 'sensor') {
      state.stats.sensorsPlaced = (state.stats.sensorsPlaced ?? 0) + 1;
    }
    return { performed: true, kind: 'place', tileX, tileY, message: `Placed ${itemDef.name}` };
  }

  return { performed: false, kind: 'none' };
}

export function eatCrop(state: GameWorldState, id: ItemId): { ok: boolean; message: string } {
  const def = ITEMS[id];
  if (!def.edibleStamina && !def.edibleHealth) {
    return { ok: false, message: 'Cannot eat this item' };
  }
  if (!consumeInventoryItem(state, id, 1)) {
    return { ok: false, message: 'None left' };
  }
  state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + (def.edibleStamina ?? 0));
  state.player.health = Math.min(state.player.maxHealth, state.player.health + (def.edibleHealth ?? 0));
  return {
    ok: true,
    message: `Ate ${def.name} (+${def.edibleStamina ?? 0} Stam)`,
  };
}

export function rollWeather(season: Season, rng: () => number = Math.random): WeatherType {
  const r = rng();
  if (season === 'Spring') {
    if (r < 0.28) return 'Rainstorm';
    if (r < 0.42) return 'Drought';
    return 'Clear';
  }
  if (season === 'Summer') {
    if (r < 0.34) return 'Drought';
    if (r < 0.50) return 'Rainstorm';
    return 'Clear';
  }
  if (season === 'Autumn') {
    if (r < 0.32) return 'Rainstorm';
    if (r < 0.46) return 'Drought';
    return 'Clear';
  }
  // Winter
  if (r < 0.38) return 'Rainstorm';
  if (r < 0.50) return 'Drought';
  return 'Clear';
}

export function triggerMiddayDrought(state: GameWorldState): number {
  if (state.weather !== 'Drought' || state.droughtMiddayTriggered) return 0;
  state.droughtMiddayTriggered = true;
  let dried = 0;
  for (const tile of state.tiles) {
    if (tile.tilled && tile.watered) {
      if (isCoveredBySensor(state, tile.x, tile.y)) continue;
      tile.watered = false;
      tile.droughtDriedToday = true;
      dried += 1;
    }
  }
  return dried;
}

export function advanceDay(
  state: GameWorldState,
  rng: () => number = Math.random
): DaySummary {
  const prevWeather = state.weather;
  const prevSeason = getSeason(state.seasonIndex);

  let cropsGrown = 0;
  let cropsWithered = 0;
  let cropsFlooded = 0;
  let wildlifeDamage = 0;

  // Resolve any active nocturnal wildlife before morning
  for (const w of state.wildlife) {
    if (w.state === 'ko' || w.state === 'fleeing') continue;
    // Unfended wildlife may nibble 1 unprotected crop overnight
    for (const tile of state.tiles) {
      if (tile.crop && !tile.crop.withered && !isProtectedByScarecrow(state, tile.x, tile.y)) {
        tile.crop = null;
        wildlifeDamage += 1;
        break;
      }
    }
  }

  for (const tile of state.tiles) {
    if (!tile.crop) continue;
    const crop = tile.crop;
    if (crop.withered) continue;

    const def = CROPS[crop.type];

    // Rainstorm auto-waters, but completely unprotected crops risk flood/frost stress
    const wasWatered = tile.watered || prevWeather === 'Rainstorm';

    if (prevWeather === 'Rainstorm' && !isProtectedFromFlood(state, tile.x, tile.y)) {
      if (rng() < (prevSeason === 'Winter' ? 0.35 : 0.20)) {
        crop.floodedDays += 1;
        if (crop.floodedDays >= 2) {
          crop.withered = true;
          cropsFlooded += 1;
          cropsWithered += 1;
          tile.watered = false;
          tile.droughtDriedToday = false;
          continue;
        }
      }
    }

    if (wasWatered) {
      crop.daysUnwatered = 0;
      const isFavSeason = def.favoriteSeasons.includes(prevSeason);
      // In winter, non-favorite crops grow half as likely unless warmed by lantern
      const warmed = isProtectedFromFlood(state, tile.x, tile.y);
      let grewToday = false;
      if (prevSeason === 'Winter' && !isFavSeason && !warmed) {
        if (rng() < 0.5 && crop.growthDays < def.daysToGrow) {
          crop.growthDays += 1;
          cropsGrown += 1;
          grewToday = true;
        }
      } else if (crop.growthDays < def.daysToGrow) {
        crop.growthDays += 1;
        cropsGrown += 1;
        grewToday = true;
      }
      // Organic Compost Bin accelerates nearby crop growth (+40% chance of extra growth day)
      if (
        grewToday &&
        crop.growthDays < def.daysToGrow &&
        isCoveredByCompost(state, tile.x, tile.y) &&
        rng() < 0.4
      ) {
        crop.growthDays += 1;
      }
    } else {
      // Un-watered crops wither after 2 days
      crop.daysUnwatered += 1;
      if (crop.daysUnwatered >= 2) {
        crop.withered = true;
        cropsWithered += 1;
      }
    }

    // Overnight evaporation
    tile.watered = false;
    tile.droughtDriedToday = false;
  }

  // Advance day & season
  state.day += 1;
  state.stats.daysSurvived = state.day;
  const newSeasonIndex = Math.floor((state.day - 1) / DAYS_PER_SEASON);
  state.seasonIndex = newSeasonIndex;
  const newSeason = getSeason(newSeasonIndex);

  // Roll new weather
  const nextWeather = rollWeather(newSeason, rng);
  state.weather = nextWeather;
  state.droughtMiddayTriggered = false;
  state.timeMinutes = DAY_START_MINUTES;
  state.wildlife = [];

  // Rainstorm & Solar Auto-Sprinklers water tilled soil for the new morning
  let sprinklerWatered = 0;
  for (const tile of state.tiles) {
    if (!tile.tilled) continue;
    if (nextWeather === 'Rainstorm') {
      tile.watered = true;
    } else if (isCoveredBySprinkler(state, tile.x, tile.y)) {
      tile.watered = true;
      sprinklerWatered += 1;
    }
  }

  // Farmyard chickens lay fresh morning eggs
  const chickens = state.chickens ?? [];
  const eggsCollected = chickens.length;
  if (eggsCollected > 0) {
    addInventoryItem(state, 'egg', eggsCollected);
    state.stats.eggsCollected = (state.stats.eggsCollected ?? 0) + eggsCollected;
  }

  // Restore player stamina & partial health
  state.player.stamina = state.player.maxStamina;
  state.player.health = Math.min(state.player.maxHealth, state.player.health + 35);

  const notes: string[] = [];
  if (cropsGrown > 0) notes.push(`${cropsGrown} crop${cropsGrown > 1 ? 's' : ''} grew`);
  if (sprinklerWatered > 0) notes.push(`${sprinklerWatered} sprinkler-watered`);
  if (eggsCollected > 0) notes.push(`+${eggsCollected} fresh egg${eggsCollected > 1 ? 's' : ''}`);
  if (cropsWithered > 0) notes.push(`${cropsWithered} withered`);
  if (wildlifeDamage > 0) notes.push(`${wildlifeDamage} lost to wildlife`);
  if (notes.length === 0) notes.push(`A fresh ${newSeason} morning begins`);

  const summary: DaySummary = {
    day: state.day,
    season: newSeason,
    weather: nextWeather,
    cropsGrown,
    cropsWithered,
    cropsFlooded,
    wildlifeDamage,
    eggsCollected,
    sprinklerWatered,
    message: notes.join(' · '),
  };
  state.lastSummary = summary;
  return summary;
}

export function buyShopItem(
  state: GameWorldState,
  itemId: ItemId,
  quantity = 1
): { ok: boolean; message: string } {
  const def = ITEMS[itemId];
  if (!def.buyPrice) return { ok: false, message: 'Item not for sale' };
  const totalCost = def.buyPrice * quantity;
  if (state.player.gold < totalCost) {
    return { ok: false, message: 'Not enough Gold' };
  }
  state.player.gold -= totalCost;
  addInventoryItem(state, itemId, quantity);
  return { ok: true, message: `Bought ${quantity}x ${def.name}` };
}

export function sellCropItem(
  state: GameWorldState,
  itemId: ItemId,
  quantity = 1
): { ok: boolean; message: string; earned: number } {
  const def = ITEMS[itemId];
  if (!def.sellPrice) return { ok: false, message: 'Cannot sell this item', earned: 0 };
  const owned = state.inventory[itemId] ?? 0;
  const sellQty = Math.min(owned, quantity);
  if (sellQty <= 0) return { ok: false, message: 'None to sell', earned: 0 };

  let unitPrice = def.sellPrice;
  const season = getSeason(state.seasonIndex);
  if (def.cropType && CROPS[def.cropType].favoriteSeasons.includes(season)) {
    unitPrice = Math.round(unitPrice * 1.25); // 25% seasonal freshness bonus
  }

  const earned = unitPrice * sellQty;
  consumeInventoryItem(state, itemId, sellQty);
  state.player.gold += earned;
  state.stats.totalGoldEarned += earned;
  return { ok: true, message: `Sold ${sellQty}x ${def.name} (+${earned}g)`, earned };
}

export function upgradeTool(
  state: GameWorldState,
  tool: ToolType
): { ok: boolean; message: string } {
  const currentLvl =
    tool === 'hoe'
      ? state.upgrades.hoeLevel
      : tool === 'watering_can'
      ? state.upgrades.canLevel
      : state.upgrades.axeLevel;

  if (currentLvl >= 3) {
    return { ok: false, message: 'Already at max Iron tier' };
  }
  const cost = currentLvl === 1 ? 120 : 260;
  if (state.player.gold < cost) {
    return { ok: false, message: `Need ${cost}g to upgrade` };
  }
  state.player.gold -= cost;
  if (tool === 'hoe') state.upgrades.hoeLevel += 1;
  else if (tool === 'watering_can') {
    state.upgrades.canLevel += 1;
    state.player.maxWaterLevel = state.upgrades.canLevel === 2 ? 20 : 30;
    state.player.waterLevel = state.player.maxWaterLevel;
  } else {
    state.upgrades.axeLevel += 1;
  }
  const tierName = currentLvl === 1 ? 'Copper' : 'Master';
  return { ok: true, message: `Upgraded to ${tierName} tier!` };
}

export function craftItem(
  state: GameWorldState,
  recipeId: PlaceableType
): { ok: boolean; message: string } {
  const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { ok: false, message: 'Unknown recipe' };

  for (const [key, req] of Object.entries(recipe.ingredients)) {
    if (!req) continue;
    if (key === 'gold') {
      if (state.player.gold < req) return { ok: false, message: 'Not enough Gold' };
    } else {
      const owned = state.inventory[key as ItemId] ?? 0;
      if (owned < req) return { ok: false, message: `Need ${req} ${ITEMS[key as ItemId].name}` };
    }
  }

  for (const [key, req] of Object.entries(recipe.ingredients)) {
    if (!req) continue;
    if (key === 'gold') state.player.gold -= req;
    else consumeInventoryItem(state, key as ItemId, req);
  }

  addInventoryItem(state, recipe.id, recipe.outputCount);
  return { ok: true, message: `Crafted ${recipe.name}` };
}

export function computeFarmRestorationPercent(state: GameWorldState): number {
  let farmPlotTiles = 0;
  let clearedFarmTiles = 0;
  let cultivatedTiles = 0;
  let defenseDecorCount = 0;

  for (const t of state.tiles) {
    if (t.tillable) {
      farmPlotTiles += 1;
      if (!t.obstacle) clearedFarmTiles += 1;
      if (t.tilled || t.structure) cultivatedTiles += 1;
    }
    if (t.structure) {
      defenseDecorCount += 1;
    }
  }

  const clearRatio = farmPlotTiles > 0 ? clearedFarmTiles / farmPlotTiles : 1; // 45% weight
  const cultRatio = Math.min(1, cultivatedTiles / 28); // 30% weight (28+ cultivated tiles = full)
  const buildRatio = Math.min(1, defenseDecorCount / 14); // 25% weight (14+ fences/scarecrows/lanterns/decor)

  const score = clearRatio * 45 + cultRatio * 30 + buildRatio * 25;
  return Math.min(100, Math.round(score));
}

export function buyFarmChicken(
  state: GameWorldState
): { ok: boolean; message: string } {
  if (!state.chickens) state.chickens = [];
  if (state.chickens.length >= MAX_CHICKENS) {
    return { ok: false, message: 'Coop is full (Max 3)' };
  }
  if (state.player.gold < CHICKEN_PRICE) {
    return { ok: false, message: 'Not enough Gold' };
  }
  state.player.gold -= CHICKEN_PRICE;
  const idx = state.chickens.length;
  const chicken: FarmChicken = {
    id: idx + 1,
    x: 9.2 + idx * 1.1,
    y: 7.4,
    vx: 0.4,
    vy: 0,
    facingX: 1,
    hopPhase: idx * 1.3,
    moveTimer: 1.5,
  };
  state.chickens.push(chicken);
  return { ok: true, message: 'Adopted Farm Chicken!' };
}

export function stepChickens(
  state: GameWorldState,
  dt: number,
  rng: () => number = Math.random
): void {
  const chickens = state.chickens;
  if (!chickens || chickens.length === 0) return;

  for (const c of chickens) {
    c.moveTimer -= dt;
    if (c.moveTimer <= 0) {
      c.moveTimer = 1.6 + rng() * 2.4;
      if (rng() < 0.35) {
        c.vx = 0;
        c.vy = 0;
      } else {
        const angle = rng() * Math.PI * 2;
        const speed = 0.65 + rng() * 0.45;
        c.vx = Math.cos(angle) * speed;
        c.vy = Math.sin(angle) * speed;
        if (Math.abs(c.vx) > 0.05) c.facingX = c.vx >= 0 ? 1 : -1;
      }
    }

    if (c.vx !== 0 || c.vy !== 0) {
      const nx = Math.max(7.2, Math.min(13.5, c.x + c.vx * dt));
      const ny = Math.max(6.8, Math.min(8.6, c.y + c.vy * dt));
      if (isTileWalkable(state, Math.floor(nx), Math.floor(ny))) {
        c.x = nx;
        c.y = ny;
      } else {
        c.vx = -c.vx;
        c.vy = -c.vy;
        c.facingX = c.vx >= 0 ? 1 : -1;
      }
      c.hopPhase += dt * 8;
    }
  }
}

export function getMissionProgress(state: GameWorldState, id: MissionId): number {
  const stats = state.stats;
  switch (id) {
    case 'first_sow':
      return stats.seedsPlanted ?? 0;
    case 'eco_water':
      return stats.cropsWatered ?? 0;
    case 'land_steward':
      return stats.obstaclesCleared ?? 0;
    case 'first_harvest':
      return stats.cropsHarvested ?? 0;
    case 'night_guard':
      return stats.defensesPlaced ?? 0;
    case 'smart_sprinkler':
      return stats.sprinklersPlaced ?? 0;
    case 'soil_sensor':
      return stats.sensorsPlaced ?? 0;
    case 'happy_flock':
      return stats.eggsCollected ?? 0;
    case 'wild_defender':
      return stats.wildlifeRepelled ?? 0;
    case 'market_trader':
      return stats.totalGoldEarned ?? 0;
    case 'climate_survivor':
      return stats.daysSurvived ?? 1;
    case 'ecogrow_master':
      return computeFarmRestorationPercent(state);
    default:
      return 0;
  }
}

export function getClaimableMissionsCount(state: GameWorldState): number {
  const claimed = new Set(state.claimedMissions ?? []);
  let count = 0;
  for (const m of MISSIONS) {
    if (!claimed.has(m.id) && getMissionProgress(state, m.id) >= m.target) {
      count += 1;
    }
  }
  return count;
}

export function claimMissionReward(
  state: GameWorldState,
  id: MissionId
): { ok: boolean; goldEarned: number } {
  const def = MISSIONS.find((m) => m.id === id);
  if (!def) return { ok: false, goldEarned: 0 };
  if (!state.claimedMissions) state.claimedMissions = [];
  if (state.claimedMissions.includes(id)) return { ok: false, goldEarned: 0 };
  const progress = getMissionProgress(state, id);
  if (progress < def.target) return { ok: false, goldEarned: 0 };

  state.claimedMissions.push(id);
  if (def.rewardGold > 0) {
    state.player.gold += def.rewardGold;
    state.stats.totalGoldEarned += def.rewardGold;
  }
  if (def.rewardItem) {
    addInventoryItem(state, def.rewardItem.id, def.rewardItem.qty);
  }
  if (def.rewardStamina) {
    state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + def.rewardStamina);
  }
  return { ok: true, goldEarned: def.rewardGold };
}

let nextWildlifeId = 1;

export function spawnNightWildlife(
  state: GameWorldState,
  rng: () => number = Math.random
): WildlifeEntity | null {
  if (state.wildlife.length >= 4 + Math.floor(state.day / 4)) return null;
  const kind = rng() < 0.62 ? 'rabbit' : 'boar';

  // Pick a random edge inside forest border
  const edge = Math.floor(rng() * 4);
  let x = 2.5;
  let y = 10.5;
  if (edge === 0) {
    x = 2 + Math.floor(rng() * (state.width - 4)) + 0.5;
    y = 1.5;
  } else if (edge === 1) {
    x = 2 + Math.floor(rng() * (state.width - 4)) + 0.5;
    y = state.height - 2.5;
  } else if (edge === 2) {
    x = 1.5;
    y = 8 + Math.floor(rng() * (state.height - 10)) + 0.5;
  } else {
    x = state.width - 2.5;
    y = 8 + Math.floor(rng() * (state.height - 10)) + 0.5;
  }

  const entity: WildlifeEntity = {
    id: nextWildlifeId++,
    kind,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: kind === 'boar' ? 3 : 1,
    maxHp: kind === 'boar' ? 3 : 1,
    state: 'approaching',
    stateTimer: 0,
    targetTileX: null,
    targetTileY: null,
    facingX: state.player.x > x ? 1 : -1,
    hitFlashTimer: 0,
    hopPhase: rng() * Math.PI * 2,
  };
  state.wildlife.push(entity);
  return entity;
}

export function stepWildlife(
  state: GameWorldState,
  dt: number,
  onCropEaten?: (tx: number, ty: number) => void,
  onPlayerHurt?: (dmg: number) => void
): void {
  for (let i = state.wildlife.length - 1; i >= 0; i--) {
    const w = state.wildlife[i];
    if (w.hitFlashTimer > 0) w.hitFlashTimer = Math.max(0, w.hitFlashTimer - dt);

    if (w.state === 'ko') {
      w.stateTimer -= dt;
      if (w.stateTimer <= 0) {
        state.wildlife.splice(i, 1);
      }
      continue;
    }

    if (w.state === 'fleeing') {
      w.stateTimer -= dt;
      const dx = w.x - state.player.x;
      const dy = w.y - state.player.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = w.kind === 'rabbit' ? 3.8 : 2.9;
      w.x += (dx / len) * speed * dt;
      w.y += (dy / len) * speed * dt;
      w.hopPhase += dt * 14;
      w.facingX = dx >= 0 ? 1 : -1;
      if (
        w.stateTimer <= 0 ||
        w.x < 1.2 ||
        w.y < 1.2 ||
        w.x > state.width - 1.2 ||
        w.y > state.height - 1.2
      ) {
        state.wildlife.splice(i, 1);
      }
      continue;
    }

    // Repelled by Scarecrow
    if (isProtectedByScarecrow(state, Math.floor(w.x), Math.floor(w.y))) {
      if (w.kind === 'rabbit') {
        w.state = 'fleeing';
        w.stateTimer = 1.4;
        continue;
      }
    }

    // Boar checks proximity to player for windup -> charge!
    const distToPlayer = Math.hypot(state.player.x - w.x, state.player.y - w.y);
    if (w.kind === 'boar') {
      if (w.state === 'windup') {
        w.stateTimer -= dt;
        if (w.stateTimer <= 0) {
          w.state = 'charging';
          w.stateTimer = 0.55;
          const dx = state.player.x - w.x;
          const dy = state.player.y - w.y;
          const len = Math.hypot(dx, dy) || 1;
          w.vx = (dx / len) * 5.6;
          w.vy = (dy / len) * 5.6;
        }
        continue;
      }
      if (w.state === 'charging') {
        w.stateTimer -= dt;
        const nx = w.x + w.vx * dt;
        const ny = w.y + w.vy * dt;
        const ntx = Math.floor(nx);
        const nty = Math.floor(ny);
        const targetTile = getTile(state, ntx, nty);
        if (targetTile?.structure && targetTile.structure.type === 'fence') {
          targetTile.structure.hp -= 1;
          if (targetTile.structure.hp <= 0) targetTile.structure = null;
          w.state = 'approaching';
          w.stateTimer = 0;
          continue;
        }
        if (isTileWalkable(state, ntx, nty)) {
          w.x = nx;
          w.y = ny;
        }
        if (Math.hypot(state.player.x - w.x, state.player.y - w.y) < 0.72) {
          state.player.health = Math.max(0, state.player.health - 12);
          state.player.hitFlashTimer = 0.25;
          onPlayerHurt?.(12);
          w.state = 'fleeing';
          w.stateTimer = 0.9;
          continue;
        }
        if (w.stateTimer <= 0) {
          w.state = 'approaching';
        }
        continue;
      }
      if (distToPlayer < 3.6) {
        w.state = 'windup';
        w.stateTimer = 0.65; // clear 0.65s windup telegraph
        w.facingX = state.player.x >= w.x ? 1 : -1;
        continue;
      }
    } else if (distToPlayer < 1.6) {
      // Rabbits spook if farmer gets very close
      w.state = 'fleeing';
      w.stateTimer = 1.2;
      continue;
    }

    // Find nearest unprotected crop
    let bestTile: FarmTile | null = null;
    let bestDist = Infinity;
    for (const t of state.tiles) {
      if (!t.crop || t.crop.withered) continue;
      if (w.kind === 'rabbit' && isProtectedByScarecrow(state, t.x, t.y)) continue;
      const d = Math.hypot(t.x + 0.5 - w.x, t.y + 0.5 - w.y);
      if (d < bestDist) {
        bestDist = d;
        bestTile = t;
      }
    }

    if (!bestTile) {
      // Wander gently or leave if dawn approaches
      if (state.timeMinutes < NIGHT_START_MINUTES) {
        w.state = 'fleeing';
        w.stateTimer = 1.0;
      }
      continue;
    }

    const tx = bestTile.x + 0.5;
    const ty = bestTile.y + 0.5;
    const dx = tx - w.x;
    const dy = ty - w.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.45) {
      w.state = 'nibbling';
      w.stateTimer += dt;
      if (w.stateTimer >= 1.6) {
        bestTile.crop = null;
        w.stateTimer = 0;
        w.state = 'approaching';
        onCropEaten?.(bestTile.x, bestTile.y);
      }
    } else {
      w.state = 'approaching';
      const speed = w.kind === 'rabbit' ? 2.1 : 1.45;
      const stepX = (dx / dist) * speed * dt;
      const stepY = (dy / dist) * speed * dt;
      const nextX = w.x + stepX;
      const nextY = w.y + stepY;
      const tileAtNext = getTile(state, Math.floor(nextX), Math.floor(nextY));

      if (tileAtNext?.structure && tileAtNext.structure.type === 'fence') {
        if (w.kind === 'boar') {
          w.stateTimer += dt;
          if (w.stateTimer >= 1.8) {
            w.stateTimer = 0;
            tileAtNext.structure.hp -= 1;
            if (tileAtNext.structure.hp <= 0) {
              tileAtNext.structure = null;
            }
          }
        } else {
          // Rabbit blocked by fence: try sidestepping
          const altTile = getTile(state, Math.floor(w.x), Math.floor(nextY));
          if (altTile && isTileWalkable(state, altTile.x, altTile.y)) {
            w.y = nextY;
          }
        }
      } else if (tileAtNext && isTileWalkable(state, tileAtNext.x, tileAtNext.y)) {
        w.x = nextX;
        w.y = nextY;
      } else {
        // Slide along X or Y
        if (isTileWalkable(state, Math.floor(nextX), Math.floor(w.y))) w.x = nextX;
        else if (isTileWalkable(state, Math.floor(w.x), Math.floor(nextY))) w.y = nextY;
      }
      w.facingX = dx >= 0 ? 1 : -1;
      w.hopPhase += dt * 10;
    }
  }
}
