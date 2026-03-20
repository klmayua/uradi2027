import Link from 'next/link';
import { Users, Heart, Vote, MapPin, Phone, Mail } from 'lucide-react';

export default function CitizenPortalLanding() {
  return (
    <div className="min-h-screen bg-uradi-bg-primary">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-uradi-text-primary mb-6">
            Your Voice. <span className="text-uradi-gold">Your Vote.</span>
          </h1>
          <p className="text-xl text-uradi-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of citizens committed to shaping the future of our state.
            Get involved, stay informed, and make your voice heard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center px-8 py-4 bg-uradi-gold text-uradi-bg-primary font-semibold rounded-lg hover:bg-uradi-gold-light transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Become a Volunteer
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-uradi-gold text-uradi-gold font-semibold rounded-lg hover:bg-uradi-gold/10 transition-colors"
            >
              <Heart className="w-5 h-5 mr-2" />
              Support Our Cause
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-uradi-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-uradi-text-primary text-center mb-12">
            How You Can Participate
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Vote}
              title="Register to Vote"
              description="Ensure you're registered and ready to vote in the upcoming elections. Your vote is your power."
              link="/register"
            />
            <FeatureCard
              icon={Users}
              title="Join the Movement"
              description="Volunteer as a canvasser, polling agent, or community mobilizer. Every hand makes a difference."
              link="/volunteer"
            />
            <FeatureCard
              icon={Heart}
              title="Donate"
              description="Support our campaign financially. Every contribution, no matter how small, helps us reach more voters."
              link="/donate"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="50,000+" label="Registered Voters" />
            <StatCard number="2,000+" label="Active Volunteers" />
            <StatCard number="27" label="Local Governments" />
            <StatCard number="100+" label="Communities Served" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-uradi-bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-uradi-text-primary mb-8">
            Get in Touch
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="tel:+2348000000000"
              className="flex items-center gap-3 text-uradi-text-secondary hover:text-uradi-gold transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>+234 800 000 0000</span>
            </a>
            <a
              href="mailto:info@uradi360.com"
              className="flex items-center gap-3 text-uradi-text-secondary hover:text-uradi-gold transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>info@uradi360.com</span>
            </a>
            <div className="flex items-center gap-3 text-uradi-text-secondary">
              <MapPin className="w-5 h-5" />
              <span>State Campaign Headquarters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-uradi-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-uradi-text-tertiary text-sm">
            © 2027 URADI-360. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-uradi-text-secondary hover:text-uradi-gold">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-uradi-text-secondary hover:text-uradi-gold">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-uradi-text-secondary hover:text-uradi-gold">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <div className="bg-uradi-bg-primary p-6 rounded-xl border border-uradi-border hover:border-uradi-gold/50 transition-colors">
      <div className="w-12 h-12 bg-uradi-gold/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-uradi-gold" />
      </div>
      <h3 className="text-xl font-semibold text-uradi-text-primary mb-2">{title}</h3>
      <p className="text-uradi-text-secondary mb-4">{description}</p>
      <Link
        href={link}
        className="text-uradi-gold font-medium hover:underline"
      >
        Learn more →
      </Link>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl sm:text-4xl font-bold text-uradi-gold mb-2">{number}</div>
      <div className="text-uradi-text-secondary text-sm">{label}</div>
    </div>
  );
}
