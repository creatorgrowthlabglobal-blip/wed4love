import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Share2, Check, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { getPostBySlug, getRelatedPosts, BlogBlock, BlogPost as BlogPostType } from "@/data/blogPosts";
import { Seo } from "@/components/Seo";

function buildArticleSchema(post: BlogPostType) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://wed4love.com/og-image.png`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author,
      "jobTitle": post.authorRole
    },
    "publisher": {
      "@type": "Organization",
      "name": "Wed4Love",
      "logo": {
        "@type": "ImageObject",
        "url": "https://wed4love.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://wed4love.com/blog/${post.slug}`
    },
    "articleSection": post.category,
    "wordCount": post.content.reduce((n, b) => {
      if (b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "quote") return n + b.text.split(" ").length;
      if (b.type === "callout") return n + b.title.split(" ").length + b.text.split(" ").length;
      if (b.type === "ul" || b.type === "ol") return n + b.items.reduce((m, i) => m + i.split(" ").length, 0);
      return n;
    }, 0)
  };
}

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";
const BG = "linear-gradient(180deg, hsl(42 60% 98%) 0%, hsl(38 40% 96%) 100%)";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const AuthorAvatar = ({ post, size = 40 }: { post: BlogPostType; size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center font-body font-bold text-white shrink-0"
    style={{
      width: size,
      height: size,
      background: post.authorColor,
      fontSize: size * 0.34,
      boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
    }}
  >
    {post.authorInitials}
  </div>
);

const BlockRenderer = ({ block, index }: { block: BlogBlock; index: number }) => {
  switch (block.type) {
    case "p":
      return (
        <p className="font-body text-[16px] sm:text-[17px] leading-[1.75] text-foreground/85 mb-6">
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2
          id={`section-${index}`}
          className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-12 mb-5 scroll-mt-32"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-4">
          {block.text}
        </h3>
      );
    case "quote":
      return (
        <blockquote
          className="my-8 pl-6 py-2 relative"
          style={{ borderLeft: `3px solid ${GOLD}` }}
        >
          <p
            className="font-handwritten italic text-xl sm:text-2xl leading-relaxed text-foreground/90 mb-3"
          >
            "{block.text}"
          </p>
          {block.cite && (
            <cite
              className="font-body not-italic text-xs uppercase tracking-widest font-semibold"
              style={{ color: GOLD }}
            >
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "ul":
      return (
        <ul className="mb-6 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 font-body text-[16px] sm:text-[17px] leading-relaxed text-foreground/85">
              <span
                className="w-1.5 h-1.5 rounded-full mt-3 shrink-0"
                style={{ background: GOLD }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mb-6 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 font-body text-[16px] sm:text-[17px] leading-relaxed text-foreground/85">
              <span
                className="font-display text-base font-bold min-w-[1.5rem] leading-relaxed"
                style={{ color: GOLD }}
              >
                {i + 1}.
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div
          className="my-8 rounded-2xl p-6 sm:p-7"
          style={{
            background: "linear-gradient(155deg, hsl(38 60% 96%), hsl(340 40% 97%))",
            border: "1.5px solid hsl(38 45% 82%)",
            boxShadow: "0 4px 20px hsl(38 40% 60% / 0.08)",
          }}
        >
          <p
            className="font-body text-[10px] tracking-[0.24em] uppercase font-bold mb-2"
            style={{ color: GOLD }}
          >
            {block.title}
          </p>
          <p className="font-display text-lg sm:text-xl font-semibold text-foreground leading-snug">
            {block.text}
          </p>
        </div>
      );
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getPostBySlug(slug) : undefined;
  const related = slug ? getRelatedPosts(slug, 3) : [];

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min((scrolled / height) * 100, 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <Seo
          title="Article not found — Wed4Love"
          description="We couldn't find that story. Browse the Wed4Love Journal for wedding planning guides and invitation ideas."
          path={`/blog/${slug ?? ""}`}
          noindex
        />
        <Header />
        <div className="text-center max-w-md">
          <p className="font-display text-5xl font-bold mb-3 text-foreground">404</p>
          <p className="font-body text-base text-muted-foreground mb-8">
            We couldn't find that story. It may have been renamed or moved.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-bold text-white"
            style={{ background: GOLD_GRAD }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled or blocked */
    }
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <Seo
        title={`${post.title} — Wed4Love`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.date,
          author: post.author,
          section: post.category,
          tags: [post.category, "wedding", "invitations"],
        }}
        structuredData={buildArticleSchema(post)}
      />
      <Header />

      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[60] transition-[width] duration-100"
        style={{ width: `${progress}%`, background: GOLD_GRAD }}
      />

      {/* Cover */}
      <section className="pt-28 sm:pt-32 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All stories
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="font-body text-[10px] tracking-[0.28em] uppercase font-bold mb-4"
              style={{ color: GOLD }}
            >
              {post.category}
            </p>
            <h1
              className="font-display font-bold leading-[1.15] text-foreground mb-6"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)" }}
            >
              {post.title}
            </h1>
            <p className="font-body text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 pb-8" style={{ borderBottom: "1px solid hsl(38 28% 88%)" }}>
              <div className="flex items-center gap-3">
                <AuthorAvatar post={post} size={42} />
                <div>
                  <p className="font-body text-sm font-bold text-foreground">{post.author}</p>
                  <p className="font-body text-xs text-muted-foreground">{post.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <span className="font-body text-xs text-muted-foreground">
                  {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime} min read
                </span>
                <button
                  onClick={share}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold border transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: "white", color: GOLD, border: `1.5px solid ${GOLD}` }}
                  aria-label="Share this post"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover image */}
      <section className="px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 12px 60px hsl(38 40% 55% / 0.16)" }}
          >
            <img
              src={post.cover}
              alt=""
              className="w-full aspect-[16/9] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="px-4">
        <div className="max-w-2xl mx-auto pb-12">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {post.content.map((block, i) => (
              <BlockRenderer key={i} block={block} index={i} />
            ))}
          </motion.article>

          {/* End-of-article CTA */}
          <div
            className="mt-14 rounded-3xl p-7 sm:p-9 text-center"
            style={{
              background: "linear-gradient(160deg, hsl(38 60% 96%) 0%, hsl(340 40% 97%) 100%)",
              border: "1.5px solid hsl(38 45% 84%)",
              boxShadow: "0 6px 30px hsl(38 40% 55% / 0.10)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: GOLD_GRAD, boxShadow: "0 4px 14px hsl(38 80% 55% / 0.28)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
              Ready to build your own?
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Cinematic digital wedding invitations with RSVP tracking, live dashboard, and a 3D
              envelope reveal — from $49.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 50% / 0.3)" }}
            >
              Start your invitation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-4 pb-24 pt-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p
                className="font-body text-[10px] tracking-[0.28em] uppercase font-bold mb-2"
                style={{ color: GOLD }}
              >
                Keep reading
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                More from the journal
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <motion.div
                  key={r.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={`/blog/${r.slug}`}
                    className="block rounded-3xl overflow-hidden group h-full flex flex-col"
                    style={{
                      background: "white",
                      border: "1.5px solid hsl(38 32% 90%)",
                      boxShadow: "0 4px 24px hsl(38 40% 55% / 0.06)",
                    }}
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={r.cover}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full font-body text-[9px] font-bold uppercase tracking-widest self-start mb-2"
                        style={{ background: "hsl(38 60% 94%)", color: GOLD }}
                      >
                        {r.category}
                      </span>
                      <h4 className="font-display text-base font-bold leading-snug mb-2 text-foreground group-hover:text-[hsl(38_72%_44%)] transition-colors line-clamp-2">
                        {r.title}
                      </h4>
                      <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {r.excerpt}
                      </p>
                      <p className="font-body text-[11px] text-muted-foreground mt-auto">
                        {r.readTime} min · {formatDate(r.date)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
