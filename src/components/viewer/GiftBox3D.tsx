import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  RoundedBox,
  Text,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

/* ─── PALETTE ─── */
const BLUSH_BODY = "#d4a0ae";
const BLUSH_LID = "#cc96a4";
const BLUSH_INNER = "#fce4ea";
const CHAMPAGNE = "#c4a265";
const CHAMPAGNE_LIGHT = "#d4b880";
const ENVELOPE_PAPER = "#fdf8f2";
const GOLD_FOIL = "#b8943e";

/* ─── RIBBON MATERIAL PROPS (reusable) ─── */
const useRibbonMaterial = () =>
  useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(CHAMPAGNE),
        metalness: 0.9,
        roughness: 0.2,
        clearcoat: 0.7,
        clearcoatRoughness: 0.15,
        envMapIntensity: 2.8,
        sheen: 1.0,
        sheenRoughness: 0.25,
        sheenColor: new THREE.Color(CHAMPAGNE_LIGHT),
        side: THREE.DoubleSide,
      }),
    []
  );

/* ─── FLAT RIBBON STRIP (realistic flat silk, not tubes) ─── */
const FlatRibbon = ({
  position,
  size,
  rotation,
}: {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const mat = useRibbonMaterial();
  return (
    <mesh position={position} rotation={rotation} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  );
};

/* ─── REALISTIC BOW ─── */
const RealisticBow = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  const mat = useRibbonMaterial();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.012;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.003;
    }
  });

  // Create a loop shape using LatheGeometry-like approach with custom curves
  const createLoopGeometry = useCallback((radiusX: number, radiusY: number, thickness: number) => {
    const shape = new THREE.Shape();
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI;
      const x = Math.cos(angle) * radiusX;
      const y = Math.sin(angle) * radiusY;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    // Return path back slightly offset to create ribbon width
    for (let i = segments; i >= 0; i--) {
      const angle = (i / segments) * Math.PI;
      const x = Math.cos(angle) * (radiusX - thickness * 0.15);
      const y = Math.sin(angle) * (radiusY - thickness * 0.08);
      shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  const outerLoop = useMemo(() => createLoopGeometry(0.18, 0.12, 0.06), [createLoopGeometry]);
  const innerLoop = useMemo(() => createLoopGeometry(0.12, 0.09, 0.05), [createLoopGeometry]);

  // Tail shape - drooping ribbon end
  const createTailGeometry = useCallback(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.03, 0);
    shape.quadraticCurveTo(0.035, -0.1, 0.015, -0.18);
    shape.lineTo(0.025, -0.14);
    shape.quadraticCurveTo(0.02, -0.08, -0.005, -0.01);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 1,
    });
  }, []);

  const tailGeom = useMemo(() => createTailGeometry(), [createTailGeometry]);

  return (
    <group ref={ref} position={position}>
      {/* Left outer loop */}
      <mesh
        geometry={outerLoop}
        material={mat}
        position={[-0.02, 0, -0.03]}
        rotation={[Math.PI / 2, 0, -0.35]}
      />
      {/* Right outer loop */}
      <mesh
        geometry={outerLoop}
        material={mat}
        position={[0.02, 0, -0.03]}
        rotation={[Math.PI / 2, Math.PI, 0.35]}
      />
      {/* Left inner loop (slightly tilted) */}
      <mesh
        geometry={innerLoop}
        material={mat}
        position={[-0.01, 0.02, -0.01]}
        rotation={[Math.PI / 2, 0.15, -0.2]}
      />
      {/* Right inner loop */}
      <mesh
        geometry={innerLoop}
        material={mat}
        position={[0.01, 0.02, -0.01]}
        rotation={[Math.PI / 2, -0.15 + Math.PI, 0.2]}
      />

      {/* Center knot - slightly squished sphere */}
      <mesh position={[0, 0.01, 0.01]}>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshPhysicalMaterial
          color={CHAMPAGNE}
          metalness={0.9}
          roughness={0.18}
          clearcoat={0.9}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Gold center ring */}
      <mesh position={[0, 0.01, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 16, 32]} />
        <meshPhysicalMaterial
          color={CHAMPAGNE}
          metalness={0.95}
          roughness={0.12}
          clearcoat={1.0}
          envMapIntensity={3.5}
        />
      </mesh>

      {/* Fabric wrap around knot */}
      <mesh position={[0, 0.005, 0.01]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.05, 0.018, 12, 20]} />
        <meshPhysicalMaterial
          color={CHAMPAGNE}
          metalness={0.85}
          roughness={0.2}
          clearcoat={0.7}
          envMapIntensity={2.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left tail */}
      <mesh
        geometry={tailGeom}
        material={mat}
        position={[-0.08, -0.02, -0.005]}
        rotation={[0, 0, 0.4]}
      />
      {/* Right tail */}
      <mesh
        geometry={tailGeom}
        material={mat}
        position={[0.08, -0.02, -0.005]}
        rotation={[0, Math.PI, -0.4]}
      />
    </group>
  );
};

/* ─── SUBTLE SPARKLE DUST ─── */
const FloatingDust = () => {
  const count = 50;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 12;
      p[i * 3 + 1] = Math.random() * 7 - 1;
      p[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    return p;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i);
      y += 0.001 + Math.sin(state.clock.elapsedTime * 0.06 + i) * 0.0003;
      if (y > 6) y = -1;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#f0dcc8"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ─── SOFT HEART PARTICLES ─── */
const HeartParticles = () => {
  const count = 20;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = Math.random() * 7 - 1;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    return p;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i);
      y += 0.002 + Math.sin(state.clock.elapsedTime * 0.12 + i * 0.4) * 0.0008;
      if (y > 6) y = -1;
      attr.setY(i, y);
      const x = attr.getX(i);
      attr.setX(i, x + Math.sin(state.clock.elapsedTime * 0.15 + i) * 0.0006);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#f0dcc8"
        transparent
        opacity={0.12}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ─── CRISP ENVELOPE ─── */
const Envelope = ({
  visible,
  phase,
}: {
  visible: boolean;
  phase: "rising" | "hovering";
}) => {
  const ref = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (visible) progressRef.current = 0;
  }, [visible]);

  useFrame((state, delta) => {
    if (!visible || !ref.current) return;
    progressRef.current = Math.min(progressRef.current + delta * 0.65, 1);
    const t = progressRef.current;
    // Smooth cubic ease-out
    const eased = 1 - Math.pow(1 - t, 3);

    const yTarget = phase === "hovering" ? 1.8 : 1.3;
    ref.current.position.y = THREE.MathUtils.lerp(-0.15, yTarget, eased);
    ref.current.rotation.x = THREE.MathUtils.lerp(0.25, -0.1, eased);
    ref.current.rotation.y = THREE.MathUtils.lerp(0.3, 0, eased);

    if (phase === "hovering") {
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 1.0) * 0.025;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.008;
    }
  });

  if (!visible) return null;

  const w = 1.0;
  const h = 0.7;
  const d = 0.018;

  return (
    <group ref={ref} position={[0, -0.15, 0]}>
      {/* Envelope body */}
      <RoundedBox args={[w, h, d]} radius={0.006} smoothness={8} castShadow>
        <meshPhysicalMaterial
          color={ENVELOPE_PAPER}
          roughness={0.75}
          metalness={0}
          clearcoat={0.02}
          clearcoatRoughness={0.9}
        />
      </RoundedBox>

      {/* Envelope flap */}
      <mesh position={[0, h / 2 - 0.003, d / 2 + 0.001]} rotation={[0.1, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-w / 2, 0, 0, w / 2, 0, 0, 0, -h * 0.4, 0]), 3]}
            count={3}
          />
          <bufferAttribute
            attach="attributes-normal"
            args={[new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3]}
            count={3}
          />
        </bufferGeometry>
        <meshPhysicalMaterial
          color="#f5efe6"
          roughness={0.7}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wax seal */}
      <mesh position={[0, h / 2 - h * 0.27, d / 2 + 0.012]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 32]} />
        <meshPhysicalMaterial
          color="#b8383b"
          metalness={0.15}
          roughness={0.5}
          clearcoat={0.6}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Fine text lines on envelope */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.02, -h * 0.08 + i * 0.07, d / 2 + 0.002]}>
          <boxGeometry args={[0.45 - i * 0.06, 0.0015, 0.0005]} />
          <meshBasicMaterial color="#e0d8cc" transparent opacity={0.2} />
        </mesh>
      ))}

      {phase === "hovering" && (
        <Text
          position={[0, -h / 2 - 0.14, 0.025]}
          fontSize={0.05}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          Tap to read your letter
          <meshBasicMaterial color={CHAMPAGNE} transparent opacity={0.75} />
        </Text>
      )}
    </group>
  );
};

/* ─── TISSUE PAPER ─── */
const TissuePaper = ({ visible }: { visible: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (visible) progressRef.current = 0;
  }, [visible]);

  useFrame((_, delta) => {
    if (!visible || !ref.current) return;
    progressRef.current = Math.min(progressRef.current + delta * 0.8, 1);
    const eased = 1 - Math.pow(1 - progressRef.current, 3);
    ref.current.position.y = THREE.MathUtils.lerp(-0.1, 0.45, eased);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.3, 1, eased));
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[(i - 1) * 0.1, i * 0.025, (i - 1) * 0.05]}
          rotation={[-0.12 + i * 0.1, i * 0.3, -0.06 + i * 0.12]}
        >
          <planeGeometry args={[0.55 - i * 0.05, 0.65 - i * 0.07]} />
          <meshPhysicalMaterial
            color={i === 1 ? "#fff8fa" : "#ffeef3"}
            roughness={0.8}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ─── ROSE PETALS ─── */
/* ─── HELLO KITTY 3D FIGURE ─── */
const HelloKittyFigure = ({ visible }: { visible: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (visible) progressRef.current = 0;
  }, [visible]);

  useFrame((state, delta) => {
    if (!visible || !ref.current) return;
    progressRef.current = Math.min(progressRef.current + delta * 0.6, 1);
    const eased = 1 - Math.pow(1 - progressRef.current, 3);
    ref.current.position.y = THREE.MathUtils.lerp(-0.3, 0.15, eased);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0, 1, eased));
    if (progressRef.current > 0.8) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  if (!visible) return null;

  const KW = "#fefefe";
  const KP = "#f5a0b8";
  const KY = "#f5d76e";

  return (
    <group ref={ref} position={[0.35, -0.3, 0.15]} scale={0}>
      {/* Head */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshPhysicalMaterial color={KW} roughness={0.6} metalness={0} clearcoat={0.3} />
      </mesh>
      {/* Left ear */}
      <mesh position={[-0.1, 0.38, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.055, 0.1, 16]} />
        <meshPhysicalMaterial color={KW} roughness={0.6} clearcoat={0.3} />
      </mesh>
      {/* Right ear */}
      <mesh position={[0.1, 0.38, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.055, 0.1, 16]} />
        <meshPhysicalMaterial color={KW} roughness={0.6} clearcoat={0.3} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.05, 0.23, 0.145]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 0.23, 0.145]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.2, 0.155]}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshPhysicalMaterial color={KY} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Whiskers */}
      {[-1, 0, 1].map((i) => (
        <mesh key={`lw${i}`} position={[-0.12, 0.19 + i * 0.02, 0.12]} rotation={[0, 0, 0.1 * i]}>
          <boxGeometry args={[0.08, 0.003, 0.003]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      ))}
      {[-1, 0, 1].map((i) => (
        <mesh key={`rw${i}`} position={[0.12, 0.19 + i * 0.02, 0.12]} rotation={[0, 0, -0.1 * i]}>
          <boxGeometry args={[0.08, 0.003, 0.003]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      ))}
      {/* Bow on ear */}
      <group position={[-0.14, 0.36, 0.02]}>
        <mesh position={[-0.025, 0, 0]} rotation={[Math.PI / 2, 0, -0.3]}>
          <torusGeometry args={[0.025, 0.01, 8, 16, Math.PI]} />
          <meshPhysicalMaterial color={KP} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.025, 0, 0]} rotation={[Math.PI / 2, 0, 0.3]}>
          <torusGeometry args={[0.025, 0.01, 8, 16, Math.PI]} />
          <meshPhysicalMaterial color={KP} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshPhysicalMaterial color={KP} roughness={0.3} />
        </mesh>
      </group>
      {/* Body */}
      <mesh position={[0, 0.02, 0]}>
        <capsuleGeometry args={[0.1, 0.08, 12, 16]} />
        <meshPhysicalMaterial color={KW} roughness={0.6} clearcoat={0.3} />
      </mesh>
      {/* Pink outfit */}
      <mesh position={[0, 0.0, 0.08]}>
        <sphereGeometry args={[0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={KP} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const RosePetals = ({ active }: { active: boolean }) => {
  const count = 20;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsedRef = useRef(0);

  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 2.5,
        z: (Math.random() - 0.5) * 2.5,
        yStart: 2.2 + Math.random() * 2,
        speed: 0.12 + Math.random() * 0.2,
        rotSpeed: (Math.random() - 0.5) * 1.2,
        wobble: Math.random() * Math.PI * 2,
        scale: 0.018 + Math.random() * 0.025,
        delay: i * 0.08,
      })),
    []
  );

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return;
    elapsedRef.current += delta;
    petals.forEach((p, i) => {
      const t = Math.max(0, elapsedRef.current - p.delay);
      if (t <= 0) {
        dummy.scale.setScalar(0);
      } else {
        const y = p.yStart - t * p.speed;
        dummy.position.set(
          p.x + Math.sin(t * 1.0 + p.wobble) * 0.35,
          y,
          p.z + Math.cos(t * 0.8 + p.wobble) * 0.25
        );
        dummy.rotation.set(t * p.rotSpeed, t * p.rotSpeed * 0.5, t * p.rotSpeed * 0.3);
        dummy.scale.setScalar(y < -2 ? 0 : p.scale);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshPhysicalMaterial
        color="#f0a0b5"
        roughness={0.55}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};

/* ─── EDGE TRIM (thin gold inset line around box edges) ─── */
const EdgeTrim = ({
  boxW,
  boxH,
  boxD,
}: {
  boxW: number;
  boxH: number;
  boxD: number;
}) => {
  const mat = useRibbonMaterial();
  const t = 0.008;
  const offset = 0.004;

  return (
    <group>
      {/* Top edge lines on box body */}
      {/* Front top */}
      <mesh position={[0, boxH / 2 - offset, boxD / 2 + 0.002]} material={mat}>
        <boxGeometry args={[boxW + 0.01, t, t]} />
      </mesh>
      {/* Back top */}
      <mesh position={[0, boxH / 2 - offset, -boxD / 2 - 0.002]} material={mat}>
        <boxGeometry args={[boxW + 0.01, t, t]} />
      </mesh>
      {/* Bottom edge - front */}
      <mesh position={[0, -boxH / 2 + offset, boxD / 2 + 0.002]} material={mat}>
        <boxGeometry args={[boxW + 0.01, t, t]} />
      </mesh>
      {/* Bottom edge - back */}
      <mesh position={[0, -boxH / 2 + offset, -boxD / 2 - 0.002]} material={mat}>
        <boxGeometry args={[boxW + 0.01, t, t]} />
      </mesh>
    </group>
  );
};

const GoldFoilStamp = ({ position }: { position: [number, number, number] }) => {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "rgba(255, 236, 190, 0.98)");
    grad.addColorStop(0.5, "rgba(214, 176, 92, 0.98)");
    grad.addColorStop(1, "rgba(168, 124, 44, 0.98)");

    const x = 44;
    const y = 46;
    const w = canvas.width - 88;
    const h = canvas.height - 92;
    const r = 34;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = "rgba(125, 92, 28, 0.14)";
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 223, 145, 0.85)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = grad;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 92px "Times New Roman", serif';
    ctx.fillText("A Special Gift", canvas.width / 2, canvas.height / 2 + 6);

    const foilTexture = new THREE.CanvasTexture(canvas);
    foilTexture.colorSpace = THREE.SRGBColorSpace;
    foilTexture.anisotropy = 8;
    foilTexture.needsUpdate = true;
    return foilTexture;
  }, []);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  return (
    <mesh position={position} renderOrder={2}>
      <planeGeometry args={[0.76, 0.24]} />
      <meshPhysicalMaterial
        map={texture ?? undefined}
        transparent
        color={GOLD_FOIL}
        metalness={0.92}
        roughness={0.22}
        clearcoat={0.85}
        clearcoatRoughness={0.2}
        envMapIntensity={2.6}
        depthWrite={false}
      />
    </mesh>
  );
};

/* ─── MAIN GIFT BOX MODEL ─── */
const GiftBoxModel = ({
  opened,
  onOpen,
  receiverName,
  onEnvelopeReady,
}: {
  opened: boolean;
  onOpen: () => void;
  receiverName: string;
  onEnvelopeReady?: () => void;
}) => {
  const lidRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Group>(null);
  const lidAngleRef = useRef(0);
  const envelopeTriggeredRef = useRef(false);
  const [showTissue, setShowTissue] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [envelopePhase, setEnvelopePhase] = useState<"rising" | "hovering">("rising");

  useEffect(() => {
    if (!opened) {
      lidAngleRef.current = 0;
      envelopeTriggeredRef.current = false;
      setShowTissue(false);
      setShowEnvelope(false);
      setEnvelopePhase("rising");
    }
  }, [opened]);

  useFrame((state) => {
    // 100 degrees ≈ 1.745 rad
    const target = opened ? -1.745 : 0;
    const diff = target - lidAngleRef.current;
    // Smooth ease-out
    lidAngleRef.current += diff * (opened ? 0.018 : 0.05);

    if (lidRef.current) lidRef.current.rotation.x = lidAngleRef.current;

    if (opened && lidAngleRef.current < -0.35 && !showTissue) setShowTissue(true);

    if (opened && lidAngleRef.current < -1.0 && !envelopeTriggeredRef.current) {
      envelopeTriggeredRef.current = true;
      setShowEnvelope(true);
      setTimeout(() => {
        setEnvelopePhase("hovering");
        onEnvelopeReady?.();
      }, 2400);
    }

    if (baseRef.current && !opened) {
      const t = state.clock.elapsedTime;
      baseRef.current.position.y = Math.sin(t * 0.35) * 0.015;
      baseRef.current.rotation.y += 0.0001;
    }
  });

  const boxW = 1.55;
  const boxH = 0.9;
  const boxD = 1.15;
  const lidH = 0.18;
  const bevel = 0.1;
  const ribbonW = 0.1;
  const ribbonThick = 0.012;

  return (
    <group ref={baseRef}>
      {/* ── BOX BODY ─ hyper-realistic soft-touch matte paper ── */}
      <RoundedBox
        args={[boxW, boxH, boxD]}
        radius={bevel}
        smoothness={8}
        castShadow
        receiveShadow
        onClick={onOpen}
      >
        <meshPhysicalMaterial
          color={BLUSH_BODY}
          roughness={0.8}
          metalness={0.0}
          clearcoat={0.05}
          clearcoatRoughness={0.85}
          envMapIntensity={0.35}
          sheen={0.3}
          sheenRoughness={0.8}
          sheenColor={new THREE.Color("#e8b8c4")}
        />
      </RoundedBox>

      {/* Inner lining (visible when open) */}
      <RoundedBox
        args={[boxW - 0.05, boxH - 0.04, boxD - 0.05]}
        radius={bevel - 0.02}
        smoothness={8}
        position={[0, 0.015, 0]}
      >
        <meshPhysicalMaterial
          color={BLUSH_INNER}
          roughness={0.92}
          metalness={0}
          side={THREE.BackSide}
        />
      </RoundedBox>

      {/* Gold edge trims */}
      <EdgeTrim boxW={boxW} boxH={boxH} boxD={boxD} />

      {/* ── RIBBONS (flat silk strips) ── */}
      {/* Vertical ribbon - front face */}
      <FlatRibbon position={[0, 0, boxD / 2 + 0.004]} size={[ribbonW, boxH + 0.005, ribbonThick]} />
      {/* Vertical ribbon - back face */}
      <FlatRibbon position={[0, 0, -boxD / 2 - 0.004]} size={[ribbonW, boxH + 0.005, ribbonThick]} />
      {/* Horizontal ribbon - right face */}
      <FlatRibbon position={[boxW / 2 + 0.004, 0, 0]} size={[ribbonThick, boxH + 0.005, ribbonW]} />
      {/* Horizontal ribbon - left face */}
      <FlatRibbon position={[-boxW / 2 - 0.004, 0, 0]} size={[ribbonThick, boxH + 0.005, ribbonW]} />
      {/* Vertical ribbon - top (connects to bow) */}
      <FlatRibbon
        position={[0, boxH / 2 + 0.003, 0]}
        size={[ribbonW, ribbonThick, boxD + 0.01]}
        rotation={[0, 0, 0]}
      />
      {/* Horizontal ribbon - top */}
      <FlatRibbon
        position={[0, boxH / 2 + 0.003, 0]}
        size={[boxW + 0.01, ribbonThick, ribbonW]}
        rotation={[0, 0, 0]}
      />


      {/* ── LID ── pivots from back edge */}
      <group position={[0, boxH / 2, -boxD / 2]} ref={lidRef}>
        <group position={[0, lidH / 2, boxD / 2]}>
          <RoundedBox
            args={[boxW + 0.04, lidH, boxD + 0.04]}
            radius={bevel}
            smoothness={8}
            castShadow
            onClick={onOpen}
          >
            <meshPhysicalMaterial
              color={BLUSH_LID}
              roughness={0.8}
              metalness={0.0}
              clearcoat={0.05}
              clearcoatRoughness={0.85}
              envMapIntensity={0.35}
              sheen={0.3}
              sheenRoughness={0.8}
              sheenColor={new THREE.Color("#d8a0b0")}
            />
          </RoundedBox>

          {/* ── "A Special Gift" gold foil stamp on front face ── */}
          <GoldFoilStamp position={[0, 0, boxD / 2 + 0.026]} />

          {/* Lid bottom gold rim */}
          <mesh position={[0, -lidH / 2 + 0.006, 0]}>
            <boxGeometry args={[boxW + 0.035, 0.014, boxD + 0.035]} />
            <meshPhysicalMaterial
              color={CHAMPAGNE}
              metalness={0.65}
              roughness={0.25}
              clearcoat={0.5}
              envMapIntensity={2}
            />
          </mesh>

          {/* Lid top ribbon cross */}
          <FlatRibbon
            position={[0, lidH / 2 + 0.005, 0]}
            size={[ribbonW, ribbonThick, boxD + 0.03]}
          />
          <FlatRibbon
            position={[0, lidH / 2 + 0.005, 0]}
            size={[boxW + 0.03, ribbonThick, ribbonW]}
          />

          {/* Bow */}
          <RealisticBow position={[0, lidH / 2 + 0.035, 0]} />

        </group>
      </group>

      {/* ── CONTENTS ── */}
      <TissuePaper visible={showTissue} />
      <HelloKittyFigure visible={showTissue} />
      <Envelope visible={showEnvelope} phase={envelopePhase} />
      <RosePetals active={opened} />

      {/* Inner warm glow when opened */}
      {opened && (
        <pointLight position={[0, 0.5, 0]} color="#fff5e8" intensity={2} distance={3.5} decay={2} />
      )}
    </group>
  );
};

/* ─── CAMERA RIG ─── */
const CameraRig = ({ opened }: { opened: boolean }) => {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.6, 4.8));

  useFrame(() => {
    if (opened) {
      target.current.lerp(new THREE.Vector3(0.15, 2.0, 3.6), 0.005);
    }
    camera.position.lerp(target.current, 0.012);
    camera.lookAt(0, 0.2, 0);
  });

  return null;
};

/* ─── SCENE ─── */
interface GiftBox3DProps {
  opened: boolean;
  onOpen: () => void;
  receiverName?: string;
  onEnvelopeReady?: () => void;
}

const GiftBox3D = ({ opened, onOpen, receiverName = "", onEnvelopeReady }: GiftBox3DProps) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.6, 4.8], fov: 34 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#fdfaf8", 18, 45]} />

        {/* Soft studio ambient light */}
        <ambientLight intensity={0.55} color="#fff8f4" />

        {/* Key light - main softbox from upper-right */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={0.75}
          color="#fff6ee"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={16}
          shadow-camera-near={1}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0002}
        />

        {/* Fill light - softer from left */}
        <directionalLight position={[-4, 3, -1]} intensity={0.25} color="#ffe4d4" />

        {/* Overhead softbox */}
        <spotLight
          position={[0, 8, 0.5]}
          angle={0.55}
          penumbra={1}
          intensity={0.5}
          color="#fff4ea"
          castShadow={false}
        />

        {/* Rim lights for edge definition */}
        <pointLight position={[-3, 1.5, -2.5]} intensity={0.12} color="#f0e0d8" distance={9} />
        <pointLight position={[3, 1.5, -2.5]} intensity={0.12} color="#e8d8c0" distance={9} />

        {/* Back light for depth separation */}
        <directionalLight position={[0, 2, -5]} intensity={0.15} color="#f0dde0" />

        <Environment preset="dawn" environmentIntensity={0.4} />

        <GiftBoxModel
          opened={opened}
          onOpen={onOpen}
          receiverName={receiverName}
          onEnvelopeReady={onEnvelopeReady}
        />

        <FloatingDust />
        <HeartParticles />

        <ContactShadows
          frames={1}
          resolution={512}
          position={[0, -0.98, 0]}
          opacity={0.25}
          scale={6}
          blur={2.5}
          far={4}
          color="#c09aaa"
        />

        {/* Ground shadow catcher (invisible) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial transparent opacity={0.08} />
        </mesh>

        <CameraRig opened={opened} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={!opened}
          autoRotateSpeed={0.25}
          dampingFactor={0.03}
          enableDamping
          target={[0, 0.2, 0]}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
};

export default GiftBox3D;
