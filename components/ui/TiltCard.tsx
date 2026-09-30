"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export interface TiltCardProps {
  children: ReactNode;
  /** Applied to the perspective wrapper (grid sizing, rounding, etc.). */
  className?: string;
  /** Maximum tilt in degrees at the card edge. */
  maxTilt?: number;
  /** Lime glare highlight that follows the pointer (a passing bulb). */
  glare?: boolean;
}

const SPRING = { stiffness: 280, damping: 24, mass: 0.6 };

/**
 * Pure CSS-3D tilt (perspective + rotateX/rotateY) — no Three.js canvas.
 * Pointer position maps to motion values, smoothed with springs; a lime
 * glare tracks the pointer like a bulb passing over the surface.
 *
 * prefers-reduced-motion: the pointer handlers never fire, so the card
 * stays perfectly flat.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  glare = true,
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = !!useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(py, [0, 1], [maxTilt, -maxTilt]),
    SPRING
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-maxTilt, maxTilt]),
    SPRING
  );
  const glareBackground = useTransform([px, py], ([x, y]: number[]) =>
    `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(200, 255, 77, 0.13), transparent 65%)`
  );

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function reset() {
    setHovered(false);
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={reset}
      onPointerCancel={reset}
      className={`[perspective:1100px] ${className}`}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full rounded-[inherit]"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen"
            style={{ background: glareBackground }}
            animate={{ opacity: hovered && !reduceMotion ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </div>
  );
}
