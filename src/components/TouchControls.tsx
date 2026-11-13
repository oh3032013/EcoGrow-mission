import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Hand, Pickaxe } from 'lucide-react';
import { UI_TEXT, type Language } from '../game/i18n';

type Direction = 'up' | 'down' | 'left' | 'right';
type ControlMode = 'dpad' | 'stick';

interface TouchControlsProps {
  visible: boolean;
  lang: Language;
  nearPromptLabel: string | null;
  onVectorChange: (vx: number, vy: number) => void;
  onUseTool: () => void;
  onInteract: () => void;
}

const DIR_VECTORS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function TouchControls({
  visible,
  lang,
  nearPromptLabel,
  onVectorChange,
  onUseTool,
  onInteract,
}: TouchControlsProps) {
  const [mode, setMode] = useState<ControlMode>('dpad');
  const [pressedDirs, setPressedDirs] = useState<Set<Direction>>(() => new Set());
  const activePointersRef = useRef<Map<number, Direction>>(new Map());

  const padRef = useRef<HTMLDivElement | null>(null);
  const stickPointerIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const t = UI_TEXT[lang];

  useEffect(() => {
    if (!visible) {
      activePointersRef.current.clear();
      setPressedDirs(new Set());
      stickPointerIdRef.current = null;
      setKnobOffset({ x: 0, y: 0 });
      onVectorChange(0, 0);
    }
  }, [visible, onVectorChange]);

  if (!visible) return null;

  const syncDpadVector = () => {
    const dirs = new Set<Direction>(activePointersRef.current.values());
    setPressedDirs(dirs);
    let vx = 0;
    let vy = 0;
    dirs.forEach((d) => {
      vx += DIR_VECTORS[d].x;
      vy += DIR_VECTORS[d].y;
    });
    const len = Math.hypot(vx, vy);
    if (len > 0) {
      onVectorChange(vx / len, vy / len);
    } else {
      onVectorChange(0, 0);
    }
  };

  const handleDirDown = (dir: Direction, e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events that lack pointer capture support
    }
    activePointersRef.current.set(e.pointerId, dir);
    syncDpadVector();
  };

  const handleDirRelease = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.delete(e.pointerId);
    syncDpadVector();
  };

  const maxRadius = 34;

  const updateStick = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnobOffset({ x: dx, y: dy });
    const nx = dist < 6 ? 0 : dx / maxRadius;
    const ny = dist < 6 ? 0 : dy / maxRadius;
    onVectorChange(nx, ny);
  };

  const resetStick = () => {
    stickPointerIdRef.current = null;
    setKnobOffset({ x: 0, y: 0 });
    onVectorChange(0, 0);
  };

  const dpadBtnClass = (dir: Direction) =>
    `w-11 h-11 rounded-lg flex items-center justify-center touch-none select-none cursor-pointer transition-transform ${
      pressedDirs.has(dir)
        ? 'wood-button-primary scale-95 border-2 border-[#fdf3dc]'
        : 'wood-button opacity-90 border border-[#b38252]/80'
    }`;

  // Always keep dir="ltr" so movement stays on left thumb and USE/ACT stay on right thumb even in Arabic RTL
  return (
    <div
      dir="ltr"
      className="fixed inset-x-0 bottom-24 sm:bottom-28 [@media(max-height:500px)_and_(min-width:640px)]:bottom-2.5 z-20 pointer-events-none flex items-end justify-between px-3 sm:px-6 [@media(max-height:500px)_and_(min-width:640px)]:px-3"
    >
      {/* Left Movement Controls: D-Pad Buttons or Analog Stick */}
      <div className="pointer-events-auto flex flex-col items-start gap-1.5">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            activePointersRef.current.clear();
            setPressedDirs(new Set());
            resetStick();
            setMode((prev) => (prev === 'dpad' ? 'stick' : 'dpad'));
          }}
          aria-label={mode === 'dpad' ? 'Switch to Analog Stick' : 'Switch to D-Pad Buttons'}
          className="wood-button px-2.5 py-1 rounded text-[10px] font-semibold text-[#e8d5b5] opacity-85 hover:opacity-100 cursor-pointer"
        >
          {mode === 'dpad' ? t.stickLabel : t.dpadLabel}
        </button>

        {mode === 'dpad' ? (
          <div
            role="group"
            aria-label="Movement D-Pad"
            className="grid grid-cols-3 gap-1 p-1.5 rounded-2xl bg-[#24170f]/45 border border-[#7c5334]/65 touch-none select-none"
          >
            <div />
            <button
              type="button"
              aria-label="Move Up"
              className={dpadBtnClass('up')}
              onPointerDown={(e) => handleDirDown('up', e)}
              onPointerUp={handleDirRelease}
              onPointerCancel={handleDirRelease}
              onLostPointerCapture={handleDirRelease}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />

            <button
              type="button"
              aria-label="Move Left"
              className={dpadBtnClass('left')}
              onPointerDown={(e) => handleDirDown('left', e)}
              onPointerUp={handleDirRelease}
              onPointerCancel={handleDirRelease}
              onLostPointerCapture={handleDirRelease}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-11 h-11 rounded-lg bg-[#24170f]/55 border border-[#5e3f27]/60" aria-hidden="true" />
            <button
              type="button"
              aria-label="Move Right"
              className={dpadBtnClass('right')}
              onPointerDown={(e) => handleDirDown('right', e)}
              onPointerUp={handleDirRelease}
              onPointerCancel={handleDirRelease}
              onLostPointerCapture={handleDirRelease}
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div />
            <button
              type="button"
              aria-label="Move Down"
              className={dpadBtnClass('down')}
              onPointerDown={(e) => handleDirDown('down', e)}
              onPointerUp={handleDirRelease}
              onPointerCancel={handleDirRelease}
              onLostPointerCapture={handleDirRelease}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <div />
          </div>
        ) : (
          <div
            ref={padRef}
            role="group"
            aria-label="Movement Thumbstick"
            className="relative w-28 h-28 rounded-full border-2 border-[#966742]/75 bg-[#24170f]/55 flex items-center justify-center touch-none select-none"
            onPointerDown={(e) => {
              e.stopPropagation();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Ignore synthetic events
              }
              stickPointerIdRef.current = e.pointerId;
              updateStick(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (stickPointerIdRef.current !== e.pointerId) return;
              updateStick(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              if (stickPointerIdRef.current !== e.pointerId) return;
              resetStick();
            }}
            onPointerCancel={resetStick}
          >
            <div
              className="w-11 h-11 rounded-full bg-[#8c5a33] border-2 border-[#f7d87c]/80 shadow-md"
              style={{
                transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Right Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            if (nearPromptLabel) onInteract();
          }}
          disabled={!nearPromptLabel}
          aria-label={nearPromptLabel ?? 'Interact with nearby object'}
          className={`min-w-[56px] min-h-[48px] px-3.5 rounded-full flex items-center justify-center gap-1.5 shadow-lg transition-opacity ${
            nearPromptLabel
              ? 'wood-button-primary border-2 border-[#fdf3dc]/75 cursor-pointer'
              : 'wood-button opacity-45 cursor-default'
          }`}
        >
          <Hand className="w-4 h-4" />
          <span className="text-xs font-bold">{t.actLabel}</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            onUseTool();
          }}
          aria-label="Use Selected Tool"
          className="wood-button min-w-[64px] min-h-[64px] rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-[#f7d87c]/85 active:scale-95 transition-transform cursor-pointer"
        >
          <Pickaxe className="w-6 h-6 text-[#fdf3dc]" />
          <span className="text-[10px] font-bold text-[#f7d87c]">{t.useLabel}</span>
        </button>
      </div>
    </div>
  );
}
