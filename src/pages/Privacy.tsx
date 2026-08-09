import Header from "@/components/Header";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: August 2026</p>

        <section className="space-y-8 font-body text-foreground/85 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly — such as your name, email address, and the invitation details (couple names, wedding date, venue, story, and photos) you enter when creating an invitation. We also collect basic usage data (device type, browser, pages visited) to improve the Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p>We use your information to (a) deliver and personalise your digital wedding invitation, (b) operate the RSVP tracking dashboard, (c) process payments, (d) respond to support requests, and (e) comply with legal obligations.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">3. Sharing of Information</h2>
            <p>We do not sell your personal data. We share information only with trusted service providers needed to operate the Service (payment processors, hosting, and email infrastructure) and only to the extent necessary.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">4. Guest RSVP Data</h2>
            <p>When your guests RSVP through your invitation link, their name, email, and attendance details are stored securely and made available to you via your host dashboard. This data is used solely to help you manage attendance and is not shared with any third parties.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">5. Storage &amp; Security</h2>
            <p>Your invitation data and RSVP responses are stored securely using Supabase (PostgreSQL). We apply industry-standard safeguards, but no system is 100% secure. You can request deletion of your data at any time.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">6. Cookies</h2>
            <p>We use essential cookies to keep you signed in and remember your preferences. We do not use third-party advertising trackers.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data. To exercise these rights, please <Link to="/contact" className="text-primary underline">contact us</Link>.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">8. Children's Privacy</h2>
            <p>The Service is not directed to children under 13. We do not knowingly collect data from children under 13.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">9. Changes to this Policy</h2>
            <p>We may update this Privacy Policy occasionally. We will notify you of significant changes via email or in-app notice.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">10. Contact</h2>
            <p>For privacy questions, email us at <span className="text-primary">hello@wed4love.com</span> or use our <Link to="/contact" className="text-primary underline">contact form</Link>.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
