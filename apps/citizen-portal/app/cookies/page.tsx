import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-uradi-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-uradi-gold hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-uradi-text-primary mb-8">Cookie Policy</h1>

        <div className="space-y-8 text-uradi-text-secondary">
          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">1. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your device when you visit our website.
              They help us provide you with a better experience by remembering your preferences and
              understanding how you use our platform.
            </p>
            <p>Last updated: March 17, 2026</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">2. Types of Cookies We Use</h2>

            <h3 className="text-xl font-medium text-uradi-text-primary mb-2">2.1 Essential Cookies</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Authentication and session management</li>
              <li>Security features</li>
              <li>Load balancing</li>
              <li>Remembering your preferences</li>
            </ul>

            <h3 className="text-xl font-medium text-uradi-text-primary mb-2">2.2 Analytics Cookies</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google Analytics</li>
              <li>Page view statistics</li>
              <li>User behavior analysis</li>
              <li>Performance monitoring</li>
            </ul>

            <h3 className="text-xl font-medium text-uradi-text-primary mb-2">2.3 Functional Cookies</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Language preferences</li>
              <li>Form auto-fill</li>
              <li>Display preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">3. How to Manage Cookies</h2>
            <p className="mb-4">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Block all cookies</li>
              <li>Delete existing cookies</li>
              <li>Allow only first-party cookies</li>
              <li>Set preferences for individual websites</li>
            </ul>
            <p className="mt-4">
              Note: Disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              We use services from the following third parties that may set cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Analytics - usage statistics</li>
              <li>Paystack - payment processing</li>
              <li>Mapbox - map functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">5. Contact Us</h2>
            <p>
              For cookie-related questions, contact us at:{' '}
              <a href="mailto:privacy@uradi360.com" className="text-uradi-gold hover:underline">
                privacy@uradi360.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
