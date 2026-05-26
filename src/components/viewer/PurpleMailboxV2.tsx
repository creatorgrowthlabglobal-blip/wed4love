import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";

type State = "idle" | "opening" | "open" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const Bokeh = ({ x, y, size, opacity, delay }: { x: string; y: string; size: number; opacity: number; delay: number }) => (
  <motion.div
    style={{
      position: "absolute",
      left: x, top: y,
      width: size, height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(230,190,210,0.9) 0%, transparent 70%)",
      filter: "blur(28px)",
      pointerEvents: "none",
    }}
    animate={{ scale: [1, 1.18, 1], opacity: [opacity, opacity * 1.4, opacity] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const Petal = ({ delay, x, rotate }: { delay: number; x: string; rotate: number }) => (
  <motion.div
    style={{
      position: "absolute",
      top: "22%", left: x,
      width: 9, height: 14,
      borderRadius: "50% 50% 50% 5%",
      background: "rgba(230, 165, 185, 0.75)",
      rotate,
      pointerEvents: "none",
      zIndex: 20,
    }}
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: "60vh", opacity: [0, 0.85, 0.85, 0], rotate: rotate + 200 }}
    transition={{ duration: 2.8 + delay * 0.3, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
  />
);

const PurpleMailboxV2 = ({ className, onContinue, senderName }: Props) => {
  const [state, setState] = useState<State>("idle");
  const [petalKey, setPetalKey] = useState(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const handleClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    setPetalKey((k) => k + 1);
    timersRef.current = [
      window.setTimeout(() => setState("open"), 750),
      window.setTimeout(() => setState("delivered"), 2600),
      window.setTimeout(() => onContinue?.(), 3500),
    ];
  };

  const isOpen = state === "open" || state === "delivered";
  const delivered = state === "delivered";

  const petals = [
    { x: "28%", rotate: -20, delay: 0 },
    { x: "38%", rotate: 30, delay: 0.2 },
    { x: "55%", rotate: -10, delay: 0.1 },
    { x: "62%", rotate: 45, delay: 0.35 },
    { x: "44%", rotate: -35, delay: 0.25 },
    { x: "70%", rotate: 15, delay: 0.45 },
  ];

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #FEF5F0 0%, #FAE8E3 35%, #F3DBD4 65%, #EDD0C8 100%)",
        }}
      />

      {/* Bokeh blobs */}
      <Bokeh x="5%" y="10%" size={240} opacity={0.35} delay={0} />
      <Bokeh x="68%" y="5%" size={200} opacity={0.28} delay={1.8} />
      <Bokeh x="75%" y="55%" size={180} opacity={0.32} delay={0.9} />
      <Bokeh x="2%" y="58%" size={160} opacity={0.28} delay={2.4} />

      {/* Vignette frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(170,120,110,0.22) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Falling petals on open */}
      <AnimatePresence>
        {isOpen &&
          petals.map((p, i) => (
            <Petal key={`${petalKey}-${i}`} delay={p.delay} x={p.x} rotate={p.rotate} />
          ))}
      </AnimatePresence>

      {/* 3D perspective container */}
      <div style={{ perspective: "900px", perspectiveOrigin: "50% 42%" }}>
        <motion.div
          onClick={handleClick}
          whileHover={!isOpen ? { y: -7 } : {}}
          animate={!isOpen ? { y: [0, -5, 0] } : { y: 0 }}
          transition={
            !isOpen
              ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.45 }
          }
          style={{
            cursor: isOpen ? "default" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transformStyle: "preserve-3d",
            position: "relative",
          }}
        >
          {/* ── Mailbox head ── */}
          <div style={{ position: "relative", width: 220, transformStyle: "preserve-3d" }}>

            {/* Right side face — real depth */}
            <div
              style={{
                position: "absolute",
                right: -32,
                top: 10,
                width: 34,
                height: 112,
                borderRadius: "0 8px 8px 0",
                background: "linear-gradient(to right, #7B68B8, #6A58A8, #5A4898)",
                boxShadow: "inset -5px 0 10px rgba(0,0,0,0.35), 3px 0 0 rgba(0,0,0,0.12)",
                transform: "skewY(-1.5deg)",
              }}
            />

            {/* Top cap face */}
            <div
              style={{
                position: "absolute",
                top: -18,
                left: 4,
                right: -20,
                height: 22,
                background: "linear-gradient(135deg, #C4B4F0 0%, #9A88D8 60%, #8878C8 100%)",
                borderRadius: "6px 6px 0 0",
                transform: "rotateX(52deg) skewX(-1deg)",
                transformOrigin: "bottom center",
                boxShadow: "0 -4px 12px rgba(120,100,200,0.2)",
              }}
            />

            {/* Main front body */}
            <div
              style={{
                width: 220,
                height: 132,
                borderRadius: 14,
                background:
                  "linear-gradient(140deg, #CFC0F0 0%, #BEAEE8 25%, #AE9EDE 55%, #9E8ED0 100%)",
                border: "2.5px solid rgba(70,50,140,0.45)",
                boxShadow:
                  "0 24px 60px rgba(100,80,180,0.28), 0 6px 20px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.45)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Brushed metal horizontal lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  background:
                    "repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)",
                  pointerEvents: "none",
                }}
              />
              {/* Top shine band */}
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 42,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.32), transparent)",
                  borderRadius: "12px 12px 0 0",
                  pointerEvents: "none",
                }}
              />

              {/* Mail slot — idle */}
              <AnimatePresence>
                {!isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    style={{
                      position: "absolute",
                      top: 58,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 104,
                      height: 13,
                      borderRadius: 3,
                      background: "#1a1224",
                      boxShadow:
                        "inset 0 2px 5px rgba(0,0,0,0.9), 0 0 14px rgba(255,200,100,0.35)",
                    }}
                  >
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: 2,
                        borderRadius: 2,
                        background:
                          "linear-gradient(90deg, transparent 5%, rgba(255,215,120,0.25) 50%, transparent 95%)",
                      }}
                      animate={{ opacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interior cavity — revealed when door opens */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: "absolute",
                      inset: 10,
                      borderRadius: 8,
                      background:
                        "radial-gradient(ellipse at 50% 25%, #2e2345, #110d1e)",
                      boxShadow: "inset 0 6px 24px rgba(0,0,0,0.65)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Door panel — hinged at bottom, swings open */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  width: 208,
                  height: 120,
                  borderRadius: 10,
                  transformOrigin: "bottom center",
                  transformStyle: "preserve-3d",
                  background:
                    "linear-gradient(140deg, #CFC0F0 0%, #BEAEE8 30%, #AE9EDE 70%, #9E8ED0 100%)",
                  border: "2px solid rgba(70,50,140,0.35)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  willChange: "transform",
                }}
                animate={
                  state === "opening"
                    ? { rotateX: -90, opacity: 0.4 }
                    : isOpen
                    ? { rotateX: -105, opacity: 0 }
                    : { rotateX: 0, opacity: 1 }
                }
                transition={{ type: "spring", stiffness: 75, damping: 16 }}
              >
                {/* Door shine */}
                <div
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: 38,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.38), transparent)",
                    borderRadius: "10px 10px 0 0",
                    pointerEvents: "none",
                  }}
                />
                {/* Gold handle bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 32,
                    height: 7,
                    borderRadius: 4,
                    background:
                      "linear-gradient(90deg, #C8A84A, #EDD278, #D4B454, #F0DA8A, #C0A040)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                />
              </motion.div>
            </div>

            {/* Envelope rising from inside */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.88 }}
                  animate={
                    delivered
                      ? { y: -180, opacity: 0, scale: 1.08 }
                      : { y: -52, opacity: 1, scale: 1 }
                  }
                  exit={{ opacity: 0 }}
                  transition={
                    delivered
                      ? { type: "spring", stiffness: 80, damping: 18 }
                      : { type: "spring", stiffness: 95, damping: 20, delay: 0.45 }
                  }
                  style={{
                    position: "absolute",
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 148,
                    height: 100,
                    zIndex: 20,
                    filter: "drop-shadow(0 14px 28px rgba(80,50,140,0.38))",
                  }}
                >
                  {/* Envelope body */}
                  <div
                    style={{
                      width: 148,
                      height: 100,
                      borderRadius: 7,
                      background:
                        "linear-gradient(175deg, #FBF6ED 0%, #F4ECDB 50%, #EDE0C5 100%)",
                      border: "2px solid rgba(90,65,20,0.22)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow:
                        "0 10px 36px rgba(80,50,140,0.22), 0 3px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Inner V lines */}
                    <svg
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                      viewBox="0 0 148 100"
                    >
                      <line x1="0" y1="100" x2="74" y2="52" stroke="rgba(150,120,70,0.18)" strokeWidth="1.2" />
                      <line x1="148" y1="100" x2="74" y2="52" stroke="rgba(150,120,70,0.18)" strokeWidth="1.2" />
                    </svg>
                    {/* Wax seal */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle at 35% 30%, #FF8FA0, #D8304A, #7A1020)",
                        boxShadow:
                          "0 3px 10px rgba(180,25,55,0.5), inset 0 1px 0 rgba(255,180,190,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.9)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      ♥
                    </div>
                  </div>
                  {/* Envelope flap */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 52,
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    <svg viewBox="0 0 148 50" style={{ width: 148, height: 50 }}>
                      <polygon
                        points="0,0 148,0 74,50"
                        fill="#EDE0C5"
                        stroke="rgba(90,65,20,0.22)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Post */}
          <div
            style={{
              width: 20,
              height: 130,
              background:
                "linear-gradient(to right, #B4A4E0, #D0C4F2, #A898D0)",
              borderRadius: "0 0 3px 3px",
              boxShadow: "3px 0 0 rgba(80,60,140,0.28), -1px 0 0 rgba(255,255,255,0.15)",
              marginTop: -3,
            }}
          />

          {/* Base */}
          <div
            style={{
              width: 64,
              height: 11,
              background:
                "linear-gradient(to bottom, #C4B4E8, #A898D0)",
              borderRadius: "0 0 6px 6px",
              boxShadow:
                "0 5px 14px rgba(80,60,140,0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
              marginTop: -2,
            }}
          />
        </motion.div>
      </div>

      {/* Ellipse ground shadow */}
      <motion.div
        animate={isOpen ? { opacity: 0.45, scaleX: 1.15 } : { opacity: 0.22, scaleX: 1 }}
        transition={{ duration: 0.9 }}
        style={{
          position: "absolute",
          bottom: "17%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 190,
          height: 18,
          background: "rgba(90,65,150,0.32)",
          borderRadius: "50%",
          filter: "blur(9px)",
          pointerEvents: "none",
        }}
      />

      {/* Caption */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{
              position: "absolute",
              bottom: "9%",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "10px 26px",
                borderRadius: 999,
                background: "rgba(255,250,248,0.84)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 8px 26px rgba(120,80,160,0.18)",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: 15,
                color: "#5A3870",
              }}
            >
              {senderName
                ? `A letter from ${senderName} — tap to open`
                : "Tap the mailbox to open your letter"}
            </div>
            <motion.p
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                marginTop: 9,
                fontSize: 11,
                color: "#9A78AE",
                letterSpacing: "0.18em",
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500,
              }}
            >
              CLICK TO OPEN
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared-layout envelope handoff */}
      <AnimatePresence>
        {delivered && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(360px, 90vw)",
              aspectRatio: "360 / 240",
              pointerEvents: "none",
              zIndex: 60,
            }}
          >
            <motion.div
              key="shared-envelope"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                scale: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
                opacity: { duration: 0.35, ease: "easeOut" },
              }}
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "50% 50%",
                perspective: "800px",
                willChange: "transform",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "8px 12px -12px 12px",
                  borderRadius: 6,
                  background: "rgba(120,110,90,0.18)",
                  boxShadow: "0 22px 34px rgba(120,110,90,0.22)",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 6,
                  background: "#F5C9DA",
                  border: "2.5px solid #1a1a1a",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "50%",
                  zIndex: 10,
                  transformOrigin: "top center",
                }}
              >
                <svg
                  viewBox="0 0 360 180"
                  style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 360,0 180,180"
                    fill="#F5C9DA"
                    stroke="#1a1a1a"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurpleMailboxV2;
