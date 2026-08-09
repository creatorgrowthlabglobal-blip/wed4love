import Header from "@/components/Header";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: August 2026</p>

        <section className="space-y-8 font-body text-foreground/85 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Wed4Love ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">2. The Service</h2>
            <p>Wed4Love allows couples to create beautiful digital wedding invitations with cinematic video backgrounds, a 3D envelope reveal, RSVP tracking, and a shareable link. The Service is intended for personal, non-commercial use only.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to keep your contact details up to date. You must be at least 13 years old to use this Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">4. User Content</h2>
            <p>You retain ownership of all content (text, photos, names, dates) you provide. By using the Service, you grant us a limited licence to store and display your content solely to deliver the Service to your guests. You are solely responsible for the content you create and share.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">5. Prohibited Use</h2>
            <p>You agree not to upload content that is illegal, harmful, harassing, defamatory, obscene, or infringes intellectual property or anyone's privacy. We reserve the right to remove content and suspend accounts that violate these terms.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">6. Payments</h2>
            <p>Digital wedding invitations are offered at $9.99 each (one-time payment). This includes all 5 colour themes, a cinematic 3D envelope reveal, live countdown timer, full RSVP tracking dashboard, and a shareable link that never expires. All payments are processed securely through our payment partners. Prices are subject to change with notice.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">7. Refunds</h2>
            <p>We offer a full money-back guarantee. If you are unsatisfied with your invitation for any reason, <Link to="/contact" className="text-primary underline">contact us</Link> within 14 days of purchase and we will issue a complete refund — no questions asked.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">8. Disclaimers</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted availability or error-free operation.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Wed4Love shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">11. Contact</h2>
            <p>For questions about these Terms, please <Link to="/contact" className="text-primary underline">contact us</Link> or email <span className="text-primary">hello@wed4love.com</span>.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Terms;
