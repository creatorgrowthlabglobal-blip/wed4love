import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

/* ── Glassmorphic Mailbox Body ── */
const MailboxBody = ({ opened }: { opened: boolean }) => {
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={bodyRef} position={[0, -0.2, 0]}>
      {/* Main body — frosted glass */}
      <RoundedBox args={[1.6, 1.8, 1.2]} radius={0.15} smoothness={8} position={[0, 0, 0]}>
        <MeshTransmissionMaterial
          backside
          thickness={0.4}
          chromaticAberration={0.3}
          anisotropy={0.2}
          roughness={0.15}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          color="#ffc0cb"
          transmission={0.92}
          ior={1.25}
        />
      </RoundedBox>

      {/* Gold trim — top edge */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[1.7, 0.06, 1.3]} />
        <meshStandardMaterial color="#F7C873" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gold trim — bottom edge */}
      <mesh position={[0, -0.92, 0]}>
        <boxGeometry args={[1.7, 0.06, 1.3]} />
        <meshStandardMaterial color="#F7C873" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Mail slot */}
      <mesh position={[0, 0.45, 0.61]}>
        <boxGeometry args={[0.9, 0.08, 0.04]} />
        <meshStandardMaterial color="#d4956b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Slot inner shadow */}
      <mesh position={[0, 0.45, 0.59]}>
        <boxGeometry args={[0.85, 0.04, 0.01]} />
        <meshStandardMaterial color="#8b5e3c" />
      </mesh>

      {/* Heart emblem — front */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[0, 0, 0.62]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#FF8FAB" metalness={0.3} roughness={0.4} emissive="#FF8FAB" emissiveIntensity={0.3} />
        </mesh>
      </Float>

      {/* Flag — side */}
      <Flag opened={opened} />

      {/* Base/pedestal */}
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.5, 32]} />
        <MeshTransmissionMaterial
          backside
          thickness={0.2}
          roughness={0.2}
          color="#ffc0cb"
          transmission={0.85}
          ior={1.2}
        />
      </mesh>

      {/* Pole */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#F7C873" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Ground disc */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#F7C873" metalness={0.5} roughness={0.3} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

/* ── Mailbox Flag ── */
const Flag = ({ opened }: { opened: boolean }) => {
  const flagRef = useRef<THREE.Mesh>(null);
  const targetRotation = opened ? -Math.PI / 3 : 0;

  useFrame((_, delta) => {
    if (flagRef.current) {
      flagRef.current.rotation.z = THREE.MathUtils.lerp(flagRef.current.rotation.z, targetRotation, delta * 3);
    }
  });

  return (
    <group position={[0.82, 0.3, 0]}>
      <mesh ref={flagRef}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color="#FF6B8A" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Flag tip */}
      <mesh position={[0, 0.3, 0]} ref={flagRef}>
        <boxGeometry args={[0.2, 0.12, 0.04]} />
        <meshStandardMaterial color="#FF6B8A" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
};

/* ── Floating Hearts ── */
const FloatingHearts = () => {
  const hearts = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (hearts.current) {
      hearts.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 0.5 + i * 1.2) * 0.4 + (i * 0.6 - 1);
        child.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.2;
      });
    }
  });

  return (
    <group ref={hearts}>
      {[
        [-1.5, 1, -0.5],
        [1.6, 0.5, -0.8],
        [-1.2, -0.5, 0.5],
        [1.3, 1.5, 0.3],
        [-0.5, 2, -1],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} scale={0.12 + i * 0.02}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#FFD1DC" : "#FF8FAB"}
            transparent
            opacity={0.5}
            emissive={i % 2 === 0 ? "#FFD1DC" : "#FF8FAB"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ── Sparkles ── */
const Sparkles = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime + i * 0.8) * 1.5;
        child.position.x = Math.cos(state.clock.elapsedTime * 0.4 + i * 1.5) * 2;
        const s = 0.03 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.02;
        child.scale.setScalar(s);
      });
    }
  });

  return (
    <group ref={ref}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[(i - 7) * 0.4, Math.random() * 3 - 1.5, Math.random() * 2 - 1]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#F7C873" emissive="#F7C873" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
};

/* ── Main Exported Component ── */
interface Mailbox3DProps {
  opened: boolean;
}

const Mailbox3D = ({ opened }: Mailbox3DProps) => {
  return (
    <div className="w-[320px] h-[360px] sm:w-[400px] sm:h-[420px]">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#fff5f0" />
        <directionalLight position={[-2, 2, -3]} intensity={0.4} color="#FFD1DC" />
        <pointLight position={[0, 2, 2]} intensity={0.8} color="#FF8FAB" distance={8} />
        <pointLight position={[0, -1, 3]} intensity={0.3} color="#F7C873" distance={6} />

        <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.2}>
          <MailboxBody opened={opened} />
        </Float>

        <FloatingHearts />
        <Sparkles />

        <Environment preset="studio" environmentIntensity={0.3} />
      </Canvas>
    </div>
  );
};

export default Mailbox3D;
