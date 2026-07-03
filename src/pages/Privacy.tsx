import Header from "@/components/Header";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

        <section className="space-y-8 font-body text-foreground/85 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and the letters and media you create. We also collect basic usage data (device type, browser, pages visited) to improve the Service.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p>We use your information to (a) deliver and personalize the Service, (b) send your letters, (c) process payments, (d) respond to support requests, and (e) comply with legal obligations.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">3. Sharing of Information</h2>
            <p>We do not sell your personal data. We share information only with trusted service providers needed to operate the Service (payment processors, telephony providers, hosting and email infrastructure) and only to the extent necessary.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">4. Storage & Security</h2>
            <p>Your letters and media are stored securely on our backend infrastructure. We apply industry-standard safeguards, but no system is 100% secure. You can request deletion of your data at any time.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">5. Cookies</h2>
            <p>We use essential cookies to keep you signed in and to remember your preferences. We do not use third-party advertising trackers.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data. To exercise these rights, please <Link to="/contact" className="text-primary underline">contact us</Link>.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">7. Children's Privacy</h2>
            <p>The Service is not directed to children under 13. We do not knowingly collect data from children under 13.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">8. Changes to this Policy</h2>
            <p>We may update this Privacy Policy occasionally. We will notify you of significant changes via email or in-app notice.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">9. Contact</h2>
            <p>For privacy questions, email us at engineer1@wish4love.com or use our <Link to="/contact" className="text-primary underline">contact form</Link>.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
