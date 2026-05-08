import { motion } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { Link } from "react-router-dom";

interface LetterRecord {
  id: string;
  receiverName: string;
  date: string;
}

const LetterHistory = () => {
  // Load from localStorage
  const letters: LetterRecord[] = JSON.parse(localStorage.getItem("wish4love_letters") || "[]");

  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <FloatingHearts count={4} />
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Your Letter History
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-8">
              All the love letters you've created
            </p>
          </motion.div>

          {letters.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="letter-paper rounded-2xl p-10 text-center">
              <Heart className="w-10 h-10 text-primary/30 mx-auto mb-4" />
              <p className="font-body text-sm text-muted-foreground mb-4">No letters created yet</p>
              <Link to="/create-letter" className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-full shadow-romantic hover:shadow-glow transition-all">
                Create Your First Letter
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {letters.map((letter, i) => (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="letter-paper rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="font-display text-sm font-semibold text-foreground">To: {letter.receiverName}</p>
                    <p className="font-body text-xs text-muted-foreground">{letter.date}</p>
                  </div>
                  <Link to={`/letter-ready/${letter.id}`} className="flex items-center gap-1 text-primary font-body text-xs hover:underline">
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LetterHistory;
