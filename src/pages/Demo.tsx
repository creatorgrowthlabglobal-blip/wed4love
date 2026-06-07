import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";

const DEMOS = [
  {
    id: "demo-jungey",
    title: "Photo Letter",
    subtitle: "Mailbox · Envelope · Polaroids",
    description:
      "Open a vintage mailbox, unseal the envelope, and watch a handwritten letter type out with your photos.",
    accent: "from-[#F8C8D8] via-[#F5B7CA] to-[#E89BB0]",
    icon: Mail,
  },
  {
    id: "demo-envelope",
    title: "Purple Envelope",
    subtitle: "Floating envelope · Wax seal reveal",
    description:
      "A dreamy purple envelope drifts in, breaks its seal, and unfolds a romantic note with music.",
    accent: "from-[#D6B5E8] via-[#C49ADC] to-[#9B72CF]",
    icon: Heart,
  },
];

const Demo = () => {
  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <FloatingHearts count={6} />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Heart className="w-3.5 h-3.5 text-primary fill-primary/30" />
            <span className="font-body text-sm text-primary tracking-wide">Live Demos</span>
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            See a Wish4Love letter in motion
          </h1>
          <p className="font-body text-base text-muted-foreground max-w-xl mx-auto">
            Two real demos — exactly like what your loved one will receive. Music plays
            automatically once you open the letter.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {DEMOS.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              >
                <Link
                  to={`/view/${d.id}`}
                  className="group block relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-primary/15 shadow-card hover:shadow-romantic transition-all duration-500"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(0 0% 100% / 0.85), hsl(350 60% 97% / 0.8))",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${d.accent} opacity-40 blur-2xl group-hover:opacity-60 transition-opacity duration-500`}
                  />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                      {d.title}
                    </h2>
                    <p className="font-body text-xs uppercase tracking-wider text-primary/80 mb-3">
                      {d.subtitle}
                    </p>
                    <p className="font-body text-sm text-muted-foreground mb-5">
                      {d.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 font-heading text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-300">
                      Open demo <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            to="/create-letter"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-heading text-sm font-bold shadow-romantic hover:shadow-glow transition-all duration-400"
          >
            Create your own letter <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Demo;
