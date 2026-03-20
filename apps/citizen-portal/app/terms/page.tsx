import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-uradi-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-uradi-gold hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-uradi-text-primary mb-8">Terms of Service</h1>

        <div className="space-y-8 text-uradi-text-secondary">
          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using URADI-360, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the platform.
            </p>
            <p>Effective Date: March 17, 2026</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">2. Eligibility</h2>
            <p className="mb-4">To use URADI-360, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Be a registered voter in Nigeria (for certain features)</li>
              <li>Provide accurate and complete information</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">3. User Accounts</h2>
            <p className="mb-4">When you create an account with us, you must provide accurate information. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us of any unauthorized access</li>
              <li>Ensuring your account information is current</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the platform for any illegal purpose</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Interfere with platform functionality</li>
              <li>Use automated systems without authorization</li>
              <li>Distribute malicious software</li>
              <li>Harass or intimidate other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">5. Donations</h2>
            <p className="mb-4">By making a donation:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You confirm you are authorized to use the payment method</li>
              <li>All donations are processed securely via Paystack</li>
              <li>Donations are non-refundable except at our discretion</li>
              <li>You will receive confirmation via email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">6. Intellectual Property</h2>
            <p className="mb-4">
              The platform and its content are owned by URADI-360 and are protected by copyright, trademark, and other laws. You may not reproduce, distribute, or create derivative works without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">7. Termination</h2>
            <p className="mb-4">We may terminate or suspend your account immediately for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these terms</li>
              <li>Fraudulent activity</li>
              <li>Illegal conduct</li>
              <li>At our sole discretion with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">8. Disclaimer</h2>
            <p className="mb-4">
              URADI-360 is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">9. Contact Information</h2>
            <p>
              Questions about these Terms? Contact us at:{' '}
              <a href="mailto:legal@uradi360.com" className="text-uradi-gold hover:underline">
                legal@uradi360.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
