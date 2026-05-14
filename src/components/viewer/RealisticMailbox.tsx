import { Component, type ReactNode, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { isWebGLAvailable } from "@/lib/webglSupport";

/* ─────────────────── Cute Claymation Mailbox ───────────────────
   Inspired by M Wildan Cahya Syarief's Dribbble shot.
   Soft pastel palette, rounded "clay" materials, no metallic shine.
*/

const PINK_LIGHT = "#FFB3C1";
const PINK = "#FF6F85";
const PINK_DARK = "#E84D67";
const YELLOW = "#FFD23F";
const YELLOW_DARK = "#E8B423";
const WOOD = "#C68A55";
const WOOD_DARK = "#8C5A33";
const GRASS = "#7BD66E";
const GRASS_DARK = "#4FA346";
const STONE = "#B8B8C2";
const FENCE = "#F4EFE6";
const ORANGE = "#FF8A3D";

// Shared "clay" material settings — matte, slightly soft.
const clay = (color: string) => (
  <meshStandardMaterial color={color} roughness={0.55} metalness={0} />
);

/* ── Mailbox body: rounded pink "tube" with flat bottom ── */
function MailboxBody() {
  return (
    <group>
      {/* Top half-cylinder shell (pink) */}
      <mesh castShadow receiveShadow position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.75, 0.75, 1.7, 64, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color={PINK} roughness={0.5} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner darker cavity */}
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.7, 0.7, 1.69, 64, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color={PINK_DARK} roughness={0.85} side={THREE.BackSide} />
      </mesh>

      {/* Back wall — closed semicircle */}
      <mesh castShadow position={[-0.85, 0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.75, 48, 0, Math.PI]} />
        {clay(PINK)}
      </mesh>

      {/* Light grey base band under the pink tube */}
      <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
        <boxGeometry args={[1.85, 0.22, 1.55]} />
        {clay("#E5E5EA")}
      </mesh>

      {/* Soft pink top highlight stripe */}
      <mesh position={[0, 1.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 0.18]} />
        {clay(PINK_LIGHT)}
      </mesh>
    </group>
  );
}

/* ── Front door: hinged at the bottom, swings down ── */
function MailboxDoor({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const target = open ? -Math.PI / 1.65 : 0;

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, target, delta * 4.5);
  });

  return (
    <group ref={ref} position={[0.85, 0.2, 0]}>
      {/* Door panel — half disc, slightly thick */}
      <mesh castShadow position={[0.04, 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 0.08, 48, 1, false, 0, Math.PI]} />
        {clay(PINK)}
      </mesh>
      {/* Inner lighter face */}
      <mesh position={[0.085, 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.72, 48, 0, Math.PI]} />
        {clay(PINK_DARK)}
      </mesh>
      {/* Latch — small white pill at top */}
      <mesh position={[0.09, 1.42, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.05, 0.18, 8, 16]} />
        {clay("#F5F5F7")}
      </mesh>
    </group>
  );
}

/* ── Yellow flag on a yellow post with a round joint ── */
function MailboxFlag({ raised }: { raised: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const target = raised ? 0 : -Math.PI / 2;

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, target, delta * 4);
  });

  return (
    <group position={[-0.1, 1.05, 0.55]}>
      {/* Yellow round joint / knob */}
      <mesh castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
        {clay(YELLOW)}
      </mesh>
      {/* Flag arm + flag — pivots at the joint */}
      <group ref={ref}>
        {/* Vertical post */}
        <mesh castShadow position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.9, 16]} />
          {clay(YELLOW)}
        </mesh>
        {/* Flag rectangle on top */}
        <mesh castShadow position={[0.15, 0.78, 0]}>
          <boxGeometry args={[0.32, 0.22, 0.05]} />
          {clay(YELLOW)}
        </mesh>
      </group>
    </group>
  );
}

/* ── Envelope: yellow, slides forward & tilts when door opens ── */
function Envelope({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    t.current = THREE.MathUtils.lerp(t.current, open ? 1 : 0, delta * 2.4);
    const p = t.current;
    const slide = Math.min(p * 1.5, 1);
    const float = Math.max((p - 0.6) / 0.4, 0);

    ref.current.position.x = 0.45 + slide * 0.55;
    ref.current.position.y = 0.55 + float * 0.18 + Math.sin(state.clock.elapsedTime * 1.6) * 0.025 * float;
    ref.current.rotation.z = -0.35 + float * 0.05;
    ref.current.rotation.y = 0.05;
    ref.current.visible = p > 0.02;
  });

  return (
    <group ref={ref} position={[0.45, 0.55, 0]}>
      {/* Envelope body */}
      <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.08]} />
        {clay(YELLOW)}
      </mesh>
      {/* Triangular flap (front) */}
      <mesh position={[0.05, 0.0, 0]} rotation={[0, Math.PI / 2, Math.PI / 4]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshStandardMaterial color={YELLOW_DARK} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Two front fold lines (subtle V) */}
      <mesh position={[0.046, -0.08, 0.18]} rotation={[0, Math.PI / 2, -0.6]}>
        <planeGeometry args={[0.36, 0.04]} />
        <meshStandardMaterial color={YELLOW_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0.046, -0.08, -0.18]} rotation={[0, Math.PI / 2, 0.6]}>
        <planeGeometry args={[0.36, 0.04]} />
        <meshStandardMaterial color={YELLOW_DARK} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ── Wooden post & cylindrical stump base ── */
function Post() {
  return (
    <group>
      {/* Square wooden post */}
      <mesh castShadow receiveShadow position={[0, -0.55, 0]}>
        <boxGeometry args={[0.28, 1.0, 0.28]} />
        {clay(WOOD)}
      </mesh>
      {/* Stump at the base */}
      <mesh castShadow receiveShadow position={[0, -1.12, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.22, 24]} />
        {clay(WOOD_DARK)}
      </mesh>
      {/* Top wood ring on stump */}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.02, 24]} />
        {clay("#A06A3F")}
      </mesh>
    </group>
  );
}

/* ── Single picket of the white fence ── */
function Picket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Vertical board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.7, 0.05]} />
        {clay(FENCE)}
      </mesh>
      {/* Triangular top (small pyramid) */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <coneGeometry args={[0.13, 0.18, 4]} />
        {clay(FENCE)}
      </mesh>
      {/* Two dark dots */}
      <mesh position={[0, 0.05, 0.026]}>
        <circleGeometry args={[0.018, 16]} />
        {clay("#3a2a2a")}
      </mesh>
      <mesh position={[0, -0.15, 0.026]}>
        <circleGeometry args={[0.018, 16]} />
        {clay("#3a2a2a")}
      </mesh>
    </group>
  );
}

/* ── Tiny daisy/flower with orange petals + yellow center ── */
function Flower({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.24, 8]} />
        {clay(GRASS_DARK)}
      </mesh>
      {/* Petals — 5 around */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.06, 0.26, Math.sin(a) * 0.06]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            {clay(ORANGE)}
          </mesh>
        );
      })}
      {/* Center */}
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        {clay(YELLOW)}
      </mesh>
    </group>
  );
}

/* ── Little grass tuft (3 small cones) ── */
function GrassTuft({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.05, 0, 0.05].map((x, i) => (
        <mesh key={i} position={[x, i === 1 ? 0.06 : 0.04, 0]}>
          <coneGeometry args={[0.035, i === 1 ? 0.16 : 0.12, 8]} />
          {clay(GRASS_DARK)}
        </mesh>
      ))}
    </group>
  );
}

/* ── Stone (small grey sphere flattened) ── */
function Stone({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh castShadow position={position} scale={[scale, scale * 0.55, scale]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      {clay(STONE)}
    </mesh>
  );
}

/* ── Grassy ground disc ── */
function Ground() {
  return (
    <group position={[0, -1.25, 0]}>
      {/* Top green disc */}
      <mesh receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.18, 64]} />
        {clay(GRASS)}
      </mesh>
      {/* Slight darker side */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[2.2, 2.05, 0.06, 64]} />
        {clay(GRASS_DARK)}
      </mesh>
    </group>
  );
}

/* ── Whole scene ── */
function Scene({ open, setOpen, allowClose = true }: { open: boolean; setOpen: (v: boolean) => void; allowClose?: boolean }) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (!open || allowClose) setOpen(!open);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <Ground />

      {/* Picket fence (behind, to the left) */}
      <group position={[-1.1, -0.85, -0.4]} rotation={[0, 0.15, 0]}>
        <Picket position={[-0.45, 0, 0]} />
        <Picket position={[-0.18, 0, 0]} />
        <Picket position={[0.09, 0, 0]} />
        {/* Horizontal rails */}
        <mesh position={[-0.18, 0.1, -0.04]}>
          <boxGeometry args={[0.85, 0.06, 0.04]} />
          {clay(FENCE)}
        </mesh>
        <mesh position={[-0.18, -0.18, -0.04]}>
          <boxGeometry args={[0.85, 0.06, 0.04]} />
          {clay(FENCE)}
        </mesh>
      </group>

      <Post />
      <MailboxBody />
      <MailboxDoor open={open} />
      <MailboxFlag raised={open} />
      <Envelope open={open} />

      {/* Decoration on the grass */}
      <Flower position={[-0.55, -1.16, 0.85]} scale={1.1} />
      <Flower position={[1.0, -1.16, 0.7]} scale={1} />
      <Flower position={[1.4, -1.16, -0.2]} scale={0.85} />
      <GrassTuft position={[0.6, -1.16, 1.1]} />
      <GrassTuft position={[-1.3, -1.16, 0.6]} />
      <GrassTuft position={[1.55, -1.16, 0.4]} />
      <GrassTuft position={[-0.9, -1.16, -0.7]} />
      <Stone position={[0.3, -1.18, 1.15]} scale={0.9} />
      <Stone position={[-0.3, -1.18, 1.05]} scale={0.6} />
      <Stone position={[1.3, -1.18, 0.95]} scale={0.7} />
      <Stone position={[-1.0, -1.18, 0.95]} scale={0.55} />
    </group>
  );
}

interface Props {
  className?: string;
  onContinue?: () => void;
}

interface MailboxErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface MailboxErrorBoundaryState {
  hasError: boolean;
}

class MailboxErrorBoundary extends Component<MailboxErrorBoundaryProps, MailboxErrorBoundaryState> {
  state: MailboxErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MailboxErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("RealisticMailbox fell back to static rendering:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function MailboxFallback({ open, setOpen, onContinue }: { open: boolean; setOpen: (v: boolean) => void; onContinue?: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 relative">
      <button
        type="button"
        onClick={() => !open && setOpen(true)}
        className="relative h-72 w-72 focus:outline-none"
        aria-label={open ? "A letter is waiting" : "Tap the mailbox"}
      >
        <div className="absolute left-1/2 top-6 h-32 w-44 -translate-x-1/2 rounded-t-full" style={{ background: PINK }} />
        <div className="absolute left-1/2 top-[9.5rem] h-3 w-44 -translate-x-1/2" style={{ background: "#E5E5EA" }} />
        <div className="absolute left-1/2 top-[10.5rem] h-24 w-7 -translate-x-1/2 rounded-sm" style={{ background: WOOD }} />
        <div className="absolute bottom-2 left-1/2 h-6 w-[80%] -translate-x-1/2 rounded-full bg-foreground/15 blur-xl" />
        <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {open ? "A letter is waiting" : "Tap the mailbox"}
        </p>
      </button>
      {open && onContinue && (
        <button
          onClick={(e) => { e.stopPropagation(); onContinue(); }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2.5 rounded-full bg-white text-foreground font-heading text-sm font-semibold shadow-xl border border-primary/30 hover:scale-105 transition-transform"
        >
          Open the letter →
        </button>
      )}
    </div>
  );
}

const RealisticMailbox = ({ className, onContinue }: Props) => {
  const [open, setOpen] = useState(false);
  const fallback = <MailboxFallback open={open} setOpen={setOpen} onContinue={onContinue} />;

  if (!isWebGLAvailable()) {
    return <div className={className ?? "w-full h-full"}>{fallback}</div>;
  }

  return (
    <div className={`${className ?? "w-full h-full"} relative`}>
      <MailboxErrorBoundary fallback={fallback}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [3.2, 1.4, 4.2], fov: 35 }}
          gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        >
          <color attach="background" args={["#F4F1EC"]} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[4, 6, 3]}
            intensity={1.3}
            color="#fff5e6"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#ffd9e5" />
          <pointLight position={[2, 1.5, 2]} intensity={0.4} color="#ffffff" distance={8} />

          <Scene open={open} setOpen={setOpen} allowClose={!onContinue} />

          <ContactShadows position={[0, -1.34, 0]} opacity={0.4} scale={8} blur={2.6} far={4} />
          <Environment preset="apartment" environmentIntensity={0.5} />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={!open}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </MailboxErrorBoundary>

      {open && onContinue && (
        <button
          onClick={() => onContinue()}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2.5 rounded-full bg-white text-foreground font-heading text-sm font-semibold shadow-xl border border-primary/30 hover:scale-105 transition-transform"
        >
          Open the letter →
        </button>
      )}
    </div>
  );
};

export default RealisticMailbox;
