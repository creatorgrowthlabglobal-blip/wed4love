import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import { QuizQuestion } from "@/components/letter/QuizCreation";

interface QuizExperienceProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

const QuizExperience = ({ questions, onComplete }: QuizExperienceProps) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const q = questions[current];

  const handleSelect = (opt: string) => {
    if (result) return;
    setSelected(opt);
    const isCorrect = opt === q.correctAnswer;
    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      sounds.correct();
    } else {
      sounds.wrong();
    }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
        setResult(null);
      } else {
        onComplete();
      }
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, hsl(350 60% 95%) 0%, hsl(340 50% 90%) 100%)" }}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {questions.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-500" style={{
              width: "32px",
              background: i < current ? "hsl(340 80% 65%)" : i === current ? "hsl(40 90% 65%)" : "hsl(340 20% 85%)",
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-center font-heading text-xs uppercase tracking-widest mb-2" style={{ color: "hsl(340 50% 60%)" }}>
              Question {current + 1} of {questions.length}
            </p>

            <div className="rounded-3xl p-6 sm:p-8 mb-6" style={{
              background: "linear-gradient(170deg, #fff8f0, #ffeef2)",
              boxShadow: "0 12px 40px rgba(200,80,120,0.1)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}>
              <p className="font-display text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: "#4B2E2E" }}>
                {q.question}
              </p>

              <div className="space-y-3">
                {q.options.filter(Boolean).map((opt, i) => {
                  const isSelected = selected === opt;
                  const isCorrect = result && opt === q.correctAnswer;
                  const isWrong = result === "wrong" && isSelected;

                  return (
                    <motion.button
                      key={i}
                      whileHover={!result ? { scale: 1.02 } : {}}
                      whileTap={!result ? { scale: 0.98 } : {}}
                      onClick={() => handleSelect(opt)}
                      className="w-full text-left px-5 py-4 rounded-xl font-body text-base transition-all duration-300 flex items-center gap-3"
                      style={{
                        background: isCorrect ? "rgba(80,200,120,0.15)" : isWrong ? "rgba(255,100,100,0.15)" : isSelected ? "rgba(200,80,120,0.1)" : "rgba(255,255,255,0.7)",
                        border: `2px solid ${isCorrect ? "#50c878" : isWrong ? "#ff6464" : isSelected ? "hsl(340 80% 65%)" : "rgba(200,160,180,0.3)"}`,
                        color: "#4B2E2E",
                      }}
                    >
                      <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-heading font-bold" style={{
                        borderColor: isCorrect ? "#50c878" : isWrong ? "#ff6464" : "rgba(200,160,180,0.4)",
                        background: isCorrect ? "#50c878" : isWrong ? "#ff6464" : "transparent",
                        color: (isCorrect || isWrong) ? "#fff" : "#8a6060",
                      }}>
                        {isCorrect ? "✓" : isWrong ? "✗" : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {result && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center font-heading text-sm font-semibold"
                style={{ color: result === "correct" ? "#50c878" : "#e06060" }}
              >
                {result === "correct" ? "That's right! 💕" : `The answer was: ${q.correctAnswer}`}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuizExperience;
