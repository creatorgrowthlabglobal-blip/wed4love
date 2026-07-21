import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";

interface RealisticPaperLetter3DProps {
  receiverName: string;
  senderName?: string;
  letterText?: string;
  images?: string[];
  onContinue: () => void;
  onLetterOpen?: () => void;
}

const PANEL_W = 1.5;
const PANEL_H = 2.1;

/** Small procedural paper-grain texture — no external asset needed. */
const usePaperTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const shade = 235 + Math.random() * 15;
      ctx.fillStyle = `rgba(${shade - 20}, ${shade - 28}, ${shade - 40}, ${Math.random() * 0.06})`;
      ctx.fillRect(x, y, 1, 1);
    }
    // A few faint horizontal fibers
    ctx.strokeStyle = "rgba(180,150,110,0.05)";
    for (let i = 0; i < 30; i++) {
      const y = Math.random() * 256;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
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
      <meshStandardMaterial
        color="#fbf6ec"
        map={paperMap ?? undefined}
        roughness={0.92}
        metalness={0}
        side={THREE.DoubleSide}
      />
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

const PaperScene = ({ playing, onUnfolded }: { playing: boolean; onUnfolded?: () => void }) => {
  const group = useRef<THREE.Group>(null);
  const paperMap = usePaperTexture();
  const progress = useUnfoldProgress(playing, 1600, onUnfolded);

  // Right wing unfolds first (0 -> 0.6 of progress), left wing follows (0.35 -> 1).
  const rightT = easeOutCubic(Math.min(1, progress / 0.65));
  const leftT = easeOutCubic(Math.min(1, Math.max(0, (progress - 0.35) / 0.65)));

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
    }
    // Pull the camera back as the letter unfolds so the fully-open (3-panel
    // wide) sheet stays framed instead of overflowing the viewport.
    const targetZ = 4.4 + progress * 2.4;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Center panel — root, never rotates */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshStandardMaterial color="#fbf6ec" map={paperMap ?? undefined} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wing hinges at center panel's right edge, folds flat over it when closed */}
      <Panel
        width={PANEL_W}
        height={PANEL_H}
        hingeX={PANEL_W / 2}
        localX={PANEL_W / 2}
        foldRotation={Math.PI * (1 - rightT)}
        paperMap={paperMap}
      />
      {/* Left wing hinges at center panel's left edge */}
      <Panel
        width={PANEL_W}
        height={PANEL_H}
        hingeX={-PANEL_W / 2}
        localX={-PANEL_W / 2}
        foldRotation={-Math.PI * (1 - leftT)}
        paperMap={paperMap}
      />
    </group>
  );
};

const RealisticPaperLetter3D = ({
  receiverName,
  senderName,
  letterText = "",
  images = [],
  onContinue,
  onLetterOpen,
}: RealisticPaperLetter3DProps) => {
  const [phase, setPhase] = useState<"idle" | "unfolding" | "open">("idle");
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)" }}
      onClick={handleStart}
    >
      {webglOk ? (
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 4.4], fov: 34 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 4, 5]} intensity={1} color="#fff3e0" />
              <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#f0d28a" />
              <pointLight position={[0, -1, 3]} intensity={0.4} color="#ff9ec4" />
              <PaperScene playing={phase === "unfolding"} onUnfolded={handleUnfolded} />
              <ContactShadows position={[0, -1.3, 0]} opacity={0.35} scale={5} blur={2.4} far={2} color="#8a5c6e" />
              <Environment preset="apartment" />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        // No-WebGL fallback: same interaction, flat CSS card instead of a 3D scene.
        <div className="w-64 h-80 rounded-sm bg-[#fbf6ec] shadow-2xl flex items-center justify-center">
          <p className="font-body text-sm text-muted-foreground px-6 text-center">
            {phase === "idle" ? "Tap to open" : ""}
          </p>
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

      <AnimatePresence>
        {phase === "open" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-x-0 bottom-0 top-[8%] sm:top-[10%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-lg mx-auto px-6 pb-10">
              <div
                className="rounded-sm p-6 sm:p-10"
                style={{ background: "#fbf6ec", boxShadow: "0 20px 60px rgba(60,40,30,0.25)" }}
              >
                <p
                  style={{ fontFamily: "'Caveat', 'Dancing Script', cursive", fontSize: "clamp(22px,3.4vw,28px)", color: "#4B3A2A", marginBottom: "1rem" }}
                >
                  My Dearest {receiverName},
                </p>

                {displayPhotos.length > 0 && (
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {displayPhotos.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Memory"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-sm"
                        style={{ boxShadow: "0 6px 16px rgba(60,40,30,0.2)" }}
                      />
                    ))}
                  </div>
                )}

                <p
                  className="break-words [word-break:break-word] [overflow-wrap:anywhere]"
                  style={{ fontFamily: "'Caveat', 'Dancing Script', cursive", fontSize: "clamp(18px,2.4vw,22px)", color: "#4B3A2A", lineHeight: 1.6 }}
                >
                  {letterText.slice(0, visibleCount)}
                </p>

                {!typingDone && (
                  <div className="text-right mt-2">
                    <button
                      onClick={skipTyping}
                      className="font-body text-xs px-3 py-1 rounded-full"
                      style={{ background: "rgba(160,120,70,0.08)", border: "1px solid rgba(160,120,70,0.35)", color: "#7a6248" }}
                    >
                      Skip ▶
                    </button>
                  </div>
                )}

                {senderName && typingDone && (
                  <p
                    className="text-right mt-8"
                    style={{ fontFamily: "'Pinyon Script', 'Dancing Script', cursive", fontSize: "clamp(28px,4vw,34px)", color: "#4B3A2A" }}
                  >
                    {senderName}
                  </p>
                )}

                {typingDone && (
                  <div className="text-center mt-8">
                    <button
                      onClick={onContinue}
                      className="font-body text-sm font-semibold px-7 py-3 rounded-full"
                      style={{ background: "rgba(160,120,70,0.1)", border: "1px solid rgba(160,120,70,0.4)", color: "#4B3A2A" }}
                    >
                      Continue ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealisticPaperLetter3D;
