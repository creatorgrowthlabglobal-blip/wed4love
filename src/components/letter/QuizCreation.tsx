import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
}

interface QuizCreationProps {
  quiz: QuizQuestion[];
  onChange: (quiz: QuizQuestion[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const emptyQ = (): QuizQuestion => ({ question: "", correctAnswer: "", options: ["", ""] });

const QuizCreation = ({ quiz, onChange, onNext, onBack }: QuizCreationProps) => {
  const addQuestion = () => {
    if (quiz.length < 5) onChange([...quiz, emptyQ()]);
  };

  const removeQuestion = (i: number) => onChange(quiz.filter((_, idx) => idx !== i));

  const updateField = (i: number, field: keyof QuizQuestion, value: string) => {
    const updated = [...quiz];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    const updated = [...quiz];
    const opts = [...updated[qi].options];
    opts[oi] = value;
    updated[qi] = { ...updated[qi], options: opts };
    onChange(updated);
  };

  const addOption = (qi: number) => {
    if (quiz[qi].options.length < 4) {
      const updated = [...quiz];
      updated[qi] = { ...updated[qi], options: [...updated[qi].options, ""] };
      onChange(updated);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <HelpCircle className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="font-display text-xl text-primary mb-1">Make it fun!</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Add Quiz Questions
        </h2>
        <p className="font-body text-base text-muted-foreground">
          Test how well they know you — optional but fun!
        </p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {quiz.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="letter-paper rounded-2xl p-5 relative"
            >
              <button onClick={() => removeQuestion(i)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                <X className="w-3.5 h-3.5 text-destructive" />
              </button>

              <p className="font-heading text-xs font-semibold text-primary mb-3 uppercase tracking-wider">
                Question {i + 1}
              </p>

              <Input
                value={q.question}
                onChange={(e) => updateField(i, "question", e.target.value)}
                placeholder="e.g. What's our favourite song?"
                className="mb-3 bg-background/50 border-border/60 font-body text-base"
              />

              <p className="font-heading text-xs font-semibold text-muted-foreground mb-2">Answer Options</p>
              <div className="space-y-2 mb-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-heading transition-all ${
                      q.correctAnswer === opt && opt ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(i, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      className="flex-1 bg-background/50 border-border/60 font-body text-sm py-2"
                    />
                  </div>
                ))}
                {q.options.length < 4 && (
                  <button onClick={() => addOption(i)} className="text-xs text-primary font-heading hover:underline">
                    + Add option
                  </button>
                )}
              </div>

              <div>
                <p className="font-heading text-xs font-semibold text-muted-foreground mb-1">Correct Answer</p>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateField(i, "correctAnswer", e.target.value)}
                  className="w-full bg-background/50 border border-border/60 rounded-lg py-2 px-3 text-sm font-body focus:outline-none focus:border-primary/50"
                >
                  <option value="">Select correct answer</option>
                  {q.options.filter(Boolean).map((opt, oi) => (
                    <option key={oi} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {quiz.length < 5 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-heading text-sm font-semibold hover:bg-primary/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </motion.button>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
          ← Go Back
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
          className="btn-glow px-10 py-3.5 bg-primary text-primary-foreground font-heading text-base font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow">
          {quiz.length === 0 ? "Skip →" : "Continue →"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default QuizCreation;
