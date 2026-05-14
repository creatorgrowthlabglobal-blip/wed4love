import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ───────────────────── Mailbox Body ─────────────────────
   Classic American curved-top mailbox.
   Built from a half-cylinder (top) + a box (bottom) merged visually,
   with a hinged front door, red flag, and a small house number.
*/

const BODY_RED = "#B7202C";
const BODY_RED_DARK = "#7A1620";
const FLAG_RED = "#D9302F";
const METAL_DARK = "#2a2a2a";

function MailboxShell() {
  // Curved top (half cylinder lying on its side)
  return (
    <group>
      {/* Top half-cylinder shell */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.7, 0.7, 1.8, 48, 1, true, 0, Math.PI]} />
        <meshStandardMaterial
          color={BODY_RED}
          metalness={0.55}
          roughness={0.38}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flat bottom plate */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 0.04, 1.4]} />
        <meshStandardMaterial color={BODY_RED_DARK} metalness={0.5} roughness={0.45} />
      </mesh>

      {/* Back wall (closed end, opposite of door) */}
      <mesh castShadow position={[-0.9, 0.85, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.7, 48, 0, Math.PI]} />
        <meshStandardMaterial color={BODY_RED_DARK} metalness={0.5} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner cavity (darker interior) — slightly smaller half-cylinder */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.66, 0.66, 1.78, 48, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#1a1011" roughness={0.95} side={THREE.BackSide} />
      </mesh>

      {/* Small rivets along the seam */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.85 + i * 0.24, 0.5, 0.71]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Door (hinged at the bottom front) ── */
function MailboxDoor({ open }: { open: boolean }) {
  const doorRef = useRef<THREE.Group>(null);
  const target = open ? -Math.PI / 1.7 : 0; // hinge open downward

  useFrame((_, delta) => {
    if (!doorRef.current) return;
    doorRef.current.rotation.x = THREE.MathUtils.lerp(
      doorRef.current.rotation.x,
      target,
      delta * 4.5
    );
  });

  return (
    // Hinge pivot at bottom front edge of mailbox opening
    <group ref={doorRef} position={[0.9, 0.5, 0]}>
      {/* Door panel — half-disc shape */}
      <mesh castShadow position={[0.02, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.68, 48, 0, Math.PI]} />
        <meshStandardMaterial
          color={BODY_RED}
          metalness={0.55}
          roughness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Door rim */}
      <mesh position={[0.025, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.66, 0.7, 48, 1, 0, Math.PI]} />
        <meshStandardMaterial color={BODY_RED_DARK} metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Latch / knob */}
      <mesh position={[0.07, 0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.07, 24]} />
        <meshStandardMaterial color="#dcdcdc" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

/* ── Red Flag on the side ── */
function MailboxFlag({ raised }: { raised: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const target = raised ? 0 : -Math.PI / 2;

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, target, delta * 4);
  });

  return (
    <group position={[-0.2, 0.5, 0.72]}>
      {/* Mounting post */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Flag arm — pivots at base */}
      <group ref={ref} position={[0, 0, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.025, 0.6, 0.025]} />
          <meshStandardMaterial color={FLAG_RED} metalness={0.3} roughness={0.5} />
        </mesh>
        {/* Flag rectangle on top */}
        <mesh position={[0.12, 0.5, 0]}>
          <boxGeometry args={[0.22, 0.18, 0.015]} />
          <meshStandardMaterial color={FLAG_RED} metalness={0.3} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Wooden post & ground ── */
function Post() {
  return (
    <group>
      {/* Wooden post */}
      <mesh castShadow receiveShadow position={[0, -0.7, 0]}>
        <boxGeometry args={[0.18, 2.2, 0.18]} />
        <meshStandardMaterial color="#6b4a2b" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Top mounting plate */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.5]} />
        <meshStandardMaterial color="#4a3320" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ── Envelope that slides out ── */
function Envelope({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // Drive a 0→1 progress when opening
    t.current = THREE.MathUtils.lerp(t.current, open ? 1 : 0, delta * 2.2);
    const p = t.current;

    // Slide forward (out of the box) then float upward
    const slideOut = Math.min(p * 1.8, 1); // 0..1 in first half
    const floatUp = Math.max((p - 0.55) / 0.45, 0); // 0..1 in second half

    ref.current.position.x = 0.4 + slideOut * 0.9; // out the front
    ref.current.position.y = 0.5 + floatUp * 1.2 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04 * floatUp;
    ref.current.position.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 * floatUp;

    // Tilt as it lifts
    ref.current.rotation.z = floatUp * 0.18 + Math.sin(state.clock.elapsedTime * 1.1) * 0.04 * floatUp;
    ref.current.rotation.y = floatUp * 0.25;

    // Hide when fully closed
    ref.current.visible = p > 0.02;
  });

  return (
    <group ref={ref} position={[0.4, 0.5, 0]} rotation={[0, 0, 0]}>
      {/* Envelope body — flat thin box */}
      <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.85, 0.55, 0.012]} />
        <meshStandardMaterial color="#f5ecdc" roughness={0.9} metalness={0} />
      </mesh>
      {/* Triangular flap (rotated square) on front face */}
      <mesh position={[0.008, 0.08, 0]} rotation={[0, Math.PI / 2, Math.PI / 4]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshStandardMaterial color="#ecdfca" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Wax seal */}
      <mesh position={[0.014, -0.04, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.008, 24]} />
        <meshStandardMaterial color="#8B2E2E" roughness={0.45} metalness={0.15} />
      </mesh>
    </group>
  );
}

/* ── Whole scene ── */
function Scene({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <Post />
      <MailboxShell />
      <MailboxDoor open={open} />
      <MailboxFlag raised={open} />
      <Envelope open={open} />
    </group>
  );
}

interface Props {
  className?: string;
}

const RealisticMailbox = ({ className }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={className ?? "w-full h-full"}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [3.2, 1.6, 3.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Soft warm key light */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.4}
          color="#fff1e0"
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
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#ffd9c8" />
        <pointLight position={[2, 1, 2]} intensity={0.5} color="#fff" distance={8} />

        <Scene open={open} setOpen={setOpen} />

        <ContactShadows
          position={[0, -1.78, 0]}
          opacity={0.55}
          scale={6}
          blur={2.4}
          far={3}
        />

        <Environment preset="apartment" environmentIntensity={0.6} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!open}
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
};

export default RealisticMailbox;
