import { ReactNode, useState, useCallback } from "react";
import frameImg from "@/assets/letter-frame.png";

interface FramedSceneProps {
  children?: ReactNode;
  /** When true, renders only the decorative frame border as an overlay
   *  (transparent center) — use on top of an existing full-screen scene. */
  overlay?: boolean;
}

/**
 * Watercolor hand-painted floral frame (PNG with transparent center).
 * Fully responsive — stretches to cover the viewport with the scene
 * showing through the empty middle.
 *
 * Two modes:
 *  - default: soft pink background + frame + inner safe area for children
 *  - overlay: just the frame artwork on top of an existing scene
 */
export default function FramedScene({ children, overlay = false }: FramedSceneProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: overlay ? 200 : 50,
        pointerEvents: overlay ? "none" : "auto",
        background: overlay
          ? "transparent"
          : "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Skeleton shimmer placeholder while frame loads */}
      {!loaded && !overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #FDF1F5 25%, #FCE8EF 50%, #FDF1F5 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
            zIndex: 0,
          }}
        />
      )}

      {/* Decorative watercolor frame */}
      <img
        src={frameImg}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        onLoad={handleLoad}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          zIndex: overlay ? 0 : 1,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          filter: overlay
            ? "drop-shadow(0 10px 24px rgba(160,80,110,0.18))"
            : "none",
        }}
      />

      {!overlay && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            // Inner safe area — keeps content inside the painted border.
            padding: "clamp(48px, 11vmin, 150px) clamp(40px, 9vmin, 150px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {children}
          </div>
        </div>
      )}

      {/* Shimmer keyframes */}
      <style>{memory://index.md
---
name: Landing Page Design
description: Glassmorphic navbar, Framer Motion constraint, live 3D box preview
type: design
---
Center floating navbar with `inset-x-0 mx-auto` to avoid Framer Motion conflicts.
Live 3D gift box preview on the landing page.

memory://features/letter-flow
---
name: Letter Creation Flow
description: Manual creation process, disabled AI, optional fields, removed ATM/PIN
type: feature
---
All creation fields are optional.
AI generation is DISABLED.
Pre-loaded music is DISABLED.
PIN creation, ATM, and secret locks have been removed.

memory://ux/emotional-design
---
name: Emotional UX Design
description: Mobile-first luxury feel, smooth transitions, disabled AI/music features
type: ux
---
Mobile-first, luxury feel.
Smooth transitions (500-800ms).
Disabled AI generation and pre-loaded music.

memory://tech/3d-rendering
---
name: 3D Rendering Constraints
description: R3F, PBR materials, no external fonts in WebGL, CanvasTexture for text
type: constraint
---
Use React Three Fiber (R3F) for 3D elements.
Use PBR materials.
Do not use external fonts in WebGL; use CanvasTexture for text rendering.

memory://features/history-and-navigation
---
name: History and Navigation
description: Header navigation routes and demo link specifics
type: feature
---
Header navigation routes and demo link specifics.

memory://business/pricing-and-payments
---
name: Pricing and Payments
description: Pricing tiers ($6.99/$2.99) and Whop payment integration
type: business
---
Pricing tiers: $6.99 for letters.
Whop payment integration.

memory://features/media-handling
---
name: Media Handling
description: Photo upload UI and live video/audio recording interface
type: feature
---
Photo upload UI.
Live video/audio recording interface.

memory://style/visual-identity
---
name: Visual Identity
description: Soft Pink luxury aesthetic, 3D Gift Box details, warm/dreamy atmosphere
type: design
---
Soft Pink, Champagne Gold, Warm Cream.
No red-heavy tones.
Luxury aesthetic.
3D Gift Box details.

memory://features/viewer-experience
---
name: Viewer Experience
description: 3D box animation, Hello Kitty reveal, vintage Letter, Polaroid, Bouquet
type: feature
---
3D box animation.
Hello Kitty reveal.
Vintage Letter, Polaroid, Bouquet.

