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
  <motion.g
    clipPath="url(#frontClip)"
    animate={{ filter: open ? "url(#cavityBlur)" : "none" }}
    transition={{ duration:0.6, delay: open ? 0.7 : 0 }}
  >
    <rect x="100" y="80" width="200" height="200" fill="url(#cavity)"/>
    <path d="M 110 170 Q 110 90 195 90 Q 280 90 280 170"
      fill="none" stroke="#000" strokeWidth="10" opacity="0.55" strokeLinecap="round"/>
    <path d="M 122 170 L 122 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35"/>
    <path d="M 268 170 L 268 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35"/>
    <line x1="115" y1="262" x2="275" y2="262" stroke="#000" strokeWidth="1.5" opacity="0.7"/>
    <ellipse cx="195" cy="155" rx="60" ry="22" fill="#fff" opacity="0.04"/>
  </motion.g>
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

/* ───────────────────── Swing door (foreignObject CSS 3D) ───────────────────── */
const SwingDoor = ({ open }: { open:boolean }) => (
  <>
    <foreignObject x="108" y="83" width="174" height="185" style={{overflow:"visible"}}>
      <div
        // @ts-expect-error xmlns required inside SVG foreignObject
        xmlns="http://www.w3.org/1999/xhtml"
        style={{ width:"174px", height:"185px", perspective:"900px", perspectiveOrigin:"87px 183px" }}
      >
        <motion.div
          animate={{ rotateX: open ? -92 : 0 }}
          transition={{ type:"spring", stiffness:60, damping:14, mass:1.1 }}
          style={{
            width:"174px", height:"185px",
            clipPath:"path('M 2 183 L 2 87 Q 2 2 87 2 Q 172 2 172 87 L 172 183 Z')",
            /* Replicates Template 2's lavMetal SVG gradient in CSS */
            background:"linear-gradient(90deg, #A99BD8 0%, #D4C8F2 22%, #BDAEE7 50%, #D8CCF4 78%, #9C8DCC 100%)",
            transformOrigin:"87px 183px",
            position:"relative",
            overflow:"hidden",
            boxSizing:"border-box",
          }}
        >
          {/* Shine overlay — matches Template 2's lavRoofShine pattern */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:"linear-gradient(180deg, rgba(239,231,255,0.65) 0%, rgba(239,231,255,0) 52%)",
          }}/>
          {/* Inner bevel highlight line */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            boxShadow:"inset 0 2px 0 rgba(242,235,255,0.72), inset 0 -2px 0 rgba(0,0,0,0.22)",
          }}/>

          {/* ── Mail slot — sharp inset, no glow ── */}
          <div style={{
            position:"absolute", top:"37%", left:"50%", transform:"translateX(-50%)",
            width:"57%",
          }}>
            <div style={{
              width:"100%", background:"#3a243a", borderRadius:3, padding:"2px",
              boxShadow:"0 -1px 0 rgba(200,180,240,0.28), 0 1px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,0,0,0.4)",
            }}>
              <div style={{height:5, borderRadius:"2px 2px 0 0", background:"#080210"}}/>
              <div style={{height:11, background:"#0e0620", position:"relative"}}>
                {/* Idle ambient pulse */}
                <motion.div
                  style={{
                    position:"absolute", inset:0,
                    background:"linear-gradient(90deg, transparent 8%, rgba(150,100,240,0.08) 50%, transparent 92%)",
                  }}
                  animate={open ? {opacity:0} : {opacity:[0.3,1,0.3]}}
                  transition={{duration:2.4, repeat: open ? 0 : Infinity}}
                />
                {/* 1 px light catch on metal lip */}
                <div style={{
                  position:"absolute", bottom:0, left:"5%", right:"5%",
                  height:1, background:"rgba(200,160,240,0.30)",
                }}/>
              </div>
              <div style={{height:2, borderRadius:"0 0 2px 2px", background:"#1e1040"}}/>
            </div>
          </div>

          {/* ── Brass handle ── */}
          <div style={{
            position:"absolute", bottom:"16%", left:"50%", transform:"translateX(-50%)",
            width:"28%",
          }}>
            <div style={{position:"absolute", top:2, left:"-3px", right:"-3px", height:7, borderRadius:4, background:"#7A5000"}}/>
            <div style={{position:"relative", width:"100%", height:7, borderRadius:4, background:"#C49018"}}>
              <div style={{position:"absolute", top:1, left:"12%", right:"12%", height:1.5, borderRadius:1, background:"rgba(255,255,255,0.88)"}}/>
            </div>
          </div>
        </motion.div>
      </div>
    </foreignObject>

    {/* Black arch outline — matches Template 2's stroke style.
        Fades out as door swings open so the opening feels clean. */}
    <motion.path
      d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270"
      fill="none" stroke={STROKE} strokeWidth="3" strokeLinejoin="round"
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration:0.25 }}
    />
    {/* Inner highlight ring (from original FrontFaceOverlay) */}
    <motion.path
      d="M 113 268 L 113 170 Q 113 88 195 88 Q 277 88 277 170 L 277 268"
      fill="none" stroke="#F2EBFF" strokeWidth="1.2" opacity="0.85"
      animate={{ opacity: open ? 0 : 0.85 }}
      transition={{ duration:0.25 }}
    />
  </>
);

/* ───────────────────── Rising envelope (Template 2 style) ───────────────────── */
const RisingEnvelope = ({ show, delivered }: { show:boolean; delivered:boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{y:30, opacity:0, scale:0.85}}
        animate={delivered ? {y:-220, opacity:0, scale:1.1} : {y:-70, opacity:1, scale:1}}
        exit={{opacity:0}}
        transition={delivered
          ? {type:"spring",stiffness:75,damping:16}
          : {type:"spring",stiffness:90,damping:20,delay:0.35}}
        style={{
          position:"absolute", left:"49%", top:"36%",
          transform:"translateX(-50%)",
          width:130, height:88, zIndex:20,
          pointerEvents:"none",
        }}
      >
        {/* Body — Template 2 style: pink with black outline */}
        <div style={{
          width:130, height:88, borderRadius:5,
          background:"linear-gradient(175deg, #FBF6ED 0%, #F5C9DA 55%, #EDB6CC 100%)",
          border:"2.5px solid #1a1a1a",
          boxShadow:"0 10px 26px rgba(0,0,0,0.24)",
          position:"relative", overflow:"hidden",
          boxSizing:"border-box",
        }}>
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 130 88">
            <line x1="0"   y1="88" x2="65" y2="46" stroke="rgba(26,18,36,0.14)" strokeWidth="1.2"/>
            <line x1="130" y1="88" x2="65" y2="46" stroke="rgba(26,18,36,0.14)" strokeWidth="1.2"/>
          </svg>
          {/* Wax seal */}
          <div style={{
            position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)",
            width:26, height:26, borderRadius:"50%",
            background:"radial-gradient(circle at 35% 30%, #FF8FA0, #D8304A, #7A1020)",
            border:"1.5px solid #1a1a1a",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, color:"rgba(255,255,255,0.92)",
          }}>♥</div>
        </div>
        {/* Flap */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:46,overflow:"hidden",pointerEvents:"none"}}>
          <svg viewBox="0 0 130 44" style={{width:130,height:44}}>
            <polygon points="0,0 130,0 65,44"
              fill="#F5C9DA" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round"/>
          </svg>
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

  const handleClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => setState("open"),                         800),
      window.setTimeout(() => { setState("delivered"); setZoomed(true); }, 2500),
      window.setTimeout(() => onContinue?.(),                           3400),
    ];
  };

  return (
    <div
      className={className}
      style={{ display:"flex", alignItems:"center", justifyContent:"center" }}
    >
      <motion.div
        onClick={handleClick}
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
          perspective:"1200px",
          transformStyle:"preserve-3d",
        }}
      >
        {/* SVG fades out as the zoomed envelope takes over */}
        <motion.div
          animate={delivered ? {opacity:0} : {opacity:1}}
          transition={{duration:0.6, ease:"easeOut"}}
          style={{width:"100%",height:"100%",willChange:"opacity"}}
        >
          <svg viewBox="0 0 400 495" width="100%" height="100%"
            style={{overflow:"visible", transformStyle:"preserve-3d"}}>
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
                <Interior open={isOpen}/>
              </g>

              {/* Door and sill sit OUTSIDE the body shadow filter
                  so the foreignObject CSS 3D transforms work correctly */}
              <SwingDoor open={isOpen}/>
              <HingeSill/>
            </motion.g>

            {/* Birds rendered on top of everything */}
            <motion.g initial="idle" animate={controls}>
              <BirdLeft/>
              <BirdRight/>
            </motion.g>

            {!isOpen && <Caption senderName={senderName}/>}
          </svg>
        </motion.div>

        {/* Rising envelope — appears from cavity once door is open */}
        <RisingEnvelope show={isOpen} delivered={delivered}/>

        {/* Full-screen handoff envelope */}
        <AnimatePresence>
          {delivered && (
            <div style={{
              position:"fixed", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:"min(360px,90vw)", aspectRatio:"360/240",
              pointerEvents:"none", zIndex:60,
            }}>
              <motion.div
                key="shared-envelope"
                initial={{scale:0.4,opacity:0}}
                animate={{scale:zoomed?1:0.4,opacity:1}}
                transition={{
                  scale:{type:"spring",stiffness:100,damping:20,mass:1},
                  opacity:{duration:0.35,ease:"easeOut"},
                }}
                style={{
                  position:"absolute", inset:0,
                  transformOrigin:"50% 50%",
                  perspective:"800px",
                  willChange:"transform",
                }}
              >
                <div style={{
                  position:"absolute", inset:"8px 12px -12px 12px", borderRadius:6,
                  background:"rgba(120,110,90,0.18)",
                  boxShadow:"0 22px 34px rgba(120,110,90,0.22)",
                  zIndex:0,
                }}/>
                <div style={{
                  position:"absolute", inset:0, borderRadius:6,
                  background:"#F5C9DA",
                  border:"2.5px solid #1a1a1a",
                  overflow:"hidden", zIndex:1,
                }}/>
                <div style={{
                  position:"absolute", top:0, left:0, width:"100%", height:"50%",
                  zIndex:10, transformOrigin:"top center",
                }}>
                  <svg viewBox="0 0 360 180"
                    style={{width:"100%",height:"100%",display:"block",overflow:"visible"}}
                    preserveAspectRatio="none">
                    <polygon points="0,0 360,0 180,180"
                      fill="#F5C9DA" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round"/>
                  </svg>
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
