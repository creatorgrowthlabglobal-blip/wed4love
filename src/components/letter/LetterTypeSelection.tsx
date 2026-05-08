import { motion } from "framer-motion";
import { Heart, Cake, Sparkles, ArrowRight } from "lucide-react";

interface LetterTypeSelectionProps {
  onSelect: (type: "love" | "birthday") => void;
}

const LetterTypeSelection = ({ onSelect }: LetterTypeSelectionProps) => {
  const types = [
    {
      id: "love" as const,
      title: "Love Letter",
      subtitle: "Pour your heart out",
      description: "Express your deepest feelings to someone who makes your heart skip a beat",
      icon: Heart,
      emoji: "💌",
    },
    {
      id: "birthday" as const,
      title: "Birthday Letter",
      subtitle: "Celebrate their day",
      description: "Make their special day unforgettable with words that touch the soul",
      icon: Cake,
      emoji: "🎂",
    },
  ];

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-display text-lg text-primary mb-1">What story will you tell?</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Choose Your Letter Type
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Every great love story begins with the first word...
        </p>
      </motion.div>

      {/* Vertical stacked layout */}
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        {types.map((type, i) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
            whileHover={{ x: 6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(type.id)}
            className="group relative overflow-hidden rounded-2xl cursor-pointer text-left"
          >
            <div className="letter-paper p-5 sm:p-6 rounded-2xl transition-all duration-300 group-hover:shadow-glow">
              <div className="flex items-center gap-4">
                <span className="text-3xl sm:text-4xl flex-shrink-0">{type.emoji}</span>
                <motion.div
                  className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 transition-all duration-300 flex-shrink-0"
                  whileHover={{ rotate: 10 }}
                >
                  <type.icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-0.5">
                    {type.title}
                  </h3>
                  <p className="font-body text-xs text-primary/70">{type.subtitle}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1 hidden sm:block">
                    {type.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LetterTypeSelection;
