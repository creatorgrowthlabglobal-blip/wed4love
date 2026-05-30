import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Glassmorphic 3D love letter — resend.com cube vibe.
 * Translucent envelope body with a refractive glass shell, soft pink theme,
 * a champagne-gold heart wax seal, slow auto-rotation + gentle float.
 */

const EnvelopeMesh = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.35;
      group.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.12;
    }
  });

  // Envelope dimensions
  const W = 2.4;
  const H = 1.55;
  const D = 0.18;

  return (
    <group ref={group}>
      {/* Soft inner glow card (the "letter" peeking through glass) */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[W * 0.92, H * 0.88, 0.02]} />
        <meshStandardMaterial
          color="#fff0f5"
          emissive="#ffb6c8"
          emissiveIntensity={0.35}
          roughness={0.6}
          metalness={0}
        />
      </mesh>

      {/* Glass envelope body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.45}
          roughness={0.08}
          chromaticAberration={0.04}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.4}
          temporalDistortion={0.1}
          ior={1.35}
          transmission={1}
          color="#ffd9e4"
          attenuationColor="#ffc1d4"
          attenuationDistance={1.2}
        />
      </mesh>

      {/* Triangular flap (front) — a thin folded plate */}
      <mesh position={[0, 0.05, D / 2 + 0.001]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[H * 0.78, H * 0.78, 0.015]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.25}
          roughness={0.1}
          ior={1.3}
          transmission={1}
          color="#ffc6d8"
          attenuationColor="#ffb0c8"
          attenuationDistance={1.5}
        />
      </mesh>

      {/* Champagne gold heart wax seal */}
      <group position={[0, 0, D / 2 + 0.12]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.32, 0.32, 0.08]} />
          <meshPhysicalMaterial
            color="#e8c98a"
            metalness={0.85}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.15}
            emissive="#8b6914"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Two spheres + the rotated square form a heart silhouette */}
        <mesh position={[-0.11, 0.11, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshPhysicalMaterial
            color="#e8c98a"
            metalness={0.85}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </mesh>
        <mesh position={[0.11, 0.11, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshPhysicalMaterial
            color="#e8c98a"
            metalness={0.85}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </mesh>
      </group>
    </group>
  );
};

const GlassLoveLetter3D = () => {
  // Skip WebGL if unavailable (older devices / SSR safety)
  if (typeof window !== "undefined") {
    try {
      const test = document.createElement("canvas");
      if (!test.getContext("webgl2") && !test.getContext("webgl")) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] pointer-events-none">
      {/* Soft pink radial glow behind the model */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 55%, hsl(340 100% 88% / 0.55), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffe0ec" />
          <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#ffd1a0" />
          <pointLight position={[0, -2, 3]} intensity={0.4} color="#ffb6c8" />

          <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
            <EnvelopeMesh />
          </Float>

          <ContactShadows
            position={[0, -1.25, 0]}
            opacity={0.35}
            scale={5}
            blur={2.8}
            far={2}
            color="#c97a96"
          />

          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlassLoveLetter3D;
