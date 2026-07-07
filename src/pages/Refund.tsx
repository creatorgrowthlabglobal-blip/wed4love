import Header from "@/components/Header";
import { Link } from "react-router-dom";

const Refund = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

        <section className="space-y-8 font-body text-foreground/85 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">1. Digital Letters ($4.99)</h2>
            <p>Because each letter is a custom-built digital keepsake delivered immediately upon payment, all sales are generally final. However, if you experience a technical issue that prevents your letter from being delivered or viewed by the recipient, you are eligible for a full refund.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">2. How to Request a Refund</h2>
            <p>To request a refund, please email <span className="text-primary">updates@wish4love.com</span> or use our <Link to="/contact" className="text-primary underline">contact form</Link> within 14 days of your purchase. Include:</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Your account email address</li>
              <li>The order/letter ID (if applicable)</li>
              <li>A brief description of the issue</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">3. Processing Time</h2>
            <p>Approved refunds are processed within 5–10 business days and credited back to your original payment method. Bank processing times may vary.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">4. Chargebacks</h2>
            <p>We kindly ask you to contact us before filing a chargeback. Most issues can be resolved quickly through direct communication.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold mb-3">5. Questions</h2>
            <p>For any refund-related questions, please <Link to="/contact" className="text-primary underline">reach out to us</Link>. We're here to help.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Refund;
