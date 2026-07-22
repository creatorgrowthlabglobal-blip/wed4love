import { Suspense, useMemo, useRef, useState, useEffect, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import goldSealSrc from "@/assets/gold-seal.png";

interface RealisticPaperLetter3DProps {
  receiverName: string;
  senderName?: string;
  letterText?: string;
  images?: string[];
  voiceMessageUrl?: string | null;
  showWatermark?: boolean;
  onContinue: () => void;
  onLetterOpen?: () => void;
}

interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const PANEL_W = 1.5;
const PANEL_H = 2.1;

/** Warm, richly-grained ivory paper texture — no external asset needed. */
const usePaperTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(256, 256, 60, 256, 256, 380);
    grad.addColorStop(0, "#f9f0da");
    grad.addColorStop(1, "#ecdfc0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() > 0.5 ? 40 : -30;
      ctx.fillStyle = `rgba(${150 + shade}, ${120 + shade}, ${80 + shade}, ${Math.random() * 0.08})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.strokeStyle = "rgba(160,120,70,0.06)";
    for (let i = 0; i < 60; i++) {
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() - 0.5) * 14);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
};

/** Chroma-keys the white background out of gold-seal.png so it reads as a real wax seal in 3D. */
const useWaxSealTexture = () => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const whiteness = (r + g + b) / 3;
        if (whiteness > 235) {
          data[i + 3] = 0;
        } else if (whiteness > 195) {
          data[i + 3] = Math.min(data[i + 3], Math.round(255 * ((235 - whiteness) / 40)));
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.src = goldSealSrc;
    return () => {
      cancelled = true;
    };
  }, []);
  return texture;
};

const Panel = ({
  width,
  height,
  hingeX,
  localX,
  foldRotation,
  paperMap,
}: {
  width: number;
  height: number;
  hingeX: number;
  localX: number;
  foldRotation: number;
  paperMap: THREE.Texture | null;
}) => (
  <group position={[hingeX, 0, 0]} rotation={[0, foldRotation, 0]}>
    <mesh position={[localX, 0, 0]} castShadow receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#f5e9cd" map={paperMap ?? undefined} roughness={0.9} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Eased 0→1 unfold progress driven by a plain RAF loop (no extra deps needed). */
const useUnfoldProgress = (playing: boolean, durationMs: number, onDone?: () => void) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return progress;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const PaperScene = ({
  playing,
  onUnfolded,
  onOpenRect,
}: {
  playing: boolean;
  onUnfolded?: () => void;
  onOpenRect: (rect: ScreenRect) => void;
}) => {
  const group = useRef<THREE.Group>(null);
  const paperMap = usePaperTexture();
  const sealMap = useWaxSealTexture();
  const progress = useUnfoldProgress(playing, 1700, onUnfolded);
  const settledRef = useRef(false);

  const rightT = easeOutCubic(Math.min(1, progress / 0.65));
  const leftT = easeOutCubic(Math.min(1, Math.max(0, (progress - 0.35) / 0.65)));
  const sealOpacity = Math.max(0, 1 - progress * 3.5);

  useFrame((state) => {
    if (group.current && progress < 1) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
    }

    // Camera distance needed to fit a given (width, height) at this fov —
    // aspect-ratio aware, so narrow portrait phone screens (where width is
    // the constraint, not height) get pulled back further than a wide
    // desktop viewport would need. Fixing distances tuned for one aspect
    // ratio is exactly what made the fully-open letter overflow off-screen
    // on phones.
    const camera = state.camera as THREE.PerspectiveCamera;
    const fovRad = (camera.fov * Math.PI) / 180;
    const aspect = state.size.width / state.size.height;
    const distanceToFit = (width: number, height: number, margin: number) => {
      const distForHeight = (height * margin) / (2 * Math.tan(fovRad / 2));
      const distForWidth = (width * margin) / (2 * Math.tan(fovRad / 2) * aspect);
      return Math.max(distForHeight, distForWidth);
    };
    // Camera framing fits the FULL open (3-panel) sheet, so the paper
    // backdrop always looks contained/intentional rather than overflowing
    // off-screen. The DOM reading card is a separate concern — it's sized
    // with normal CSS (not stretched to the projected panel dimensions) and
    // just centered on the middle panel's midpoint, see below.
    const closedZ = distanceToFit(PANEL_W, PANEL_H, 1.5);
    const openZ = distanceToFit(PANEL_W * 3, PANEL_H, 1.15);
    const targetZ = closedZ + progress * (openZ - closedZ);
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.08;

    if (progress >= 1 && !settledRef.current && group.current) {
      const halfW = PANEL_W / 2;
      const halfH = PANEL_H / 2;
      const corners = [
        new THREE.Vector3(-halfW, halfH, 0),
        new THREE.Vector3(halfW, halfH, 0),
        new THREE.Vector3(halfW, -halfH, 0),
        new THREE.Vector3(-halfW, -halfH, 0),
      ].map((v) => v.applyMatrix4(group.current!.matrixWorld));
      const screenPts = corners.map((v) => {
        const p = v.clone().project(state.camera);
        return { x: (p.x * 0.5 + 0.5) * state.size.width, y: (1 - (p.y * 0.5 + 0.5)) * state.size.height };
      });
      const xs = screenPts.map((p) => p.x);
      const ys = screenPts.map((p) => p.y);
      onOpenRect({
        left: Math.min(...xs),
        top: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      });
      if (Math.abs(state.camera.position.z - targetZ) < 0.015) {
        settledRef.current = true;
      }
    }
  });

  return (
    <group ref={group}>
      {/* Center panel — root, never rotates */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshStandardMaterial color="#f5e9cd" map={paperMap ?? undefined} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <Panel width={PANEL_W} height={PANEL_H} hingeX={PANEL_W / 2} localX={PANEL_W / 2} foldRotation={Math.PI * (1 - rightT)} paperMap={paperMap} />
      <Panel width={PANEL_W} height={PANEL_H} hingeX={-PANEL_W / 2} localX={-PANEL_W / 2} foldRotation={-Math.PI * (1 - leftT)} paperMap={paperMap} />

      {sealMap && sealOpacity > 0.01 && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshBasicMaterial map={sealMap} transparent opacity={sealOpacity} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

/** Shared letter body — used both projected onto the 3D paper and in the no-WebGL fallback. */
const LetterBody = ({
  receiverName,
  senderName,
  letterText,
  visibleCount,
  typingDone,
  displayPhotos,
  showWatermark,
  onSkip,
  onContinue,
  voiceAvailable,
  voicePlaying,
  onToggleVoice,
}: {
  receiverName: string;
  senderName?: string;
  letterText: string;
  visibleCount: number;
  typingDone: boolean;
  displayPhotos: string[];
  showWatermark: boolean;
  onSkip: () => void;
  onContinue: () => void;
  voiceAvailable: boolean;
  voicePlaying: boolean;
  onToggleVoice: () => void;
}): ReactNode => (
  <div
    className="w-full px-5 py-6 sm:px-8 sm:py-8 rounded-lg"
    style={{
      background: "linear-gradient(160deg, #f9f0da, #ecdfc0)",
      boxShadow: "0 20px 50px rgba(60,40,30,0.3)",
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <p style={{ fontFamily: "'Caveat', 'Dancing Script', cursive", fontSize: "clamp(20px,3vw,26px)", color: "#4B3A2A", marginBottom: "0.75rem" }}>
      My Dearest {receiverName},
    </p>

    {displayPhotos.length > 0 && (
      <div className="flex gap-3 mb-4 flex-wrap">
        {displayPhotos.map((src, i) => (
          <img key={i} src={src} alt="Memory" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm" style={{ boxShadow: "0 6px 16px rgba(60,40,30,0.2)" }} />
        ))}
      </div>
    )}

    <p className="break-words [word-break:break-word] [overflow-wrap:anywhere]" style={{ fontFamily: "'Caveat', 'Dancing Script', cursive", fontSize: "clamp(16px,2.1vw,20px)", color: "#4B3A2A", lineHeight: 1.6 }}>
      {letterText.slice(0, visibleCount)}
    </p>

    {!typingDone && (
      <div className="text-right mt-2">
        <button onClick={onSkip} className="font-body text-xs px-3 py-1 rounded-full" style={{ background: "rgba(160,120,70,0.08)", border: "1px solid rgba(160,120,70,0.35)", color: "#7a6248" }}>
          Skip ▶
        </button>
      </div>
    )}

    {senderName && typingDone && (
      <p className="text-right mt-6" style={{ fontFamily: "'Pinyon Script', 'Dancing Script', cursive", fontSize: "clamp(24px,3.4vw,30px)", color: "#4B3A2A" }}>
        {senderName}
      </p>
    )}

    {showWatermark && typingDone && (
      <p className="text-center mt-4 font-body text-[10px]" style={{ color: "#4B3A2A", opacity: 0.5 }}>
        Sent with Wish4Love 💌
      </p>
    )}

    {typingDone && voiceAvailable && (
      <div className="text-center mt-4">
        <button onClick={onToggleVoice} className="font-body text-xs sm:text-sm font-semibold px-5 py-2 rounded-full" style={{ background: "rgba(200,80,120,0.1)", border: "1px solid rgba(200,80,120,0.35)", color: "#4B3A2A" }}>
          {voicePlaying ? "⏸" : "▶"} Hear their voice
        </button>
      </div>
    )}

  </div>
);

const RealisticPaperLetter3D = ({
  receiverName,
  senderName,
  letterText = "",
  images = [],
  voiceMessageUrl,
  showWatermark = true,
  onContinue,
  onLetterOpen,
}: RealisticPaperLetter3DProps) => {
  const [phase, setPhase] = useState<"idle" | "unfolding" | "open">("idle");
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [openRect, setOpenRect] = useState<ScreenRect | null>(null);
  const voiceAudioRef = useMemo(() => (voiceMessageUrl ? new Audio(voiceMessageUrl) : null), [voiceMessageUrl]);

  useEffect(() => {
    return () => voiceAudioRef?.pause();
  }, [voiceAudioRef]);

  const toggleVoice = () => {
    if (!voiceAudioRef) return;
    if (voicePlaying) {
      voiceAudioRef.pause();
      setVoicePlaying(false);
    } else {
      voiceAudioRef.onended = () => setVoicePlaying(false);
      voiceAudioRef.play().catch(() => setVoicePlaying(false));
      setVoicePlaying(true);
    }
  };

  useEffect(() => {
    try {
      const test = document.createElement("canvas");
      if (!test.getContext("webgl2") && !test.getContext("webgl")) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  useEffect(() => {
    if (phase !== "open" || typingDone) return;
    if (visibleCount >= letterText.length) {
      setTypingDone(true);
      return;
    }
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 22);
    return () => clearTimeout(t);
  }, [phase, visibleCount, letterText, typingDone]);

  const handleStart = () => {
    if (phase !== "idle") return;
    sounds.paper();
    setPhase("unfolding");
  };

  const handleUnfolded = () => {
    setPhase("open");
    onLetterOpen?.();
  };

  const skipTyping = () => {
    setVisibleCount(letterText.length);
    setTypingDone(true);
  };

  const displayPhotos = images.slice(0, 2);

  const letterBodyProps = {
    receiverName,
    senderName,
    letterText,
    visibleCount,
    typingDone,
    displayPhotos,
    showWatermark,
    onSkip: skipTyping,
    onContinue,
    voiceAvailable: !!voiceAudioRef,
    voicePlaying,
    onToggleVoice: toggleVoice,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)" }}
      onClick={handleStart}
    >
      {webglOk ? (
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 4.5], fov: 34 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.75} />
              <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff3e0" />
              <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#f0d28a" />
              <pointLight position={[0, -1, 3]} intensity={0.4} color="#ff9ec4" />
              <PaperScene playing={phase === "unfolding"} onUnfolded={handleUnfolded} onOpenRect={setOpenRect} />
              <Sparkles count={40} scale={[6, 4, 3]} size={1.6} speed={0.3} color="#f4c9dc" opacity={0.5} />
              <ContactShadows position={[0, -1.3, 0]} opacity={0.35} scale={5} blur={2.4} far={2} color="#8a5c6e" />
              <Environment preset="apartment" />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <div className="w-72 h-96 rounded-sm shadow-2xl overflow-hidden" style={{ background: "#f5e9cd" }}>
          {phase === "open" ? (
            <LetterBody {...letterBodyProps} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="font-body text-sm text-muted-foreground px-6 text-center">Tap to open</p>
            </div>
          )}
        </div>
      )}

      {phase === "idle" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-16 font-body text-sm text-foreground/60 tracking-wide pointer-events-none"
        >
          Tap to unfold
        </motion.p>
      )}

      {/* Letter content — centered on the 3D paper's screen-space midpoint
          (not a separate popup) via world-to-screen coordinates, computed
          once the unfold settles. A comfortable, normally-sized CSS card
          rather than one stretched to match the projected panel's exact
          (often awkward, especially on narrow phones) pixel dimensions. */}
      <AnimatePresence>
        {webglOk && phase === "open" && openRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              position: "absolute",
              left: openRect.left + openRect.width / 2,
              top: openRect.top + openRect.height / 2,
              transform: "translate(-50%, -50%)",
              width: "min(92vw, 420px)",
              maxHeight: "min(75vh, 480px)",
              overflowY: "auto",
              borderRadius: "0.5rem",
            }}
          >
            <LetterBody {...letterBodyProps} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealisticPaperLetter3D;
