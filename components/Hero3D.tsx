"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Homepage hero showpiece: a low-poly chili-red lantern wrapped in a lime
 * neon tube ring that flickers on while the lantern spins into place —
 * one orchestrated "sign switching on" moment for the whole site.
 *
 * Constraints honored:
 *  - primitive/procedural geometry only (no .glb / external assets)
 *  - low poly + 3 lights + no shadows (mobile friendly)
 *  - static fallback if WebGL is unavailable, fails, or loses context
 *  - prefers-reduced-motion: renders the final steady state, no animation
 */

/* ------------------------------------------------------------------ */
/* Static fallback: a CSS/SVG neon sign, no WebGL required             */
/* ------------------------------------------------------------------ */

function NeonSignFallback({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 240"
        className="h-full w-full max-h-[420px] motion-reduce:animate-none animate-neon-flicker"
        role="presentation"
      >
        {/* neon ring */}
        <circle
          cx="120"
          cy="120"
          r="86"
          fill="none"
          stroke="#C8FF4D"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 10px #C8FF4D)" }}
        />
        <circle
          cx="120"
          cy="120"
          r="86"
          fill="none"
          stroke="#C8FF4D"
          strokeWidth="18"
          strokeOpacity="0.18"
        />
        {/* lantern diamond */}
        <path
          d="M120 68 L162 120 L120 172 L78 120 Z"
          fill="#FF4B3E"
          stroke="#0B0B0D"
          strokeWidth="4"
        />
        <path d="M120 84 L148 120 L120 156 L92 120 Z" fill="#D93A30" />
        {/* orbiting sparks */}
        <circle cx="120" cy="18" r="6" fill="#FF4B3E" />
        <rect x="210" y="112" width="14" height="14" fill="#EDE6D6" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WebGL availability check                                            */
/* ------------------------------------------------------------------ */

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Scene pieces                                                        */
/* ------------------------------------------------------------------ */

/** Neon stutter envelope: pattern over the first 1.8s, steady after. */
const FLICKER_PATTERN = [0, 0.15, 0, 0.7, 0.2, 1, 0.35, 1, 0.6, 1];

function flickerAt(t: number): number {
  if (t >= 1.8) return 1;
  const index = Math.min(
    FLICKER_PATTERN.length - 1,
    Math.floor((t / 1.8) * FLICKER_PATTERN.length)
  );
  return FLICKER_PATTERN[index];
}

function NeonRing({ reduced }: { reduced: boolean }) {
  const tube = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const f = flickerAt(clock.getElapsedTime());
    const tubeMat = tube.current?.material as THREE.MeshStandardMaterial | undefined;
    if (tubeMat) tubeMat.emissiveIntensity = 0.25 + f * 3.4;
    const glowMat = glow.current?.material as THREE.MeshBasicMaterial | undefined;
    if (glowMat) glowMat.opacity = 0.04 + f * 0.16;
  });

  return (
    <group rotation={[Math.PI / 2.35, 0, 0.35]}>
      <mesh ref={tube}>
        <torusGeometry args={[2, 0.05, 6, 72]} />
        <meshStandardMaterial
          color="#C8FF4D"
          emissive="#C8FF4D"
          emissiveIntensity={reduced ? 3.6 : 0.25}
          roughness={0.3}
          metalness={0}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={glow}>
        <torusGeometry args={[2, 0.22, 6, 72]} />
        <meshBasicMaterial
          color="#C8FF4D"
          transparent
          opacity={reduced ? 0.2 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Lantern({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reduced || !mesh.current) return;
    mesh.current.rotation.x += delta * 0.15;
    mesh.current.rotation.z += delta * 0.08;
  });

  return (
    <mesh ref={mesh}>
      {/* 80 faces — deliberately low poly */}
      <icosahedronGeometry args={[1.15, 1]} />
      <meshStandardMaterial
        color="#FF4B3E"
        emissive="#FF4B3E"
        emissiveIntensity={0.22}
        roughness={0.45}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

function Steam({ reduced }: { reduced: boolean }) {
  const refs = useRef<Array<THREE.Mesh | null>>([null, null, null]);
  const baseX = [-0.55, 0.15, 0.75];

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.getElapsedTime();
    refs.current.forEach((meshRef, i) => {
      if (!meshRef) return;
      const progress = (t * 0.35 + i * 0.55) % 1.5;
      meshRef.position.y = 1.7 + progress;
      meshRef.position.x = baseX[i] + Math.sin(t * 1.4 + i) * 0.12;
      meshRef.scale.setScalar(0.7 + progress * 0.45);
      const mat = meshRef.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.38 - progress * 0.24);
    });
  });

  return (
    <group>
      {baseX.map((x, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[x, 1.9 + i * 0.2, 0.1]}
        >
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshBasicMaterial
            color="#EDE6D6"
            transparent
            opacity={reduced ? 0.25 : 0.3}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Satellites({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reduced || !group.current) return;
    group.current.rotation.z += delta * 0.3;
    group.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={group}>
      <mesh position={[2.75, 0.35, 0]}>
        <tetrahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color="#FF4B3E"
          emissive="#FF4B3E"
          emissiveIntensity={0.4}
          flatShading
        />
      </mesh>
      <mesh position={[-2.55, -0.6, 0.4]} rotation={[0.6, 0.3, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#EDE6D6" flatShading roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * Orchestrated entrance: the piece spins in from a thrown angle while the
 * neon ring flickers on (see NeonRing), then settles into a gentle idle sway.
 */
function Rig({
  reduced,
  children,
}: {
  reduced: boolean;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    if (reduced) {
      group.current.rotation.set(0, 0, 0);
      group.current.scale.setScalar(1);
      return;
    }
    const now = clock.getElapsedTime();
    if (startedAt.current === null) startedAt.current = now;
    const elapsed = now - startedAt.current;
    const t = Math.min(1, elapsed / 1.4);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic

    if (t < 1) {
      group.current.rotation.y = -Math.PI * 0.85 * (1 - eased);
      // slight overshoot before settling
      const overshoot = Math.sin(Math.PI * t) * 0.08;
      group.current.scale.setScalar(0.55 + 0.45 * eased + overshoot);
    } else {
      // idle sway after landing
      group.current.rotation.y = Math.sin((elapsed - 1.4) * 0.45) * 0.14;
      group.current.scale.setScalar(1);
    }
  });

  return <group ref={group}>{children}</group>;
}

function Scene({ reduced }: { reduced: boolean }) {
  const inner = (
    <group>
      <Lantern reduced={reduced} />
      <NeonRing reduced={reduced} />
      <Steam reduced={reduced} />
      <Satellites reduced={reduced} />
    </group>
  );

  return (
    <>
      {/* three lights, no shadows */}
      <ambientLight intensity={0.6} color="#EDE6D6" />
      <directionalLight position={[4, 6, 5]} intensity={1.15} color="#FFF4E6" />
      <pointLight
        position={[-3.2, -1.5, 2.5]}
        intensity={14}
        distance={14}
        decay={2}
        color="#FF4B3E"
      />
      <Rig reduced={reduced}>
        {reduced ? (
          inner
        ) : (
          <Float speed={1.5} rotationIntensity={0.12} floatingRange={[-0.12, 0.12]}>
            {inner}
          </Float>
        )}
      </Rig>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Error boundary for runtime WebGL failures                           */
/* ------------------------------------------------------------------ */

class NeonErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[Hero3D] WebGL scene failed — using static fallback.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export default function Hero3D({ className = "" }: { className?: string }) {
  // null = server render + first client paint (both show the static
  // fallback, so hydration always matches), then we probe for WebGL.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const reduced = !!useReducedMotion();

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  const fallback = <NeonSignFallback className="h-full w-full" />;

  if (webgl === false) return <div className={className}>{fallback}</div>;

  return (
    <div className={className} aria-hidden="true">
      {webgl === true ? (
        <NeonErrorBoundary fallback={fallback}>
          <Canvas
            dpr={[1, 1.75]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            camera={{ position: [0, 0, 6.8], fov: 38 }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              // If the context dies (driver crash, tab throttling), fall back.
              gl.domElement.addEventListener("webglcontextlost", () =>
                setWebgl(false)
              );
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Scene reduced={reduced} />
          </Canvas>
        </NeonErrorBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
