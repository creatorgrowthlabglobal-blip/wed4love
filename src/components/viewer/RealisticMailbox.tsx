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

          {/* Post — flush against the bottom of mailbox body (y=260) */}
          <g>
            <polygon
              points="188,260 212,260 212,365 188,365"
              fill={POST}
              stroke={STROKE}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polygon
              points="212,260 224,252 224,357 212,365"
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

          {/* Envelope (slides out from slot when opened) */}
          <AnimatePresence>
            {open && (
              <motion.g
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.85 }}
                animate={{ x: -30, y: -50, opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <g transform="translate(150, 175)">
                  <rect x="0" y="0" width="110" height="70" rx="3"
                    fill="#ffffff" stroke={STROKE} strokeWidth="2.5" />
                  <polyline points="0,0 55,38 110,0"
                    fill="none" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
                  <path
                    d="M 55 50 m -8 -3
                       a 5 5 0 1 1 8 -3
                       a 5 5 0 1 1 8 3
                       q 0 6 -8 12
                       q -8 -6 -8 -12 z"
                    fill="#FF6F85" stroke={STROKE} strokeWidth="1.5"
                  />
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Mailbox front — single seamless closed face */}
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

          {/* Mail slot — crisp horizontal black rectangle (tilted like reference) */}
          <g transform="rotate(-8 190 180)">
            <rect x="140" y="172" width="100" height="14" rx="2" fill={STROKE} />
          </g>

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
