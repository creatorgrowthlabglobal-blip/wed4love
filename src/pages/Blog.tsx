import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles, Search, Mail } from "lucide-react";
import Header from "@/components/Header";
import { BLOG_POSTS, CATEGORIES, BlogPost } from "@/data/blogPosts";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";
const BG = "linear-gradient(180deg, hsl(42 60% 98%) 0%, hsl(38 40% 96%) 100%)";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const AuthorAvatar = ({ post, size = 28 }: { post: BlogPost; size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center font-body font-bold text-white shrink-0"
    style={{
      width: size,
      height: size,
      background: post.authorColor,
      fontSize: size * 0.34,
      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
    }}
  >
    {post.authorInitials}
  </div>
);

const FeaturedCard = ({ post }: { post: BlogPost }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="mb-14"
  >
    <Link
      to={`/blog/${post.slug}`}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 rounded-3xl overflow-hidden group"
      style={{
        background: "white",
        border: "1.5px solid hsl(38 32% 88%)",
        boxShadow: "0 12px 50px hsl(38 40% 55% / 0.10)",
      }}
    >
      <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
        <img
          src={post.cover}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 left-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.35)" }}
          >
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        </div>
      </div>

      <div className="p-8 lg:p-10 flex flex-col justify-center">
        <p
          className="font-body text-[10px] tracking-[0.28em] uppercase font-bold mb-3"
          style={{ color: GOLD }}
        >
          {post.category}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 text-foreground group-hover:text-[hsl(38_72%_44%)] transition-colors">
          {post.title}
        </h2>
        <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 mb-6">
          <AuthorAvatar post={post} size={36} />
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs font-bold text-foreground truncate">{post.author}</p>
            <p className="font-body text-[11px] text-muted-foreground truncate">
              {formatDate(post.date)} · {post.readTime} min read
            </p>
          </div>
        </div>

        <span
          className="inline-flex items-center gap-2 font-body text-sm font-bold self-start group-hover:gap-3 transition-all"
          style={{ color: GOLD }}
        >
          Read the story <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  </motion.div>
);

const PostCard = ({ post, index }: { post: BlogPost; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.08 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
  >
    <Link
      to={`/blog/${post.slug}`}
      className="block rounded-3xl overflow-hidden group h-full flex flex-col"
      style={{
        background: "white",
        border: "1.5px solid hsl(38 32% 90%)",
        boxShadow: "0 4px 24px hsl(38 40% 55% / 0.06)",
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={post.cover}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block px-2.5 py-1 rounded-full font-body text-[9px] font-bold uppercase tracking-widest"
            style={{ background: "hsl(38 60% 94%)", color: GOLD }}
          >
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" /> {post.readTime} min
          </span>
        </div>

        <h3 className="font-display text-lg sm:text-xl font-bold leading-snug mb-2 text-foreground group-hover:text-[hsl(38_72%_44%)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <div
          className="flex items-center gap-2.5 pt-4 mt-auto"
          style={{ borderTop: "1px solid hsl(38 28% 92%)" }}
        >
          <AuthorAvatar post={post} size={26} />
          <div className="flex-1 min-w-0">
            <p className="font-body text-[11px] font-semibold text-foreground truncate">
              {post.author}
            </p>
            <p className="font-body text-[10px] text-muted-foreground truncate">
              {formatDate(post.date)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const Blog = () => {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const featured = BLOG_POSTS.find(p => p.featured) ?? BLOG_POSTS[0];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(p => {
      if (p.slug === featured.slug) return false;
      if (category !== "All" && p.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, query, featured.slug]);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-14 px-4 relative overflow-hidden">
        <div
          className="absolute top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(38 80% 85% / 0.35) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-40 -right-10 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(340 60% 88% / 0.28) 0%, transparent 70%)" }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-body text-[11px] font-bold uppercase tracking-widest mb-6"
              style={{ background: "hsl(38 60% 92%)", color: GOLD, border: "1.5px solid hsl(38 55% 82%)" }}
            >
              <Sparkles className="w-3 h-3" /> The Wed4Love Journal
            </div>

            <h1
              className="font-display font-bold leading-tight mb-5 text-foreground"
              style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}
            >
              Everything worth knowing about a{" "}
              <span className="font-handwritten italic font-normal" style={{ color: GOLD, fontSize: "1.08em" }}>
                modern wedding
              </span>
            </h1>
            <p
              className="font-body text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Real advice from real weddings. Design ideas, planning timelines, RSVP tactics, and the
              small etiquette questions couples always ask us — answered honestly.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 max-w-lg mx-auto relative"
          >
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "hsl(30 12% 52%)" }}
            />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl font-body text-sm bg-white border border-[hsl(38_28%_88%)] focus:outline-none focus:ring-2 focus:ring-[hsl(38_72%_60%/0.35)] focus:border-[hsl(38_72%_60%)] transition placeholder:text-muted-foreground/60 shadow-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* Category pills */}
      <section className="px-4 mb-10">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-full font-body text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={
                category === cat
                  ? { background: GOLD_GRAD, color: "white", boxShadow: "0 4px 14px hsl(38 80% 55% / 0.28)" }
                  : { background: "white", color: "hsl(30 18% 32%)", border: "1.5px solid hsl(38 28% 88%)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {category === "All" && !query.trim() && (
        <section className="px-4 mb-4">
          <div className="max-w-5xl mx-auto">
            <FeaturedCard post={featured} />
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl font-bold text-foreground mb-2">No stories yet</p>
              <p className="font-body text-sm text-muted-foreground">
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredPosts.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(38 60% 96%) 0%, hsl(340 40% 96%) 100%)",
              border: "1.5px solid hsl(38 40% 88%)",
              boxShadow: "0 8px 40px hsl(38 40% 60% / 0.12)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 55% / 0.3)" }}
            >
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3 text-foreground">
              Planning a wedding?
            </h2>
            <p className="font-body text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Get one thoughtful article a week — no spam, no aggressive pitching, just useful advice
              from weddings we've worked on.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-body text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: GOLD_GRAD, boxShadow: "0 8px 24px hsl(38 80% 50% / 0.32)" }}
            >
              Start your invitation <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
