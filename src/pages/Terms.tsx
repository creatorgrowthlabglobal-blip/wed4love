import Header from "@/components/Header";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

        <section className="space-y-8 font-body text-foreground/85 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Wish4Love ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">2. The Service</h2>
            <p>Wish4Love allows you to create personalized digital love letters with photos, music, and messages, as well as schedule voice reminder calls for special occasions. The Service is intended for personal, non-commercial use only.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to keep your contact details up to date. You must be at least 13 years old to use this Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">4. User Content</h2>
            <p>You retain ownership of all content (text, photos, audio, video) you upload. By using the Service, you grant us a limited license to store and display your content solely to deliver the Service to your intended recipient. You are solely responsible for the content you create and share.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">5. Prohibited Use</h2>
            <p>You agree not to upload content that is illegal, harmful, harassing, defamatory, obscene, infringes intellectual property, or violates anyone's privacy. We reserve the right to remove content and suspend accounts that violate these terms.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">6. Payments</h2>
            <p>Letters are offered at $6.99 each. Reminder calls include 2 free calls; additional calls are $0.50 each or $5 for a 10-pack. All payments are processed through our payment partners. Prices are subject to change with notice.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">7. Disclaimers</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted availability or error-free operation. Reminder calls depend on third-party telephony providers and may occasionally be delayed or fail.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Wish4Love shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">9. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">10. Contact</h2>
            <p>For questions about these Terms, please <Link to="/contact" className="text-primary underline">contact us</Link>.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Terms;
