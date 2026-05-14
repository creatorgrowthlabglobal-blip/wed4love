import { Suspense } from "react";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";

const Index = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #7a3744 0%, #5d2632 60%, #4a1d28 100%)",
      }}
    >
      {/* Paper grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.15 0 0 0 0 0.2 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "300px",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* 3D Mailbox */}
      <div className="relative w-[min(560px,90vw)] h-[min(560px,80vh)]">
        <Suspense fallback={null}>
          <RealisticMailbox className="w-full h-full" />
        </Suspense>
      </div>

      {/* Hint */}
      <p
        className="relative mt-2 text-xs uppercase tracking-[0.25em] text-white/60 font-light"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
      >
        Click the mailbox to open
      </p>
    </div>
  );
};

export default Index;
