import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion";
import { sounds } from "@/lib/sounds";

/*
  Template 2 — Classic Purple Mailbox
  Opening mechanism: door-swing (same foreignObject CSS-3D approach as Template 4)
  Visual style preserved: black outlines, brushed-metal texture, illustrated birds.
*/

type MailboxState = "idle" | "opening" | "open" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const STROKE = "#1a1a1a";

/* ───────────────────── Defs ───────────────────── */
const Defs = () => (
  <defs>
    <linearGradient id="lavMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#A99BD8"/>
      <stop offset="22%"  stopColor="#D4C8F2"/>
      <stop offset="50%"  stopColor="#BDAEE7"/>
      <stop offset="78%"  stopColor="#D8CCF4"/>
      <stop offset="100%" stopColor="#9C8DCC"/>
    </linearGradient>
    <linearGradient id="lavMetalDark" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%"   stopColor="#7E6FB3"/>
      <stop offset="35%"  stopColor="#A395D1"/>
      <stop offset="65%"  stopColor="#8B7CC2"/>
      <stop offset="100%" stopColor="#6E5FA3"/>
    </linearGradient>
    {/* Brushed-metal texture overlay — horizontal turbulence, no blur */}
    <filter id="brushed" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.9 0.04" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.18 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dy="4"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    {/* Interior depth-of-field blur */}
    <filter id="cavityBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <radialGradient id="cavity" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0%"   stopColor="#3a2f4d"/>
      <stop offset="55%"  stopColor="#1a1424"/>
      <stop offset="100%" stopColor="#0a0610"/>
    </radialGradient>
    <clipPath id="frontClip">
      <path d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"/>
    </clipPath>
    <clipPath id="roofClip">
      <path d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"/>
    </clipPath>
  </defs>
);

/* ───────────────────── Ground shadow ───────────────────── */
const GroundShadow = () => (
  <motion.g
    variants={{
      idle:      { opacity:1,   scaleX:1    },
      opening:   { opacity:0.85, scaleX:1.05 },
      open:      { opacity:0.85, scaleX:1.08 },
      delivered: { opacity:1,   scaleX:1    },
    }}
    style={{ transformOrigin:"200px 418px" }}
  >
    <ellipse cx="200" cy="418" rx="150" ry="14" fill="#000" opacity="0.18"/>
    <ellipse cx="200" cy="416" rx="110" ry="6"  fill="#000" opacity="0.25"/>
  </motion.g>
);

/* ───────────────────── Post ───────────────────── */
const Post = () => (
  <g>
    <polygon points="188,270 212,270 212,410 188,410"
      fill="#EFEAFB" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round"/>
    <polygon points="212,270 224,262 224,402 212,410"
      fill="#BBA8F0" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round"/>
  </g>
);

/* ───────────────────── Roof ───────────────────── */
const Roof = () => (
  <motion.g
    variants={{
      idle:      { rotate:0 },
      opening:   { rotate:[0,-1.2,1.2,0], transition:{ duration:0.5 } },
      open:      { rotate:0 },
      delivered: { rotate:0 },
    }}
    style={{ transformOrigin:"217px 170px" }}
  >
    <path
      d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"
      fill="url(#lavMetalDark)" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round"
    />
    <g clipPath="url(#roofClip)" opacity="0.55">
      <rect x="100" y="60" width="240" height="220" fill="#fff" filter="url(#brushed)"/>
    </g>
    <path
      d="M 158 150 Q 160 70 240 70 Q 322 70 324 150"
      fill="none" stroke="#EAE0FA" strokeWidth="2.5" strokeLinecap="round" opacity="0.85"
    />
  </motion.g>
);

/* ───────────────────── Interior cavity ───────────────────── */
const Interior = ({ open }: { open:boolean }) => (
  <g
    clipPath="url(#frontClip)"
    style={{
      filter: open ? "url(#cavityBlur)" : "none",
      transition: open ? "filter 0.6s ease 0.7s" : "filter 0.6s ease",
    }}
  >
    <rect x="100" y="80" width="200" height="200" fill="url(#cavity)"/>
    <path d="M 110 170 Q 110 90 195 90 Q 280 90 280 170"
      fill="none" stroke="#000" strokeWidth="10" opacity="0.55" strokeLinecap="round"/>
    <path d="M 122 170 L 122 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35"/>
    <path d="M 268 170 L 268 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35"/>
    <line x1="115" y1="262" x2="275" y2="262" stroke="#000" strokeWidth="1.5" opacity="0.7"/>
    <ellipse cx="195" cy="155" rx="60" ry="22" fill="#fff" opacity="0.04"/>
  </g>
);

/* ───────────────────── Hinge sill ───────────────────── */
const HingeSill = () => (
  <g>
    <rect x="105" y="265" width="180" height="14" rx="1"
      fill="url(#lavMetalDark)" stroke={STROKE} strokeWidth="2.5"/>
    <rect x="105" y="265" width="180" height="2.5" fill="#EAE0FA" opacity="0.8"/>
    <rect x="107" y="277" width="176" height="2"   fill="#000"    opacity="0.35"/>
  </g>
);

/* ───────────────────── Swing door (pure SVG clipPath — all browsers) ───────────────────── */
/* foreignObject + CSS rotateX is broken on iOS Safari. scaleY on SVG groups has wrong
   transform-origin on iOS. motion.rect inside <defs> doesn't animate via WAAPI on Safari
   (elements in defs are not rendered so WAAPI skips them). Solution: drive the clip rect
   via useRef + CSS geometry property transitions, which work in Safari 14.1+. */
const SwingDoor = ({ open }: { open:boolean }) => {
  const rectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const rect = rectRef.current;
    if (!rect) return;
    rect.style.transition = 'y 0.55s cubic-bezier(0.22, 1, 0.36, 1), height 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
    rect.style.setProperty('y', open ? '270' : '85');
    rect.style.setProperty('height', open ? '0' : '185');
  }, [open]);

  return (
  <>
    <defs>
      <clipPath id="doorRevealClip">
        {/* y goes 85→270, height goes 185→0 — bottom edge fixed at 270 (the hinge). */}
        <rect ref={rectRef} x="108" width="176" y="85" height="185" />
      </clipPath>
    </defs>

    <g clipPath="url(#doorRevealClip)">
      {/* Door face */}
      <path
        d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"
        fill="url(#lavMetal)"
      />
      {/* Shine — upper fade */}
      <path
        d="M 110 180 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 180 Z"
        fill="rgba(239,231,255,0.50)"
      />
      {/* Inner bevel */}
      <path
        d="M 116 268 L 116 173 Q 116 91 195 91 Q 274 91 274 173 L 274 268"
        fill="none" stroke="rgba(242,235,255,0.60)" strokeWidth="1.5"
      />
      {/* Bottom shadow */}
      <line x1="110" y1="268" x2="280" y2="268" stroke="rgba(0,0,0,0.22)" strokeWidth="2"/>

      {/* Mail slot */}
      <rect x="146" y="153" width="99" height="22" rx="3" fill="#3a243a"/>
      <rect x="148" y="155" width="95" height="5"  rx="2" fill="#080210"/>
      <rect x="148" y="160" width="95" height="11"       fill="#0e0620"/>
      <rect x="148" y="171" width="95" height="2"        fill="#1e1040"/>
      <motion.rect
        x="148" y="160" width="95" height="11" fill="rgba(150,100,240,0.08)"
        animate={open ? { opacity: 0 } : { opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.4, repeat: open ? 0 : Infinity }}
      />
      <rect x="148" y="172" width="95" height="1" fill="rgba(200,160,240,0.30)"/>

      {/* Brass handle */}
      <rect x="171" y="239" width="49" height="7" rx="4" fill="#7A5000"/>
      <rect x="171" y="237" width="49" height="7" rx="4" fill="#C49018"/>
      <rect x="177" y="238" width="37" height="1.5" rx="1" fill="rgba(255,255,255,0.88)"/>
    </g>

    {/* Black arch outline — fades as door opens */}
    <motion.path
      d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270"
      fill="none" stroke={STROKE} strokeWidth="3" strokeLinejoin="round"
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration: 0.25 }}
    />
    {/* Inner highlight ring */}
    <motion.path
      d="M 113 268 L 113 170 Q 113 88 195 88 Q 277 88 277 170 L 277 268"
      fill="none" stroke="#F2EBFF" strokeWidth="1.2"
      animate={{ opacity: open ? 0 : 0.85 }}
      transition={{ duration: 0.25 }}
    />
  </>
  );
};

/* ───────────────────── Rising envelope — ATM slot style ───────────────────── */
const RisingEnvelope = ({ show, delivered }: { show:boolean; delivered:boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scaleY: 0.04, y: 0, opacity: 1 }}
        animate={delivered
          ? { scaleY: 1, y: -280, opacity: 0 }
          : { scaleY: 1, y: 72, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={delivered
          ? { type:"spring", stiffness:75, damping:16 }
          : {
              scaleY: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              y:      { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 },
            }}
        style={{
          position:"absolute", left:"50%", top:"31%",
          marginLeft:-65,
          width:130, height:87, zIndex:20,
          transformOrigin:"50% 0%",
          cursor:"default",
          filter:"drop-shadow(0 10px 22px rgba(100,40,70,0.30))",
        }}
      >
        {/* Envelope body — refined */}
        <div style={{
          position:"absolute", inset:0, borderRadius:4,
          background:"#FFF0F4",
          border:"1.5px solid rgba(160,80,110,0.55)",
          overflow:"hidden",
          boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.6)",
        }}>
          <svg viewBox="0 0 360 240" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="none">
            <defs>
              <linearGradient id="rmLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#E0A8C0"/><stop offset="100%" stopColor="#F0CAD8"/>
              </linearGradient>
              <linearGradient id="rmRight" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#E0A8C0"/><stop offset="100%" stopColor="#F5D5E5"/>
              </linearGradient>
              <linearGradient id="rmBottom" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#D9A0BC"/><stop offset="100%" stopColor="#EDB8CE"/>
              </linearGradient>
            </defs>
            <polygon points="0,240 360,240 180,120" fill="url(#rmBottom)"/>
            <polygon points="0,0 0,240 180,120" fill="url(#rmLeft)"/>
            <polygon points="360,0 360,240 180,120" fill="url(#rmRight)"/>
            <line x1="0" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.5"/>
            <line x1="360" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.5"/>
            <rect x="8" y="8" width="344" height="224" fill="none" stroke="rgba(190,120,150,0.45)" strokeWidth="1" rx="3"/>
            {/* Stamp */}
            <g transform="translate(280,16)">
              <rect width="60" height="70" fill="#FFF8F2" stroke="rgba(180,110,140,0.7)" strokeWidth="1.2" rx="2"/>
              <path d="M30 51 C22 43,19 37,21 31.5 C23 27,27.5 26.5,30 30.5 C32.5 26.5,37 27,39 31.5 C41 37,38 43,30 51Z" fill="#C0607A" opacity="0.8"/>
            </g>
            {/* Corner roses */}
            <g transform="translate(26,210)">
              <ellipse cx="0" cy="-7" rx="3" ry="4.5" fill="#E8B0C8" opacity="0.6"/>
              <ellipse cx="7" cy="0" rx="4.5" ry="3" fill="#E8B0C8" opacity="0.6" transform="rotate(90 7 0)"/>
              <circle cx="0" cy="0" r="3.5" fill="#F0C5D5" opacity="0.8"/>
            </g>
            <g transform="translate(334,210)">
              <ellipse cx="0" cy="-7" rx="3" ry="4.5" fill="#E8B0C8" opacity="0.6"/>
              <ellipse cx="-7" cy="0" rx="4.5" ry="3" fill="#E8B0C8" opacity="0.6" transform="rotate(90 -7 0)"/>
              <circle cx="0" cy="0" r="3.5" fill="#F0C5D5" opacity="0.8"/>
            </g>
          </svg>
        </div>
        {/* Flap */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",zIndex:5}}>
          <svg viewBox="0 0 360 180" style={{width:"100%",height:"100%",display:"block",overflow:"visible"}} preserveAspectRatio="none">
            <defs>
              <linearGradient id="rmFlap" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#F8DDE8"/><stop offset="100%" stopColor="#EDB8CE"/>
              </linearGradient>
            </defs>
            <polygon points="0,0 360,0 180,180" fill="url(#rmFlap)" stroke="rgba(140,70,100,0.45)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          {/* Wax seal */}
          <div style={{position:"absolute",bottom:-14,left:"50%",width:28,height:28,marginLeft:-14,filter:"drop-shadow(0 3px 6px rgba(70,10,35,0.4))"}}>
            <svg viewBox="0 0 72 72" style={{width:"100%",height:"100%"}}>
              <circle cx="36" cy="36" r="32" fill="#8B1A40"/>
              <circle cx="36" cy="36" r="23" fill="#7A1535"/>
              <path d="M36 50 C24 41,20 33,23 26.5 C25.5 21.5,31 21,36 26 C41 21,46.5 21.5,49 26.5 C52 33,48 41,36 50Z" fill="#FFE4EF"/>
            </svg>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ───────────────────── Birds ───────────────────── */
const birdBodyVariants = (dir: 1 | -1): Variants => ({
  idle: {
    y:[0,-2,0], x:0, opacity:1,
    transition:{ duration:2.8, repeat:Infinity, ease:"easeInOut" },
  },
  opening: {
    x: dir * 520, y:-220, opacity:[1,1,1,0], rotate: dir * 10,
    transition:{ duration:4.5, ease:"easeOut", opacity:{ duration:4.5, times:[0,0.7,0.9,1] } },
  },
  open:      { opacity:0 },
  delivered: { opacity:0 },
});

const wingFlapVariants: Variants = {
  idle:      { rotate:[-6,10,-6], transition:{ duration:1.8, repeat:Infinity, ease:"easeInOut" }},
  opening:   { rotate:[-30,25,-30], transition:{ duration:0.22, repeat:Infinity, ease:"easeInOut" }},
  open:      { rotate:0 },
  delivered: { rotate:0 },
};

const BirdLeft = () => (
  <g transform="translate(170, 70)">
    <motion.g variants={birdBodyVariants(-1)} style={{ transformOrigin:"0 0" }}>
      <path d="M 12 -2 Q 20 -8 22 -14" fill="none" stroke={STROKE} strokeWidth="1.4"/>
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#F4E6C9" stroke={STROKE} strokeWidth="1.6"/>
      <path d="M -2 9 L -4 14 M 2 9 L 1 14" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="-10" cy="-6" r="7.5" fill="#F4E6C9" stroke={STROKE} strokeWidth="1.6"/>
      <polygon points="-17,-6 -22,-4 -17,-2" fill="#E2A23C" stroke={STROKE} strokeWidth="1"/>
      <circle cx="-12" cy="-7" r="1.3" fill={STROKE}/>
      <motion.path d="M 1 -3 Q 6 -10 12 -6 Q 8 0 1 1 Z"
        fill="#E8D6A8" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round"
        variants={wingFlapVariants}
        style={{ transformOrigin:"1px -3px", transformBox:"fill-box" as any }}/>
    </motion.g>
  </g>
);

const BirdRight = () => (
  <g transform="translate(240, 70)">
    <motion.g variants={birdBodyVariants(1)} style={{ transformOrigin:"0 0" }}>
      <path d="M -12 -2 Q -20 -8 -22 -14" fill="none" stroke={STROKE} strokeWidth="1.4"/>
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FAFAF6" stroke={STROKE} strokeWidth="1.6"/>
      <path d="M -2 9 L -4 14 M 2 9 L 1 14" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="10" cy="-6" r="7.5" fill="#FAFAF6" stroke={STROKE} strokeWidth="1.6"/>
      <polygon points="17,-6 22,-4 17,-2" fill="#E2A23C" stroke={STROKE} strokeWidth="1"/>
      <circle cx="12" cy="-7" r="1.3" fill={STROKE}/>
      <motion.path d="M -1 -3 Q -6 -10 -12 -6 Q -8 0 -1 1 Z"
        fill="#ECEAE3" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round"
        variants={wingFlapVariants}
        style={{ transformOrigin:"-1px -3px", transformBox:"fill-box" as any }}/>
    </motion.g>
  </g>
);

/* ───────────────────── Caption ───────────────────── */
const Caption = ({ senderName }: { senderName?: string }) => (
  <g>
    <motion.text x="200" y="450" textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="18" fontWeight="600" fill="#4b3a6b"
      filter="url(#textGlow)"
      initial={{opacity:0,y:460}} animate={{opacity:1,y:450}} transition={{duration:0.8,ease:"easeOut"}}
    >
      You've got a mail from {senderName?.trim() || "someone special"}
    </motion.text>
    <motion.text x="200" y="478" textAnchor="middle"
      fontFamily="'Inter', system-ui, sans-serif"
      fontSize="12" fontWeight="500" letterSpacing="2" fill="#8a7aae"
      filter="url(#textGlow)"
      initial={{opacity:0}}
      animate={{opacity:[0.4,1,1,0.5]}} transition={{duration:2.6, repeat:Infinity}}
    >
      CLICK THE MAILBOX TO CONTINUE
    </motion.text>
  </g>
);

/* ───────────────────── Root ───────────────────── */
const PurpleMailbox = ({ className, onContinue, senderName }: Props) => {
  const [state, setState]   = useState<MailboxState>("idle");
  const [zoomed, setZoomed] = useState(false);
  const controls            = useAnimation();
  const timersRef           = useRef<number[]>([]);

  useEffect(() => { controls.start(state); }, [state, controls]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const isOpen    = state === "open" || state === "delivered";
  const delivered = state === "delivered";

  const handleMailboxClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => setState("open"), 800),
      // envelope fully risen ~600ms after "open"; wait 700ms then auto-advance
      window.setTimeout(() => { setState("delivered"); setZoomed(true); }, 1500),
      window.setTimeout(() => onContinue?.(), 2400),
    ];
  };

  return (
    <div
      className={className}
      style={{ display:"flex", alignItems:"center", justifyContent:"center" }}
    >
      <motion.div
        onClick={handleMailboxClick}
        whileHover={{ scale: isOpen ? 1 : 1.02 }}
        whileTap={{  scale: isOpen ? 1 : 0.98 }}
        animate={isOpen ? { y:[0,-2,0] } : { y:[0,-5,0] }}
        transition={isOpen
          ? { duration:0.4 }
          : { duration:3.4, repeat:Infinity, ease:"easeInOut" }}
        style={{
          cursor: isOpen ? "default" : "pointer",
          width:"min(520px,90%)",
          aspectRatio:"1/1",
          position:"relative",
        }}
      >
        {/* SVG fades out as the zoomed envelope takes over */}
        <motion.div
          animate={delivered ? {opacity:0} : {opacity:1}}
          transition={{duration:0.6, ease:"easeOut"}}
          style={{width:"100%",height:"100%",willChange:"opacity"}}
        >
          <svg viewBox="0 0 400 495" width="100%" height="100%"
            style={{overflow:"visible"}}>
            <Defs/>
            <motion.g initial="idle" animate={controls}>
              <GroundShadow/>
              <Post/>
              <g filter="url(#bodyShadow)">
                {/* Right-side wall */}
                <g>
                  <path
                    d="M 280 270 L 280 170 Q 280 85 195 85 L 200 78 Q 293 78 293 168 L 293 268 Z"
                    fill="url(#lavMetalDark)" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" opacity="0.95"
                  />
                  <path d="M 281 170 Q 281 88 198 82"
                    fill="none" stroke="#000" strokeWidth="1.5" opacity="0.4"/>
                  <path d="M 285 265 L 285 279 L 292 276 L 292 263 Z"
                    fill="url(#lavMetalDark)" stroke={STROKE} strokeWidth="2" strokeLinejoin="round"/>
                </g>
                <Roof/>
                <Interior open={false}/>
              </g>

              {/* Door stays closed — envelope comes out of the slot */}
              <SwingDoor open={false}/>
              <HingeSill/>
            </motion.g>

            {/* Birds rendered on top of everything */}
            <motion.g initial="idle" animate={controls}>
              <BirdLeft/>
              <BirdRight/>
            </motion.g>

            {state === "idle" && <Caption senderName={senderName}/>}
          </svg>
        </motion.div>

        {/* Rising envelope — appears from cavity once door is open */}
        <RisingEnvelope show={isOpen} delivered={delivered}/>

        {/* Full-screen handoff — refined envelope zooms in */}
        <AnimatePresence>
          {delivered && (
            <div style={{
              position:"fixed", inset:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              pointerEvents:"none", zIndex:60,
              background:"radial-gradient(ellipse at 50% 30%, #DCCFE6 0%, #C4B3D6 100%)",
            }}>
              <motion.div
                key="handoff-envelope"
                initial={{scale:0.35, opacity:0}}
                animate={{scale:zoomed?1:0.35, opacity:1}}
                transition={{
                  scale:{type:"spring",stiffness:90,damping:20,mass:1},
                  opacity:{duration:0.3,ease:"easeOut"},
                }}
                style={{
                  width:"min(360px,90vw)", aspectRatio:"360/240",
                  position:"relative",
                  filter:"drop-shadow(0 28px 48px rgba(100,40,70,0.30))",
                }}
              >
                {/* Body */}
                <div style={{position:"absolute",inset:0,borderRadius:6,background:"#FFF0F4",border:"2px solid rgba(160,80,110,0.55)",overflow:"hidden",boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.6)"}}>
                  <svg viewBox="0 0 360 240" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="hoLeft" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stopColor="#E0A8C0"/><stop offset="100%" stopColor="#F0CAD8"/></linearGradient>
                      <linearGradient id="hoRight" x1="100%" y1="50%" x2="0%" y2="50%"><stop offset="0%" stopColor="#E0A8C0"/><stop offset="100%" stopColor="#F5D5E5"/></linearGradient>
                      <linearGradient id="hoBottom" x1="50%" y1="100%" x2="50%" y2="0%"><stop offset="0%" stopColor="#D9A0BC"/><stop offset="100%" stopColor="#EDB8CE"/></linearGradient>
                      <linearGradient id="hoSeamL" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(100,30,60,0.18)"/><stop offset="100%" stopColor="rgba(100,30,60,0)"/></linearGradient>
                      <linearGradient id="hoSeamR" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stopColor="rgba(100,30,60,0.18)"/><stop offset="100%" stopColor="rgba(100,30,60,0)"/></linearGradient>
                    </defs>
                    <polygon points="0,240 360,240 180,120" fill="url(#hoBottom)"/>
                    <polygon points="0,0 0,240 180,120" fill="url(#hoLeft)"/>
                    <polygon points="360,0 360,240 180,120" fill="url(#hoRight)"/>
                    <polygon points="0,0 0,240 22,218 22,22" fill="url(#hoSeamL)" opacity="0.7"/>
                    <polygon points="360,0 360,240 338,218 338,22" fill="url(#hoSeamR)" opacity="0.7"/>
                    <line x1="0" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.2"/>
                    <line x1="360" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.2"/>
                    <rect x="8" y="8" width="344" height="224" fill="none" stroke="rgba(190,120,150,0.50)" strokeWidth="0.9" rx="3"/>
                    <rect x="12" y="12" width="336" height="216" fill="none" stroke="rgba(220,165,185,0.35)" strokeWidth="0.6" rx="2"/>
                    <g transform="translate(280,16)">
                      <rect width="60" height="70" fill="#FFF8F2" stroke="rgba(180,110,140,0.70)" strokeWidth="1.2" rx="2"/>
                      <rect x="5" y="5" width="50" height="60" fill="none" stroke="rgba(200,140,160,0.55)" strokeWidth="0.7" strokeDasharray="2.5,2" rx="1"/>
                      <path d="M30 51 C22 43,19 37,21 31.5 C23 27,27.5 26.5,30 30.5 C32.5 26.5,37 27,39 31.5 C41 37,38 43,30 51Z" fill="#C0607A" opacity="0.80"/>
                    </g>
                    <g transform="translate(26,210)">
                      <ellipse cx="0" cy="-8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55"/>
                      <ellipse cx="8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(90 8 0)"/>
                      <ellipse cx="0" cy="8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" transform="rotate(180)"/>
                      <ellipse cx="-8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(270 -8 0)"/>
                      <circle cx="0" cy="0" r="4" fill="#F0C5D5" opacity="0.75"/>
                      <circle cx="0" cy="0" r="1.8" fill="#C88090" opacity="0.60"/>
                    </g>
                    <g transform="translate(334,210)">
                      <ellipse cx="0" cy="-8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55"/>
                      <ellipse cx="8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(90 8 0)"/>
                      <ellipse cx="0" cy="8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" transform="rotate(180)"/>
                      <ellipse cx="-8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(270 -8 0)"/>
                      <circle cx="0" cy="0" r="4" fill="#F0C5D5" opacity="0.75"/>
                      <circle cx="0" cy="0" r="1.8" fill="#C88090" opacity="0.60"/>
                    </g>
                  </svg>
                </div>
                {/* Flap */}
                <div style={{position:"absolute",inset:0,perspective:"600px",transformStyle:"preserve-3d",zIndex:10}}>
                  <div style={{position:"absolute",top:0,left:0,width:"100%",height:"50%",transformOrigin:"top center",transformStyle:"preserve-3d"}}>
                    <svg viewBox="0 0 360 180" style={{width:"100%",height:"100%",display:"block",overflow:"visible"}} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="hoFlap" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#F8DDE8"/><stop offset="100%" stopColor="#EDB8CE"/></linearGradient>
                      </defs>
                      <polygon points="0,0 360,0 180,180" fill="url(#hoFlap)" stroke="rgba(140,70,100,0.45)" strokeWidth="2" strokeLinejoin="round"/>
                      <line x1="20" y1="4" x2="340" y2="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                    </svg>
                    {/* Wax seal */}
                    <div style={{position:"absolute",bottom:-36,left:"50%",width:72,height:72,marginLeft:-36,filter:"drop-shadow(0 5px 10px rgba(70,10,35,0.40))"}}>
                      <svg viewBox="0 0 72 72" style={{width:"100%",height:"100%",display:"block"}}>
                        {Array.from({length:16}).map((_,i)=>{
                          const a=(i*360)/16, r1=33, r2=36;
                          const x1=36+r1*Math.cos((a*Math.PI)/180), y1=36+r1*Math.sin((a*Math.PI)/180);
                          const x2=36+r2*Math.cos(((a-5)*Math.PI)/180), y2=36+r2*Math.sin(((a-5)*Math.PI)/180);
                          const x3=36+r2*Math.cos(((a+5)*Math.PI)/180), y3=36+r2*Math.sin(((a+5)*Math.PI)/180);
                          return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="#7A1535"/>;
                        })}
                        <circle cx="36" cy="36" r="32" fill="#8B1A40"/>
                        <circle cx="36" cy="36" r="28" fill="#9E2550"/>
                        <circle cx="36" cy="36" r="25" fill="none" stroke="#F8D8E8" strokeWidth="1" opacity="0.55"/>
                        <circle cx="36" cy="36" r="23" fill="#7A1535"/>
                        <path d="M36 50 C24 41,20 33,23 26.5 C25.5 21.5,31 21,36 26 C41 21,46.5 21.5,49 26.5 C52 33,48 41,36 50Z" fill="#FFE4EF"/>
                        <ellipse cx="30" cy="30" rx="4" ry="2.5" fill="white" opacity="0.22" transform="rotate(-25 30 30)"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PurpleMailbox;
