import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Isometric pastel-purple mailbox — click to open, envelope slides out.
   Pure SVG + framer-motion. No WebGL. */

interface Props {
  className?: string;
  onContinue?: () => void;
}

const STROKE = "#1a1a1a";
const BODY = "#D9CCFF";
const BODY_DARK = "#BBA8F0";
const BODY_LIGHT = "#E8DEFF";
const POST = "#EFEAFB";

const RealisticMailbox = ({ className, onContinue }: Props) => {
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
        whileHover={{ scale: open ? 1 : 1.03 }}
        whileTap={{ scale: open ? 1 : 0.97 }}
        animate={
          open
            ? { y: [0, -2, 0] }
            : { y: [0, -6, 0] }
        }
        transition={
          open
            ? { duration: 0.4 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          cursor: open ? "default" : "pointer",
          width: "min(520px, 90%)",
          aspectRatio: "1 / 1",
          position: "relative",
        }}
      >
        <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
          {/* Soft ground shadow */}
          <ellipse cx="200" cy="370" rx="120" ry="10" fill="#000" opacity="0.12" />

          {/* Post */}
          <g>
            {/* Post front */}
            <polygon
              points="188,280 212,280 212,365 188,365"
              fill={POST}
              stroke={STROKE}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Post side (isometric) */}
            <polygon
              points="212,280 224,272 224,357 212,365"
              fill={BODY_DARK}
              stroke={STROKE}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Mailbox isometric body — side panel (right) */}
          <path
            d="M 280 130
               Q 280 90 250 90
               L 320 60
               Q 350 60 350 100
               L 350 230
               L 280 260
               Z"
            fill={BODY_DARK}
            stroke={STROKE}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Top highlight stripe on side */}
          <path
            d="M 290 100 Q 305 75 325 75"
            fill="none"
            stroke={BODY_LIGHT}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Base / floor strip */}
          <polygon
            points="100,255 280,255 280,260 100,260"
            fill={BODY_DARK}
            stroke={STROKE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Envelope (revealed coming out of slot) */}
          <AnimatePresence>
            {open && (
              <motion.g
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: -40, y: -30, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <g transform="translate(150, 170)">
                  {/* envelope body */}
                  <rect
                    x="0" y="0" width="110" height="70"
                    rx="3"
                    fill="#ffffff"
                    stroke={STROKE}
                    strokeWidth="2.5"
                  />
                  {/* envelope flap lines */}
                  <polyline
                    points="0,0 55,38 110,0"
                    fill="none"
                    stroke={STROKE}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* heart seal */}
                  <path
                    d="M 55 50
                       m -8 -3
                       a 5 5 0 1 1 8 -3
                       a 5 5 0 1 1 8 3
                       q 0 6 -8 12
                       q -8 -6 -8 -12 z"
                    fill="#FF6F85"
                    stroke={STROKE}
                    strokeWidth="1.5"
                  />
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Mailbox front (rounded arch) */}
          <path
            d="M 100 130
               Q 100 90 140 90
               L 250 90
               Q 280 90 280 130
               L 280 260
               L 100 260
               Z"
            fill={BODY}
            stroke={STROKE}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Front cover (door) — hinged at bottom, swings down when open */}
          <motion.g
            style={{ originX: "190px", originY: "260px" }}
            animate={{ rotate: open ? 95 : 0 }}
            transition={{ duration: 0.9, ease: [0.34, 1.4, 0.64, 1] }}
          >
            <path
              d="M 100 130
                 Q 100 90 140 90
                 L 250 90
                 Q 280 90 280 130
                 L 280 260
                 L 100 260
                 Z"
              fill={BODY}
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Mail slot */}
            <motion.rect
              x="135" y="175" width="90" height="14"
              rx="3"
              fill={STROKE}
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            {/* Slot inner accent (a tilted darker bar like the ref) */}
            <motion.path
              d="M 145 188 L 215 174"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            {/* Handle hint at bottom */}
            <circle cx="190" cy="245" r="3" fill={STROKE} opacity={open ? 0 : 0.6} />
          </motion.g>

          {/* Subtle hint when closed */}
          {!open && (
            <motion.text
              x="200"
              y="395"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize="13"
              fill="#6b5b8e"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              Tap the mailbox
            </motion.text>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

export default RealisticMailbox;
