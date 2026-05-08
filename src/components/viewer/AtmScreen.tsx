import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";

interface AtmScreenProps {
  correctPin: string;
  onSuccess: () => void;
}

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

const AtmScreen = ({ correctPin, onSuccess }: AtmScreenProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [heartFill, setHeartFill] = useState(0);

  useEffect(() => {
    if (!processing) { setHeartFill(0); return; }
    const interval = setInterval(() => {
      setHeartFill(prev => Math.min(prev + 2, 100));
    }, 25);
    return () => clearInterval(interval);
  }, [processing]);

  const handleKey = useCallback((key: string) => {
    if (processing || accepted) return;
    sounds.atmButton();
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);

    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError(false);
      return;
    }
    if (key === "" || pin.length >= 4) return;

    const newPin = pin + key;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      setProcessing(true);
      sounds.atmProcess();
      setTimeout(() => {
        if (newPin === correctPin) {
          sounds.atmSuccess();
          setProcessing(false);
          setAccepted(true);
          setTimeout(onSuccess, 2200);
        } else {
          sounds.atmError();
          setError(true);
          setProcessing(false);
          setTimeout(() => { setPin(""); setError(false); }, 1200);
        }
      }, 1500);
    }
  }, [pin, correctPin, onSuccess, processing, accepted]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, hsl(340 45% 82%) 0%, hsl(345 35% 72%) 40%, hsl(340 30% 62%) 100%)",
      }}
    >
      {/* === Soft Pink Background === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Spotlight glow */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px]" style={{
          background: "radial-gradient(circle, hsl(340 80% 85% / 0.4) 0%, hsl(340 60% 80% / 0.15) 40%, transparent 65%)",
        }} />

        {/* Bokeh lights — pink & gold tones */}
        {[
          { x: "15%", y: "20%", size: 120, color: "340 80% 80%", opacity: 0.15, delay: 0 },
          { x: "80%", y: "30%", size: 90, color: "40 80% 75%", opacity: 0.12, delay: 1.5 },
          { x: "70%", y: "70%", size: 140, color: "350 60% 85%", opacity: 0.1, delay: 3 },
          { x: "25%", y: "75%", size: 100, color: "340 70% 82%", opacity: 0.12, delay: 2 },
          { x: "55%", y: "15%", size: 80, color: "40 70% 80%", opacity: 0.1, delay: 4 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: b.x, top: b.y,
              width: b.size, height: b.size,
              background: `radial-gradient(circle, hsl(${b.color} / ${b.opacity}) 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 6 + i, delay: b.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              background: `hsl(${340 + i * 3} ${60 + i * 2}% ${80 + (i % 5)}% / 0.5)`,
              left: `${10 + (i * 6.5) % 80}%`,
              top: `${10 + (i * 7.3) % 75}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-6, 6, -6],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 7 + i * 1.1,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* === ATM Machine === */}
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.88 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.4 }}
        className="relative w-[300px] sm:w-[340px] max-w-[92vw]"
      >
        {/* Breathing animation */}
        <motion.div
          animate={{ scale: [1, 1.008, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-3 rounded-[40px] opacity-60 pointer-events-none" style={{
            background: "radial-gradient(ellipse, hsl(340 70% 80% / 0.2) 0%, transparent 70%)",
            filter: "blur(20px)",
          }} />

          {/* ATM Body — soft pink/rose metallic */}
          <div className="rounded-[28px] overflow-hidden relative group" style={{
            background: "linear-gradient(170deg, hsl(340 50% 92%) 0%, hsl(340 45% 86%) 40%, hsl(340 40% 80%) 100%)",
            boxShadow: `
              0 40px 80px hsl(340 40% 60% / 0.2),
              0 20px 40px hsl(340 30% 50% / 0.15),
              0 0 1px hsl(0 0% 100% / 0.3),
              inset 0 1px 0 hsl(0 0% 100% / 0.5),
              inset 0 -1px 0 hsl(340 30% 70% / 0.3)
            `,
          }}>
            {/* Body shimmer sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-[1]"
              animate={{ x: ["-130%", "130%"] }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 5, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.08) 48%, hsl(0 0% 100% / 0.15) 50%, hsl(0 0% 100% / 0.08) 52%, transparent 60%)",
                width: "100%",
              }}
            />

            {/* Top gold accent */}
            <div className="h-[2px]" style={{
              background: "linear-gradient(90deg, transparent 10%, hsl(40 80% 75% / 0.6) 30%, hsl(40 90% 82% / 0.8) 50%, hsl(40 80% 75% / 0.6) 70%, transparent 90%)",
            }} />

            {/* Branding */}
            <div className="text-center pt-5 pb-3 relative">
              {/* LED indicators */}
              <div className="absolute top-4 left-5 flex gap-1.5">
                <motion.div
                  className="w-[5px] h-[5px] rounded-full"
                  style={{
                    background: accepted ? "hsl(150 60% 55%)" : "hsl(340 80% 70%)",
                    boxShadow: `0 0 6px ${accepted ? "hsl(150 60% 55% / 0.6)" : "hsl(340 80% 70% / 0.5)"}`,
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <div className="w-[5px] h-[5px] rounded-full" style={{
                  background: "hsl(40 70% 65%)",
                  boxShadow: "0 0 6px hsl(40 70% 65% / 0.4)",
                }} />
              </div>

              <p className="font-display text-[13px] tracking-[0.3em] uppercase font-semibold" style={{
                color: "hsl(340 30% 40%)",
                textShadow: "0 1px 0 hsl(0 0% 100% / 0.5)",
              }}>Love ATM</p>
              <p className="text-[8px] tracking-[0.25em] uppercase mt-0.5" style={{
                color: "hsl(340 20% 60%)",
              }}>Wish4Love</p>
            </div>

            {/* Screen — frosted glass on pink */}
            <div className="mx-4 sm:mx-5 rounded-2xl p-[2px] relative" style={{
              background: "linear-gradient(180deg, hsl(0 0% 100% / 0.4) 0%, hsl(340 30% 85% / 0.3) 100%)",
            }}>
              <div className="rounded-[14px] relative overflow-hidden" style={{
                background: "linear-gradient(180deg, hsl(0 0% 100% / 0.85) 0%, hsl(340 30% 96%) 100%)",
                boxShadow: "inset 0 2px 10px hsl(340 30% 70% / 0.15), inset 0 0 20px hsl(0 0% 100% / 0.3)",
              }}>
                {/* Glass reflection */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(135deg, hsl(0 0% 100% / 0.3) 0%, transparent 40%, transparent 60%, hsl(0 0% 100% / 0.1) 100%)",
                }} />

                {/* Sweeping light */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 8, ease: "easeInOut" }}
                  style={{
                    background: "linear-gradient(105deg, transparent 30%, hsl(0 0% 100% / 0.15) 48%, hsl(0 0% 100% / 0.25) 50%, hsl(0 0% 100% / 0.15) 52%, transparent 70%)",
                    width: "100%",
                  }}
                />

                {/* Screen content */}
                <div className="p-5 sm:p-6 min-h-[180px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {accepted ? (
                      <motion.div key="accepted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center w-full">
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="font-display text-sm tracking-[0.15em] uppercase font-semibold"
                          style={{ color: "hsl(150 45% 45%)", textShadow: "0 0 15px hsl(150 45% 60% / 0.2)" }}
                        >
                          Access Granted
                        </motion.p>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                          className="h-[1px] mx-auto mt-3 w-3/4"
                          style={{ background: "linear-gradient(90deg, transparent, hsl(150 45% 55% / 0.5), transparent)" }}
                        />
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="text-[10px] mt-3 tracking-wider"
                          style={{ color: "hsl(340 20% 55%)" }}
                        >
                          Opening your love letter...
                        </motion.p>
                      </motion.div>
                    ) : processing ? (
                      <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center w-full">
                        <p className="font-display text-xs tracking-[0.2em] uppercase mb-5"
                          style={{ color: "hsl(340 50% 55%)" }}>
                          Processing Love…
                        </p>

                        {/* Loading bar */}
                        <div className="relative w-full max-w-[180px] mx-auto h-[6px] rounded-full overflow-hidden" style={{
                          background: "hsl(340 30% 88%)",
                          boxShadow: "inset 0 1px 3px hsl(340 20% 80% / 0.5)",
                        }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              width: `${heartFill}%`,
                              background: "linear-gradient(90deg, hsl(340 70% 70%), hsl(340 80% 75%), hsl(40 80% 72%))",
                              boxShadow: "0 0 10px hsl(340 70% 70% / 0.3)",
                            }}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-full">
                        <p className="text-center text-[9px] tracking-[0.35em] uppercase mb-1" style={{
                          color: "hsl(340 40% 60%)",
                        }}>Wish4Love</p>
                        <p className="text-center font-display text-lg mb-1 font-semibold tracking-wide" style={{
                          color: "hsl(340 30% 30%)",
                        }}>Welcome</p>
                        <p className="text-center text-[11px] mb-5 tracking-wide" style={{
                          color: "hsl(340 20% 55%)",
                        }}>Enter your secret PIN</p>

                        {/* PIN dots */}
                        <div className="flex justify-center gap-3.5 mb-3">
                          {[0,1,2,3].map(i => (
                            <motion.div
                              key={i}
                              animate={error ? { x: [0,-6,6,-6,6,0] } : {}}
                              transition={{ duration: 0.4 }}
                              className="w-11 h-12 sm:w-12 sm:h-13 rounded-xl flex items-center justify-center relative overflow-hidden"
                              style={{
                                background: pin[i]
                                  ? "hsl(340 60% 90% / 0.6)"
                                  : "hsl(0 0% 100% / 0.5)",
                                border: `1.5px solid ${
                                  error ? "hsl(0 60% 60% / 0.7)"
                                  : pin[i] ? "hsl(340 60% 75% / 0.5)"
                                  : "hsl(340 30% 80% / 0.4)"
                                }`,
                                boxShadow: pin[i]
                                  ? "0 0 12px hsl(340 60% 75% / 0.15), inset 0 0 8px hsl(340 60% 80% / 0.1)"
                                  : "inset 0 1px 3px hsl(340 20% 80% / 0.2)",
                              }}
                            >
                              {pin[i] ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{
                                    background: error
                                      ? "hsl(0 60% 55%)"
                                      : "linear-gradient(180deg, hsl(340 80% 72%), hsl(340 70% 62%))",
                                    boxShadow: error
                                      ? "0 0 8px hsl(0 60% 55% / 0.5)"
                                      : "0 0 8px hsl(340 80% 72% / 0.4)",
                                  }}
                                />
                              ) : null}
                            </motion.div>
                          ))}
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-[11px] mt-1"
                            style={{ color: "hsl(0 55% 55%)" }}
                          >
                            Incorrect PIN
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Keypad — soft pink glass buttons */}
            <div className="grid grid-cols-3 gap-[6px] px-4 sm:px-5 py-4">
              {KEYS.map((key, i) => (
                <motion.button
                  key={i}
                  whileHover={key !== "" ? { scale: 1.04, y: -1 } : {}}
                  whileTap={key !== "" ? { scale: 0.92 } : {}}
                  onClick={() => key !== "" && handleKey(key)}
                  disabled={key === ""}
                  className="relative h-[42px] sm:h-[46px] rounded-xl font-body text-sm font-medium transition-all duration-200"
                  style={{
                    visibility: key === "" ? "hidden" : "visible",
                    background: key === ""
                      ? "transparent"
                      : pressedKey === key
                        ? "hsl(340 40% 78%)"
                        : "linear-gradient(180deg, hsl(0 0% 100% / 0.6) 0%, hsl(0 0% 100% / 0.3) 100%)",
                    color: "hsl(340 30% 35%)",
                    boxShadow: key !== ""
                      ? pressedKey === key
                        ? "inset 0 2px 4px hsl(340 30% 70% / 0.3)"
                        : "0 2px 8px hsl(340 30% 60% / 0.12), 0 1px 0 hsl(0 0% 100% / 0.5)"
                      : "none",
                    border: key !== "" ? "1px solid hsl(340 30% 85% / 0.5)" : "none",
                  }}
                >
                  <span className="relative z-10">{key}</span>
                </motion.button>
              ))}
            </div>

            {/* Card slot */}
            <div className="mx-8 sm:mx-10 mb-4">
              <div className="h-[4px] rounded-full" style={{
                background: "linear-gradient(90deg, transparent 5%, hsl(340 30% 70% / 0.4) 30%, hsl(340 25% 65% / 0.5) 50%, hsl(340 30% 70% / 0.4) 70%, transparent 95%)",
                boxShadow: "inset 0 1px 2px hsl(340 20% 60% / 0.2), 0 1px 0 hsl(0 0% 100% / 0.3)",
              }} />
            </div>

            {/* Bottom gold accent */}
            <div className="h-[2px]" style={{
              background: "linear-gradient(90deg, transparent 10%, hsl(40 80% 75% / 0.4) 30%, hsl(40 90% 82% / 0.6) 50%, hsl(40 80% 75% / 0.4) 70%, transparent 90%)",
            }} />
          </div>
        </motion.div>

        {/* Ground shadow */}
        <div className="mx-6 h-5 -mt-1 rounded-[50%]" style={{
          background: "radial-gradient(ellipse, hsl(340 40% 70% / 0.25) 0%, transparent 70%)",
          filter: "blur(4px)",
        }} />
      </motion.div>
    </motion.div>
  );
};

export default AtmScreen;
