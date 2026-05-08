import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const FloatingHearts = ({ count = 6 }: { count?: number }) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 10,
      size: 8 + Math.random() * 12,
    }));
    setHearts(generated);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{ left: `${heart.x}%`, bottom: "-20px" }}
          animate={{
            y: [0, -window.innerHeight - 100],
            rotate: [0, heart.x > 50 ? 180 : -180],
            opacity: [0, 0.35, 0.2, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          <Heart
            style={{ width: heart.size, height: heart.size }}
            className="text-primary/30 fill-primary/15"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
