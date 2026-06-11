import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ArticleLayoutProps {
  title: string;
  children: React.ReactNode;
}

const ArticleLayout = ({ title, children }: ArticleLayoutProps) => {
  useEffect(() => {
    document.title = `${title} — Wish4Love`;
    return () => { document.title = "Wish4Love — Send a Digital Love Letter With Photos & Music"; };
  }, [title]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          All Articles
        </Link>
        <article className="font-body text-foreground/85 leading-relaxed space-y-6">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleLayout;
