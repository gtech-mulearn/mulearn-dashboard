"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Kickable Football
 *
 * 📍 src/app/break/football.tsx
 *
 * A football you can throw around the break page. Drag it and let go to flick
 * it; click or press Enter/Space to boot it upward. It falls, bounces off the
 * viewport edges losing energy each time, and eventually settles on the floor.
 *
 * Deliberately dependency-free: one requestAnimationFrame loop writing a
 * `transform` on a single element. Position lives in refs, not state, so the
 * physics never triggers a React render — only the kick counter does.
 *
 * Users who ask for reduced motion get a still ball that is not interactive,
 * rather than a bouncing one.
 *
 * TEMPORARY: delete with the rest of the FIFA break block.
 */

const BALL_SIZE = 64;

// Tuned by feel, in pixels-per-frame at ~60fps.
const GRAVITY = 0.65;
const AIR_DRAG = 0.995;
/** Energy kept after hitting a wall or the floor. */
const RESTITUTION = 0.72;
/** Horizontal energy scrubbed off on each floor bounce. */
const FLOOR_FRICTION = 0.9;
/** Below this vertical speed at floor level, the ball is done bouncing. */
const SETTLE_SPEED = 0.9;
const KICK_STRENGTH = 19;
/** Caps a flick so a fast drag can't fire the ball off at absurd speed. */
const MAX_THROW_SPEED = 42;

interface Vec {
  x: number;
  y: number;
}

export function Football() {
  const ballRef = useRef<HTMLButtonElement>(null);
  const pos = useRef<Vec>({ x: 0, y: 0 });
  const vel = useRef<Vec>({ x: 0, y: 0 });
  const angle = useRef(0);
  const dragging = useRef(false);
  /** Last two pointer samples, used to derive throw velocity on release. */
  const trail = useRef<{ x: number; y: number; t: number }[]>([]);
  const frame = useRef<number>(null);
  const moved = useRef(false);

  const [kicks, setKicks] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const draw = useCallback(() => {
    const el = ballRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle.current}deg)`;
  }, []);

  // ── Physics loop ────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;

    // Start resting on the floor, right of centre, out of the copy's way.
    const floor = () => window.innerHeight - BALL_SIZE - 24;
    pos.current = { x: window.innerWidth * 0.72, y: floor() };
    draw();

    const step = () => {
      frame.current = requestAnimationFrame(step);
      if (dragging.current) return;

      const maxX = window.innerWidth - BALL_SIZE;
      const maxY = floor();
      const p = pos.current;
      const v = vel.current;

      const resting = p.y >= maxY && Math.abs(v.y) < SETTLE_SPEED;
      if (resting && Math.abs(v.x) < 0.05) {
        // Fully settled — skip the maths until something kicks it again.
        v.x = 0;
        v.y = 0;
        return;
      }

      v.y += GRAVITY;
      v.x *= AIR_DRAG;
      p.x += v.x;
      p.y += v.y;

      if (p.x <= 0 || p.x >= maxX) {
        p.x = p.x <= 0 ? 0 : maxX;
        v.x = -v.x * RESTITUTION;
      }
      if (p.y >= maxY) {
        p.y = maxY;
        // Stop micro-bouncing once the ball has run out of height.
        v.y = Math.abs(v.y) < SETTLE_SPEED ? 0 : -v.y * RESTITUTION;
        v.x *= FLOOR_FRICTION;
      }
      if (p.y <= 0) {
        p.y = 0;
        v.y = -v.y * RESTITUTION;
      }

      // Roll in the direction of travel.
      angle.current += v.x * 1.8;
      draw();
    };

    frame.current = requestAnimationFrame(step);

    const onResize = () => {
      pos.current.x = Math.min(pos.current.x, window.innerWidth - BALL_SIZE);
      pos.current.y = Math.min(pos.current.y, floor());
      draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion, draw]);

  // ── Pointer handling ────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;
    dragging.current = true;
    moved.current = false;
    vel.current = { x: 0, y: 0 };
    trail.current = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const last = trail.current[trail.current.length - 1];
    if (last) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
      pos.current.x += dx;
      pos.current.y += dy;
      angle.current += dx * 1.2;
    }
    trail.current.push({ x: e.clientX, y: e.clientY, t: now });
    if (trail.current.length > 4) trail.current.shift();
    draw();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (!moved.current) {
      kick();
      return;
    }

    // Throw: velocity from the oldest retained sample to the newest, converted
    // from px/ms into px/frame.
    const first = trail.current[0];
    const last = trail.current[trail.current.length - 1];
    const dt = Math.max(1, last.t - first.t);
    const scale = 16;
    const vx = ((last.x - first.x) / dt) * scale;
    const vy = ((last.y - first.y) / dt) * scale;
    const speed = Math.hypot(vx, vy);
    const clamp = speed > MAX_THROW_SPEED ? MAX_THROW_SPEED / speed : 1;
    vel.current = { x: vx * clamp, y: vy * clamp };
    setKicks((n) => n + 1);
  };

  const kick = () => {
    if (reducedMotion) return;
    vel.current = {
      x: (Math.random() - 0.5) * 16,
      y: -KICK_STRENGTH - Math.random() * 5,
    };
    setKicks((n) => n + 1);
  };

  if (reducedMotion) return null;

  return (
    <>
      <button
        ref={ballRef}
        type="button"
        aria-label="Kick the football"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            kick();
          }
        }}
        className="fixed top-0 left-0 z-50 cursor-grab touch-none select-none rounded-full active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        style={{ width: BALL_SIZE, height: BALL_SIZE, willChange: "transform" }}
      >
        <BallSvg />
      </button>

      {kicks > 0 ? (
        <p
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 text-xs text-muted-foreground tabular-nums"
        >
          {kicks} {kicks === 1 ? "touch" : "touches"}
          {kicks >= 20 ? " — someone call the selectors" : ""}
        </p>
      ) : null}
    </>
  );
}

/**
 * Classic 32-panel ball, drawn rather than shipped as an asset.
 *
 * The panel layout is the real one, not eyeballed: a pentagon at the centre,
 * and five more at the rim sitting on the centre pentagon's EDGE midpoints —
 * i.e. rotated 36° off its vertices, then every 72°. The rim pentagons are
 * positioned beyond the circle's radius and clipped by it, which is what gives
 * a flat drawing the look of panels curving over the horizon of a sphere. The
 * seams run radially out from the centre pentagon's vertices, filling the gaps
 * the way the hexagon edges do on a real ball.
 */

/**
 * Centre pentagon: circumradius 14, one vertex pointing up. Kept well under a
 * third of the ball's radius — sized up from here the black panels merge with
 * the seams and the whole thing reads as a star rather than a football.
 */
const CENTRE_PENTAGON = "50,36 63.3,45.7 58.2,61.3 41.8,61.3 36.7,45.7";

/**
 * A rim pentagon drawn at the top, centred 52 units above the middle — mostly
 * outside the circle — with one vertex pointing back down. Only the ~10 units
 * below the rim survive the clip, which is the sliver a real panel shows as it
 * curves away.
 */
const RIM_PENTAGON = "50,13 35.7,2.6 41.2,-14.1 58.8,-14.1 64.3,2.6";

/** 36° puts a rim panel over an edge midpoint rather than a vertex. */
const RIM_ANGLES = [36, 108, 180, 252, 324];
const SEAM_ANGLES = [0, 72, 144, 216, 288];

function BallSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full drop-shadow-md"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="ball-clip">
          <circle cx="50" cy="50" r="47" />
        </clipPath>
        {/* Off-centre highlight reads as a light source, so the flat
            drawing sits in the page as a solid object. */}
        <radialGradient id="ball-shade" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#f1f4f9" />
          <stop offset="100%" stopColor="#c8d0dd" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill="url(#ball-shade)" />

      <g clipPath="url(#ball-clip)">
        <g fill="#16191f">
          <polygon points={CENTRE_PENTAGON} />
          {RIM_ANGLES.map((deg) => (
            <polygon
              key={deg}
              points={RIM_PENTAGON}
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>

        {/* Seams run from each centre-pentagon vertex to the rim, landing in
            the gaps BETWEEN rim panels — the 36° offset is what puts them
            there. Thin on purpose: heavier and they read as a star's arms. */}
        <g stroke="#16191f" strokeWidth="1.8" strokeLinecap="round">
          {SEAM_ANGLES.map((deg) => (
            <line
              key={deg}
              x1="50"
              y1="36"
              x2="50"
              y2="3"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>
      </g>

      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="#16191f"
        strokeWidth="2.5"
      />
    </svg>
  );
}
