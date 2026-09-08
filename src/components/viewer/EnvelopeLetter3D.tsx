import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { createTimeline } from "animejs";
import { motion } from "framer-motion";
import { isWebGLAvailable } from "@/lib/webglSupport";
import { sounds } from "@/lib/sounds";

import velvetNormalSrc from "@/assets/velvet-normal.webp";
import velvetRoughSrc from "@/assets/velvet-rough.webp";
import paperColorSrc from "@/assets/paper-color.webp";
import paperNormalSrc from "@/assets/paper-normal.webp";
import paperRoughSrc from "@/assets/paper-rough.webp";

interface EnvelopeLetter3DProps {
  receiverName: string;
  senderName?: string;
  letterText?: string;
  images?: string[];
  voiceMessageUrl?: string | null;
  showWatermark?: boolean;
  onContinue: () => void;
  onLetterOpen?: () => void;
}

/** Envelope size in world units — portrait, roughly a C6 card envelope. */
const ENV_W = 3.0;
const ENV_H = 4.1;

/** The letter is folded in half vertically: tall when open, which suits the
 *  portrait-first framing far better than a wide tri-fold would. */
const PAPER_W = 2.62;
const PAPER_H = 1.85;

const VELVET_SHEEN = "#C8536A";
const WAX_COLOR = "#8C1730";
const SEAL_R = 0.42;
const SEAL_WEDGES = 9;

/** Mutated in place by the anime.js timeline and read every frame by `useFrame`.
 *  Keeping the timeline on a plain object (rather than binding it to three.js
 *  objects directly) keeps every scene-graph write inside R3F's own render loop,
 *  and makes the whole sequence testable by seeking without a renderer. */
type AnimState = {
  sealGlow: number;
  sealBreak: number;
  flapOpen: number;
  letterOut: number;
  unfold: number;
};
const ZERO_STATE: AnimState = { sealGlow: 0, sealBreak: 0, flapOpen: 0, letterOut: 0, unfold: 0 };

/**
 * Explicit z-layering for the envelope stack. The gaps are deliberately large
 * (millimetres, not fractions of one): the letter is folded in half, so its
 * lower panel swings a panel-thickness *forward* of the group origin, and with
 * hairline gaps that put it in front of the side flaps — the folded letter
 * visibly poked out through the closed envelope.
 */
const Z = {
  back: -0.08,
  letter: -0.04,
  flapLeft: 0,
  flapRight: 0.004,
  flapBottom: 0.008,
  flapTop: 0.014,
} as const;

// ── Textures ────────────────────────────────────────────────────────────────

/** World units covered by one texture tile. Smaller = finer nap. */
const TILE = 0.62;

/**
 * Replaces a geometry's UVs with a world-space planar projection.
 *
 * Necessary because neither geometry we use has usable UVs: `ShapeGeometry`
 * emits UVs in *shape* coordinates (so a `repeat` of 4 actually tiled ~12x and
 * the nap vanished into sub-pixel noise), and `LatheGeometry` emits a radial
 * (angle, profile) sweep that smears any map into a pinwheel. Projecting in
 * world space also makes the nap continuous across the separate flap meshes.
 */
const applyPlanarUV = (geo: THREE.BufferGeometry, tile = TILE) => {
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / tile;
    uv[i * 2 + 1] = pos.getY(i) / tile;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
};

/** Normal/roughness maps are non-colour data — decoding them as sRGB skews the
 *  values and produces subtly wrong shading. Only the albedo is sRGB. */
const useSurfaceTextures = () => {
  const [vNormal, vRough, pColor, pNormal, pRough] = useTexture([
    velvetNormalSrc, velvetRoughSrc, paperColorSrc, paperNormalSrc, paperRoughSrc,
  ]);

  return useMemo(() => {
    for (const t of [vNormal, vRough, pNormal, pRough]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.NoColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    pColor.wrapS = pColor.wrapT = THREE.RepeatWrapping;
    pColor.colorSpace = THREE.SRGBColorSpace;
    pColor.anisotropy = 8;
    pColor.needsUpdate = true;
    return { vNormal, vRough, pColor, pNormal, pRough };
  }, [vNormal, vRough, pColor, pNormal, pRough]);
};

/**
 * Debosses the recipient's initial into the wax as a tangent-space normal map.
 * Drawn as a height field then converted with a Sobel gradient — far sharper
 * than modelling engraved letterforms as geometry, and it's what makes the seal
 * personal (the pre-rendered video competitors ship structurally cannot).
 */
const useSealNormalMap = (initial: string) =>
  useMemo(() => {
    if (typeof document === "undefined") return null;
    const S = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = S;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Height field: mid-grey is flush, darker is recessed.
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = "#5e5e5e";
    ctx.lineWidth = S * 0.012;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S * 0.335, 0, Math.PI * 2);
    ctx.stroke();

    // Canvas can only use fonts the document has already loaded; the serif
    // fallback is deliberate rather than accidental.
    ctx.fillStyle = "#1c1c1c";
    ctx.font = `bold ${S * 0.46}px 'Pinyon Script', 'Great Vibes', Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initial, S / 2, S / 2 + S * 0.03);

    // Soft shoulders — a hard step reads as a printed decal, a blurred one as
    // wax displaced by a stamp.
    ctx.filter = "blur(2.5px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";

    const src = ctx.getImageData(0, 0, S, S).data;
    const out = ctx.createImageData(S, S);
    const h = (x: number, y: number) => {
      const cx = Math.min(S - 1, Math.max(0, x));
      const cy = Math.min(S - 1, Math.max(0, y));
      return src[(cy * S + cx) * 4] / 255;
    };
    const STRENGTH = 3.0;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dx =
          h(x - 1, y - 1) + 2 * h(x - 1, y) + h(x - 1, y + 1) -
          (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1));
        const dy =
          h(x - 1, y - 1) + 2 * h(x, y - 1) + h(x + 1, y - 1) -
          (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1));
        const n = new THREE.Vector3(dx * STRENGTH, dy * STRENGTH, 1).normalize();
        const i = (y * S + x) * 4;
        out.data[i] = (n.x * 0.5 + 0.5) * 255;
        out.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
        out.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
        out.data[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [initial]);

/** Soft radial falloff used as an additive glow sprite. */
const useGlowTexture = () =>
  useMemo(() => {
    if (typeof document === "undefined") return null;
    const S = 256;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,236,200,1)");
    g.addColorStop(0.25, "rgba(255,150,120,0.55)");
    g.addColorStop(0.6, "rgba(255,80,90,0.16)");
    g.addColorStop(1, "rgba(255,60,80,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

// ── Geometry ────────────────────────────────────────────────────────────────

const HW = ENV_W / 2;
const HH = ENV_H / 2;

const flapShape = (pts: [number, number][]) => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
};

/** Side and bottom flaps stay put; the top flap is built separately so it can
 *  hinge about the envelope's top edge. */
const STATIC_FLAPS = {
  left: applyPlanarUV(new THREE.ShapeGeometry(flapShape([[-HW, HH], [0, 0], [-HW, -HH]]))),
  right: applyPlanarUV(new THREE.ShapeGeometry(flapShape([[HW, HH], [HW, -HH], [0, 0]]))),
  bottom: applyPlanarUV(new THREE.ShapeGeometry(flapShape([[-HW, -HH], [HW, -HH], [0, 0]]))),
};
const BACK_GEO = applyPlanarUV(new THREE.PlaneGeometry(ENV_W, ENV_H, 1, 1));

/** Drawn relative to a pivot on the top edge so `rotation.x` swings it open. */
const TOP_FLAP_GEO = applyPlanarUV(
  new THREE.ShapeGeometry(flapShape([[-HW, 0], [HW, 0], [0, -HH]])),
);

/** Planar UVs here too — with default 0–1 plane UVs the paper grain stretched
 *  once across the whole sheet and was effectively invisible. */
const PAPER_GEO = applyPlanarUV(new THREE.PlaneGeometry(PAPER_W, PAPER_H, 1, 1), 0.9);

/** Seal profile: a real seal is not a dome — the stamp presses a broad FLAT
 *  face and the displaced wax squeezes up into a ridge near the rim. */
const sealProfile = () => {
  const profile: THREE.Vector2[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let height: number;
    if (t < 0.62) height = 0.072;
    else if (t < 0.86) height = 0.072 + 0.028 * Math.sin(((t - 0.62) / 0.24) * Math.PI);
    else {
      const k = (t - 0.86) / 0.14;
      height = 0.072 * (1 - k) * (1 - k * 0.4);
    }
    profile.push(new THREE.Vector2(SEAL_R * t, height));
  }
  profile.push(new THREE.Vector2(SEAL_R * 1.01, 0.01));
  profile.push(new THREE.Vector2(SEAL_R * 0.985, 0));
  profile.push(new THREE.Vector2(0, 0));
  return profile;
};

/**
 * The seal is built as wedges rather than one disc so it can shatter. While
 * intact they tile seamlessly, because the rim wobble and the planar UVs are
 * both pure functions of position — so the monogram spans the wedges correctly.
 */
const useSealWedges = () =>
  useMemo(() => {
    const profile = sealProfile();
    return Array.from({ length: SEAL_WEDGES }, (_, i) => {
      const phiStart = (i / SEAL_WEDGES) * Math.PI * 2;
      const phiLength = (Math.PI * 2) / SEAL_WEDGES;
      const geo = new THREE.LatheGeometry(profile, 14, phiStart, phiLength);

      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v);
        const z = pos.getZ(v);
        const r = Math.hypot(x, z);
        if (r < 1e-4) continue;
        const a = Math.atan2(z, x);
        const wobble = 1 + 0.012 * Math.sin(a * 7) + 0.008 * Math.sin(a * 13 + 1.7);
        pos.setX(v, x * wobble);
        pos.setZ(v, z * wobble);
      }

      // Planar UVs across the disc face, baked BEFORE the rotation. U is
      // negated because projecting straight from +x mirrors the artwork once
      // the disc faces the camera (it rendered "N" as "И").
      const uv = new Float32Array(pos.count * 2);
      for (let v = 0; v < pos.count; v++) {
        uv[v * 2] = 0.5 - pos.getX(v) / (SEAL_R * 2);
        uv[v * 2 + 1] = pos.getZ(v) / (SEAL_R * 2) + 0.5;
      }
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

      // +Y (the lathe's height axis) must end up facing the camera (+Z);
      // rotateX(-PI/2) maps it to -Z and backface-culls the whole face.
      geo.rotateX(Math.PI / 2);
      geo.computeVertexNormals();

      const mid = phiStart + phiLength / 2;
      return {
        geo,
        // Outward direction in the seal's own plane, plus a deterministic
        // tumble so the shatter looks chaotic but replays identically.
        dir: new THREE.Vector3(Math.cos(mid), -Math.sin(mid), 0).normalize(),
        spin: new THREE.Vector3(Math.sin(i * 2.3), Math.cos(i * 1.7), Math.sin(i * 3.1)),
        speed: 0.85 + 0.3 * Math.abs(Math.sin(i * 5.5)),
      };
    });
  }, []);

// ── Materials ───────────────────────────────────────────────────────────────

const VelvetMaterial = ({
  normalMap, roughnessMap, tint,
}: { normalMap: THREE.Texture; roughnessMap: THREE.Texture; tint: string }) => (
  <meshPhysicalMaterial
    color={tint}
    normalMap={normalMap}
    normalScale={new THREE.Vector2(1.15, 1.15)}
    roughnessMap={roughnessMap}
    roughness={1}
    metalness={0}
    // Sheen is three's cloth term — it's what turns a flat red plane into
    // velvet by adding the retroreflective bloom at grazing angles.
    sheen={1}
    sheenColor={new THREE.Color(VELVET_SHEEN)}
    sheenRoughness={0.32}
    side={THREE.DoubleSide}
  />
);

// ── Scene ───────────────────────────────────────────────────────────────────

const WaxSeal = ({ anim, initial }: { anim: React.MutableRefObject<AnimState>; initial: string }) => {
  const wedges = useSealWedges();
  const normalMap = useSealNormalMap(initial);
  const glowMap = useGlowTexture();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const { sealBreak, sealGlow } = anim.current;

    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      // Flares up as the seal ignites, then fades out as it shatters.
      m.opacity = Math.max(0, sealGlow * (1 - sealBreak * 0.85));
      const s = 1 + sealGlow * 1.5 + sealBreak * 1.2;
      glowRef.current.scale.setScalar(s);
    }

    wedges.forEach((w, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const t = sealBreak * w.speed;
      // Outward burst plus gravity — reads as wax cracking off, not dissolving.
      mesh.position.set(
        w.dir.x * t * 1.7,
        w.dir.y * t * 1.7 - t * t * 2.4,
        0.055 + t * 0.5,
      );
      mesh.rotation.set(w.spin.x * t * 3.2, w.spin.y * t * 3.2, w.spin.z * t * 3.2);
      mesh.scale.setScalar(Math.max(0.001, 1 - sealBreak * 0.25));
      mesh.visible = sealBreak < 0.995;
    });
  });

  return (
    <group>
      {glowMap && (
        <mesh ref={glowRef} position={[0, 0, 0.12]}>
          <planeGeometry args={[SEAL_R * 3.4, SEAL_R * 3.4]} />
          <meshBasicMaterial
            map={glowMap}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
      {wedges.map((w, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          geometry={w.geo}
          position={[0, 0, 0.055]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={WAX_COLOR}
            roughness={0.34}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.18}
            reflectivity={0.55}
            normalMap={normalMap ?? undefined}
            normalScale={new THREE.Vector2(1.4, 1.4)}
            // Keeps the wax solid from every angle once fragments tumble edge-on.
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export interface ScreenRect { left: number; top: number; width: number; height: number }

/** Corners of the fully-unfolded sheet, in the letter group's local space. */
const LETTER_CORNERS = [
  new THREE.Vector3(-PAPER_W / 2, PAPER_H, 0),
  new THREE.Vector3(PAPER_W / 2, PAPER_H, 0),
  new THREE.Vector3(PAPER_W / 2, -PAPER_H, 0),
  new THREE.Vector3(-PAPER_W / 2, -PAPER_H, 0),
];

const Letter = ({
  anim, tex, onRect,
}: {
  anim: React.MutableRefObject<AnimState>;
  tex: ReturnType<typeof useSurfaceTextures>;
  onRect: (r: ScreenRect | null) => void;
}) => {
  const group = useRef<THREE.Group>(null);
  const lower = useRef<THREE.Group>(null);
  const lastRect = useRef<ScreenRect | null>(null);

  useFrame((state) => {
    const { letterOut, unfold } = anim.current;
    if (group.current) {
      // Rises out of the envelope mouth, then settles to centre as it opens.
      // The group's origin sits on the fold line, so an unfolded letter is
      // symmetric about it and centring is just y → 0.
      const riseY = THREE.MathUtils.lerp(-PAPER_H / 2, 1.6, letterOut);
      group.current.position.y = THREE.MathUtils.lerp(riseY, 0, unfold);
      group.current.position.z = THREE.MathUtils.lerp(Z.letter, 0.55, letterOut);
    }
    if (lower.current) {
      // PI = folded flat behind the upper half; 0 = open and coplanar.
      lower.current.rotation.x = Math.PI * (1 - unfold);
    }

    // Project the sheet to screen space so DOM content can sit exactly on it.
    // Recomputed every frame and re-emitted whenever it actually moves, which
    // means resize and orientation changes self-correct — the previous
    // implementation latched this once and left the card at stale coordinates
    // after a rotate.
    if (!group.current || unfold < 0.9) {
      if (lastRect.current !== null) { lastRect.current = null; onRect(null); }
      return;
    }
    group.current.updateWorldMatrix(true, false);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of LETTER_CORNERS) {
      const p = c.clone().applyMatrix4(group.current.matrixWorld).project(state.camera);
      const x = (p.x * 0.5 + 0.5) * state.size.width;
      const y = (1 - (p.y * 0.5 + 0.5)) * state.size.height;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    const next: ScreenRect = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
    const prev = lastRect.current;
    // Only push to React when it meaningfully changed, so a settled letter
    // doesn't re-render the overlay every frame.
    if (!prev || Math.abs(prev.left - next.left) > 0.5 || Math.abs(prev.top - next.top) > 0.5 ||
        Math.abs(prev.width - next.width) > 0.5 || Math.abs(prev.height - next.height) > 0.5) {
      lastRect.current = next;
      onRect(next);
    }
  });

  const paper = (
    <meshPhysicalMaterial
      // Warm ecru rather than near-white: under this lighting rig a bright
      // base blew out to flat paper with no readable surface at all.
      color="#DFCEB0"
      map={tex.pColor}
      normalMap={tex.pNormal}
      normalScale={new THREE.Vector2(0.85, 0.85)}
      roughnessMap={tex.pRough}
      roughness={0.96}
      metalness={0}
      sheen={0.3}
      sheenColor={new THREE.Color("#fff6e6")}
      sheenRoughness={0.65}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group ref={group} position={[0, -PAPER_H / 2, Z.letter]}>
      <mesh geometry={PAPER_GEO} position={[0, PAPER_H / 2, 0]} castShadow receiveShadow>
        {paper}
      </mesh>
      <group ref={lower}>
        {/* Offset backwards so that, once folded (rotated PI), it lands just
            *behind* the upper half rather than in front of it. */}
        <mesh geometry={PAPER_GEO} position={[0, -PAPER_H / 2, -0.006]} castShadow receiveShadow>
          {paper}
        </mesh>
      </group>
    </group>
  );
};

const EnvelopeScene = ({
  anim, initial, onRect,
}: { anim: React.MutableRefObject<AnimState>; initial: string; onRect: (r: ScreenRect | null) => void }) => {
  const tex = useSurfaceTextures();
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { flapOpen, letterOut, unfold } = anim.current;

    if (group.current) {
      // Slow breathing tilt so the sheen travels across the nap — velvet only
      // reads as velvet when light moves relative to the fibres. Settles as
      // the letter emerges so the reading pose is stable.
      const calm = 1 - letterOut;
      group.current.rotation.y = Math.sin(t * 0.28) * 0.075 * calm;
      group.current.rotation.x = Math.sin(t * 0.21) * 0.035 * calm;
    }
    if (shell.current) {
      // The envelope sinks away once the letter is clear of it. Without this
      // it stays put and reads as a red border framing the letter, rather than
      // something the letter came out of.
      // Deep enough to clear the OPEN flap, whose apex swings a further ENV_H/2
      // above the envelope body — at a shallower drop it clipped back into
      // frame from the bottom.
      shell.current.position.y = -unfold * 8.6;
      shell.current.position.z = -unfold * 1.2;
    }
    if (flap.current) {
      // Slight overshoot past vertical so it falls open naturally.
      flap.current.rotation.x = -Math.PI * 1.02 * flapOpen;
    }
  });

  const velvet = { normalMap: tex.vNormal, roughnessMap: tex.vRough };

  return (
    <group ref={group}>
      {/* The letter lives OUTSIDE the shell group so the envelope can sink
          away independently of it. */}
      <Letter anim={anim} tex={tex} onRect={onRect} />

      <group ref={shell}>
      <mesh geometry={BACK_GEO} position={[0, 0, Z.back]} receiveShadow castShadow>
        <VelvetMaterial {...velvet} tint="#5C0E1A" />
      </mesh>

      {/* Side and bottom flaps, each nudged forward in z so the seams catch
          light and cast real shadows. */}
      <mesh geometry={STATIC_FLAPS.left} position={[0, 0, Z.flapLeft]} castShadow receiveShadow>
        <VelvetMaterial {...velvet} tint="#66101E" />
      </mesh>
      <mesh geometry={STATIC_FLAPS.right} position={[0, 0, Z.flapRight]} castShadow receiveShadow>
        <VelvetMaterial {...velvet} tint="#661020" />
      </mesh>
      <mesh geometry={STATIC_FLAPS.bottom} position={[0, 0, Z.flapBottom]} castShadow receiveShadow>
        <VelvetMaterial {...velvet} tint="#71131F" />
      </mesh>

      {/* Hinged top flap — pivot on the envelope's top edge. */}
      <group ref={flap} position={[0, HH, Z.flapTop]}>
        <mesh geometry={TOP_FLAP_GEO} castShadow receiveShadow>
          <VelvetMaterial {...velvet} tint="#761523" />
        </mesh>
        {/* The seal rides on the flap, positioned back at the envelope centre. */}
        <group position={[0, -HH, 0]}>
          <WaxSeal anim={anim} initial={initial} />
        </group>
      </group>
      </group>
    </group>
  );
};

/**
 * Fits the scene from BOTH width and height constraints — deriving distance
 * from one axis alone is what made the previous letter overflow off-screen on
 * portrait phones. The framed height grows while the letter rises clear of the
 * envelope, then tightens back onto the open letter.
 */
const CameraRig = ({ anim }: { anim: React.MutableRefObject<AnimState> }) => {
  useFrame((state) => {
    const { letterOut, unfold, flapOpen } = anim.current;
    const cam = state.camera as THREE.PerspectiveCamera;
    const fovRad = (cam.fov * Math.PI) / 180;
    const aspect = state.size.width / state.size.height;

    // The opened flap swings a full ENV_H/2 above the envelope's top edge, so
    // the scene is ~1.5x taller mid-sequence than when closed. Framing only for
    // ENV_H cropped the flap and the emerging letter straight off the screen.
    const OPEN_EXTENT = ENV_H * 1.55;
    const framedH = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(ENV_H, OPEN_EXTENT, Math.max(flapOpen, letterOut)),
      PAPER_H * 2 + 0.45,
      unfold,
    );
    const framedW = THREE.MathUtils.lerp(ENV_W, PAPER_W + 0.3, unfold);

    // A little breathing room reads as deliberate framing; edge-to-edge reads
    // as an accidental crop.
    const margin = 1.2;
    const target = Math.max(
      (framedH * margin) / (2 * Math.tan(fovRad / 2)),
      (framedW * margin) / (2 * Math.tan(fovRad / 2) * aspect),
    );
    cam.position.z += (target - cam.position.z) * 0.06;
    // Drift up with the letter so it stays framed as it clears the envelope.
    cam.position.y += (letterOut * 0.7 * (1 - unfold) - cam.position.y) * 0.06;
    cam.updateProjectionMatrix();
  });
  return null;
};

/** Studio rig built in-scene. Deliberately not `<Environment preset>`, which
 *  fetches an HDRI from a CDN at runtime with no local fallback. */
const StudioLighting = ({ low }: { low: boolean }) => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight
      position={[2.5, 4, 5]}
      intensity={2.4}
      color="#fff2e4"
      castShadow
      shadow-mapSize={low ? [512, 512] : [1024, 1024]}
      shadow-camera-near={0.5}
      shadow-camera-far={20}
      shadow-bias={-0.0008}
    />
    {/* Low grazing fill — velvet's sheen only shows where light rakes across
        the nap, so a light near the surface plane matters more than a key. */}
    <pointLight position={[-2.2, -1.4, 1.6]} intensity={2.2} color="#ff9a86" distance={12} decay={2} />
    <Environment resolution={low ? 128 : 256}>
      <Lightformer intensity={4.2} position={[0, 3.5, 2.5]} scale={[7, 3, 1]} color="#fff1e2" />
      <Lightformer intensity={2.6} position={[-3.5, 0.5, 2]} scale={[3, 7, 1]} color="#ffd2b8" />
      <Lightformer intensity={2.0} position={[3.5, -0.8, 2]} scale={[3, 7, 1]} color="#ffb9cd" />
      <Lightformer intensity={1.3} position={[0, -3.5, 1.5]} scale={[7, 2, 1]} color="#ffffff" />
    </Environment>
  </>
);

// ── Letter content (shared by the 3D overlay and the no-WebGL fallback) ─────

/**
 * Time-driven RAF typewriter with a hard total cap, matching
 * `EnvelopeReveal.tsx:207-232`. The previous 3D letter used a per-character
 * setTimeout with no cap, which took ~33s and ~1,500 React renders for a
 * 1,500-character letter.
 */
const useTypewriter = (text: string, active: boolean) => {
  const [visible, setVisible] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || done) return;
    const total = text.length;
    if (total === 0) { setDone(true); return; }
    const duration = Math.min(3500, total * 20);
    let start: number | null = null;
    let raf = 0;
    const delay = setTimeout(() => {
      const tick = (now: number) => {
        if (start === null) start = now;
        const chars = Math.min(total, Math.floor(((now - start) / duration) * total));
        setVisible(chars);
        if (chars < total) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
    }, 500);
    return () => { clearTimeout(delay); cancelAnimationFrame(raf); };
  }, [active, text, done]);

  return { visible, done, skip: () => { setVisible(text.length); setDone(true); } };
};

interface ContentProps {
  receiverName: string;
  senderName?: string;
  letterText: string;
  images: string[];
  visible: number;
  typingDone: boolean;
  showWatermark: boolean;
  voiceAvailable: boolean;
  voicePlaying: boolean;
  onToggleVoice: () => void;
  onSkip: () => void;
}

const LetterContent = ({
  receiverName, senderName, letterText, images, visible, typingDone,
  showWatermark, voiceAvailable, voicePlaying, onToggleVoice, onSkip,
}: ContentProps) => {
  const photos = images.filter(Boolean).slice(0, 3);
  const ink = "#4A3527";

  return (
    <div className="w-full h-full flex flex-col px-[7%] py-[6%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <p style={{ fontFamily: "'Pinyon Script','Great Vibes',cursive", fontSize: "clamp(20px,5.2vw,30px)", color: ink, lineHeight: 1.25 }}>
        My Dearest {receiverName},
      </p>

      {photos.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Memory ${i + 1}`}
              className="object-cover rounded-[2px]"
              style={{
                width: photos.length === 1 ? "58%" : "31%",
                aspectRatio: "3 / 4",
                boxShadow: "0 6px 14px rgba(70,45,30,0.3)",
                transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <p
        className="mt-4 break-words [overflow-wrap:anywhere]"
        style={{ fontFamily: "'Caveat','Dancing Script',cursive", fontSize: "clamp(14px,3.8vw,19px)", color: ink, lineHeight: 1.65 }}
      >
        {letterText.slice(0, visible)}
        {/* Full text stays in the DOM as transparent tail so nothing reflows while typing. */}
        <span style={{ color: "transparent" }}>{letterText.slice(visible)}</span>
      </p>

      {!typingDone && (
        <div className="mt-2 text-right">
          <button
            onClick={onSkip}
            className="px-3 py-1 rounded-full text-[11px]"
            style={{ background: "rgba(120,80,50,0.09)", border: "1px solid rgba(120,80,50,0.3)", color: "#7A6248" }}
          >
            Skip ▶
          </button>
        </div>
      )}

      {typingDone && senderName && (
        <p className="mt-5 text-right" style={{ fontFamily: "'Pinyon Script','Dancing Script',cursive", fontSize: "clamp(19px,4.6vw,26px)", color: ink }}>
          {senderName}
        </p>
      )}

      {typingDone && voiceAvailable && (
        <div className="mt-3 text-center">
          <button
            onClick={onToggleVoice}
            className="px-4 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ background: "rgba(180,60,90,0.12)", border: "1px solid rgba(180,60,90,0.4)", color: ink }}
          >
            {voicePlaying ? "⏸" : "▶"} Hear their voice
          </button>
        </div>
      )}

      {showWatermark && typingDone && (
        <p className="mt-4 text-center text-[9px]" style={{ color: ink, opacity: 0.45 }}>
          Sent with Wish4Love 💌
        </p>
      )}
    </div>
  );
};

// ── Root ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "opening" | "open";

const BACKDROP = "radial-gradient(ellipse at 50% 42%, #3A0A16 0%, #26060F 55%, #150309 100%)";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const EnvelopeLetter3D = ({
  receiverName, senderName, letterText = "", images = [],
  voiceMessageUrl, showWatermark = true, onContinue, onLetterOpen,
}: EnvelopeLetter3DProps) => {
  const [webglOk] = useState(() => isWebGLAvailable());
  // Resolved once at mount rather than via useIsMobile: these feed renderer
  // construction options, which don't re-apply cleanly if they change after
  // the Canvas already exists.
  const [low] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rect, setRect] = useState<ScreenRect | null>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const anim = useRef<AnimState>({ ...ZERO_STATE });
  const openedRef = useRef(false);

  const initial = (receiverName || "♥").trim().slice(0, 1).toUpperCase();
  const body = letterText.trim();
  const { visible, done, skip } = useTypewriter(body, phase === "open");

  const voiceAudio = useMemo(
    () => (voiceMessageUrl ? new Audio(voiceMessageUrl) : null),
    [voiceMessageUrl],
  );
  useEffect(() => () => voiceAudio?.pause(), [voiceAudio]);

  const toggleVoice = () => {
    if (!voiceAudio) return;
    if (voicePlaying) { voiceAudio.pause(); setVoicePlaying(false); return; }
    voiceAudio.onended = () => setVoicePlaying(false);
    voiceAudio.play().catch(() => setVoicePlaying(false));
    setVoicePlaying(true);
  };

  const markOpen = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    setPhase("open");
    onLetterOpen?.();
  };

  const start = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    sounds.paper();

    const s = anim.current;
    // Skip the cinematic when it can't be seen (no WebGL) or shouldn't be
    // played (reduced motion) — otherwise the fallback sits in "opening" for
    // the full timeline duration with nothing animating and no Continue button.
    if (!webglOk || prefersReducedMotion()) {
      Object.assign(s, { sealGlow: 1, sealBreak: 1, flapOpen: 1, letterOut: 1, unfold: 1 });
      markOpen();
      return;
    }

    createTimeline({ autoplay: true })
      .add(s, { sealGlow: 1, duration: 620, ease: "inOutQuad" })
      .add(s, { sealBreak: 1, duration: 620, ease: "outCubic" }, "-=120")
      .add(s, { flapOpen: 1, duration: 780, ease: "inOutCubic" }, "-=380")
      .add(s, { letterOut: 1, duration: 820, ease: "outCubic" }, "-=260")
      .add(s, { unfold: 1, duration: 760, ease: "outCubic", onComplete: markOpen });
  };

  const content = (
    <LetterContent
      receiverName={receiverName}
      senderName={senderName}
      letterText={body}
      images={images}
      visible={visible}
      typingDone={done}
      showWatermark={showWatermark}
      voiceAvailable={!!voiceAudio}
      voicePlaying={voicePlaying}
      onToggleVoice={toggleVoice}
      onSkip={skip}
    />
  );

  const continueButton = (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      onClick={(e) => { e.stopPropagation(); onContinue(); }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 px-7 py-3 rounded-full font-body text-sm font-semibold z-10"
      style={{ background: "rgba(255,240,220,0.16)", border: "1px solid rgba(255,220,180,0.45)", color: "#F2DCC0" }}
    >
      Continue ▶
    </motion.button>
  );

  // No WebGL: the same letter, on a styled paper card. The previous
  // implementation's fallback could never reach a readable state at all —
  // its "open" transition only ran inside the Canvas, so it showed
  // "Tap to open" forever on devices without WebGL.
  if (!webglOk) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: BACKDROP }} onClick={start}>
        <div
          className="relative w-full flex flex-col"
          style={{
            maxWidth: 420, height: "min(86vh, 680px)",
            background: "linear-gradient(160deg,#EFE2C8,#DFCEB0)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)", borderRadius: 3,
          }}
        >
          {phase === "idle" ? (
            <button className="m-auto font-display tracking-[0.25em] text-sm uppercase" style={{ color: "#7A6248" }}>
              Tap to open
            </button>
          ) : content}
        </div>
        {phase === "open" && continueButton}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: BACKDROP }}
      onClick={start}
    >
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [0, 0, 6], fov: 34 }}
          dpr={low ? [1, 1.5] : [1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <StudioLighting low={low} />
            <CameraRig anim={anim} />
            <EnvelopeScene anim={anim} initial={initial} onRect={setRect} />
            <ContactShadows position={[0, -ENV_H / 2 - 0.15, 0]} opacity={0.55} scale={8} blur={2.6} far={3} color="#120307" />
          </Suspense>
        </Canvas>
      </div>

      {/* Content sits exactly on the projected sheet, so the text lives ON the
          paper rather than in a floating card disconnected from the 3D scene. */}
      {rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          style={{ position: "absolute", left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
        >
          {content}
        </motion.div>
      )}

      {phase === "idle" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 2.6, repeat: Infinity }}
          className="absolute bottom-14 font-display tracking-[0.25em] text-sm pointer-events-none uppercase"
          style={{ color: "#E8C9A0" }}
        >
          Tap to open
        </motion.p>
      )}

      {phase === "open" && continueButton}
    </div>
  );
};

export default EnvelopeLetter3D;
