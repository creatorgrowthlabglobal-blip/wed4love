import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion";
import { sounds } from "@/lib/sounds";

/* Premium photorealistic lavender mailbox — PBR-inspired SVG lighting.
   Colors preserved: lavender body (#BDAEE7 family), white post, pink-cream bg. */

type MailboxState = "idle" | "opening" | "open" | "delivered";
interface Props { className?: string; onContinue?: () => void; senderName?: string; }
const S = "#1a1a1a"; // base stroke

/* ─────────────────────── DEFS ─────────────────────── */
const Defs = () => (
  <defs>
    {/* ── Brushed satin metal — fine horizontal scratches ── */}
    <filter id="v4brushed" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.7 0.012" numOctaves="3" seed="9" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="gray"/>
      <feColorMatrix in="gray" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.14 0" result="tinted"/>
      <feComposite in="tinted" in2="SourceGraphic" operator="in"/>
    </filter>

    {/* ── Wood grain for post ── */}
    <filter id="v4wood" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.04 0.9" numOctaves="2" seed="3" result="grain"/>
      <feColorMatrix in="grain" values="0 0 0 0 0.97  0 0 0 0 0.96  0 0 0 0 0.94  0 0 0 0.1 0" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="in"/>
    </filter>

    {/* ── Soft drop shadow for full mailbox ── */}
    <filter id="v4shadow" x="-25%" y="-15%" width="150%" height="145%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b"/>
      <feOffset dx="5" dy="10" result="off"/>
      <feComponentTransfer in="off" result="s"><feFuncA type="linear" slope="0.28"/></feComponentTransfer>
      <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    {/* ── Contact shadow (AO) — downward only ── */}
    <filter id="v4contact" x="-60%" y="-10%" width="220%" height="300%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/>
      <feOffset dx="0" dy="4"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
    </filter>

    {/* ── Soft glow / specular bloom ── */}
    <filter id="v4bloom" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    {/* ── Warm interior glow ── */}
    <filter id="v4warmBloom" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>

    {/* ── AO corner darkening ── */}
    <filter id="v4ao" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/>
      <feComposite in="b" in2="SourceAlpha" operator="in" result="ao"/>
      <feComponentTransfer in="ao"><feFuncA type="linear" slope="0.6"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    {/* ════ BODY GRADIENTS — light from top-left ════ */}
    {/* Base lavender body — directional light top-left to bottom-right */}
    <linearGradient id="v4lavBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stopColor="#DDD0FA"/>
      <stop offset="18%"  stopColor="#CAB8F0"/>
      <stop offset="45%"  stopColor="#BDAEE7"/>
      <stop offset="72%"  stopColor="#A898D8"/>
      <stop offset="100%" stopColor="#8E7EC8"/>
    </linearGradient>

    {/* Right side wall — less lit, deeper shadow */}
    <linearGradient id="v4lavSide" x1="0" y1="0" x2="1" y2="0.15">
      <stop offset="0%"   stopColor="#7E6FB3"/>
      <stop offset="30%"  stopColor="#9080C4"/>
      <stop offset="65%"  stopColor="#8070B8"/>
      <stop offset="100%" stopColor="#6A5CA8"/>
    </linearGradient>

    {/* Top ambient light overlay — soft white bloom from top-left */}
    <radialGradient id="v4topLight" cx="0.18" cy="0.08" r="0.75">
      <stop offset="0%"   stopColor="#fff" stopOpacity="0.26"/>
      <stop offset="60%"  stopColor="#fff" stopOpacity="0.06"/>
      <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
    </radialGradient>

    {/* Bottom-right shadow overlay */}
    <radialGradient id="v4bottomShadow" cx="0.88" cy="0.92" r="0.65">
      <stop offset="0%"   stopColor="#1a1028" stopOpacity="0.32"/>
      <stop offset="100%" stopColor="#1a1028" stopOpacity="0"/>
    </radialGradient>

    {/* Specular highlight — sharp bright line along top arch edge */}
    <linearGradient id="v4specEdge" x1="0.15" y1="0" x2="0.85" y2="0">
      <stop offset="0%"   stopColor="#fff" stopOpacity="0"/>
      <stop offset="25%"  stopColor="#fff" stopOpacity="0.7"/>
      <stop offset="50%"  stopColor="#fff" stopOpacity="0.95"/>
      <stop offset="75%"  stopColor="#fff" stopOpacity="0.55"/>
      <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
    </linearGradient>

    {/* Roof gradient — lit on the left overhang */}
    <linearGradient id="v4roofGrad" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%"   stopColor="#8878C8"/>
      <stop offset="30%"  stopColor="#9E8ED8"/>
      <stop offset="60%"  stopColor="#8878C0"/>
      <stop offset="100%" stopColor="#7060B0"/>
    </linearGradient>

    {/* Post — bright white with subtle warm shadow edge */}
    <linearGradient id="v4postGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#F8F6F2"/>
      <stop offset="35%"  stopColor="#FEFEFE"/>
      <stop offset="65%"  stopColor="#F5F3F0"/>
      <stop offset="100%" stopColor="#E8E5E0"/>
    </linearGradient>
    <linearGradient id="v4postSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#D8D5D0"/>
      <stop offset="100%" stopColor="#C4C0BA"/>
    </linearGradient>

    {/* Brass nameplate */}
    <linearGradient id="v4brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stopColor="#F0D870"/>
      <stop offset="20%"  stopColor="#E8C84A"/>
      <stop offset="45%"  stopColor="#F5DC7A"/>
      <stop offset="65%"  stopColor="#C8A030"/>
      <stop offset="85%"  stopColor="#E4C050"/>
      <stop offset="100%" stopColor="#D0A828"/>
    </linearGradient>
    <linearGradient id="v4brassEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#FFE990" stopOpacity="0.8"/>
      <stop offset="100%" stopColor="#FFE990" stopOpacity="0"/>
    </linearGradient>

    {/* Interior cavity */}
    <radialGradient id="v4cavity" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0%"   stopColor="#2e2345"/>
      <stop offset="55%"  stopColor="#1a1224"/>
      <stop offset="100%" stopColor="#0a0610"/>
    </radialGradient>

    {/* Warm cavity glow */}
    <radialGradient id="v4warmGlow" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0%"   stopColor="#FFD580" stopOpacity="0.7"/>
      <stop offset="100%" stopColor="#FFD580" stopOpacity="0"/>
    </radialGradient>

    {/* Arch inner wall reveal */}
    <linearGradient id="v4archWall" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#1e1230" stopOpacity="0.58"/>
      <stop offset="50%"  stopColor="#160c24" stopOpacity="0.48"/>
      <stop offset="100%" stopColor="#1e1230" stopOpacity="0.58"/>
    </linearGradient>

    {/* Bottom face */}
    <linearGradient id="v4bottomFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#7060B0"/>
      <stop offset="100%" stopColor="#5248A0"/>
    </linearGradient>

    {/* Door face gradient — matches body with slightly different angle */}
    <linearGradient id="v4doorGrad" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%"   stopColor="#D4C8F4"/>
      <stop offset="30%"  stopColor="#C0B0EC"/>
      <stop offset="60%"  stopColor="#B0A0E0"/>
      <stop offset="100%" stopColor="#9888D0"/>
    </linearGradient>

    {/* Hinge sill */}
    <linearGradient id="v4sill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#9080C8"/>
      <stop offset="100%" stopColor="#6858A8"/>
    </linearGradient>

    {/* ── Clip paths ── */}
    <clipPath id="v4frontClip">
      <path d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z"/>
    </clipPath>
    <clipPath id="v4roofClip">
      <path d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"/>
    </clipPath>
  </defs>
);

/* ─────────────────────── GROUND SHADOW ─────────────────────── */
const GroundShadow = () => (
  <motion.g
    variants={{ idle:{opacity:1,scale:1}, opening:{opacity:0.9,scale:1.08}, open:{opacity:0.9,scale:1.08}, delivered:{opacity:1,scale:1} }}
    style={{ transformOrigin:"200px 418px" }}
  >
    {/* Soft outer halo */}
    <ellipse cx="200" cy="420" rx="165" ry="18" fill="#000" opacity="0.10" style={{ filter:"blur(8px)" }}/>
    {/* Mid shadow */}
    <ellipse cx="200" cy="418" rx="140" ry="13" fill="#000" opacity="0.16"/>
    {/* Sharp contact shadow center */}
    <ellipse cx="200" cy="416" rx="100" ry="6"  fill="#000" opacity="0.24"/>
  </motion.g>
);

/* ─────────────────────── POST (textured white) ─────────────────────── */
const Post = () => (
  <motion.g variants={{ idle:{y:0}, opening:{y:0}, open:{y:0}, delivered:{y:0} }}>
    {/* Main shaft — white with subtle gradient */}
    <polygon points="188,270 212,270 212,412 188,412"
      fill="url(#v4postGrad)" stroke={S} strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Wood/concrete grain overlay */}
    <polygon points="188,270 212,270 212,412 188,412"
      fill="#fff" filter="url(#v4wood)" opacity="0.6"/>
    {/* Right side face */}
    <polygon points="212,270 224,262 224,404 212,412"
      fill="url(#v4postSide)" stroke={S} strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Top cap where post meets mailbox — AO shadow */}
    <ellipse cx="200" cy="270" rx="18" ry="5" fill="#000" opacity="0.22" style={{filter:"blur(3px)"}}/>
    {/* Vertical highlight stripe */}
    <line x1="194" y1="272" x2="194" y2="410" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
    {/* Edge shadow on left */}
    <line x1="188" y1="272" x2="188" y2="410" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2"/>
  </motion.g>
);

/* ─────────────────────── ROOF ─────────────────────── */
const Roof = () => (
  <motion.g
    variants={{ idle:{rotate:0}, opening:{rotate:[0,-1.5,1.5,0]}, open:{rotate:0}, delivered:{rotate:0} }}
    transition={{ duration:0.5 }}
    style={{ transformOrigin:"217px 170px" }}
  >
    {/* Base shape */}
    <path
      d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"
      fill="url(#v4roofGrad)" stroke={S} strokeWidth="2.6" strokeLinejoin="round"
    />
    {/* Brushed metal overlay */}
    <g clipPath="url(#v4roofClip)" opacity="0.5">
      <rect x="100" y="60" width="250" height="220" fill="#fff" filter="url(#v4brushed)"/>
    </g>
    {/* Top-left light bloom on roof */}
    <path
      d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"
      fill="url(#v4topLight)"
    />
    {/* Specular ridge along the front arch top — the brightest specular line */}
    <path
      d="M 128 152 Q 128 88 195 88 Q 262 88 262 152"
      fill="none" stroke="url(#v4specEdge)" strokeWidth="2.8" strokeLinecap="round"
      filter="url(#v4bloom)"
    />
    {/* Secondary softer highlight just inside */}
    <path
      d="M 125 152 Q 125 85 195 85 Q 265 85 265 152"
      fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"
    />
    {/* AO shadow at roof-to-body junction */}
    <path
      d="M 155 152 L 280 170"
      fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="4" strokeLinecap="round"
    />
  </motion.g>
);

/* ─────────────────────── INTERIOR ─────────────────────── */
const TinyEnvelope = ({ x, y, rotate, body, flap }: { x:number; y:number; rotate:number; body:string; flap:string }) => (
  <g transform={`translate(${x},${y}) rotate(${rotate})`}>
    <rect x="-27" y="-18" width="54" height="36" rx="2" fill={body} stroke={S} strokeWidth="1.4"/>
    <path d="M -27 -18 L 0 6 L 27 -18 Z" fill={flap} stroke={S} strokeWidth="1.4" strokeLinejoin="round"/>
    {/* Contact shadow under each envelope */}
    <ellipse cx="0" cy="19" rx="22" ry="3" fill="#000" opacity="0.18" style={{filter:"blur(2px)"}}/>
  </g>
);

const Interior = ({ open }: { open: boolean }) => (
  <g clipPath="url(#v4frontClip)">
    <rect x="100" y="80" width="200" height="200" fill="url(#v4cavity)"/>
    {/* Inner arch shadow rim */}
    <path d="M 110 170 Q 110 90 195 90 Q 280 90 280 170" fill="none" stroke="#000" strokeWidth="12" opacity="0.5" strokeLinecap="round"/>
    {/* Side wall depth lines */}
    <path d="M 122 170 L 122 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35"/>
    <path d="M 268 170 L 268 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35"/>
    {/* Floor line */}
    <line x1="115" y1="262" x2="275" y2="262" stroke="#000" strokeWidth="1.5" opacity="0.65"/>
    {/* Stacked letters */}
    <AnimatePresence>
      {open && (
        <motion.g initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35,duration:0.5}}>
          <TinyEnvelope x={172} y={247} rotate={-12} body="#EDD8C8" flap="#E2CCBA"/>
          <TinyEnvelope x={218} y={245} rotate={9}   body="#E8D8F0" flap="#DCCCEC"/>
          <TinyEnvelope x={195} y={243} rotate={-3}  body="#F5E0E8" flap="#EDD0DC"/>
        </motion.g>
      )}
    </AnimatePresence>
    {/* Warm golden glow when door opens */}
    {open && (
      <motion.g initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.7}}>
        {/* Soft blur bloom behind */}
        <ellipse cx="195" cy="190" rx="70" ry="55" fill="url(#v4warmGlow)" filter="url(#v4warmBloom)" opacity="0.6"/>
        {/* Sharper inner glow */}
        <ellipse cx="195" cy="200" rx="45" ry="35" fill="url(#v4warmGlow)" opacity="0.55"/>
      </motion.g>
    )}
  </g>
);

/* ─────────────────────── HINGE SILL ─────────────────────── */
const HingeSill = () => (
  <g>
    <rect x="105" y="265" width="180" height="14" rx="1" fill="url(#v4sill)" stroke={S} strokeWidth="2.5"/>
    {/* Top highlight on sill */}
    <rect x="105" y="265" width="180" height="2.5" fill="#EAE0FA" opacity="0.75"/>
    {/* AO shadow under sill */}
    <rect x="107" y="278" width="176" height="2" fill="#000" opacity="0.3"/>
  </g>
);

/* ─────────────────────── BRASS NAMEPLATE ─────────────────────── */
const BrassPlate = () => (
  <g>
    {/* Plate shadow */}
    <rect x="143" y="242" width="106" height="24" rx="3" fill="#000" opacity="0.28" style={{filter:"blur(3px)"}}/>
    {/* Plate base */}
    <rect x="140" y="238" width="110" height="24" rx="3" fill="url(#v4brass)" stroke="#9A7010" strokeWidth="1.5"/>
    {/* Top shine on plate */}
    <rect x="140" y="238" width="110" height="10" rx="3" fill="url(#v4brassEdge)"/>
    {/* Engraved border */}
    <rect x="143" y="241" width="104" height="18" rx="2" fill="none" stroke="#7A5808" strokeWidth="0.8" opacity="0.6"/>
    {/* Engraved text */}
    <text x="195" y="254" textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="8.5" fontWeight="700" letterSpacing="2"
      fill="#5A3800" opacity="0.85"
    >PO BOX 773</text>
    {/* Text highlight (engraving catch-light) */}
    <text x="195" y="253.5" textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="8.5" fontWeight="700" letterSpacing="2"
      fill="#FFE0A0" opacity="0.35"
    >PO BOX 773</text>
  </g>
);

/* ─────────────────────── SWING DOOR (foreignObject) ─────────────────────── */
const SwingDoor = ({ open }: { open: boolean }) => (
  <foreignObject x="108" y="83" width="174" height="185" style={{ overflow:"visible" }}>
    <div
      // @ts-expect-error xmlns required for foreignObject HTML
      xmlns="http://www.w3.org/1999/xhtml"
      style={{ width:"174px", height:"185px", perspective:"900px", perspectiveOrigin:"87px 183px" }}
    >
      <motion.div
        animate={{ rotateX: open ? -92 : 0 }}
        transition={{ type:"spring", stiffness:60, damping:14, mass:1.1 }}
        style={{
          width:"174px", height:"185px",
          clipPath:"path('M 2 183 L 2 87 Q 2 2 87 2 Q 172 2 172 87 L 172 183 Z')",
          background:"linear-gradient(145deg, #D4C8F4 0%, #C0B0EC 28%, #BDAEE7 55%, #A898D8 80%, #9888D0 100%)",
          border:"2.5px solid #1a1a1a",
          transformOrigin:"87px 183px",
          position:"relative",
          overflow:"hidden",
          boxSizing:"border-box",
        }}
      >
        {/* Brushed metal grain */}
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 4px)",
          pointerEvents:"none"
        }}/>
        {/* Top-left light bloom */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 20% 12%, rgba(255,255,255,0.28) 0%, transparent 65%)",
          pointerEvents:"none"
        }}/>
        {/* Top shine band */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"36%",
          background:"linear-gradient(180deg, rgba(239,231,255,0.62), transparent)",
          pointerEvents:"none"
        }}/>
        {/* Bottom-right shadow */}
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 85% 90%, rgba(20,12,40,0.28) 0%, transparent 60%)",
          pointerEvents:"none"
        }}/>
        {/* Inner bevel ring */}
        <div style={{ position:"absolute", inset:5,
          border:"1px solid rgba(242,235,255,0.65)",
          clipPath:"path('M 1 175 L 1 82 Q 1 1 82 1 Q 163 1 163 82 L 163 175 Z')",
          pointerEvents:"none"
        }}/>
        {/* Panel construction lines */}
        <div style={{ position:"absolute", top:"27%", left:"8%", right:"8%", height:"1px", background:"rgba(242,235,255,0.28)", pointerEvents:"none"}}/>
        <div style={{ position:"absolute", top:"60%", left:"8%", right:"8%", height:"1px", background:"rgba(242,235,255,0.2)", pointerEvents:"none"}}/>
        {/* Corner rivets */}
        {[{t:10,l:12},{t:10,r:12},{b:18,l:12},{b:18,r:12}].map((pos,i)=>(
          <div key={i} style={{
            position:"absolute", ...pos as any,
            width:6, height:6, borderRadius:"50%",
            background:"radial-gradient(circle at 35% 35%, #E0D0FF, #A898D0)",
            border:"1px solid rgba(26,26,26,0.55)",
          }}/>
        ))}
        {/* Mail slot — deep 3D recess */}
        <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translateX(-50%)",
          width:"55%", height:13, borderRadius:3,
          background:"linear-gradient(180deg, #0a0610 0%, #1a1224 100%)",
          boxShadow:"inset 0 3px 6px rgba(0,0,0,0.95), inset 0 -1px 2px rgba(80,60,140,0.3), 0 2px 4px rgba(0,0,0,0.4)",
          border:"1.5px solid rgba(10,6,20,0.9)"
        }}>
          {/* Slot inner glow */}
          <motion.div
            style={{ position:"absolute", inset:"2px", borderRadius:2,
              background:"linear-gradient(90deg, transparent 5%, rgba(255,210,120,0.2) 50%, transparent 95%)"
            }}
            animate={open ? {opacity:0} : {opacity:[0.3,0.95,0.3]}}
            transition={{ duration:2.4, repeat: open ? 0 : Infinity }}
          />
          {/* Slot depth shadow top */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4,
            background:"rgba(0,0,0,0.7)", borderRadius:"3px 3px 0 0"
          }}/>
        </div>
        {/* Brass handle */}
        <div style={{ position:"absolute", bottom:"15%", left:"50%", transform:"translateX(-50%)",
          width:"24%", height:7, borderRadius:4,
          background:"linear-gradient(90deg, #C0900A, #F0D260, #D4AA20, #FFEC80, #C0900A)",
          boxShadow:"0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,240,180,0.6)",
          border:"1px solid rgba(120,80,0,0.5)"
        }}/>
      </motion.div>
    </div>
  </foreignObject>
);

/* ─────────────────────── BIRDS (dimensional) ─────────────────────── */
const birdBodyV: (dir: 1|-1) => Variants = (dir) => ({
  idle:      { y:[0,-2.5,0], x:0, opacity:1, transition:{ duration:2.8, repeat:Infinity, ease:"easeInOut" }},
  opening:   { x:dir*520, y:-220, opacity:[1,1,1,0], rotate:dir*10, transition:{ duration:4.5, ease:"easeOut", opacity:{duration:4.5,times:[0,0.7,0.9,1]}}},
  open:      { opacity:0 },
  delivered: { opacity:0 },
});
const wingV: Variants = {
  idle:      { rotate:[-6,10,-6], transition:{ duration:1.8, repeat:Infinity, ease:"easeInOut" }},
  opening:   { rotate:[-32,28,-32], transition:{ duration:0.2, repeat:Infinity }},
  open:      { rotate:0 },
  delivered: { rotate:0 },
};

const BirdLeft = () => (
  <g transform="translate(170,70)">
    <motion.g variants={birdBodyV(-1)} style={{transformOrigin:"0 0"}}>
      {/* Contact shadow */}
      <ellipse cx="-2" cy="12" rx="14" ry="4" fill="#000" opacity="0.14" style={{filter:"blur(2px)"}}/>
      {/* Body — gradient fill, no flat fill */}
      <ellipse cx="0" cy="0" rx="14" ry="10"
        fill="none" stroke="none"/>
      <ellipse cx="0" cy="0" rx="14" ry="10"
        fill="#F8EDD6" stroke="rgba(26,26,26,0.55)" strokeWidth="1.2"/>
      {/* Body shading */}
      <ellipse cx="2" cy="2" rx="10" ry="7"
        fill="radial-gradient(circle, transparent 40%, rgba(180,140,80,0.18) 100%)" opacity="0.5"/>
      <path d="M 12 -2 Q 20 -8 22 -14" fill="none" stroke="rgba(26,26,26,0.5)" strokeWidth="1.3"/>
      <path d="M -2 9 L -4 14 M 2 9 L 1 14" stroke="rgba(26,26,26,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
      {/* Head */}
      <circle cx="-10" cy="-6" r="7.5" fill="#F8EDD6" stroke="rgba(26,26,26,0.55)" strokeWidth="1.2"/>
      {/* Head shading */}
      <circle cx="-8" cy="-4" r="5" fill="rgba(200,160,100,0.1)"/>
      <polygon points="-17,-6 -22,-4 -17,-2" fill="#E8A830" stroke="rgba(26,26,26,0.5)" strokeWidth="0.9"/>
      <circle cx="-12" cy="-7.5" r="1.5" fill={S}/>
      <circle cx="-11.5" cy="-8" r="0.5" fill="rgba(255,255,255,0.6)"/>
      {/* Wing — gradient */}
      <motion.path d="M 1 -3 Q 6 -10 12 -6 Q 8 0 1 1 Z"
        fill="#ECD8A8" stroke="rgba(26,26,26,0.5)" strokeWidth="1" strokeLinejoin="round"
        variants={wingV} style={{transformOrigin:"1px -3px", transformBox:"fill-box" as any}}/>
    </motion.g>
  </g>
);

const BirdRight = () => (
  <g transform="translate(240,70)">
    <motion.g variants={birdBodyV(1)} style={{transformOrigin:"0 0"}}>
      <ellipse cx="2" cy="12" rx="14" ry="4" fill="#000" opacity="0.14" style={{filter:"blur(2px)"}}/>
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FAFAF5" stroke="rgba(26,26,26,0.5)" strokeWidth="1.2"/>
      <path d="M -12 -2 Q -20 -8 -22 -14" fill="none" stroke="rgba(26,26,26,0.5)" strokeWidth="1.3"/>
      <path d="M -2 9 L -4 14 M 2 9 L 1 14" stroke="rgba(26,26,26,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="10" cy="-6" r="7.5" fill="#FAFAF5" stroke="rgba(26,26,26,0.5)" strokeWidth="1.2"/>
      <circle cx="8" cy="-4" r="5" fill="rgba(220,210,180,0.1)"/>
      <polygon points="17,-6 22,-4 17,-2" fill="#E8A830" stroke="rgba(26,26,26,0.5)" strokeWidth="0.9"/>
      <circle cx="12" cy="-7.5" r="1.5" fill={S}/>
      <circle cx="12.5" cy="-8" r="0.5" fill="rgba(255,255,255,0.6)"/>
      <motion.path d="M -1 -3 Q -6 -10 -12 -6 Q -8 0 -1 1 Z"
        fill="#ECEAE0" stroke="rgba(26,26,26,0.5)" strokeWidth="1" strokeLinejoin="round"
        variants={wingV} style={{transformOrigin:"-1px -3px", transformBox:"fill-box" as any}}/>
    </motion.g>
  </g>
);

/* ─────────────────────── CAPTION ─────────────────────── */
const Caption = ({ senderName }: { senderName?: string }) => (
  <g>
    <motion.text x="200" y="452" textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="17" fontWeight="600" fontStyle="italic" fill="#3d2d5c"
      initial={{opacity:0,y:462}} animate={{opacity:1,y:452}} transition={{duration:0.8}}
    >
      {senderName ? `A letter from ${senderName}` : "You've got a letter"}
    </motion.text>
    <motion.text x="200" y="476" textAnchor="middle"
      fontFamily="'Inter', system-ui, sans-serif"
      fontSize="10.5" fontWeight="500" letterSpacing="2.5" fill="#8a7aae"
      initial={{opacity:0}} animate={{opacity:[0.45,1,1,0.45]}} transition={{duration:2.8,repeat:Infinity}}
    >
      TAP TO OPEN
    </motion.text>
  </g>
);

/* ─────────────────────── RISING ENVELOPE ─────────────────────── */
const RisingEnvelope = ({ show, delivered }: { show:boolean; delivered:boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{y:30,opacity:0,scale:0.85}}
        animate={delivered ? {y:-220,opacity:0,scale:1.1} : {y:-70,opacity:1,scale:1}}
        exit={{opacity:0}}
        transition={delivered
          ? {type:"spring",stiffness:75,damping:16}
          : {type:"spring",stiffness:90,damping:20,delay:0.35}}
        style={{
          position:"absolute", left:"49%", top:"36%",
          transform:"translateX(-50%)",
          width:130, height:88, zIndex:20,
          filter:"drop-shadow(0 14px 28px rgba(80,50,140,0.42))",
          pointerEvents:"none",
        }}
      >
        <div style={{ width:130, height:88, borderRadius:6,
          background:"linear-gradient(175deg,#FBF6ED 0%,#F5C9DA 55%,#EDB6CC 100%)",
          border:"2.2px solid #1a1a1a", position:"relative", overflow:"hidden",
          boxShadow:"0 8px 28px rgba(80,50,140,0.22), 0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 130 88">
            <line x1="0" y1="88" x2="65" y2="46" stroke="rgba(26,18,36,0.14)" strokeWidth="1.2"/>
            <line x1="130" y1="88" x2="65" y2="46" stroke="rgba(26,18,36,0.14)" strokeWidth="1.2"/>
          </svg>
          <div style={{
            position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
            width:26, height:26, borderRadius:"50%",
            background:"radial-gradient(circle at 35% 30%, #FF8FA0, #D8304A, #7A1020)",
            boxShadow:"0 3px 8px rgba(180,25,55,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, color:"rgba(255,255,255,0.9)",
          }}>♥</div>
        </div>
        <div style={{position:"absolute",top:0,left:0,right:0,height:46,overflow:"hidden",pointerEvents:"none"}}>
          <svg viewBox="0 0 130 44" style={{width:130,height:44}}>
            <polygon points="0,0 130,0 65,44" fill="#F5C9DA" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────── ROOT ─────────────────────── */
const PurpleMailboxV4 = ({ className, onContinue, senderName }: Props) => {
  const [state, setState] = useState<MailboxState>("idle");
  const [zoomed, setZoomed] = useState(false);
  const controls = useAnimation();
  const timersRef = useRef<number[]>([]);

  useEffect(() => { controls.start(state); }, [state, controls]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const handleClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => setState("open"), 800),
      window.setTimeout(() => { setState("delivered"); setZoomed(true); }, 2500),
      window.setTimeout(() => onContinue?.(), 3400),
    ];
  };

  const isOpen = state === "open" || state === "delivered";
  const delivered = state === "delivered";

  return (
    <div className={className} style={{
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      width:"100%", height:"100%",
      position:"relative", overflow:"hidden",
    }}>
      {/* ── Mailbox ── */}
      <div style={{ perspective:"900px", perspectiveOrigin:"50% 42%" }}>
        <motion.div
          onClick={handleClick}
          whileHover={!isOpen ? { y:-7 } : {}}
          animate={!isOpen ? { y:[0,-5,0] } : { y:0 }}
          transition={!isOpen ? {duration:3.6,repeat:Infinity,ease:"easeInOut"} : {duration:0.45}}
          style={{
            cursor: isOpen ? "default" : "pointer",
            width:"min(520px, 90%)",
            aspectRatio:"1 / 1",
            position:"relative",
          }}
        >
          <motion.div
            animate={delivered ? {opacity:0} : {opacity:1}}
            transition={{duration:0.5}}
            style={{width:"100%",height:"100%",willChange:"opacity"}}
          >
            <svg viewBox="0 0 400 495" width="100%" height="100%" style={{overflow:"visible"}}>
              <Defs/>
              <motion.g initial="idle" animate={controls}>
                <GroundShadow/>
                <Post/>

                {/* ── Main body with drop shadow ── */}
                <g filter="url(#v4shadow)">
                  {/* Right side wall */}
                  <g>
                    <path d="M 280 270 L 280 170 Q 280 85 195 85 L 200 78 Q 293 78 293 168 L 293 268 Z"
                      fill="url(#v4lavSide)" stroke={S} strokeWidth="2.5" strokeLinejoin="round" opacity="0.95"/>
                    {/* Brushed metal on side */}
                    <path d="M 280 270 L 280 170 Q 280 85 195 85 L 200 78 Q 293 78 293 168 L 293 268 Z"
                      fill="#fff" filter="url(#v4brushed)" opacity="0.35" strokeLinejoin="round"/>
                    {/* AO shadow on front-to-side corner */}
                    <path d="M 281 170 Q 281 88 198 82" fill="none" stroke="#000" strokeWidth="2" opacity="0.35"/>
                    {/* Panel seam line */}
                    <line x1="280" y1="178" x2="293" y2="174" stroke="rgba(30,18,55,0.5)" strokeWidth="1.2"/>
                    <line x1="280" y1="176" x2="293" y2="172" stroke="rgba(220,205,255,0.2)" strokeWidth="0.8"/>
                    {/* Rivets */}
                    <circle cx="288" cy="107" r="2.8" fill="#C8B8EC" stroke={S} strokeWidth="1.2"/>
                    <circle cx="288" cy="107" r="1.1" fill="#EAE0FF" opacity="0.7"/>
                    <circle cx="289" cy="252" r="2.8" fill="#C8B8EC" stroke={S} strokeWidth="1.2"/>
                    <circle cx="289" cy="252" r="1.1" fill="#EAE0FF" opacity="0.7"/>
                    <path d="M 285 265 L 285 279 L 292 276 L 292 263 Z"
                      fill="url(#v4lavSide)" stroke={S} strokeWidth="2" strokeLinejoin="round"/>
                  </g>

                  <Roof/>
                  <Interior open={isOpen}/>

                  {/* Bottom face */}
                  <path d="M 110 270 L 280 270 L 293 263 L 293 275 L 280 282 L 110 282 Z"
                    fill="url(#v4bottomFace)" stroke={S} strokeWidth="2" strokeLinejoin="round"/>
                  {/* Post mounting plate */}
                  <rect x="181" y="268" width="28" height="9" rx="1.5"
                    fill="url(#v4lavSide)" stroke={S} strokeWidth="1.5"/>
                  <circle cx="187" cy="272" r="2.2" fill="#C0AEE4" stroke={S} strokeWidth="1"/>
                  <circle cx="203" cy="272" r="2.2" fill="#C0AEE4" stroke={S} strokeWidth="1"/>
                  <circle cx="188" cy="272" r="0.8" fill="#EAE0FF" opacity="0.8"/>
                  <circle cx="204" cy="272" r="0.8" fill="#EAE0FF" opacity="0.8"/>
                </g>

                {/* Arch wall reveal — shows metal wall thickness at the opening */}
                <path
                  d="M 118 266 L 118 172 Q 118 93 195 93 Q 272 93 272 172 L 272 266 L 280 266 L 280 170 Q 280 85 195 85 Q 110 85 110 170 L 110 266 Z"
                  fill="url(#v4archWall)"
                />
                <path d="M 119 172 Q 119 94 195 94 Q 271 94 271 172"
                  fill="none" stroke="rgba(170,140,220,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="110" y1="170" x2="110" y2="266" stroke="rgba(220,205,255,0.32)" strokeWidth="1"/>
                <line x1="280" y1="170" x2="280" y2="266" stroke="rgba(20,10,40,0.38)" strokeWidth="1"/>

                {/* Door */}
                <SwingDoor open={isOpen}/>
                <HingeSill/>

                {/* Brass plate — shown when door is closed */}
                {!isOpen && <BrassPlate/>}

                <BirdLeft/>
                <BirdRight/>
              </motion.g>
              {!isOpen && <Caption senderName={senderName}/>}
            </svg>
          </motion.div>

          <RisingEnvelope show={isOpen} delivered={delivered}/>

          <AnimatePresence>
            {delivered && (
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(360px,90vw)",aspectRatio:"360/240",pointerEvents:"none",zIndex:60}}>
                <motion.div
                  key="shared-envelope-v4"
                  initial={{scale:0.4,opacity:0}}
                  animate={{scale:zoomed?1:0.4,opacity:1}}
                  transition={{scale:{type:"spring",stiffness:100,damping:20,mass:1},opacity:{duration:0.35}}}
                  style={{position:"absolute",inset:0,transformOrigin:"50% 50%",perspective:"800px",willChange:"transform"}}
                >
                  <div style={{position:"absolute",inset:0,borderRadius:6,background:"#F5C9DA",border:"2.5px solid #1a1a1a",overflow:"hidden",zIndex:1}}/>
                  <div style={{position:"absolute",top:0,left:0,width:"100%",height:"50%",zIndex:10}}>
                    <svg viewBox="0 0 360 180" style={{width:"100%",height:"100%",display:"block",overflow:"visible"}} preserveAspectRatio="none">
                      <polygon points="0,0 360,0 180,180" fill="#F5C9DA" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Caption overlay */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{delay:0.4,duration:0.6}}
            style={{position:"absolute",bottom:"8%",textAlign:"center",pointerEvents:"none"}}
          >
            <motion.p
              animate={{opacity:[0.6,1,0.6]}} transition={{duration:2.5,repeat:Infinity}}
              style={{
                fontFamily:"'Pinyon Script', cursive",
                fontSize:"clamp(32px, 6vw, 48px)",
                color:"#C0396A",
                letterSpacing:"0.02em",
                textShadow:"0 2px 8px rgba(192,57,106,0.18)",
                margin:0,
              }}
            >
              Click Me
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurpleMailboxV4;
