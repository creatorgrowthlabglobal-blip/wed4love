import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const articles = [
  {
    slug: "handwritten-letters-digital-age",
    title: "Why Handwritten Letters Still Hit Differently in a World Full of Texts",
    description: "In a world of instant messages, the deliberate slowness of a letter says something no emoji can. Here's why letters still carry weight that nothing else does.",
    readTime: "7 min read",
  },
  {
    slug: "how-to-write-an-anniversary-letter",
    title: "How to Write an Anniversary Letter That Actually Means Something",
    description: "Skip the generic card. A step-by-step guide to writing an anniversary letter with specific memories, honest feeling, and words they'll actually keep.",
    readTime: "7 min read",
  },
  {
    slug: "just-because-notes-intimacy",
    title: 'Why "Just Because" Notes Are Essential for Long-Term Intimacy',
    description: "No birthday, no occasion — just a note because you were thinking of them. The most underrated relationship habit, and how to build it.",
    readTime: "6 min read",
  },
  {
    slug: "overcoming-writers-block-emotions",
    title: "How to Write a Love Letter When You Have No Idea Where to Start",
    description: "The blank page is a vulnerability problem, not a writing problem. How to break through it and finally say what you've been meaning to say.",
    readTime: "7 min read",
  },
  {
    slug: "personalize-digital-messages",
    title: "How to Make a Digital Love Letter Feel Like It Was Written Just for Them",
    description: "The difference between a message that lands and one that gets scrolled past comes down to one word: specificity. Here's how to use it.",
    readTime: "7 min read",
  },
];

const ArticlesIndex = () => {
  useEffect(() => {
    document.title = "Articles on Love, Letters & Connection — Wish4Love";
    return () => { document.title = "Wish4Love — Send a Digital Love Letter With Photos & Music"; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-3">
            From the Wish4Love blog
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Articles on Love, Letters & Connection
          </h1>
          <p className="font-body text-base text-muted-foreground mb-12 leading-relaxed">
            Practical writing guides and honest reflections on staying close to the people who matter most.
          </p>
        </motion.div>

        <div className="space-y-8">
          {articles.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                to={`/articles/${article.slug}`}
                className="group block rounded-2xl border border-primary/10 bg-white/60 hover:bg-white hover:border-primary/25 px-6 py-6 transition-all duration-300 hover:shadow-md"
              >
                <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug mb-2">
                  {article.title}
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                  {article.description}
                </p>
                <span className="font-body text-xs text-primary font-semibold">{article.readTime}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-primary/5 border border-primary/15 px-6 py-8 text-center">
          <p className="font-display text-xl font-semibold text-foreground mb-2">
            Ready to write something real?
          </p>
          <p className="font-body text-sm text-muted-foreground mb-5">
            Use the Wish4Love letter generator — add photos, music, and a 3D reveal experience
            that makes your words feel as special as the person receiving them.
          </p>
          <Link
            to="/create-letter"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]"
          >
            Create Your Love Letter
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlesIndex;
