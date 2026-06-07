import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, MeshTransmissionMaterial, Sparkles, Edges } from "@react-three/drei";
import * as THREE from "three";

/**
 * Cyber-cute glass love letter.
 * Small, glossy translucent envelope with neon pink edge-glow,
 * holographic shimmer, gold heart seal, sparkles orbiting around.
 * Matches Soft Pink + Champagne Gold theme.
 */

const HeartShape = useMemo as any; // avoid TS dynamic complaints below

// Build a proper heart geometry via THREE.Shape (extruded)
const useHeartGeometry = () => {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y);
    shape.bezierCurveTo(x, y + 0.3, x - 0.5, y + 0.5, x - 0.5, y + 0.1);
    shape.bezierCurveTo(x - 0.5, y - 0.2, x - 0.25, y - 0.4, x, y - 0.6);
    shape.bezierCurveTo(x + 0.25, y - 0.4, x + 0.5, y - 0.2, x + 0.5, y + 0.1);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x, y + 0.3, x, y);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 6,
      curveSegments: 32,
    });
    geo.center();
    geo.scale(0.45, 0.45, 0.45);
    return geo;
  }, []);
};

const EnvelopeMesh = () => {
  const group = useRef<THREE.Group>(null);
  const heartGeo = useHeartGeometry();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.45;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });

  const W = 1.6;
  const H = 1.05;
  const D = 0.14;

  return (
    <group ref={group}>
      {/* Soft inner letter card glow */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[W * 0.9, H * 0.85, 0.015]} />
        <meshStandardMaterial
          color="#fff5f8"
          emissive="#ff8ab8"
          emissiveIntensity={0.6}
          roughness={0.5}
        />
      </mesh>

      {/* Glass envelope body with neon edges */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.35}
          roughness={0.05}
          chromaticAberration={0.06}
          anisotropy={0.4}
          distortion={0.15}
          distortionScale={0.3}
          temporalDistortion={0.08}
          ior={1.4}
          transmission={1}
          color="#ffd4e5"
          attenuationColor="#ff9ec4"
          attenuationDistance={0.9}
        />
        {/* Neon pink edge glow — cyber outline */}
        <Edges threshold={15} color="#ff4d8d" />
      </mesh>

      {/* Holographic horizontal scan stripe */}
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W * 0.98, H * 0.06]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Envelope flap (back triangle hint via rotated thin plate) */}
      <mesh position={[0, 0.1, D / 2 + 0.001]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[H * 0.7, H * 0.7, 0.012]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.2}
          roughness={0.08}
          ior={1.35}
          transmission={1}
          color="#ffc0d8"
          attenuationColor="#ff9ec4"
          attenuationDistance={1.2}
        />
        <Edges threshold={15} color="#ff4d8d" />
      </mesh>

      {/* Gold heart wax seal — extruded shape */}
      <mesh geometry={heartGeo} position={[0, 0.05, D / 2 + 0.12]} rotation={[0, 0, Math.PI]}>
        <meshPhysicalMaterial
          color="#f0d28a"
          metalness={0.9}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#c9a84c"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Subtle outer halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[1.15, 0.008, 16, 100]} />
        <meshBasicMaterial color="#ff7ab0" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const GlassLoveLetter3D = () => {
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
    <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] h-[200px] sm:h-[230px] pointer-events-none">
      {/* Cyber pink + gold radial glow */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 55%, hsl(335 100% 80% / 0.55), hsl(45 80% 80% / 0.18) 50%, transparent 75%)",
          filter: "blur(18px)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0.2, 3.6], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 5]} intensity={1.1} color="#ffe0ec" />
          <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#f0d28a" />
          <pointLight position={[0, -2, 3]} intensity={0.6} color="#ff5e9c" />
          <pointLight position={[2, 2, 2]} intensity={0.4} color="#a78bfa" />

          <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.5} floatingRange={[-0.06, 0.06]}>
            <EnvelopeMesh />
          </Float>

          {/* Cyber sparkles orbiting */}
          <Sparkles count={28} scale={[2.6, 1.8, 2]} size={2.2} speed={0.5} color="#ffb3d1" opacity={0.9} />
          <Sparkles count={12} scale={[3, 2.2, 2.4]} size={1.4} speed={0.3} color="#f0d28a" opacity={0.8} />

          <ContactShadows
            position={[0, -0.9, 0]}
            opacity={0.3}
            scale={3.5}
            blur={2.6}
            far={1.5}
            color="#c9577e"
          />

          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlassLoveLetter3D;
