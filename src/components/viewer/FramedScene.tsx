import { ReactNode } from "react";
import frame from "@/assets/pink-hearts-frame.png";

interface FramedSceneProps {
  children: ReactNode;
}

/**
 * Wraps a scene (mailbox / envelope) inside the pink hearts & lace frame.
 * The frame is rendered as a background, and the children are placed within
 * the cream inner panel area.
 */
export default function FramedScene({ children }: FramedSceneProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background:
          "radial-gradient(ellipse at 50% 40%, #FBE9EF 0%, #F2D6E0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(96vw, calc(96vh * 1.45))",
          aspectRatio: "1.45 / 1",
          backgroundImage: `url(${frame})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 18px 36px rgba(160, 90, 120, 0.25))",
        }}
      >
        {/* Inner cream panel — children render inside this safe area */}
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "18%",
            right: "18%",
            bottom: "16%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
