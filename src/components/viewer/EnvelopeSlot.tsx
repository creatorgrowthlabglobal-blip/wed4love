import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface EnvelopeSlotProps {
  receiverName: string;
  onContinue: () => void;
}

const ENVELOPE_BASE = "#FFF0F4";
const TEXT_MID = "#6B6456";

export default function EnvelopeSlot({ receiverName, onContinue }: EnvelopeSlotProps) {
  const [settled, setSettled] = useState(false);

  // Marks envelope as settled after slide animation completes (delay 0.5 + duration 1.3 + buffer)
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "radial-gradient(ellipse at 50% 30%, #DCCFE6 0%, #C4B3D6 100%)",
        overflow: "hidden",
      }}
    >
      {/* Grain overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "200px",
      }} />

      {/* Wall panel — covers top half of screen, same bg so it blends; slot bar marks the exit point */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "50%",
        background: "radial-gradient(ellipse at 50% 30%, #DCCFE6 0%, #C4B3D6 100%)",
        zIndex: 20,
        boxShadow: "0 12px 40px rgba(40,20,35,0.18)",
      }}>
        {/* Slot bar at bottom of wall */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(400px, 94vw)",
          height: "22px",
          background: "rgba(35, 18, 30, 0.80)",
          borderRadius: "4px 4px 0 0",
          zIndex: 25,
          boxShadow: "0 -2px 12px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.07)",
        }}>
          {/* Slot opening — thin dark slit */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "14px",
            right: "14px",
            height: "7px",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.60)",
            borderRadius: "3.5px",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.5)",
          }} />
        </div>
      </div>

      {/* Envelope — starts inside wall (hidden), slides down to below slot */}
      <motion.div
        initial={{ y: "-55%" }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={settled ? onContinue : undefined}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          width: "min(360px, 90vw)",
          aspectRatio: "360 / 240",
          zIndex: 15, // below wall (z:20) while inside it; fully visible once past 50%
          cursor: settled ? "pointer" : "default",
          filter: "drop-shadow(0 28px 48px rgba(100,40,70,0.28)) drop-shadow(0 8px 16px rgba(100,40,70,0.16))",
        }}
      >
        {/* Envelope body */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "6px",
          background: ENVELOPE_BASE,
          border: "2px solid rgba(160,80,110,0.55)",
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
        }}>
          <svg viewBox="0 0 360 240" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="esLgLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#E0A8C0" />
                <stop offset="100%" stopColor="#F0CAD8" />
              </linearGradient>
              <linearGradient id="esLgRight" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#E0A8C0" />
                <stop offset="100%" stopColor="#F5D5E5" />
              </linearGradient>
              <linearGradient id="esLgBottom" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#D9A0BC" />
                <stop offset="100%" stopColor="#EDB8CE" />
              </linearGradient>
              <linearGradient id="esSeamL" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(100,30,60,0.18)" />
                <stop offset="100%" stopColor="rgba(100,30,60,0)" />
              </linearGradient>
              <linearGradient id="esSeamR" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(100,30,60,0.18)" />
                <stop offset="100%" stopColor="rgba(100,30,60,0)" />
              </linearGradient>
            </defs>
            <polygon points="0,240 360,240 180,120" fill="url(#esLgBottom)" />
            <polygon points="0,0 0,240 180,120" fill="url(#esLgLeft)" />
            <polygon points="360,0 360,240 180,120" fill="url(#esLgRight)" />
            <polygon points="0,0 0,240 22,218 22,22" fill="url(#esSeamL)" opacity="0.7" />
            <polygon points="360,0 360,240 338,218 338,22" fill="url(#esSeamR)" opacity="0.7" />
            <line x1="0" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.2" />
            <line x1="360" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.2" />
            <rect x="8" y="8" width="344" height="224" fill="none" stroke="rgba(190,120,150,0.50)" strokeWidth="0.9" rx="3" />
            <rect x="12" y="12" width="336" height="216" fill="none" stroke="rgba(220,165,185,0.35)" strokeWidth="0.6" rx="2" />
            {/* Postage stamp */}
            <g transform="translate(280, 16)">
              <rect width="60" height="70" fill="#FFF8F2" stroke="rgba(180,110,140,0.70)" strokeWidth="1.2" rx="2" />
              <rect x="5" y="5" width="50" height="60" fill="none" stroke="rgba(200,140,160,0.55)" strokeWidth="0.7" strokeDasharray="2.5,2" rx="1" />
              <path d="M30 51 C 22 43, 19 37, 21 31.5 C 23 27, 27.5 26.5, 30 30.5 C 32.5 26.5, 37 27, 39 31.5 C 41 37, 38 43, 30 51 Z" fill="#C0607A" opacity="0.80" />
              <ellipse cx="26" cy="34" rx="2.5" ry="1.6" fill="white" opacity="0.30" transform="rotate(-20 26 34)" />
              <rect x="10" y="57" width="40" height="4" rx="1" fill="rgba(180,110,140,0.20)" />
            </g>
            {/* Corner roses */}
            <g transform="translate(26, 210)">
              <ellipse cx="0" cy="-8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" />
              <ellipse cx="8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(90 8 0)" />
              <ellipse cx="0" cy="8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" transform="rotate(180)" />
              <ellipse cx="-8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(270 -8 0)" />
              <circle cx="0" cy="0" r="4" fill="#F0C5D5" opacity="0.75" />
              <circle cx="0" cy="0" r="1.8" fill="#C88090" opacity="0.60" />
            </g>
            <g transform="translate(334, 210)">
              <ellipse cx="0" cy="-8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" />
              <ellipse cx="8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(90 8 0)" />
              <ellipse cx="0" cy="8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" transform="rotate(180)" />
              <ellipse cx="-8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(270 -8 0)" />
              <circle cx="0" cy="0" r="4" fill="#F0C5D5" opacity="0.75" />
              <circle cx="0" cy="0" r="1.8" fill="#C88090" opacity="0.60" />
            </g>
          </svg>

          {/* Recipient name */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            paddingTop: "30%", gap: "4px", pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: "'Caveat', 'Dancing Script', cursive",
              fontSize: "clamp(26px, 8vw, 42px)",
              color: "#5C1832",
              letterSpacing: "0.02em",
              lineHeight: 1.1,
              textShadow: "0 1px 6px rgba(92,24,50,0.20)",
            }}>
              {receiverName}
            </span>
            <svg viewBox="0 0 120 12" style={{ width: "clamp(80px, 22vw, 120px)", marginTop: "2px", opacity: 0.35 }}>
              <path d="M10 6 Q 30 2, 60 6 Q 90 10, 110 6" fill="none" stroke="#9B5570" strokeWidth="1" />
              <circle cx="4" cy="6" r="2" fill="#9B5570" />
              <circle cx="116" cy="6" r="2" fill="#9B5570" />
            </svg>
          </div>
        </div>

        {/* Closed flap with wax seal */}
        <div style={{ position: "absolute", inset: 0, perspective: "600px", transformStyle: "preserve-3d", zIndex: 10 }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "50%",
            transformOrigin: "top center", transformStyle: "preserve-3d",
          }}>
            <svg viewBox="0 0 360 180" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="esFlapGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#F8DDE8" />
                  <stop offset="100%" stopColor="#EDB8CE" />
                </linearGradient>
              </defs>
              <path d="M 0,0 L 180,180 L 360,0" fill="url(#esFlapGrad)" stroke="rgba(140,70,100,0.45)" strokeWidth="2" strokeLinejoin="round"/>
              <line x1="20" y1="4" x2="340" y2="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            </svg>
            {/* Wax seal */}
            <div style={{
              position: "absolute", bottom: -36, left: "50%", width: 72, height: 72,
              marginLeft: -36, pointerEvents: "none",
              filter: "drop-shadow(0 5px 10px rgba(70,10,35,0.40)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            }}>
              <svg viewBox="0 0 72 72" style={{ width: "100%", height: "100%", display: "block" }}>
                {Array.from({ length: 16 }).map((_, i) => {
                  const a = (i * 360) / 16;
                  const r1 = 33, r2 = 36;
                  const x1 = 36 + r1 * Math.cos((a * Math.PI) / 180);
                  const y1 = 36 + r1 * Math.sin((a * Math.PI) / 180);
                  const x2 = 36 + r2 * Math.cos(((a - 5) * Math.PI) / 180);
                  const y2 = 36 + r2 * Math.sin(((a - 5) * Math.PI) / 180);
                  const x3 = 36 + r2 * Math.cos(((a + 5) * Math.PI) / 180);
                  const y3 = 36 + r2 * Math.sin(((a + 5) * Math.PI) / 180);
                  return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="#7A1535" />;
                })}
                <circle cx="36" cy="36" r="32" fill="#8B1A40" />
                <circle cx="36" cy="36" r="28" fill="#9E2550" />
                <circle cx="36" cy="36" r="25" fill="none" stroke="#F8D8E8" strokeWidth="1" opacity="0.55" />
                <circle cx="36" cy="36" r="23" fill="#7A1535" />
                <path d="M36 50 C 24 41, 20 33, 23 26.5 C 25.5 21.5, 31 21, 36 26 C 41 21, 46.5 21.5, 49 26.5 C 52 33, 48 41, 36 50 Z" fill="#FFE4EF" />
                <ellipse cx="30" cy="30" rx="4" ry="2.5" fill="white" opacity="0.22" transform="rotate(-25 30 30)" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* "Tap to open" hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: settled ? 0.65 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "12px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: TEXT_MID,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          whiteSpace: "nowrap",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        tap to open
      </motion.p>
    </div>
  );
}
