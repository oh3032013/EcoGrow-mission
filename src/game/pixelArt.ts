import {
  COMPOST_RADIUS,
  CROPS,
  FARMHOUSE_POS,
  NIGHT_START_MINUTES,
  SCARECROW_RADIUS,
  SENSOR_RADIUS,
  SHIPPING_BIN_POS,
  SHOP_STALL_POS,
  SPRINKLER_RADIUS,
  SUNSET_START_MINUTES,
  TILE_SIZE,
  WELL_POS,
} from './constants';
import { getSeason, getTile, getTimePhase } from './rules';
import type {
  FarmChicken,
  FarmTile,
  FloatingText,
  GameWorldState,
  Particle,
  Season,
  WildlifeEntity,
} from './types';

interface SeasonPalette {
  grassA: string;
  grassB: string;
  grassTuft: string;
  treeDark: string;
  treeMid: string;
  treeLight: string;
  dirt: string;
  dirtSpeck: string;
  roof: string;
  roofTrim: string;
}

const SEASON_PALETTES: Record<Season, SeasonPalette> = {
  Spring: {
    grassA: '#68a347',
    grassB: '#5d963e',
    grassTuft: '#84be59',
    treeDark: '#264d29',
    treeMid: '#376e37',
    treeLight: '#569448',
    dirt: '#b88b58',
    dirtSpeck: '#9c7143',
    roof: '#b34b39',
    roofTrim: '#d9765f',
  },
  Summer: {
    grassA: '#5c9c3d',
    grassB: '#518c34',
    grassTuft: '#7bb850',
    treeDark: '#1f4524',
    treeMid: '#2e6331',
    treeLight: '#498740',
    dirt: '#c2945e',
    dirtSpeck: '#a37644',
    roof: '#a64332',
    roofTrim: '#cf6b53',
  },
  Autumn: {
    grassA: '#9e8b3e',
    grassB: '#8e7b34',
    grassTuft: '#bf9d45',
    treeDark: '#4f2b1c',
    treeMid: '#8a4322',
    treeLight: '#c46a29',
    dirt: '#a87d4f',
    dirtSpeck: '#8c643b',
    roof: '#8f412e',
    roofTrim: '#bf6545',
  },
  Winter: {
    grassA: '#bfd1cb',
    grassB: '#b0c4be',
    grassTuft: '#dce8e4',
    treeDark: '#243c3d',
    treeMid: '#365859',
    treeLight: '#87a8a6',
    dirt: '#988878',
    dirtSpeck: '#7d6e60',
    roof: '#708796',
    roofTrim: '#eef5f7',
  },
};

// Pre-allocated offscreen light canvas for crisp Day/Sunset/Night lighting
let lightCanvas: HTMLCanvasElement | null = null;
let terrainCacheCanvas: HTMLCanvasElement | null = null;
let terrainCacheSeason: Season | null = null;

function getLightCtx(w: number, h: number): CanvasRenderingContext2D | null {
  if (!lightCanvas) {
    lightCanvas = document.createElement('canvas');
  }
  if (lightCanvas.width !== w || lightCanvas.height !== h) {
    lightCanvas.width = w;
    lightCanvas.height = h;
  }
  return lightCanvas.getContext('2d');
}

function getCachedTerrainCanvas(state: GameWorldState, season: Season, pal: SeasonPalette): HTMLCanvasElement {
  const totalW = state.width * TILE_SIZE;
  const totalH = state.height * TILE_SIZE;
  if (!terrainCacheCanvas) {
    terrainCacheCanvas = document.createElement('canvas');
  }
  if (terrainCacheCanvas.width !== totalW || terrainCacheCanvas.height !== totalH || terrainCacheSeason !== season) {
    terrainCacheCanvas.width = totalW;
    terrainCacheCanvas.height = totalH;
    terrainCacheSeason = season;
    const tCtx = terrainCacheCanvas.getContext('2d');
    if (tCtx) {
      tCtx.imageSmoothingEnabled = false;
      for (let y = 0; y < state.height; y++) {
        for (let x = 0; x < state.width; x++) {
          const tile = state.tiles[y * state.width + x];
          drawStaticTerrainTile(tCtx, tile, x * TILE_SIZE, y * TILE_SIZE, pal, season);
        }
      }
    }
  }
  return terrainCacheCanvas;
}

export interface CameraState {
  x: number; // world pixel center
  y: number;
  zoom: number;
  shakeX: number;
  shakeY: number;
}

export function renderGameWorld(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  state: GameWorldState,
  camera: CameraState,
  particles: Particle[],
  floatingTexts: FloatingText[],
  hoverTile: { x: number; y: number } | null,
  elapsedSec: number,
  isTitleBackdrop: boolean
): void {
  const season = getSeason(state.seasonIndex);
  const pal = SEASON_PALETTES[season];
  const timePhase = getTimePhase(state.timeMinutes);

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#182419';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  const viewCenterX = canvasWidth / 2 + camera.shakeX;
  const viewCenterY = canvasHeight / 2 + camera.shakeY;
  ctx.translate(Math.round(viewCenterX), Math.round(viewCenterY));
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  // Compute visible tile bounds for culling
  const halfW = canvasWidth / 2 / camera.zoom + TILE_SIZE;
  const halfH = canvasHeight / 2 / camera.zoom + TILE_SIZE;
  const minTX = Math.max(0, Math.floor((camera.x - halfW) / TILE_SIZE));
  const maxTX = Math.min(state.width - 1, Math.ceil((camera.x + halfW) / TILE_SIZE));
  const minTY = Math.max(0, Math.floor((camera.y - halfH) / TILE_SIZE));
  const maxTY = Math.min(state.height - 1, Math.ceil((camera.y + halfH) / TILE_SIZE));

  // 1. Draw Cached Terrain Layer in a single blit + animated water/tilled soil
  const terrainImg = getCachedTerrainCanvas(state, season, pal);
  ctx.drawImage(terrainImg, 0, 0);

  for (let y = minTY; y <= maxTY; y++) {
    for (let x = minTX; x <= maxTX; x++) {
      const tile = state.tiles[y * state.width + x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      if (tile.terrain === 'water') {
        drawAnimatedWaterTile(ctx, tile, px, py, elapsedSec);
      } else if (tile.tilled) {
        drawTilledSoil(ctx, tile, px, py);
      }
    }
  }

  // 2. Draw Subtle Plot Boundary Markers (helps player see farmable central plot)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 244, 214, 0.14)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(5 * TILE_SIZE + 1, 9 * TILE_SIZE + 1, 16 * TILE_SIZE - 2, 9 * TILE_SIZE - 2);
  ctx.restore();

  // 3. Hover / Facing Tile Highlight & Scarecrow Ward Preview
  if (!isTitleBackdrop) {
    const targetTile = hoverTile ?? {
      x: Math.floor(
        state.player.x +
          (Math.abs(state.player.facingX) >= Math.abs(state.player.facingY)
            ? Math.sign(state.player.facingX)
            : 0) *
            0.85
      ),
      y: Math.floor(
        state.player.y +
          (Math.abs(state.player.facingX) >= Math.abs(state.player.facingY)
            ? 0
            : Math.sign(state.player.facingY || 1)) *
            0.85
      ),
    };
    const ht = getTile(state, targetTile.x, targetTile.y);
    if (ht) {
      const dist = Math.hypot(
        state.player.x - (targetTile.x + 0.5),
        state.player.y - (targetTile.y + 0.5)
      );
      const inReach = dist <= 2.25;
      const hx = targetTile.x * TILE_SIZE;
      const hy = targetTile.y * TILE_SIZE;

      ctx.save();
      ctx.strokeStyle = hoverTile
        ? inReach
          ? 'rgba(255, 245, 190, 0.85)'
          : 'rgba(255, 130, 110, 0.55)'
        : 'rgba(255, 245, 190, 0.42)';
      ctx.lineWidth = hoverTile ? 2 : 1.5;
      ctx.strokeRect(hx + 1, hy + 1, TILE_SIZE - 2, TILE_SIZE - 2);

      const selectedId = state.hotbar[state.player.selectedHotbarIndex];
      if (
        selectedId === 'scarecrow' ||
        selectedId === 'sprinkler' ||
        selectedId === 'sensor' ||
        selectedId === 'compost'
      ) {
        const radiusTiles =
          selectedId === 'scarecrow'
            ? SCARECROW_RADIUS
            : selectedId === 'sprinkler'
            ? SPRINKLER_RADIUS
            : selectedId === 'sensor'
            ? SENSOR_RADIUS
            : COMPOST_RADIUS;
        const fillStyle =
          selectedId === 'sprinkler'
            ? 'rgba(92, 194, 242, 0.14)'
            : selectedId === 'sensor'
            ? 'rgba(72, 224, 138, 0.12)'
            : selectedId === 'compost'
            ? 'rgba(136, 209, 75, 0.13)'
            : 'rgba(245, 210, 110, 0.12)';
        const strokeStyle =
          selectedId === 'sprinkler'
            ? 'rgba(92, 194, 242, 0.6)'
            : selectedId === 'sensor'
            ? 'rgba(72, 224, 138, 0.58)'
            : selectedId === 'compost'
            ? 'rgba(136, 209, 75, 0.58)'
            : 'rgba(245, 210, 110, 0.55)';
        ctx.beginPath();
        ctx.arc(hx + TILE_SIZE / 2, hy + TILE_SIZE / 2, radiusTiles * TILE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // 4. Draw Crops, Obstacles, Placeables, Buildings, Player, Wildlife sorted by Y depth
  type DrawItem = { sortY: number; draw: () => void };
  const drawList: DrawItem[] = [];

  // Buildings
  drawList.push({
    sortY: (FARMHOUSE_POS.y + FARMHOUSE_POS.h) * TILE_SIZE,
    draw: () => drawFarmhouse(ctx, pal, timePhase, elapsedSec),
  });
  drawList.push({
    sortY: (SHOP_STALL_POS.y + SHOP_STALL_POS.h) * TILE_SIZE,
    draw: () => drawShopStall(ctx, timePhase, elapsedSec),
  });
  drawList.push({
    sortY: (WELL_POS.y + 1) * TILE_SIZE,
    draw: () => drawStoneWell(ctx, elapsedSec),
  });
  drawList.push({
    sortY: (SHIPPING_BIN_POS.y + 1) * TILE_SIZE,
    draw: () => drawShippingBin(ctx),
  });

  // Tile contents (culled to camera viewport)
  for (let y = minTY; y <= maxTY; y++) {
    for (let x = minTX; x <= maxTX; x++) {
      const tile = state.tiles[y * state.width + x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      if (tile.terrain === 'forest_edge') {
        drawList.push({
          sortY: py + TILE_SIZE,
          draw: () => drawForestTree(ctx, px, py, x, y, pal, elapsedSec),
        });
      }
      if (tile.obstacle) {
        drawList.push({
          sortY: py + TILE_SIZE - 2,
          draw: () => drawObstacle(ctx, tile, px, py, elapsedSec),
        });
      }
      if (tile.crop) {
        drawList.push({
          sortY: py + TILE_SIZE - 4,
          draw: () => drawCrop(ctx, tile, px, py, elapsedSec),
        });
      }
      if (tile.structure) {
        const isGround = tile.structure.type === 'stone_path';
        drawList.push({
          sortY: isGround ? py + 2 : py + TILE_SIZE - 1,
          draw: () => drawStructure(ctx, state, tile, px, py, timePhase, elapsedSec),
        });
      }
    }
  }

  // Player
  if (!isTitleBackdrop) {
    drawList.push({
      sortY: state.player.y * TILE_SIZE + 4,
      draw: () => drawFarmer(ctx, state, elapsedSec),
    });
  }

  // Farmyard Chickens
  for (const c of state.chickens ?? []) {
    drawList.push({
      sortY: c.y * TILE_SIZE + 3,
      draw: () => drawChicken(ctx, c, elapsedSec),
    });
  }

  // Wildlife
  for (const w of state.wildlife) {
    drawList.push({
      sortY: w.y * TILE_SIZE + 4,
      draw: () => drawWildlife(ctx, w, elapsedSec),
    });
  }

  drawList.sort((a, b) => a.sortY - b.sortY);
  for (const item of drawList) {
    item.draw();
  }

  // 5. Particles
  for (const p of particles) {
    if (!p.active) continue;
    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // 6. Floating Texts
  for (const ft of floatingTexts) {
    const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 12px "Pixelify Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1b120b';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();

  // 7. Weather Screen Effects (Rain streaks / Drought shimmer)
  if (state.weather === 'Rainstorm') {
    drawRainOverlay(ctx, canvasWidth, canvasHeight, elapsedSec);
  } else if (state.weather === 'Drought') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 190, 85, 0.09)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 8. Dynamic Day / Sunset / Night Lighting Overlay
  drawLightingOverlay(ctx, canvasWidth, canvasHeight, state, camera, isTitleBackdrop, elapsedSec);
}

function drawStaticTerrainTile(
  ctx: CanvasRenderingContext2D,
  tile: FarmTile,
  px: number,
  py: number,
  pal: SeasonPalette,
  season: Season
): void {
  const checker = (tile.x + tile.y) % 2 === 0;
  if (tile.terrain === 'water') {
    ctx.fillStyle = '#38769c';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#4c90b8';
    ctx.fillRect(px + 2, py + 4, TILE_SIZE - 4, TILE_SIZE - 8);
    return;
  }

  if (tile.terrain === 'dirt_path') {
    ctx.fillStyle = pal.dirt;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = pal.dirtSpeck;
    if ((tile.x * 7 + tile.y * 13) % 3 === 0) {
      ctx.fillRect(px + 6, py + 8, 4, 2);
      ctx.fillRect(px + 20, py + 22, 4, 2);
    }
    return;
  }

  // Grass base
  ctx.fillStyle = checker ? pal.grassA : pal.grassB;
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  // Grass tufts & seasonal blossoms
  const hash = (tile.x * 37 + tile.y * 17) % 11;
  if (hash < 3) {
    ctx.fillStyle = pal.grassTuft;
    ctx.fillRect(px + 6 + hash * 4, py + 10, 2, 4);
    ctx.fillRect(px + 10 + hash * 4, py + 12, 2, 3);
    if (season === 'Spring' && hash === 1) {
      ctx.fillStyle = '#f5d76e';
      ctx.fillRect(px + 20, py + 20, 3, 3);
    }
  }
}

function drawAnimatedWaterTile(
  ctx: CanvasRenderingContext2D,
  tile: FarmTile,
  px: number,
  py: number,
  elapsedSec: number
): void {
  if (Math.sin(elapsedSec * 2.5 + tile.x * 0.8 + tile.y * 0.6) > 0.25) {
    ctx.fillStyle = '#92d1eb';
    ctx.fillRect(px + 6, py + 10, 10, 2);
    ctx.fillRect(px + 16, py + 22, 8, 2);
  }
}

function drawTilledSoil(
  ctx: CanvasRenderingContext2D,
  tile: FarmTile,
  px: number,
  py: number
): void {
  const soilColor = tile.watered ? '#4f3322' : '#85583a';
  const furrowColor = tile.watered ? '#3b2416' : '#6b4329';
  ctx.fillStyle = soilColor;
  ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.fillStyle = furrowColor;
  ctx.fillRect(px + 4, py + 8, TILE_SIZE - 8, 3);
  ctx.fillRect(px + 4, py + 16, TILE_SIZE - 8, 3);
  ctx.fillRect(px + 4, py + 24, TILE_SIZE - 8, 3);

  if (tile.droughtDriedToday && !tile.watered) {
    ctx.fillStyle = '#c4986e';
    ctx.fillRect(px + 8, py + 12, 6, 2);
    ctx.fillRect(px + 18, py + 20, 5, 2);
  }
}

function drawForestTree(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  tx: number,
  ty: number,
  pal: SeasonPalette,
  elapsedSec: number
): void {
  const sway = Math.round(Math.sin(elapsedSec * 1.4 + tx * 0.7 + ty * 0.5) * 1);
  // Trunk
  ctx.fillStyle = '#543824';
  ctx.fillRect(px + 12, py + 20, 8, 12);
  // Canopy shadow
  ctx.fillStyle = pal.treeDark;
  ctx.fillRect(px + 2 + sway, py + 4, 28, 20);
  // Mid foliage
  ctx.fillStyle = pal.treeMid;
  ctx.fillRect(px + 4 + sway, py, 24, 18);
  // Top highlight
  ctx.fillStyle = pal.treeLight;
  ctx.fillRect(px + 8 + sway, py + 2, 14, 8);
}

function drawFarmhouse(
  ctx: CanvasRenderingContext2D,
  pal: SeasonPalette,
  timePhase: string,
  elapsedSec: number
): void {
  const x = FARMHOUSE_POS.x * TILE_SIZE;
  const y = FARMHOUSE_POS.y * TILE_SIZE;
  const w = FARMHOUSE_POS.w * TILE_SIZE;
  const h = FARMHOUSE_POS.h * TILE_SIZE;

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(x + 4, y + h - 4, w - 4, 10);

  // Stone foundation & timber walls
  ctx.fillStyle = '#e8d5b5';
  ctx.fillRect(x + 6, y + 36, w - 12, h - 38);
  ctx.fillStyle = '#734b2e';
  ctx.fillRect(x + 6, y + 36, 6, h - 38);
  ctx.fillRect(x + w - 12, y + 36, 6, h - 38);
  ctx.fillRect(x + 6, y + h - 8, w - 12, 8);

  // Chimney
  ctx.fillStyle = '#75665d';
  ctx.fillRect(x + w - 28, y - 8, 14, 26);
  ctx.fillStyle = '#99897e';
  ctx.fillRect(x + w - 30, y - 10, 18, 4);

  // Cozy Pitched Roof
  ctx.fillStyle = pal.roof;
  ctx.fillRect(x + 2, y + 10, w - 4, 32);
  ctx.fillStyle = pal.roofTrim;
  ctx.fillRect(x + 8, y + 4, w - 16, 10);
  // Shingle lines
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.fillRect(x + 4, y + 20, w - 8, 2);
  ctx.fillRect(x + 4, y + 30, w - 8, 2);

  // Door
  const doorX = x + 38;
  const doorY = y + h - 30;
  ctx.fillStyle = '#5c381f';
  ctx.fillRect(doorX, doorY, 22, 30);
  ctx.fillStyle = '#80502f';
  ctx.fillRect(doorX + 3, doorY + 3, 16, 25);
  ctx.fillStyle = '#f2c961';
  ctx.fillRect(doorX + 15, doorY + 14, 3, 3);

  // Windows (glowing warm amber at Sunset & Night)
  const lit = timePhase !== 'Day';
  const flicker = lit && Math.sin(elapsedSec * 5) > -0.7 ? '#ffd666' : '#f2ad46';
  const winColor = lit ? flicker : '#6ea8c9';
  const winPositions = [x + 16, x + w - 36];
  for (const wx of winPositions) {
    ctx.fillStyle = '#54351e';
    ctx.fillRect(wx, y + 52, 18, 18);
    ctx.fillStyle = winColor;
    ctx.fillRect(wx + 2, y + 54, 14, 14);
    ctx.fillStyle = '#54351e';
    ctx.fillRect(wx + 8, y + 54, 2, 14);
    ctx.fillRect(wx + 2, y + 60, 14, 2);
  }
}

function drawShopStall(
  ctx: CanvasRenderingContext2D,
  timePhase: string,
  elapsedSec: number
): void {
  const x = SHOP_STALL_POS.x * TILE_SIZE;
  const y = SHOP_STALL_POS.y * TILE_SIZE;
  const w = SHOP_STALL_POS.w * TILE_SIZE;
  const h = SHOP_STALL_POS.h * TILE_SIZE;

  ctx.fillStyle = 'rgba(0,0,0,0.24)';
  ctx.fillRect(x + 4, y + h - 4, w - 4, 8);

  // Timber frame & counter
  ctx.fillStyle = '#6b4528';
  ctx.fillRect(x + 6, y + 20, 6, h - 20);
  ctx.fillRect(x + w - 12, y + 20, 6, h - 20);
  ctx.fillStyle = '#996439';
  ctx.fillRect(x + 4, y + h - 20, w - 8, 18);
  ctx.fillStyle = '#b57b4a';
  ctx.fillRect(x + 2, y + h - 22, w - 4, 4);

  // Friendly Shopkeeper NPC behind counter
  const bob = Math.round(Math.sin(elapsedSec * 2.4));
  ctx.fillStyle = '#47784d'; // apron
  ctx.fillRect(x + 40, y + 32 + bob, 16, 12);
  ctx.fillStyle = '#f2c89d'; // head
  ctx.fillRect(x + 42, y + 22 + bob, 12, 10);
  ctx.fillStyle = '#26180f'; // eyes
  ctx.fillRect(x + 44, y + 26 + bob, 2, 2);
  ctx.fillRect(x + 50, y + 26 + bob, 2, 2);
  ctx.fillStyle = '#9e4c36'; // cap
  ctx.fillRect(x + 40, y + 18 + bob, 16, 5);

  // Striped Awning (higher up so NPC face is clearly visible)
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c44536' : '#f4e7ce';
    ctx.fillRect(x + i * 16, y - 2, 16, 18);
    ctx.fillStyle = i % 2 === 0 ? '#9c3226' : '#d6c6a7';
    ctx.fillRect(x + i * 16, y + 14, 16, 4);
  }

  // Display crate with veggies
  ctx.fillStyle = '#e8782b';
  ctx.fillRect(x + 12, y + h - 25, 6, 4);
  ctx.fillStyle = '#e6b84c';
  ctx.fillRect(x + 22, y + h - 25, 8, 4);

  // Hanging lantern
  ctx.fillStyle = timePhase !== 'Day' ? '#ffd86b' : '#b8944f';
  ctx.fillRect(x + w - 16, y + 24, 6, 8);
}

function drawStoneWell(ctx: CanvasRenderingContext2D, elapsedSec: number): void {
  const x = WELL_POS.x * TILE_SIZE;
  const y = WELL_POS.y * TILE_SIZE;

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x + 4, y + 24, 24, 6);
  // Stone rim
  ctx.fillStyle = '#7c8288';
  ctx.fillRect(x + 4, y + 12, 24, 16);
  ctx.fillStyle = '#a0a8b0';
  ctx.fillRect(x + 4, y + 10, 24, 6);
  // Water inside
  ctx.fillStyle = '#3b82b0';
  ctx.fillRect(x + 8, y + 12, 16, 6);
  if (Math.sin(elapsedSec * 3) > 0) {
    ctx.fillStyle = '#8fd0f2';
    ctx.fillRect(x + 11, y + 14, 6, 2);
  }
  // Wooden roof
  ctx.fillStyle = '#6b4528';
  ctx.fillRect(x + 5, y + 2, 3, 12);
  ctx.fillRect(x + 24, y + 2, 3, 12);
  ctx.fillStyle = '#99533a';
  ctx.fillRect(x + 2, y - 2, 28, 6);
}

function drawShippingBin(ctx: CanvasRenderingContext2D): void {
  const x = SHIPPING_BIN_POS.x * TILE_SIZE;
  const y = SHIPPING_BIN_POS.y * TILE_SIZE;
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(x + 3, y + 8, 26, 20);
  ctx.fillStyle = '#8c5a35';
  ctx.fillRect(x + 5, y + 10, 22, 16);
  // Metal bands
  ctx.fillStyle = '#474c52';
  ctx.fillRect(x + 3, y + 12, 26, 3);
  ctx.fillRect(x + 3, y + 22, 26, 3);
  ctx.fillStyle = '#e6b84c';
  ctx.fillRect(x + 13, y + 16, 6, 4);
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  tile: FarmTile,
  px: number,
  py: number,
  elapsedSec: number
): void {
  if (tile.obstacle === 'weed') {
    const sway = Math.round(Math.sin(elapsedSec * 2.5 + tile.x) * 1);
    ctx.fillStyle = '#3c732d';
    ctx.fillRect(px + 8 + sway, py + 14, 4, 12);
    ctx.fillRect(px + 14 + sway, py + 10, 4, 16);
    ctx.fillRect(px + 20 + sway, py + 15, 4, 11);
    ctx.fillStyle = '#6ba844';
    ctx.fillRect(px + 10 + sway, py + 12, 3, 6);
    ctx.fillRect(px + 16 + sway, py + 14, 4, 6);
  } else if (tile.obstacle === 'rock') {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(px + 6, py + 23, 20, 4);
    ctx.fillStyle = '#6e7378';
    ctx.fillRect(px + 6, py + 12, 20, 13);
    ctx.fillStyle = '#92989e';
    ctx.fillRect(px + 8, py + 9, 14, 8);
    ctx.fillStyle = '#b4bbc2';
    ctx.fillRect(px + 10, py + 10, 6, 4);
  } else if (tile.obstacle === 'stump') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(px + 6, py + 23, 20, 5);
    ctx.fillStyle = '#5c3b24';
    ctx.fillRect(px + 7, py + 12, 18, 14);
    ctx.fillStyle = '#805334';
    ctx.fillRect(px + 9, py + 10, 14, 6);
    ctx.fillStyle = '#c49464';
    ctx.fillRect(px + 10, py + 10, 12, 4);
  }
}

function drawCrop(
  ctx: CanvasRenderingContext2D,
  tile: FarmTile,
  px: number,
  py: number,
  elapsedSec: number
): void {
  const crop = tile.crop;
  if (!crop) return;
  const def = CROPS[crop.type];

  if (crop.withered) {
    ctx.fillStyle = '#6b533b';
    ctx.fillRect(px + 10, py + 18, 4, 8);
    ctx.fillRect(px + 18, py + 20, 4, 6);
    ctx.fillStyle = '#4a3826';
    ctx.fillRect(px + 8, py + 16, 6, 3);
    ctx.fillRect(px + 18, py + 18, 6, 3);
    return;
  }

  const ratio = crop.growthDays / def.daysToGrow;
  const sway = Math.round(Math.sin(elapsedSec * 2.6 + tile.x * 0.9 + tile.y * 0.4));

  if (ratio <= 0) {
    // Planted seeds
    ctx.fillStyle = '#d9be82';
    ctx.fillRect(px + 10, py + 14, 3, 3);
    ctx.fillRect(px + 19, py + 18, 3, 3);
    ctx.fillRect(px + 13, py + 22, 3, 3);
    return;
  }

  if (ratio < 0.55) {
    // Young green sprout
    ctx.fillStyle = '#4c963e';
    ctx.fillRect(px + 14, py + 16, 4, 10);
    ctx.fillStyle = '#76bf54';
    ctx.fillRect(px + 10 + sway, py + 14, 5, 4);
    ctx.fillRect(px + 17 + sway, py + 13, 5, 4);
    return;
  }

  if (ratio < 1) {
    // Mid-growth leafy stalk
    ctx.fillStyle = '#3b8233';
    ctx.fillRect(px + 13, py + 11, 6, 15);
    ctx.fillStyle = '#66b548';
    ctx.fillRect(px + 8 + sway, py + 12, 7, 6);
    ctx.fillRect(px + 17 + sway, py + 10, 7, 6);
    return;
  }

  // RIPE CROP with gentle sparkle!
  if (crop.type === 'wheat') {
    ctx.fillStyle = '#cfa034';
    ctx.fillRect(px + 8 + sway, py + 10, 4, 16);
    ctx.fillRect(px + 14 + sway, py + 8, 4, 18);
    ctx.fillRect(px + 20 + sway, py + 11, 4, 15);
    ctx.fillStyle = def.accentColor;
    ctx.fillRect(px + 8 + sway, py + 6, 4, 6);
    ctx.fillRect(px + 14 + sway, py + 4, 4, 6);
    ctx.fillRect(px + 20 + sway, py + 7, 4, 6);
  } else if (crop.type === 'carrot') {
    ctx.fillStyle = '#4f9c3e';
    ctx.fillRect(px + 10 + sway, py + 6, 12, 10);
    ctx.fillStyle = def.color;
    ctx.fillRect(px + 12, py + 15, 8, 12);
    ctx.fillStyle = '#f2994a';
    ctx.fillRect(px + 14, py + 16, 3, 8);
  } else if (crop.type === 'tomato') {
    ctx.fillStyle = '#3d7d34';
    ctx.fillRect(px + 8, py + 7, 16, 18);
    ctx.fillStyle = def.color;
    ctx.fillRect(px + 9, py + 12, 6, 6);
    ctx.fillRect(px + 17, py + 9, 6, 6);
    ctx.fillRect(px + 14, py + 18, 6, 6);
  } else if (crop.type === 'strawberry') {
    ctx.fillStyle = '#3d8538';
    ctx.fillRect(px + 7, py + 10, 18, 14);
    ctx.fillStyle = def.color;
    ctx.fillRect(px + 9, py + 15, 6, 7);
    ctx.fillRect(px + 17, py + 14, 6, 7);
    ctx.fillStyle = '#fff5d6';
    ctx.fillRect(px + 11, py + 17, 2, 2);
    ctx.fillRect(px + 19, py + 16, 2, 2);
  } else {
    // Pumpkin
    ctx.fillStyle = '#477d34';
    ctx.fillRect(px + 14, py + 8, 4, 6);
    ctx.fillStyle = def.color;
    ctx.fillRect(px + 7, py + 13, 18, 13);
    ctx.fillStyle = def.accentColor;
    ctx.fillRect(px + 11, py + 14, 10, 10);
  }

  // Ripe golden harvest sparkle
  if (Math.sin(elapsedSec * 4.5 + tile.x + tile.y) > 0.65) {
    ctx.fillStyle = '#fff6b3';
    ctx.fillRect(px + 22, py + 5, 3, 3);
  }
}

function drawStructure(
  ctx: CanvasRenderingContext2D,
  state: GameWorldState,
  tile: FarmTile,
  px: number,
  py: number,
  timePhase: string,
  elapsedSec: number
): void {
  const s = tile.structure;
  if (!s) return;

  if (s.type === 'stone_path') {
    ctx.fillStyle = '#8b9196';
    ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = '#a7adb3';
    ctx.fillRect(px + 4, py + 4, 10, 10);
    ctx.fillRect(px + 17, py + 5, 11, 9);
    ctx.fillRect(px + 5, py + 17, 12, 11);
    ctx.fillRect(px + 19, py + 16, 9, 12);
    return;
  }

  if (s.type === 'fence') {
    const left = getTile(state, tile.x - 1, tile.y)?.structure?.type === 'fence';
    const right = getTile(state, tile.x + 1, tile.y)?.structure?.type === 'fence';
    const up = getTile(state, tile.x, tile.y - 1)?.structure?.type === 'fence';
    const down = getTile(state, tile.x, tile.y + 1)?.structure?.type === 'fence';

    ctx.fillStyle = '#6b4426';
    // Horizontal rails
    if (left || right) {
      ctx.fillRect(left ? px : px + 10, py + 12, (left && right ? 32 : 22), 4);
      ctx.fillRect(left ? px : px + 10, py + 20, (left && right ? 32 : 22), 4);
    }
    if (up || down) {
      ctx.fillRect(px + 13, up ? py : py + 10, 6, up && down ? 32 : 22);
    }
    // Center fence post
    ctx.fillStyle = '#8c5a33';
    ctx.fillRect(px + 11, py + 6, 10, 22);
    ctx.fillStyle = '#a87246';
    ctx.fillRect(px + 12, py + 6, 8, 4);

    // Damage crack indicator
    if (s.hp < s.maxHp) {
      ctx.fillStyle = '#d9534f';
      ctx.fillRect(px + 10, py + 2, 12, 3);
    }
    return;
  }

  if (s.type === 'scarecrow') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(px + 9, py + 25, 14, 4);
    // Wooden cross post
    ctx.fillStyle = '#6b4528';
    ctx.fillRect(px + 14, py + 10, 4, 18);
    ctx.fillRect(px + 6, py + 13, 20, 3);
    // Coat
    ctx.fillStyle = '#4c6e91';
    ctx.fillRect(px + 10, py + 12, 12, 10);
    // Pumpkin/Burlap head & straw hat
    ctx.fillStyle = '#e0b879';
    ctx.fillRect(px + 12, py + 5, 8, 7);
    ctx.fillStyle = '#c9933b';
    ctx.fillRect(px + 8, py + 4, 16, 3);
    ctx.fillRect(px + 11, py + 1, 10, 4);
    return;
  }

  if (s.type === 'lantern') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(px + 8, py + 25, 16, 4);
    ctx.fillStyle = '#6e757a';
    ctx.fillRect(px + 10, py + 22, 12, 5);
    ctx.fillRect(px + 13, py + 13, 6, 10);
    ctx.fillStyle = '#8f969c';
    ctx.fillRect(px + 8, py + 5, 16, 4);
    const glow = timePhase !== 'Day' ? (Math.sin(elapsedSec * 6 + tile.x) > -0.6 ? '#ffe073' : '#f2b144') : '#d4c89b';
    ctx.fillStyle = glow;
    ctx.fillRect(px + 11, py + 8, 10, 6);
    return;
  }

  if (s.type === 'flowerbed') {
    ctx.fillStyle = '#734b2e';
    ctx.fillRect(px + 3, py + 10, 26, 18);
    ctx.fillStyle = '#4e331f';
    ctx.fillRect(px + 5, py + 12, 22, 13);
    ctx.fillStyle = '#4e963e';
    ctx.fillRect(px + 7, py + 13, 18, 9);
    // Blossoms
    ctx.fillStyle = '#e86884';
    ctx.fillRect(px + 8, py + 13, 4, 4);
    ctx.fillStyle = '#f5d259';
    ctx.fillRect(px + 15, py + 15, 4, 4);
    ctx.fillStyle = '#78b8eb';
    ctx.fillRect(px + 20, py + 12, 4, 4);
    return;
  }

  if (s.type === 'sprinkler') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(px + 9, py + 24, 14, 4);
    ctx.fillStyle = '#5a636b';
    ctx.fillRect(px + 11, py + 18, 10, 7);
    ctx.fillStyle = '#8b96a0';
    ctx.fillRect(px + 14, py + 10, 4, 10);
    // Mini Solar Cap
    ctx.fillStyle = '#255280';
    ctx.fillRect(px + 9, py + 7, 14, 4);
    ctx.fillStyle = '#4ea5e8';
    ctx.fillRect(px + 10, py + 8, 12, 2);
    // Rotating water droplets animation
    const dropletPhase = Math.sin(elapsedSec * 5 + tile.x);
    if (dropletPhase > -0.2) {
      ctx.fillStyle = '#99e1ff';
      const offset = dropletPhase > 0.4 ? 4 : 2;
      ctx.fillRect(px + 7 - offset, py + 12, 2, 2);
      ctx.fillRect(px + 23 + offset, py + 12, 2, 2);
    }
    return;
  }

  if (s.type === 'sensor') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(px + 10, py + 25, 12, 4);
    // Probe stake
    ctx.fillStyle = '#6b4528';
    ctx.fillRect(px + 14, py + 15, 4, 12);
    // Smart Sensor housing
    ctx.fillStyle = '#334452';
    ctx.fillRect(px + 10, py + 9, 12, 8);
    // Antenna
    ctx.fillStyle = '#97a7b3';
    ctx.fillRect(px + 15, py + 4, 2, 5);
    // Pulsing moisture status LED (green in normal, bright cyan in rain, amber in drought)
    const pulse = Math.sin(elapsedSec * 4 + tile.x * 0.7) > 0;
    const ledColor =
      state.weather === 'Drought'
        ? '#ffb347'
        : state.weather === 'Rainstorm'
        ? '#64d2ff'
        : pulse
        ? '#4cf298'
        : '#2eb86e';
    ctx.fillStyle = ledColor;
    ctx.fillRect(px + 12, py + 11, 8, 3);
    ctx.fillRect(px + 14, py + 3, 4, 2);
    return;
  }

  if (s.type === 'compost') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(px + 4, py + 24, 24, 5);
    ctx.fillStyle = '#6b4528';
    ctx.fillRect(px + 5, py + 10, 22, 16);
    ctx.fillStyle = '#8c5a35';
    ctx.fillRect(px + 5, py + 14, 22, 3);
    ctx.fillRect(px + 5, py + 21, 22, 3);
    // Rich dark compost top + eco sprout
    ctx.fillStyle = '#3b2516';
    ctx.fillRect(px + 7, py + 10, 18, 4);
    ctx.fillStyle = '#53a642';
    ctx.fillRect(px + 12, py + 6, 8, 5);
    ctx.fillStyle = '#84d45d';
    ctx.fillRect(px + 14, py + 4, 4, 3);
  }
}

function drawFarmer(
  ctx: CanvasRenderingContext2D,
  state: GameWorldState,
  elapsedSec: number
): void {
  const p = state.player;
  const cx = Math.round(p.x * TILE_SIZE);
  const cy = Math.round(p.y * TILE_SIZE);
  const bob = Math.round(Math.abs(Math.sin(p.walkCycle)) * -2);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(cx - 8, cy + 8, 16, 5);

  const flash = p.hitFlashTimer > 0 && Math.floor(elapsedSec * 24) % 2 === 0;

  // Boots
  const stride = Math.round(Math.sin(p.walkCycle) * 2);
  ctx.fillStyle = '#4d2f1a';
  ctx.fillRect(cx - 6, cy + 5 + Math.max(0, stride), 5, 5);
  ctx.fillRect(cx + 1, cy + 5 + Math.max(0, -stride), 5, 5);

  // Overalls & shirt
  ctx.fillStyle = flash ? '#ffffff' : '#3a6699';
  ctx.fillRect(cx - 7, cy - 5 + bob, 14, 11);
  ctx.fillStyle = flash ? '#ffffff' : '#c95240';
  ctx.fillRect(cx - 7, cy - 8 + bob, 14, 5);

  // Head
  ctx.fillStyle = flash ? '#ffffff' : '#f2c89d';
  ctx.fillRect(cx - 6, cy - 17 + bob, 12, 10);

  // Eyes (facing aware)
  if (p.facingY >= -0.3) {
    ctx.fillStyle = '#26180f';
    const eyeOffsetX = Math.abs(p.facingX) > Math.abs(p.facingY) ? Math.sign(p.facingX) * 2 : 0;
    ctx.fillRect(cx - 3 + eyeOffsetX, cy - 13 + bob, 2, 2);
    ctx.fillRect(cx + 2 + eyeOffsetX, cy - 13 + bob, 2, 2);
  }

  // Straw Sunhat
  ctx.fillStyle = '#deb15b';
  ctx.fillRect(cx - 9, cy - 19 + bob, 18, 4);
  ctx.fillStyle = '#c49139';
  ctx.fillRect(cx - 6, cy - 23 + bob, 12, 5);
  ctx.fillStyle = '#b54636';
  ctx.fillRect(cx - 6, cy - 20 + bob, 12, 2);

  // Active Tool Swing Arc
  if (p.swingTimer > 0 && p.swingTool) {
    const dirX = Math.abs(p.facingX) >= Math.abs(p.facingY) ? Math.sign(p.facingX) : 0;
    const dirY = dirX === 0 ? Math.sign(p.facingY || 1) : 0;
    const tx = cx + dirX * 14;
    const ty = cy - 4 + dirY * 14;
    ctx.fillStyle = p.swingTool === 'watering_can' ? '#5ea4d4' : '#aeb6bf';
    ctx.fillRect(tx - 4, ty - 4, 8, 8);
    ctx.fillStyle = '#6b4528';
    ctx.fillRect(cx + dirX * 7 - 2, cy - 4 + dirY * 7 - 2, 4, 4);
  }
}

function drawChicken(
  ctx: CanvasRenderingContext2D,
  c: FarmChicken,
  elapsedSec: number
): void {
  const cx = Math.round(c.x * TILE_SIZE);
  const cy = Math.round(c.y * TILE_SIZE);
  const hop = Math.round(Math.abs(Math.sin(c.hopPhase)) * -3);
  const peck = c.vx === 0 && c.vy === 0 && Math.sin(elapsedSec * 3 + c.id) > 0.7 ? 2 : 0;

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(cx - 5, cy + 4, 10, 3);

  // Legs
  ctx.fillStyle = '#e6942e';
  ctx.fillRect(cx - 3, cy + 2, 2, 3);
  ctx.fillRect(cx + 1, cy + 2, 2, 3);

  // Plump body
  ctx.fillStyle = '#f7f0de';
  ctx.fillRect(cx - 5, cy - 4 + hop, 10, 7);
  ctx.fillStyle = '#e3d8be';
  ctx.fillRect(cx - 4, cy - 1 + hop, 8, 3);

  // Head facing direction
  const hx = c.facingX >= 0 ? cx + 2 : cx - 6;
  ctx.fillStyle = '#f7f0de';
  ctx.fillRect(hx, cy - 8 + hop + peck, 5, 5);
  // Red comb
  ctx.fillStyle = '#d93829';
  ctx.fillRect(hx + 1, cy - 10 + hop + peck, 3, 2);
  // Beak & eye
  ctx.fillStyle = '#f2a634';
  ctx.fillRect(c.facingX >= 0 ? hx + 5 : hx - 2, cy - 6 + hop + peck, 2, 2);
  ctx.fillStyle = '#241812';
  ctx.fillRect(c.facingX >= 0 ? hx + 3 : hx + 1, cy - 7 + hop + peck, 1, 1);
}

function drawWildlife(
  ctx: CanvasRenderingContext2D,
  w: WildlifeEntity,
  elapsedSec: number
): void {
  const cx = Math.round(w.x * TILE_SIZE);
  const cy = Math.round(w.y * TILE_SIZE);
  const hop = Math.round(Math.abs(Math.sin(w.hopPhase)) * -4);
  const flash = w.hitFlashTimer > 0;

  // Boar windup telegraph ring!
  if (w.kind === 'boar' && w.state === 'windup') {
    ctx.save();
    ctx.strokeStyle = 'rgba(235, 72, 60, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 16 + Math.sin(elapsedSec * 25) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(cx - 8, cy + 6, 16, 4);

  if (w.kind === 'rabbit') {
    ctx.fillStyle = flash ? '#ffffff' : '#d6cfc7';
    ctx.fillRect(cx - 5, cy - 4 + hop, 10, 9);
    // Ears
    ctx.fillRect(cx - 4, cy - 11 + hop, 3, 7);
    ctx.fillRect(cx + 1, cy - 11 + hop, 3, 7);
    ctx.fillStyle = '#e89ba3';
    ctx.fillRect(cx - 3, cy - 9 + hop, 1, 4);
    ctx.fillRect(cx + 2, cy - 9 + hop, 1, 4);
    // Eye
    ctx.fillStyle = '#241812';
    ctx.fillRect(cx + (w.facingX > 0 ? 2 : -3), cy - 2 + hop, 2, 2);
  } else {
    // Wild Boar
    ctx.fillStyle = flash ? '#ffffff' : '#5e3d2b';
    ctx.fillRect(cx - 10, cy - 7 + hop, 20, 14);
    ctx.fillStyle = flash ? '#ffffff' : '#40281b';
    ctx.fillRect(cx - 8, cy - 10 + hop, 16, 4); // bristles
    // Tusks
    const tuskX = w.facingX > 0 ? cx + 9 : cx - 12;
    ctx.fillStyle = '#f5eedc';
    ctx.fillRect(tuskX, cy + 1 + hop, 3, 3);
    // Angry red eye
    ctx.fillStyle = '#eb483c';
    ctx.fillRect(cx + (w.facingX > 0 ? 5 : -7), cy - 3 + hop, 2, 2);
  }
}

function drawRainOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  elapsedSec: number
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(28, 48, 74, 0.16)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(175, 218, 245, 0.48)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 65; i++) {
    const rx = ((i * 97 + elapsedSec * 240) % (w + 80)) - 40;
    const ry = ((i * 53 + elapsedSec * 520) % (h + 60)) - 30;
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 6, ry + 14);
  }
  ctx.stroke();
  ctx.restore();
}

function drawLightingOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: GameWorldState,
  camera: CameraState,
  isTitleBackdrop: boolean,
  elapsedSec: number
): void {
  // Compute ambient tint alpha based on timeMinutes
  const t = state.timeMinutes;
  let tintColor = 'rgba(0,0,0,0)';
  let darkness = 0;

  if (t >= SUNSET_START_MINUTES && t < NIGHT_START_MINUTES) {
    const progress = (t - SUNSET_START_MINUTES) / (NIGHT_START_MINUTES - SUNSET_START_MINUTES);
    darkness = progress * 0.34;
    tintColor = `rgba(186, 86, 48, ${progress * 0.22})`;
  } else if (t >= NIGHT_START_MINUTES) {
    const progress = Math.min(1, (t - NIGHT_START_MINUTES) / 90);
    darkness = 0.34 + progress * 0.32; // Max 0.66 darkness so farm stays readable!
  }

  if (tintColor !== 'rgba(0,0,0,0)') {
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, w, h);
  }

  if (darkness <= 0.02) return;

  const lCtx = getLightCtx(w, h);
  if (!lCtx || !lightCanvas) return;

  lCtx.globalCompositeOperation = 'source-over';
  lCtx.clearRect(0, 0, w, h);
  lCtx.fillStyle = `rgba(14, 18, 42, ${darkness.toFixed(3)})`;
  lCtx.fillRect(0, 0, w, h);

  // Carve warm radial light pools
  lCtx.globalCompositeOperation = 'destination-out';

  const toScreen = (wx: number, wy: number) => ({
    sx: w / 2 + camera.shakeX + (wx * TILE_SIZE - camera.x) * camera.zoom,
    sy: h / 2 + camera.shakeY + (wy * TILE_SIZE - camera.y) * camera.zoom,
  });

  const punchLight = (wx: number, wy: number, radiusTiles: number) => {
    const { sx, sy } = toScreen(wx, wy);
    const r = radiusTiles * TILE_SIZE * camera.zoom;
    const grad = lCtx.createRadialGradient(sx, sy, r * 0.12, sx, sy, r);
    grad.addColorStop(0, 'rgba(0,0,0,0.95)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    lCtx.fillStyle = grad;
    lCtx.beginPath();
    lCtx.arc(sx, sy, r, 0, Math.PI * 2);
    lCtx.fill();
  };

  // Farmhouse porch light
  punchLight(FARMHOUSE_POS.x + 2, FARMHOUSE_POS.y + 2.5, 4.0);
  // Shop stall lantern
  punchLight(SHOP_STALL_POS.x + 2.5, SHOP_STALL_POS.y + 1.5, 3.2);
  // Player pocket lantern
  if (!isTitleBackdrop) {
    const pulse = 3.4 + Math.sin(elapsedSec * 3) * 0.12;
    punchLight(state.player.x, state.player.y, pulse);
  }
  // Placed Stone Lanterns & Smart Soil Sensors
  for (const tile of state.tiles) {
    if (tile.structure?.type === 'lantern') {
      punchLight(tile.x + 0.5, tile.y + 0.5, 4.2);
    } else if (tile.structure?.type === 'sensor') {
      punchLight(tile.x + 0.5, tile.y + 0.5, 1.8);
    }
  }

  ctx.drawImage(lightCanvas, 0, 0);
}
