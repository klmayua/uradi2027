import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-uradi-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-uradi-gold hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-uradi-text-primary mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-uradi-text-secondary">
          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">1. Introduction</h2>
            <p className="mb-4">
              URADI-360 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              Last updated: March 17, 2026
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-uradi-text-primary mb-2">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Name and contact information (email, phone)</li>
              <li>Location data (LGA, ward, polling unit)</li>
              <li>Voter registration information</li>
              <li>Device and browser information</li>
            </ul>

            <h3 className="text-xl font-medium text-uradi-text-primary mb-2">2.2 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform interaction logs</li>
              <li>Campaign participation data</li>
              <li>Communication preferences</li>
              <li>Analytics and performance data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Communicate campaign updates and events</li>
              <li>Coordinate volunteer activities</li>
              <li>Process donations and payments</li>
              <li>Improve platform functionality</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">4. Data Protection</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal data, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption in transit and at rest</li>
              <li>Access controls and authentication</li>
              <li>Regular security assessments</li>
              <li>Staff training on data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">5. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of communications</li>
              <li>Export your data</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-uradi-text-primary mb-4">6. Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:{' '}
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
