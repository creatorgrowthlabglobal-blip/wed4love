const Index = () => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
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
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.15 0 0 0 0 0.2 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
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

      {/* Envelope */}
      <div
        className="relative"
        style={{
          width: "min(440px, 78vw)",
          aspectRatio: "1.4 / 1",
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.55)) drop-shadow(0 8px 14px rgba(0,0,0,0.35))",
        }}
      >
        <svg
          viewBox="0 0 440 314"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <defs>
            {/* Soft pink paper gradient for body */}
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0CFCC" />
              <stop offset="50%" stopColor="#E8C0BC" />
              <stop offset="100%" stopColor="#D9ADA8" />
            </linearGradient>

            {/* Slightly different tone for the back flap */}
            <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EBC4C0" />
              <stop offset="100%" stopColor="#D9ABA5" />
            </linearGradient>

            {/* Crease shading */}
            <linearGradient id="creaseLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(120,60,60,0.18)" />
            </linearGradient>
            <linearGradient id="creaseRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(120,60,60,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>

            {/* Paper grain filter */}
            <filter id="paperGrain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="1.2"
                numOctaves={2}
                seed="3"
              />
              <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0.35 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
          </defs>

          {/* Soft inner shadow under envelope */}
          <ellipse
            cx="220"
            cy="300"
            rx="180"
            ry="10"
            fill="rgba(0,0,0,0.35)"
            filter="blur(6px)"
          />

          {/* Envelope body (rectangle) */}
          <rect
            x="20"
            y="40"
            width="400"
            height="260"
            rx="3"
            fill="url(#bodyGrad)"
          />

          {/* Subtle paper grain on body */}
          <rect
            x="20"
            y="40"
            width="400"
            height="260"
            rx="3"
            filter="url(#paperGrain)"
            opacity="0.6"
          />

          {/* Bottom triangle creases (envelope back fold lines) */}
          <polygon
            points="20,300 220,170 420,300"
            fill="rgba(150,90,90,0.08)"
          />

          {/* Left fold */}
          <polygon
            points="20,40 220,170 20,300"
            fill="url(#creaseLeft)"
            opacity="0.9"
          />
          {/* Right fold */}
          <polygon
            points="420,40 220,170 420,300"
            fill="url(#creaseRight)"
            opacity="0.9"
          />

          {/* Top flap (triangle pointing down to center) */}
          <polygon
            points="20,40 420,40 220,210"
            fill="url(#flapGrad)"
            stroke="rgba(120,60,60,0.12)"
            strokeWidth="0.6"
          />

          {/* Flap edge highlight */}
          <polyline
            points="20,40 220,210 420,40"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.8"
          />

          {/* Subtle crease shadow under the flap tip */}
          <path
            d="M 90 90 L 220 210 L 350 90"
            fill="none"
            stroke="rgba(120,60,60,0.10)"
            strokeWidth="1"
          />

          {/* Tiny center seam highlight */}
          <line
            x1="220"
            y1="170"
            x2="220"
            y2="210"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </div>
  );
};

export default Index;
