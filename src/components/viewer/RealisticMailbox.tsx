import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Premium brushed-metal lavender mailbox with piston stand & perched birds.
   Pure SVG + framer-motion. */

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const STROKE = "#1a1a1a";

const RealisticMailbox = ({ className, onContinue, senderName }: Props) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (open) return;
    setOpen(true);
    setTimeout(() => onContinue?.(), 2200);
  };

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: open ? 1 : 1.02 }}
        whileTap={{ scale: open ? 1 : 0.98 }}
        animate={open ? { y: [0, -2, 0] } : { y: [0, -5, 0] }}
        transition={
          open
            ? { duration: 0.4 }
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          cursor: open ? "default" : "pointer",
          width: "min(520px, 90%)",
          aspectRatio: "1 / 1",
          position: "relative",
        }}
      >
        <svg viewBox="0 0 400 470" width="100%" height="100%" style={{ overflow: "visible" }}>
          <defs>
            {/* Brushed lavender metal — front face (vertical grain + soft sheen) */}
            <linearGradient id="lavMetal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A99BD8" />
              <stop offset="22%" stopColor="#D4C8F2" />
              <stop offset="50%" stopColor="#BDAEE7" />
              <stop offset="78%" stopColor="#D8CCF4" />
              <stop offset="100%" stopColor="#9C8DCC" />
            </linearGradient>
            {/* Darker brushed lavender — top/back ribbon */}
            <linearGradient id="lavMetalDark" x1="0" y1="0" x2="1" y2="0.2">
              <stop offset="0%" stopColor="#7E6FB3" />
              <stop offset="35%" stopColor="#A395D1" />
              <stop offset="65%" stopColor="#8B7CC2" />
              <stop offset="100%" stopColor="#6E5FA3" />
            </linearGradient>
            {/* Roof top sheen highlight */}
            <linearGradient id="lavRoofShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EFE7FF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EFE7FF" stopOpacity="0" />
            </linearGradient>
            {/* Brushed steel for piston */}
            <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7A7585" />
              <stop offset="30%" stopColor="#C8C3D2" />
              <stop offset="55%" stopColor="#9A94A8" />
              <stop offset="80%" stopColor="#C8C3D2" />
              <stop offset="100%" stopColor="#6F6A7A" />
            </linearGradient>
            <linearGradient id="steelDark" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4F4A5A" />
              <stop offset="50%" stopColor="#807A8C" />
              <stop offset="100%" stopColor="#3F3A4A" />
            </linearGradient>
            {/* Slot interior glow */}
            <radialGradient id="slotGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFE9B0" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#E0995A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
            </radialGradient>
            {/* Brushed grain noise */}
            <filter id="brushed" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="turbulence" baseFrequency="0.9 0.04" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.18 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            {/* Soft glow for tap text */}
            <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Drop shadow for body */}
            <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
              <feOffset dy="4" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.35" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="frontClip">
              <path d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z" />
            </clipPath>
            <clipPath id="roofClip">
              <path d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z" />
            </clipPath>
          </defs>

          {/* Soft ground reflection */}
          <ellipse cx="200" cy="418" rx="150" ry="14" fill="#000" opacity="0.18" />
          <ellipse cx="200" cy="416" rx="110" ry="6" fill="#000" opacity="0.25" />

          {/* ───── SIMPLE POST STAND (original) ───── */}
          <g>
            <polygon
              points="188,270 212,270 212,410 188,410"
              fill="#EFEAFB"
              stroke={STROKE}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polygon
              points="212,270 224,262 224,402 212,410"
              fill="#BBA8F0"
              stroke={STROKE}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* ───── MAILBOX BODY ───── */}
          <g filter="url(#bodyShadow)">
            {/* Back / top dome ribbon */}
            <path
              d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"
              fill="url(#lavMetalDark)"
              stroke={STROKE}
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {/* Brushed grain on roof ribbon */}
            <g clipPath="url(#roofClip)" opacity="0.55">
              <rect x="100" y="60" width="240" height="220" fill="#fff" filter="url(#brushed)" />
            </g>
            {/* Roof rim sheen */}
            <path
              d="M 158 150 Q 160 70 240 70 Q 322 70 324 150"
              fill="none"
              stroke="#EAE0FA"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Envelope (slides from slot) */}
            <AnimatePresence>
              {open && (
                <motion.g
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.85 }}
                  animate={{ x: -30, y: -60, opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <g transform="translate(150, 185)">
                    <rect x="0" y="0" width="110" height="70" rx="3" fill="#ffffff" stroke={STROKE} strokeWidth="2.5" />
                    <polyline points="0,0 55,38 110,0" fill="none" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
                    <path
                      d="M 55 50 m -8 -3 a 5 5 0 1 1 8 -3 a 5 5 0 1 1 8 3 q 0 6 -8 12 q -8 -6 -8 -12 z"
                      fill="#FF6F85"
                      stroke={STROKE}
                      strokeWidth="1.5"
                    />
                  </g>
                </motion.g>
              )}
            </AnimatePresence>

            {/* Front face — brushed lavender */}
            <path
              d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"
              fill="url(#lavMetal)"
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Brushed grain on front */}
            <g clipPath="url(#frontClip)" opacity="0.6">
              <rect x="100" y="80" width="200" height="200" fill="#fff" filter="url(#brushed)" />
            </g>
            {/* Top sheen on front */}
            <path
              d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"
              fill="url(#lavRoofShine)"
              opacity="0.5"
              clipPath="url(#frontClip)"
            />
            {/* Edge highlight (precision-machined rim) */}
            <path
              d="M 113 268 L 113 170 Q 113 88 195 88 Q 277 88 277 170 L 277 268"
              fill="none"
              stroke="#F2EBFF"
              strokeWidth="1.2"
              opacity="0.85"
            />

            {/* Base band (bottom panel thickness) */}
            <rect x="105" y="265" width="180" height="11" fill="url(#lavMetalDark)" stroke={STROKE} strokeWidth="2.5" />
            <rect x="105" y="265" width="180" height="2.5" fill="#EAE0FA" opacity="0.7" />

            {/* Mail slot — recessed with interior glow */}
            <g>
              <rect x="138" y="186" width="104" height="17" rx="3" fill={STROKE} />
              <rect x="141" y="189" width="98" height="11" rx="2" fill="url(#slotGlow)" />
              {/* Slot lip highlight */}
              <line x1="141" y1="187.5" x2="239" y2="187.5" stroke="#F2EBFF" strokeWidth="1" opacity="0.9" />
            </g>
          </g>

          {/* ───── BIRDS (perched on roof) ───── */}
          {/* Cream bird (left) */}
          <g transform="translate(168, 60)">
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#F4E6C9" stroke={STROKE} strokeWidth="1.6" />
            <circle cx="-10" cy="-6" r="7.5" fill="#F4E6C9" stroke={STROKE} strokeWidth="1.6" />
            <polygon points="-17,-6 -22,-4 -17,-2" fill="#E2A23C" stroke={STROKE} strokeWidth="1" />
            <circle cx="-12" cy="-7" r="1.3" fill={STROKE} />
            <path d="M 6 -2 Q 12 -6 14 -10" fill="none" stroke={STROKE} strokeWidth="1.4" />
            <path d="M -2 4 L -4 9 M 2 4 L 1 9" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
            {/* wing hint */}
            <path d="M -2 -2 Q 4 -1 8 4" fill="none" stroke="#C9B58A" strokeWidth="1.2" />
          </g>

          {/* White bird (right) */}
          <g transform="translate(238, 58)">
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FAFAF6" stroke={STROKE} strokeWidth="1.6" />
            <circle cx="10" cy="-6" r="7.5" fill="#FAFAF6" stroke={STROKE} strokeWidth="1.6" />
            <polygon points="17,-6 22,-4 17,-2" fill="#E2A23C" stroke={STROKE} strokeWidth="1" />
            <circle cx="12" cy="-7" r="1.3" fill={STROKE} />
            <path d="M -6 -2 Q -12 -6 -14 -10" fill="none" stroke={STROKE} strokeWidth="1.4" />
            <path d="M 2 4 L 4 9 M -2 4 L -1 9" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 2 -2 Q -4 -1 -8 4" fill="none" stroke="#D6D2C8" strokeWidth="1.2" />
          </g>

          {/* Tap text with glow */}
          {!open && (
            <motion.text
              x="200"
              y="458"
              textAnchor="middle"
              fontFamily="'Inter', system-ui, sans-serif"
              fontSize="13"
              fontWeight="500"
              letterSpacing="2"
              fill="#6b5b8e"
              filter="url(#textGlow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 1, 0.5] }}
              transition={{ duration: 2.6, repeat: Infinity }}
            >
              TAP THE MAILBOX
            </motion.text>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

export default RealisticMailbox;
