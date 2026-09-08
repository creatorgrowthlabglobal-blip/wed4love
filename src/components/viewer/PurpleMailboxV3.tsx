import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion";
import { sounds } from "@/lib/sounds";

type MailboxState = "idle" | "opening" | "open" | "delivered";
interface Props { className?: string; onContinue?: () => void; senderName?: string; }

/*
  BAKED-ASSET RENDERING RULES
  ───────────────────────────
  • Zero blur policy: NO <filter>, NO feGaussianBlur, NO CSS filter:blur(),
    NO box-shadow blur radius > 0 anywhere in this file.
  • Depth = contrasting solid-colour facets + 1–2 px crisp edge lines only.
  • Post = 2 flat solid rectangles (front lit / side shadow). No gradient tube.
  • Highlights = thin 1–2 px light-coloured path at top/left edges.
  • Shadows  = thin 1–2 px dark-coloured path at bottom/right edges.
  • shape-rendering + text-rendering = "geometricPrecision" hardcoded on SVG.
*/

/* ─────────────────── DEFS — gradients + paths, ZERO filter elements ─────── */
const Defs = () => (
  <defs>
    {/* Arch path for curved "YOU'VE GOT MAIL!" title */}
    <path id="mailTextArch" d="M 52 80 Q 200 24 348 80"/>

    {/* Front arch face — lightest face, viewer-facing */}
    <linearGradient id="lavFront" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%"   stopColor="#D6C8FA"/>
      <stop offset="100%" stopColor="#9280CA"/>
    </linearGradient>

    {/* Roof cap — medium brightness */}
    <linearGradient id="roofFace" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0%"   stopColor="#8A7AC4"/>
      <stop offset="100%" stopColor="#5C50A6"/>
    </linearGradient>

    {/* Right side wall — darkest face, shadow side */}
    <linearGradient id="sideWall" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#7262B2"/>
      <stop offset="100%" stopColor="#524498"/>
    </linearGradient>

    {/* Interior cavity */}
    <linearGradient id="cavity" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#1E1836"/>
      <stop offset="100%" stopColor="#06020E"/>
    </linearGradient>

    {/* Warm cavity glow when open — pure radial, NO filter */}
    <radialGradient id="warmGlow" cx="0.5" cy="0.46" r="0.52">
      <stop offset="0%"   stopColor="#FFD580" stopOpacity="0.46"/>
      <stop offset="100%" stopColor="#FFD580" stopOpacity="0"/>
    </radialGradient>

    {/* Hinge sill */}
    <linearGradient id="sillGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#9E8ECE"/>
      <stop offset="100%" stopColor="#5C4EA2"/>
    </linearGradient>

    {/* Bottom extrusion face */}
    <linearGradient id="bottomFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#6858A8"/>
      <stop offset="100%" stopColor="#4C3E92"/>
    </linearGradient>

    {/* Ground contact shadow */}
    <radialGradient id="groundAO" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stopColor="#18082C" stopOpacity="0.30"/>
      <stop offset="60%"  stopColor="#18082C" stopOpacity="0.08"/>
      <stop offset="100%" stopColor="#18082C" stopOpacity="0"/>
    </radialGradient>

    {/* Bird gradients */}
    <radialGradient id="birdBodyL" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0%"   stopColor="#FEF5E8"/>
      <stop offset="100%" stopColor="#ECD8AE"/>
    </radialGradient>
    <radialGradient id="birdBodyR" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0%"   stopColor="#FAFAF6"/>
      <stop offset="100%" stopColor="#E6E2D8"/>
    </radialGradient>
    <radialGradient id="birdWingL" cx="0.3" cy="0.3" r="0.7">
      <stop offset="0%"   stopColor="#F2E8C8"/>
      <stop offset="100%" stopColor="#DCCA98"/>
    </radialGradient>
    <radialGradient id="birdWingR" cx="0.3" cy="0.3" r="0.7">
      <stop offset="0%"   stopColor="#EEEBE4"/>
      <stop offset="100%" stopColor="#D6D2C6"/>
    </radialGradient>

    {/* Clip path */}
    <clipPath id="frontClip">
      <path d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"/>
    </clipPath>

    {/* ── ZERO <filter> elements in this file ── */}
  </defs>
);

/* ─────────────────── VINTAGE FRAME — double border + corner ornaments ─── */
const VintageFrame = () => {
  const GOLD  = "#9A7448";   // warm antique gold — contrasts lavender mailbox
  const LIGHT = "#C89C68";   // lighter gold for inner border
  const CW = 28;             // corner bracket arm length

  const corners = [
    { tx: 10, ty: 10, sx: 1,  sy: 1  },  // top-left
    { tx: 390, ty: 10, sx: -1, sy: 1  },  // top-right
    { tx: 10, ty: 500, sx: 1,  sy: -1 },  // bottom-left
    { tx: 390, ty: 500, sx: -1, sy: -1 },  // bottom-right
  ];

  return (
    <g shapeRendering="geometricPrecision" pointerEvents="none">
      {/* Outer border */}
      <rect x="10" y="10" width="380" height="490" rx="5"
        fill="none" stroke={GOLD} strokeWidth="1.5"/>
      {/* Inner border — double-line vintage effect */}
      <rect x="14" y="14" width="372" height="482" rx="3"
        fill="none" stroke={LIGHT} strokeWidth="0.75" opacity="0.55"/>

      {/* Corner L-bracket ornaments */}
      {corners.map((c, i) => (
        <g key={i} transform={`translate(${c.tx},${c.ty})`}>
          {/* L-bracket */}
          <path
            d={`M ${c.sx*CW} 0 L 0 0 L 0 ${c.sy*CW}`}
            fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="square"
          />
          {/* Diamond jewel at corner tip */}
          <path
            d={`M 0 0 L ${c.sx*5} ${c.sy*5} L 0 ${c.sy*10} L ${-c.sx*5} ${c.sy*5} Z`}
            fill={GOLD} opacity="0.72"
          />
          {/* Two small accent dots along each arm */}
          <circle cx={c.sx*14} cy="0"      r="1.6" fill={LIGHT} opacity="0.65"/>
          <circle cx="0"       cy={c.sy*14} r="1.6" fill={LIGHT} opacity="0.65"/>
        </g>
      ))}

      {/* Mid-edge diamond ornaments */}
      {[
        { x: 200, y: 10  },  // top centre
        { x: 200, y: 500 },  // bottom centre
        { x: 10,  y: 255 },  // left centre
        { x: 390, y: 255 },  // right centre
      ].map((d, i) => (
        <g key={i} transform={`translate(${d.x},${d.y})`}>
          <path d="M 0 -5 L 4 0 L 0 5 L -4 0 Z" fill={GOLD}  opacity="0.55"/>
          <path d="M 0 -3 L 2 0 L 0 3 L -2 0 Z" fill={LIGHT} opacity="0.65"/>
        </g>
      ))}

      {/* Decorative top banner area — subtle tinted rect behind title */}
      <rect x="50" y="18" width="300" height="52" rx="3"
        fill="#F8F0E4" opacity="0.55"/>
      <rect x="50" y="18" width="300" height="52" rx="3"
        fill="none" stroke={LIGHT} strokeWidth="0.75" opacity="0.4"/>
    </g>
  );
};

/* ─────────────────── CURVED TITLE — textPath arch ─────────────────── */
const ArchedTitle = ({ visible }: { visible: boolean }) => (
  <motion.g
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.35 }}
    shapeRendering="geometricPrecision"
    pointerEvents="none"
  >
    {/* Subtle shadow path drawn 1 px below — pure dark offset, no blur */}
    <text
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="13.5" fontWeight="700" letterSpacing="2"
      fill="rgba(40,24,72,0.22)"
    >
      <textPath href="#mailTextArch" startOffset="50%" textAnchor="middle">
        ✦  YOU&apos;VE GOT MAIL!  ✦
      </textPath>
    </text>
    {/* Main title */}
    <text
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="13.5" fontWeight="700" letterSpacing="2"
      fill="#4A3270"
    >
      <textPath href="#mailTextArch" startOffset="50%" textAnchor="middle">
        ✦  YOU&apos;VE GOT MAIL!  ✦
      </textPath>
    </text>
  </motion.g>
);

/* ─────────────────── GROUND SHADOW ─────────────────── */
const GroundShadow = () => (
  <motion.g
    variants={{
      idle:      { opacity:1,   scaleX:1    },
      opening:   { opacity:0.8, scaleX:1.08 },
      open:      { opacity:0.8, scaleX:1.08 },
      delivered: { opacity:1,   scaleX:1    },
    }}
    style={{ transformOrigin:"200px 420px" }}
  >
    <ellipse cx="200" cy="422" rx="164" ry="16" fill="url(#groundAO)"/>
    <ellipse cx="200" cy="420" rx="116" ry="8"  fill="#18082C" fillOpacity="0.10"/>
    <ellipse cx="200" cy="418" rx="76"  ry="4"  fill="#18082C" fillOpacity="0.14"/>
  </motion.g>
);

/* ─────────────────── POST — TWO solid-face 3-D block ─────────────────── */
const Post = () => (
  <g shapeRendering="geometricPrecision">
    {/* Front face — flat near-white, fully lit */}
    <polygon points="188,270 212,270 212,412 188,412" fill="#F6F5F2" stroke="none"/>
    {/* Right side face — flat grey-pink shadow */}
    <polygon points="212,270 225,262 225,404 212,412" fill="#C8C2BC" stroke="none"/>

    {/* Sharp corner seam between the two faces */}
    <line x1="212" y1="270" x2="212" y2="412" stroke="#A8A4A0" strokeWidth="0.75"/>
    {/* Top highlight — 1 px light line at top of front face */}
    <line x1="188" y1="270" x2="212" y2="270" stroke="#E4E0DC" strokeWidth="0.75"/>
    {/* Top edge of side face */}
    <line x1="212" y1="270" x2="225" y2="262" stroke="#B4AEAA" strokeWidth="0.75"/>
    {/* AO crush where post meets mailbox underside */}
    <ellipse cx="200" cy="271" rx="22" ry="5" fill="rgba(50,28,108,0.18)"/>
  </g>
);

/* ─────────────────── ROOF CAP ─────────────────── */
const roofShakeV: Variants = {
  idle:      { rotate:0 },
  opening:   { rotate:[0,-1.2,1.2,-0.6,0], transition:{ duration:0.45 } },
  open:      { rotate:0 },
  delivered: { rotate:0 },
};
const Roof = () => (
  <motion.g variants={roofShakeV} style={{ transformOrigin:"217px 170px" }} shapeRendering="geometricPrecision">
    {/* Solid fill */}
    <path
      d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"
      fill="url(#roofFace)" stroke="none"
    />
    {/* 1 px catch-light on the front arch edge */}
    <path
      d="M 111 170 Q 111 86 195 86 Q 279 86 279 170"
      fill="none" stroke="rgba(222,210,255,0.75)" strokeWidth="1.5" strokeLinecap="round"
    />
    {/* 1 px shadow seam — roof base meets front face */}
    <path d="M 155 152 L 280 170"
      fill="none" stroke="rgba(18,8,42,0.48)" strokeWidth="1.5" strokeLinecap="butt"/>
    {/* 0.8 px inner secondary highlight */}
    <path
      d="M 115 172 Q 115 90 195 90 Q 275 90 275 172"
      fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeLinecap="round"
    />
  </motion.g>
);

/* ─────────────────── INTERIOR ─────────────────── */
const TinyEnv = ({ x,y,r,body,flap }:{ x:number;y:number;r:number;body:string;flap:string }) => (
  <g transform={`translate(${x},${y}) rotate(${r})`} shapeRendering="geometricPrecision">
    <rect x="-26" y="-17" width="52" height="34" rx="2" fill={body} stroke="none"/>
    <path d="M -26 -17 L 0 5 L 26 -17 Z" fill={flap} stroke="none"/>
    <ellipse cx="0" cy="18" rx="20" ry="3" fill="rgba(0,0,0,0.13)"/>
  </g>
);

const Interior = ({ open }: { open:boolean }) => (
  <g clipPath="url(#frontClip)" shapeRendering="geometricPrecision">
    <rect x="100" y="80" width="200" height="200" fill="url(#cavity)"/>
    {/* Crisp dark inner rim — thick stroke, zero blur */}
    <path
      d="M 110 173 Q 110 88 195 88 Q 280 88 280 173"
      fill="none" stroke="#04010A" strokeWidth="18" strokeLinecap="round"
    />
    {/* 1.2 px rim edge highlight */}
    <path
      d="M 121 176 Q 121 99 195 99 Q 269 99 269 176"
      fill="none" stroke="rgba(112,88,172,0.38)" strokeWidth="1.2" strokeLinecap="round"
    />
    {/* Side depth lines */}
    <line x1="128" y1="177" x2="128" y2="264" stroke="rgba(52,36,90,0.30)" strokeWidth="1"/>
    <line x1="262" y1="177" x2="262" y2="264" stroke="rgba(52,36,90,0.30)" strokeWidth="1"/>
    {/* Floor line */}
    <line x1="122" y1="264" x2="268" y2="264" stroke="rgba(0,0,0,0.52)" strokeWidth="1.5"/>
    <AnimatePresence>
      {open && (
        <motion.g initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4,duration:0.5}}>
          <TinyEnv x={172} y={247} r={-13} body="#EDD8C8" flap="#E0CCA8"/>
          <TinyEnv x={218} y={245} r={9}   body="#E8D8F0" flap="#D8C8E8"/>
          <TinyEnv x={195} y={242} r={-3}  body="#F5E0E8" flap="#ECCCD8"/>
        </motion.g>
      )}
    </AnimatePresence>
    {/* Warm glow — pure radial gradient, zero filter */}
    {open && (
      <motion.g initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.9}}>
        <ellipse cx="195" cy="196" rx="72" ry="54" fill="url(#warmGlow)"/>
        <ellipse cx="195" cy="204" rx="42" ry="32" fill="url(#warmGlow)" opacity="0.5"/>
      </motion.g>
    )}
  </g>
);

/* ─────────────────── HINGE SILL ─────────────────── */
const HingeSill = () => (
  <g shapeRendering="geometricPrecision">
    <rect x="105" y="265" width="180" height="13" rx="1.5" fill="url(#sillGrad)" stroke="none"/>
    {/* Top catch-light */}
    <rect x="105" y="265" width="180" height="1.5" rx="1.5" fill="rgba(232,220,255,0.65)"/>
    {/* Bottom shadow edge */}
    <rect x="107" y="276" width="176" height="2"   rx="1"   fill="rgba(0,0,0,0.26)"/>
    {/* Centre shine */}
    <line x1="124" y1="268" x2="214" y2="268" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
  </g>
);

/* ─────────────────── SWING DOOR (foreignObject, real CSS 3-D) ─────────────── */
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
            background:"linear-gradient(148deg, #D8CCFA 0%, #C0B0EC 34%, #AFA0E0 68%, #9E90D6 100%)",
            transformOrigin:"87px 183px",
            position:"relative", overflow:"hidden", boxSizing:"border-box",
            /*
              Crisp inset rim — ALL blur values are 0 (third value in each rule).
              No box-shadow spread creates blur.
            */
            boxShadow:[
              "inset 0  2px 0 rgba(244,238,255,0.62)",
              "inset 0 -2px 0 rgba(22,10,50,0.36)",
              "inset  2px 0 0 rgba(244,238,255,0.18)",
              "inset -2px 0 0 rgba(22,10,50,0.24)",
            ].join(", "),
          }}
        >
          {/* Ambient panel — pure radial gradient, zero blur */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(ellipse at 28% 14%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 52%)",
          }}/>
          {/* Bottom-right shadow — pure radial gradient */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(ellipse at 80% 90%, rgba(18,8,48,0.20) 0%, rgba(18,8,48,0) 48%)",
          }}/>

          {/* Panel grooves */}
          <div style={{position:"absolute",top:"28%",left:"8%",right:"8%",height:1,background:"rgba(76,52,120,0.26)"}}/>
          <div style={{position:"absolute",top:"calc(28% + 1px)",left:"8%",right:"8%",height:1,background:"rgba(255,252,255,0.18)"}}/>
          <div style={{position:"absolute",top:"60%",left:"8%",right:"8%",height:1,background:"rgba(76,52,120,0.20)"}}/>

          {/* ── MAIL SLOT: solid dark inset bar, NO blur ── */}
          <div style={{
            position:"absolute", top:"37%", left:"50%", transform:"translateX(-50%)",
            width:"57%",
          }}>
            {/* Raised bezel — box-shadow with 0 blur */}
            <div style={{
              width:"100%", background:"#4C2E80", borderRadius:3, padding:"2px",
              boxShadow:"0 -1px 0 rgba(192,172,236,0.28), 0 1px 0 rgba(0,0,0,0.48), inset 0 1px 0 rgba(0,0,0,0.40)",
            }}>
              {/* Top shadow wall — near-black, sharp edge */}
              <div style={{height:5, borderRadius:"2px 2px 0 0", background:"#060010"}}/>
              {/* Main slot cavity — dark + sharp 1 px bottom highlight */}
              <div style={{height:11, background:"#0C0420", position:"relative"}}>
                {/* Idle pulse — opacity only, no translate, no blur */}
                <motion.div
                  style={{
                    position:"absolute", inset:0,
                    background:"linear-gradient(90deg,transparent 8%,rgba(148,108,230,0.07) 50%,transparent 92%)",
                  }}
                  animate={open ? {opacity:0} : {opacity:[0.25,1,0.25]}}
                  transition={{duration:2.7, repeat: open ? 0 : Infinity}}
                />
                {/* 1 px crisp catch-light at metal lip bottom */}
                <div style={{
                  position:"absolute", bottom:0, left:"5%", right:"5%",
                  height:1, background:"rgba(182,148,232,0.32)",
                }}/>
              </div>
              {/* Slot bottom face */}
              <div style={{height:2, borderRadius:"0 0 2px 2px", background:"#1C0A30"}}/>
            </div>
            {/* 1 px catch-light strip above the bezel */}
            <div style={{
              position:"absolute", top:-1, left:"10%", right:"10%",
              height:1, background:"rgba(216,200,255,0.40)", borderRadius:1,
            }}/>
          </div>

          {/* ── GOLD HANDLE — 3 explicit layered shapes, NO blur ── */}
          <div style={{
            position:"absolute", bottom:"16%", left:"50%", transform:"translateX(-50%)",
            width:"28%",
          }}>
            {/* Shadow base — dark gold, offset 2 px below + 3 px wider */}
            <div style={{
              position:"absolute", top:2, left:"-3px", right:"-3px",
              height:7, borderRadius:4, background:"#7A5000",
            }}/>
            {/* Main brass body */}
            <div style={{position:"relative", width:"100%", height:7, borderRadius:4, background:"#C49018"}}>
              {/* Pure white 1.5 px specular top line */}
              <div style={{
                position:"absolute", top:1, left:"12%", right:"12%",
                height:1.5, borderRadius:1, background:"rgba(255,255,255,0.90)",
              }}/>
            </div>
          </div>
        </motion.div>
      </div>
    </foreignObject>

    {/* Crisp arch outline drawn in SVG — fades as door opens */}
    <motion.path
      d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270"
      fill="none"
      stroke="rgba(50,30,88,0.50)" strokeWidth="1"
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration: 0.22 }}
    />
  </>
);

/* ─────────────────── BIRDS ─────────────────── */
const birdBodyVL: Variants = {
  idle:      { y:[0,-3,0], x:0, opacity:1, transition:{ duration:3.2,repeat:Infinity,ease:"easeInOut" }},
  opening:   { x:-530, y:-230, opacity:[1,1,0.8,0], rotate:-12,
               transition:{ duration:3.8, ease:[0.25,0.1,0.25,0], opacity:{duration:3.8,times:[0,0.6,0.9,1]}}},
  open:      { opacity:0 }, delivered:{ opacity:0 },
};
const birdBodyVR: Variants = {
  idle:      { y:[0,-2.5,0], x:0, opacity:1, transition:{ duration:2.6,repeat:Infinity,ease:"easeInOut",delay:0.7 }},
  opening:   { x:530, y:-220, opacity:[1,1,0.8,0], rotate:12,
               transition:{ duration:3.8, ease:[0.25,0.1,0.25,0], opacity:{duration:3.8,times:[0,0.6,0.9,1]}}},
  open:      { opacity:0 }, delivered:{ opacity:0 },
};
const wingIdleL: Variants = {
  idle:      { rotate:[-5,9,-5], transition:{ duration:2.0,repeat:Infinity,ease:"easeInOut" }},
  opening:   { rotate:[-28,24,-28], transition:{ duration:0.18,repeat:Infinity }},
  open:{ rotate:0 }, delivered:{ rotate:0 },
};
const wingIdleR: Variants = {
  idle:      { rotate:[-5,9,-5], transition:{ duration:1.7,repeat:Infinity,ease:"easeInOut",delay:0.4 }},
  opening:   { rotate:[-28,24,-28], transition:{ duration:0.18,repeat:Infinity }},
  open:{ rotate:0 }, delivered:{ rotate:0 },
};

const BirdLeft = () => (
  <g transform="translate(170,70)" shapeRendering="geometricPrecision">
    <motion.g variants={birdBodyVL} style={{transformOrigin:"0 0"}}>
      <ellipse cx="-1" cy="13" rx="13" ry="3.5" fill="rgba(78,48,136,0.13)"/>
      <path d="M 11 -1 Q 20 -7 22 -14" fill="none" stroke="rgba(208,188,148,0.44)" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="0" cy="0" rx="14" ry="9.5" fill="url(#birdBodyL)" stroke="none"/>
      <motion.path d="M 2 -2 Q 7 -9.5 13 -5.5 Q 9 1 2 1.5 Z"
        fill="url(#birdWingL)" stroke="none"
        variants={wingIdleL} style={{transformOrigin:"2px -2px",transformBox:"fill-box" as any}}/>
      <ellipse cx="-10" cy="-5.5" rx="7.5" ry="7" fill="url(#birdBodyL)" stroke="none"/>
      <path d="M -17 -5.5 L -22.5 -3.5 L -17 -2" fill="#D4A030" stroke="none"/>
      <circle cx="-11.5" cy="-7"   r="1.5" fill="#2E1A40"/>
      <circle cx="-11"   cy="-7.5" r="0.5" fill="rgba(255,255,255,0.68)"/>
      <path d="M -2 8.5 L -4 14 M 2 8.5 L 1 14"
        stroke="rgba(178,138,68,0.55)" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </motion.g>
  </g>
);

const BirdRight = () => (
  <g transform="translate(240,70)" shapeRendering="geometricPrecision">
    <motion.g variants={birdBodyVR} style={{transformOrigin:"0 0"}}>
      <ellipse cx="1" cy="13" rx="13" ry="3.5" fill="rgba(78,48,136,0.12)"/>
      <path d="M -11 -1 Q -20 -7 -22 -14" fill="none" stroke="rgba(200,194,174,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="0" cy="0" rx="14" ry="9.5" fill="url(#birdBodyR)" stroke="none"/>
      <motion.path d="M -2 -2 Q -7 -9.5 -13 -5.5 Q -9 1 -2 1.5 Z"
        fill="url(#birdWingR)" stroke="none"
        variants={wingIdleR} style={{transformOrigin:"-2px -2px",transformBox:"fill-box" as any}}/>
      <ellipse cx="10" cy="-5.5" rx="7.5" ry="7" fill="url(#birdBodyR)" stroke="none"/>
      <path d="M 17 -5.5 L 22.5 -3.5 L 17 -2" fill="#D4A030" stroke="none"/>
      <circle cx="11.5" cy="-7"   r="1.5" fill="#2E1A40"/>
      <circle cx="12"   cy="-7.5" r="0.5" fill="rgba(255,255,255,0.68)"/>
      <path d="M -2 8.5 L -4 14 M 2 8.5 L 1 14"
        stroke="rgba(178,138,68,0.50)" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </motion.g>
  </g>
);

/* ─────────────────── IDLE FLOATING ENVELOPE ─────────────────── */
const IdleEnvelope = ({ visible }: { visible:boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.g
        key="idle-env"
        initial={{ opacity:0 }}
        animate={{ opacity:1, y:[0,-5,0] }}
        exit={{ opacity:0 }}
        transition={{
          opacity: { duration:0.4 },
          y: { duration:2.4, repeat:Infinity, ease:"easeInOut" },
        }}
        transform="translate(200, 450)"
        shapeRendering="geometricPrecision"
      >
        {/* Envelope body */}
        <rect x="-22" y="-14" width="44" height="28" rx="2"
          fill="#F5C9DA" stroke="#8A68AC" strokeWidth="1.4"/>
        {/* Flap fold lines */}
        <path d="M -22 -14 L 0 4 L 22 -14"
          fill="none" stroke="#8A68AC" strokeWidth="1.2"/>
        {/* Bottom V fold */}
        <path d="M -22 14 L 0 -2 L 22 14"
          fill="none" stroke="rgba(138,104,172,0.35)" strokeWidth="0.8"/>
        {/* Heart seal */}
        <circle cx="0" cy="6" r="6"
          fill="#D8304A" stroke="#8A68AC" strokeWidth="1"/>
        <text x="0" y="10" textAnchor="middle" fontSize="7"
          fill="rgba(255,255,255,0.92)" fontFamily="serif">♥</text>
        {/* Cast shadow — solid dark ellipse, no blur */}
        <ellipse cx="0" cy="18" rx="18" ry="3" fill="rgba(60,28,100,0.18)"/>
      </motion.g>
    )}
  </AnimatePresence>
);

/* ─────────────────── RISING ENVELOPE ─────────────────── */
const RisingEnvelope = ({ show, delivered }: { show:boolean; delivered:boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        /* Y-axis translate only — no scale animation, no blur */
        initial={{ y:0, opacity:0 }}
        animate={delivered ? { y:-200, opacity:0 } : { y:-72, opacity:1 }}
        exit={{ opacity:0 }}
        transition={delivered
          ? { type:"spring", stiffness:78, damping:18 }
          : { type:"spring", stiffness:88, damping:20, delay:0.35 }}
        style={{
          position:"absolute", left:"49%", top:"36%",
          transform:"translateX(-50%)",
          width:130, height:88, zIndex:20,
          pointerEvents:"none",
        }}
      >
        {/* Body — NO box-shadow blur. Use a 1.5 px solid border instead. */}
        <div style={{
          width:130, height:88, borderRadius:5,
          background:"linear-gradient(175deg,#FBF6ED 0%,#F5C9DA 55%,#EDB6CC 100%)",
          border:"1.5px solid rgba(78,48,130,0.30)",
          /* Only offset shadow — 0 blur radius */
          boxShadow:"3px 4px 0 rgba(60,30,110,0.14)",
          position:"relative", overflow:"hidden",
          boxSizing:"border-box",
        }}>
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 130 88">
            <line x1="0"   y1="88" x2="65" y2="46" stroke="rgba(26,18,36,0.10)" strokeWidth="1.2"/>
            <line x1="130" y1="88" x2="65" y2="46" stroke="rgba(26,18,36,0.10)" strokeWidth="1.2"/>
          </svg>
          {/* Wax seal — solid, no blur */}
          <div style={{
            position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)",
            width:24, height:24, borderRadius:"50%",
            background:"#D8304A",
            border:"1px solid rgba(100,20,40,0.55)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, color:"rgba(255,255,255,0.92)",
          }}>♥</div>
        </div>
        {/* Flap */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:44,overflow:"hidden",pointerEvents:"none"}}>
          <svg viewBox="0 0 130 44" style={{width:130,height:44}}>
            <polygon points="0,0 130,0 65,44" fill="#F5C9DA" stroke="none"/>
            <line x1="0"   y1="0" x2="65" y2="44" stroke="rgba(26,18,36,0.09)" strokeWidth="1"/>
            <line x1="130" y1="0" x2="65" y2="44" stroke="rgba(26,18,36,0.09)" strokeWidth="1"/>
          </svg>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────── ROOT ─────────────────── */
const PurpleMailboxV3 = ({ className, onContinue, senderName }: Props) => {
  const [state, setState]   = useState<MailboxState>("idle");
  const [zoomed, setZoomed] = useState(false);
  const [tilt, setTilt]     = useState({ rotateX:0, rotateY:0 });
  const controls            = useAnimation();
  const containerRef        = useRef<HTMLDivElement>(null);
  const timersRef           = useRef<number[]>([]);

  useEffect(() => { controls.start(state); }, [state, controls]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const isOpen    = state === "open" || state === "delivered";
  const delivered = state === "delivered";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpen || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    setTilt({ rotateX: y * -8, rotateY: x * 10 });
  };
  const handleMouseLeave = () => setTilt({ rotateX:0, rotateY:0 });

  const handleClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => setState("open"),                          800),
      window.setTimeout(() => { setState("delivered"); setZoomed(true); }, 2500),
      window.setTimeout(() => onContinue?.(),                            3400),
    ];
  };

  return (
    <div
      className={className}
      style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        width:"100%", height:"100%",
        position:"relative", overflow:"hidden",
      }}
    >
      {/* Background — flat warm parchment, zero bokeh/blur */}
      <div style={{position:"absolute",inset:0,background:"#F5EFE6"}}/>

      {/* Perspective wrapper */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective:"1100px", perspectiveOrigin:"50% 42%" }}
      >
        <motion.div
          onClick={handleClick}
          animate={{
            rotateX: isOpen ? 0 : tilt.rotateX,
            rotateY: isOpen ? 0 : tilt.rotateY,
          }}
          transition={{ type:"spring", stiffness:180, damping:22 }}
          style={{
            cursor: isOpen ? "default" : "pointer",
            width:"min(480px,88vw)",
            aspectRatio:"1/1",
            position:"relative",
            transformStyle:"preserve-3d",
          }}
        >
          <motion.div
            animate={!isOpen ? {y:[0,-6,0]} : {y:0}}
            transition={!isOpen
              ? { duration:3.6, repeat:Infinity, ease:"easeInOut" }
              : { duration:0.4 }}
            style={{width:"100%",height:"100%",position:"relative"}}
          >
            <motion.div
              animate={delivered ? {opacity:0} : {opacity:1}}
              transition={{duration:0.5}}
              style={{width:"100%",height:"100%",willChange:"opacity"}}
            >
              {/*
                shape-rendering="geometricPrecision" + text-rendering="geometricPrecision"
                hardcoded for sub-pixel accuracy on all paths and type.
              */}
              <svg
                viewBox="0 0 400 510"
                width="100%" height="100%"
                style={{overflow:"visible"}}
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
              >
                <Defs/>

                {/* Layer 0: Vintage frame — drawn first, behind everything */}
                <VintageFrame/>

                {/* Layer 1: Curved title — fades on open */}
                <ArchedTitle visible={!isOpen}/>

                <motion.g initial="idle" animate={controls}>
                  {/* Layer 2: Ground + post */}
                  <GroundShadow/>
                  <Post/>

                  {/* Layer 3: Mailbox body — back-to-front paint order */}
                  <g shapeRendering="geometricPrecision">

                    {/* 3a. Right side wall — darkest face */}
                    <path
                      d="M 280 270 L 280 170 Q 280 85 195 85 L 200 78 Q 294 78 294 168 L 294 268 Z"
                      fill="url(#sideWall)" stroke="none"
                    />
                    {/* Top seam of side wall */}
                    <line x1="280" y1="178" x2="294" y2="174"
                      stroke="rgba(38,18,70,0.38)" strokeWidth="0.75"/>
                    {/* Rivets */}
                    <circle cx="288" cy="107" r="2.8" fill="#BAA8E0" stroke="none"/>
                    <circle cx="288" cy="107" r="1"   fill="rgba(238,232,255,0.70)"/>
                    <circle cx="289" cy="252" r="2.8" fill="#BAA8E0" stroke="none"/>
                    <circle cx="289" cy="252" r="1"   fill="rgba(238,232,255,0.70)"/>
                    <path d="M 285 265 L 285 278 L 293 275 L 293 262 Z"
                      fill="url(#sideWall)" stroke="none"/>

                    {/* 3b. Roof cap — medium face */}
                    <Roof/>

                    {/* 3c. Interior cavity — visible through arch */}
                    <Interior open={isOpen}/>

                    {/* 3d. Front arch face — lightest, facing viewer */}
                    <path
                      d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"
                      fill="url(#lavFront)" stroke="none"
                    />

                    {/*
                      3e. INSET HIGHLIGHT RING — baked 1.5 px specular rim.
                          Slightly inset path with a lighter stroke = raised border.
                    */}
                    <path
                      d="M 113 268 L 113 172 Q 113 88 195 88 Q 277 88 277 172 L 277 268"
                      fill="none"
                      stroke="rgba(236,228,255,0.60)" strokeWidth="1.5" strokeLinecap="round"
                    />

                    {/*
                      3f. FACE/SIDE CORNER SEAM — 1 px dark line at the hard
                          edge between front face and shadow side wall.
                    */}
                    <path
                      d="M 280 268 L 280 170 Q 280 86 195 86"
                      fill="none" stroke="rgba(20,8,44,0.48)" strokeWidth="1"
                    />
                    {/* 0.8 px chamfer highlight on same edge */}
                    <path
                      d="M 279 268 L 279 170 Q 279 86 195 86"
                      fill="none" stroke="rgba(202,188,255,0.28)" strokeWidth="0.8"
                    />

                    {/* 3g. Bottom extrusion face */}
                    <path
                      d="M 110 270 L 280 270 L 294 263 L 294 274 L 280 280 L 110 280 Z"
                      fill="url(#bottomFace)" stroke="none"
                    />
                    {/* Post mounting plate */}
                    <rect x="181" y="267" width="28" height="8" rx="1.5" fill="url(#sideWall)"/>
                    <circle cx="187" cy="271" r="2"   fill="#BBB0E4"/>
                    <circle cx="203" cy="271" r="2"   fill="#BBB0E4"/>
                    <circle cx="187.5" cy="270.5" r="0.7" fill="rgba(238,234,255,0.82)"/>
                    <circle cx="203.5" cy="270.5" r="0.7" fill="rgba(238,234,255,0.82)"/>
                  </g>

                  {/* Layer 4: Door (foreignObject) + sill */}
                  <SwingDoor open={isOpen}/>
                  <HingeSill/>

                  {/* Layer 5: Birds */}
                  <BirdLeft/>
                  <BirdRight/>
                </motion.g>

                {/* Layer 6: Idle floating envelope + caption (visible when closed) */}
                <IdleEnvelope visible={!isOpen}/>
                {!isOpen && (
                  <g>
                    <motion.text
                      x="200" y="478"
                      textAnchor="middle"
                      fontFamily="'Playfair Display', Georgia, serif"
                      fontSize="15" fontWeight="600" fontStyle="italic"
                      fill="#4A3268"
                      initial={{opacity:0,y:486}} animate={{opacity:1,y:478}}
                      transition={{duration:0.8}}
                    >
                      {senderName ? `A letter from ${senderName}` : "You've got a letter"}
                    </motion.text>
                    <motion.text
                      x="200" y="498"
                      textAnchor="middle"
                      fontFamily="'Inter','SF Pro Display',system-ui,sans-serif"
                      fontSize="9.5" fontWeight="500" letterSpacing="3.5"
                      fill="#9A76AE"
                      initial={{opacity:0}}
                      animate={{opacity:[0.40,1,0.40]}} transition={{duration:2.8,repeat:Infinity}}
                    >
                      TAP TO OPEN
                    </motion.text>
                  </g>
                )}
              </svg>
            </motion.div>

            <RisingEnvelope show={isOpen} delivered={delivered}/>
          </motion.div>
        </motion.div>
      </div>

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
              key="shared-env"
              initial={{scale:0.4,opacity:0}}
              animate={{scale:zoomed?1:0.4,opacity:1}}
              transition={{
                scale:{type:"spring",stiffness:100,damping:20,mass:1},
                opacity:{duration:0.35},
              }}
              style={{
                position:"absolute", inset:0,
                transformOrigin:"50% 50%", perspective:"800px", willChange:"transform",
              }}
            >
              {/* Offset shadow — 0 blur radius, pure translate */}
              <div style={{
                position:"absolute", inset:"6px 10px -8px 10px", borderRadius:6,
                background:"rgba(60,40,90,0.14)",
                /* Zero blur — offset only */
                boxShadow:"4px 6px 0 rgba(60,40,90,0.10)",
                zIndex:0,
              }}/>
              <div style={{
                position:"absolute", inset:0, borderRadius:6,
                background:"#F5C9DA",
                border:"1.5px solid rgba(78,48,130,0.25)",
                overflow:"hidden", zIndex:1,
              }}/>
              <div style={{position:"absolute",top:0,left:0,width:"100%",height:"50%",zIndex:10}}>
                <svg viewBox="0 0 360 180"
                  style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="none">
                  <polygon points="0,0 360,0 180,180" fill="#F5C9DA"/>
                  <line x1="0"   y1="0" x2="180" y2="180" stroke="rgba(26,18,36,0.09)" strokeWidth="1.5"/>
                  <line x1="360" y1="0" x2="180" y2="180" stroke="rgba(26,18,36,0.09)" strokeWidth="1.5"/>
                </svg>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurpleMailboxV3;
