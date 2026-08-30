import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Mail, Send, Loader2, CheckCircle2, ArrowLeft, Phone } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUPPORT_EMAIL = "wed4loveglobal@gmail.com";
const SUPPORT_WHATSAPP = "9779702238084";
const SUPPORT_WHATSAPP_DISPLAY = "+977 9702238084";
const WHATSAPP_LINK = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Hi Wed4Love! I have a question about your invitations.")}`;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Please check your input", description: first, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-message", {
        body: parsed.data,
      });
      if (error) throw error;
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ title: "Message sent 💌", description: "We'll get back to you soon." });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to send",
        description: err?.message || `Please try again or email ${SUPPORT_EMAIL} directly.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center mb-10">
          <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">Get in touch</h1>
          <p className="font-body text-muted-foreground">
            Questions, feedback, or need help? We'd love to hear from you.
          </p>
        </div>

        {/* Fast-path direct contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-primary/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "hsl(142 55% 42%)" }}>
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(142 40% 32%)" }}>
                WhatsApp — fastest reply
              </p>
              <p className="font-body text-sm font-bold text-foreground truncate">{SUPPORT_WHATSAPP_DISPLAY}</p>
            </div>
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-primary/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))" }}>
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(30 40% 32%)" }}>
                Email
              </p>
              <p className="font-body text-sm font-bold text-foreground truncate">{SUPPORT_EMAIL}</p>
            </div>
          </a>
        </div>

        {sent ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-lg p-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Thank you 💕</h2>
            <p className="font-body text-muted-foreground mb-6">
              Your message is on its way. We typically reply within 24 hours.
            </p>
            <button
              onClick={() => setSent(false)}
              className="font-body text-sm text-primary hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-lg p-6 sm:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/15 bg-white/70 font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Your name"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-2 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-primary/15 bg-white/70 font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com"
                  maxLength={255}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-body text-sm font-medium text-foreground mb-2 block">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/15 bg-white/70 font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="What is this about?"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="font-body text-sm font-medium text-foreground mb-2 block">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/15 bg-white/70 font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[150px] resize-y"
                placeholder="Tell us what's on your mind..."
                maxLength={5000}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send message
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center font-body">
              Or email us directly at <span className="text-primary">{SUPPORT_EMAIL}</span>
            </p>
          </form>
        )}
      </main>
    </div>
  );
};

export default Contact;
