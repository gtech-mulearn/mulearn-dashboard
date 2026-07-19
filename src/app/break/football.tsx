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

    // Enter from above the viewport and drop in, right of centre so the
    // landing bounces happen clear of the copy.
    const floor = () => window.innerHeight - BALL_SIZE - 24;
    pos.current = { x: window.innerWidth * 0.72, y: -BALL_SIZE * 2 };
    vel.current = { x: 0, y: 2 };
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
      // Ceiling: only when moving up — the ball SPAWNS above the viewport
      // (drop-in entrance), and clamping it there would kill the entrance.
      if (p.y <= 0 && v.y < 0) {
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
 * Adidas Trionda — the 2026 World Cup ball — as a stylised drawing.
 *
 * The real ball: white, with three curved blades pinwheeling around the
 * centre, one per host nation — red for Canada, blue for the USA, green for
 * Mexico — separated by white seam channels that taper as they spiral in.
 *
 * This is a stylisation, not a trace of the photograph, and the geometry is
 * COMPUTED rather than hand-drawn: hand-tuned Bézier blades kept collapsing
 * into a star or a pie chart. Each blade lives between two copies of one
 * spiral (radius grows core→rim while the angle sweeps clockwise), rotated
 * 120° apart and pulled in by an angular gap that becomes the white channel.
 * The three-fold symmetry, the pinwheel motion and the tapering channels all
 * fall out of that one parametric curve.
 */

const BALL_R = 47;
const CX = 50;
/** White core the three blade tails curl around. */
const CORE_R = 9;
/** Clockwise twist from a blade's core tail to its rim head — the pinwheel. */
const SWEEP_DEG = 82;
/**
 * Angular half-width of the white channel between neighbouring blades. The
 * real ball is white-DOMINANT — undersize this and the drawing collapses into
 * a camera-shutter of colour.
 */
const GAP_DEG = 13;

/** Point on the blade-boundary spiral anchored at `startDeg`, t ∈ [0,1]. */
function spiralPoint(startDeg: number, t: number): [number, number] {
  const r = CORE_R + (BALL_R - CORE_R) * t;
  const a = ((startDeg + SWEEP_DEG * t) * Math.PI) / 180;
  return [CX + r * Math.sin(a), CX - r * Math.cos(a)];
}

/** The spiral sampled as a polyline path segment (t0 → t1, either direction). */
function spiralLine(startDeg: number, t0: number, t1: number): string {
  const steps = 26;
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const [x, y] = spiralPoint(startDeg, t0 + ((t1 - t0) * i) / steps);
    parts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(" ");
}

/** Closed blade outline: spiral out, rim arc, spiral back, arc around the core. */
function bladePath(startDeg: number): string {
  const edgeA = startDeg + GAP_DEG;
  const edgeB = startDeg + 120 - GAP_DEG;
  const [rimX, rimY] = spiralPoint(edgeB, 1);
  const [coreX, coreY] = spiralPoint(edgeA, 0);
  return [
    spiralLine(edgeA, 0, 1),
    `A ${BALL_R} ${BALL_R} 0 0 1 ${rimX.toFixed(2)} ${rimY.toFixed(2)}`,
    spiralLine(edgeB, 1, 0).replace(/^M/, "L"),
    `A ${CORE_R} ${CORE_R} 0 0 0 ${coreX.toFixed(2)} ${coreY.toFixed(2)}`,
    "Z",
  ].join(" ");
}

const BLADES = [
  { deg: 0, id: "tri-red", from: "#E85045", to: "#A8221E" }, // Canada
  { deg: 120, id: "tri-blue", from: "#41B9EA", to: "#1258BE" }, // USA
  { deg: 240, id: "tri-green", from: "#16AC58", to: "#077038" }, // Mexico
].map((blade) => ({
  ...blade,
  d: bladePath(blade.deg),
  // Line-work inside the panel, echoing the real ball's embossed striping.
  details: [0.32, 0.62].map((f) => ({
    f,
    d: spiralLine(blade.deg + GAP_DEG + (120 - 2 * GAP_DEG) * f, 0.1, 0.95),
  })),
  // Gradient runs along the blade: lit at the rim head, deep at the core tail.
  gradFrom: spiralPoint(blade.deg + 60, 1),
  gradTo: spiralPoint(blade.deg + GAP_DEG, 0),
}));

/** Stitch grooves running down the middle of each white channel. */
const SEAMS = [0, 120, 240].map((deg) => ({
  deg,
  d: spiralLine(deg, 0.05, 1),
}));

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
        {/* Off-centre highlight reads as a light source, so the flat drawing
            sits on the page as a sphere rather than a disc. */}
        <radialGradient id="ball-shade" cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="58%" stopColor="#f4f6fa" />
          <stop offset="100%" stopColor="#c9d2df" />
        </radialGradient>
        {/* Same light applied over the panels, so the colours darken toward
            the lower-right edge with the rest of the ball. */}
        <radialGradient id="ball-light" cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1020" stopOpacity="0.26" />
        </radialGradient>
        {BLADES.map((blade) => (
          <linearGradient
            key={blade.id}
            id={blade.id}
            gradientUnits="userSpaceOnUse"
            x1={blade.gradFrom[0]}
            y1={blade.gradFrom[1]}
            x2={blade.gradTo[0]}
            y2={blade.gradTo[1]}
          >
            <stop offset="0%" stopColor={blade.from} />
            <stop offset="100%" stopColor={blade.to} />
          </linearGradient>
        ))}
      </defs>

      <circle cx="50" cy="50" r="47" fill="url(#ball-shade)" />

      <g clipPath="url(#ball-clip)">
        {BLADES.map((blade) => (
          <g key={blade.deg}>
            <path
              d={blade.d}
              fill={`url(#${blade.id})`}
              stroke="#233043"
              strokeOpacity="0.25"
              strokeWidth="0.7"
            />
            {blade.details.map((detail) => (
              <path
                key={detail.f}
                d={detail.d}
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.22"
                strokeWidth="1"
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}

        {/* Stitch grooves down the middle of each white channel. */}
        {SEAMS.map((seam) => (
          <path
            key={seam.deg}
            d={seam.d}
            fill="none"
            stroke="#9aa6b8"
            strokeOpacity="0.5"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        ))}

        <circle cx="50" cy="50" r="47" fill="url(#ball-light)" />
      </g>

      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="#2e3646"
        strokeWidth="1.5"
        opacity="0.8"
      />
    </svg>
  );
}
