'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  MapPin,
  Download,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  ArrowLeft,
  Quote,
  Star,
  CheckCircle,
  Phone,
  Mail,
} from 'lucide-react';

// Navigation items
const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Vision', href: '/vision' },
  { name: 'Scorecard', href: '/scorecard' },
  { name: 'News', href: '/news' },
  { name: 'Get Involved', href: '/get-involved' },
  { name: 'Donate', href: '/donate' },
];

// Timeline data
const timeline = [
  {
    year: '2023',
    title: 'Governor of Jigawa State',
    description: 'Elected as the 5th Executive Governor of Jigawa State with a mandate for transformative change.',
    icon: Award,
    highlight: true,
  },
  {
    year: '2019',
    title: 'Senator, Jigawa North',
    description: 'Represented Jigawa North Senatorial District, championing healthcare and education bills.',
    icon: Users,
    highlight: false,
  },
  {
    year: '2015',
    title: 'Commissioner for Education',
    description: 'Appointed Commissioner for Education, overseeing reforms that increased enrollment by 40%.',
    icon: GraduationCap,
    highlight: false,
  },
  {
    year: '2011',
    title: 'House of Representatives',
    description: 'Elected to represent Dutse Federal Constituency, focusing on infrastructure development.',
    icon: Briefcase,
    highlight: false,
  },
  {
    year: '2007',
    title: 'Local Government Chairman',
    description: 'Served as Chairman of Dutse Local Government, implementing community development programs.',
    icon: MapPin,
    highlight: false,
  },
  {
    year: '1998',
    title: 'Business Career Begins',
    description: 'Founded Danladi Group, creating thousands of jobs across agriculture and manufacturing.',
    icon: Heart,
    highlight: false,
  },
];

// Key achievements
const achievements = [
  { number: '45', label: 'Schools Built', description: 'New classrooms and educational facilities' },
  { number: '300km', label: 'Roads Constructed', description: 'Connecting rural and urban communities' },
  { number: '10,000+', label: 'Jobs Created', description: 'Through public and private sector initiatives' },
  { number: '28', label: 'Health Centers', description: 'Upgraded with modern equipment' },
];

// Values
const values = [
  {
    title: 'Integrity',
    description: 'Unwavering commitment to honesty and transparency in all dealings.',
  },
  {
    title: 'Service',
    description: 'Leadership is about serving the people, not personal gain.',
  },
  {
    title: 'Excellence',
    description: 'Striving for the highest standards in governance and delivery.',
  },
  {
    title: 'Inclusivity',
    description: 'Building a Jigawa that works for everyone, regardless of background.',
  },
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--gray-200)]">
        <div className="container-premium">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-[var(--navy-deep)] text-lg leading-tight">Musa Danladi</p>
                <p className="text-xs text-[var(--gray-500)]">For Jigawa 2027</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.href === '/about'
                      ? 'text-[var(--gold-primary)]'
                      : 'text-[var(--gray-700)] hover:text-[var(--gold-primary)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/get-involved" className="btn-secondary text-sm py-2.5 px-5">
                Volunteer
              </Link>
              <Link href="/donate" className="btn-primary text-sm py-2.5 px-5">
                Donate
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[var(--navy-deep)]" />
              ) : (
                <Menu className="w-6 h-6 text-[var(--navy-deep)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--gray-200)]">
            <div className="container-premium py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-[var(--gray-700)] hover:text-[var(--gold-primary)] font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3 border-t border-[var(--gray-200)]">
                <Link href="/get-involved" className="block btn-secondary text-center">
                  Volunteer
                </Link>
                <Link href="/donate" className="block btn-primary text-center">
                  Donate
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-royal)] to-[var(--navy-deep)]">
        <div className="container-premium">
          <div className="max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--gold-light)] hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              About Alhaji Musa Danladi
            </h1>
            <p className="text-xl text-[var(--gray-300)] leading-relaxed">
              A lifetime of service to the people of Jigawa. From humble beginnings to the Governor&apos;s office,
              my journey has always been about one thing: delivering results for our people.
            </p>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)] rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-[var(--gray-400)]">
                  <div className="text-center">
                    <Users className="w-20 h-20 mx-auto mb-4" />
                    <p className="text-lg font-medium">Candidate Portrait</p>
                    <p className="text-sm">High-resolution official photograph</p>
                  </div>
                </div>
              </div>
              {/* Quote Card */}
              <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white p-6 rounded-xl shadow-xl max-w-xs">
                <Quote className="w-8 h-8 text-[var(--gold-primary)] mb-3" />
                <p className="text-[var(--gray-700)] italic mb-3">
                  &ldquo;Leadership is not about titles. It&apos;s about delivering results that change lives.&rdquo;
                </p>
                <p className="text-sm font-semibold text-[var(--navy-deep)]">— Alhaji Musa Danladi</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold-light)] rounded-full mb-6">
                <Star className="w-4 h-4 text-[var(--gold-dark)]" />
                <span className="text-sm font-medium text-[var(--gold-dark)]">Biography</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-6">
                A Life Dedicated to Service
              </h2>
              <div className="space-y-4 text-[var(--gray-600)] leading-relaxed">
                <p>
                  Born in Dutse, Jigawa State, Alhaji Musa Danladi grew up witnessing the challenges
                  facing ordinary Nigerians—limited access to quality education, inadequate healthcare,
                  and infrastructure that left communities isolated.
                </p>
                <p>
                  After completing his education at Ahmadu Bello University, he chose not the path of
                  personal enrichment, but of public service. Starting as a Local Government Chairman
                  in 2007, he demonstrated that government could be a force for positive change.
                </p>
                <p>
                  His business career, founding Danladi Group in 1998, taught him that economic
                  prosperity comes from empowering people, not just extracting resources. This philosophy
                  has guided every position he has held.
                </p>
                <p>
                  As Governor since 2023, he has overseen unprecedented development in education,
                  healthcare, and infrastructure—delivering on promises that others said were impossible.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#" className="inline-flex items-center gap-2 text-[var(--navy-royal)] font-medium hover:text-[var(--gold-primary)] transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Download Full Biography (PDF)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Core Values
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              The principles that guide every decision and every policy
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="card-premium p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">{value.title}</h3>
                <p className="text-[var(--gray-600)]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Track Record of Delivery
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              Concrete results that speak louder than promises
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement) => (
              <div key={achievement.label} className="text-center p-6">
                <p className="text-4xl md:text-5xl font-display font-bold text-[var(--gold-primary)] mb-2">
                  {achievement.number}
                </p>
                <p className="text-lg font-semibold text-[var(--navy-deep)] mb-1">{achievement.label}</p>
                <p className="text-sm text-[var(--gray-500)]">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Journey of Service
            </h2>
            <p className="text-lg text-[var(--gray-600)]">
              A timeline of dedication to the people of Jigawa
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--gold-primary)] to-[var(--gold-light)]" />

              {/* Timeline Items */}
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={item.year} className="relative flex gap-8">
                    {/* Icon */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.highlight
                        ? 'bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] shadow-lg shadow-[var(--gold-primary)]/30'
                        : 'bg-white border-2 border-[var(--gold-primary)]'
                    }`}>
                      <item.icon className={`w-6 h-6 ${item.highlight ? 'text-white' : 'text-[var(--gold-primary)]'}`} />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pt-2 ${index !== timeline.length - 1 ? 'pb-8' : ''}`}>
                      <span className="inline-block px-3 py-1 bg-[var(--gold-light)] text-[var(--gold-dark)] text-sm font-semibold rounded-full mb-2">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">{item.title}</h3>
                      <p className="text-[var(--gray-600)]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Family Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--navy-deep)] mb-6">
                Family & Personal Life
              </h2>
              <div className="space-y-4 text-[var(--gray-600)] leading-relaxed">
                <p>
                  Alhaji Musa Danladi is married to Hajiya Amina Musa Danladi, an educator and
                  advocate for women&apos;s empowerment. Together they have four children and are
                  proud grandparents.
                </p>
                <p>
                  Despite the demands of public office, he maintains a deep connection to his roots,
                  regularly visiting his hometown of Dutse and maintaining the values instilled by
                  his parents.
                </p>
                <p>
                  An avid reader and lifelong learner, he believes that leadership requires constant
                  growth and adaptation. He is also a passionate advocate for traditional Nigerian
                  culture and the preservation of our heritage.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)] rounded-xl flex items-center justify-center">
                <div className="text-center text-[var(--gray-400)]">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Family Photo</p>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)] rounded-xl flex items-center justify-center mt-8">
                <div className="text-center text-[var(--gray-400)]">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Community Event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--navy-deep)] to-[var(--navy-royal)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Join the Movement
            </h2>
            <p className="text-xl text-[var(--gray-300)] mb-8">
              Be part of the team building a brighter future for Jigawa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-involved" className="btn-primary">
                Volunteer Today
              </Link>
              <Link href="/donate" className="btn-secondary border-white text-white hover:bg-white hover:text-[var(--navy-deep)]">
                Make a Donation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--navy-deep)] text-white py-16">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <p className="font-display font-bold text-lg">Musa Danladi</p>
                  <p className="text-xs text-[var(--gray-400)]">For Jigawa 2027</p>
                </div>
              </div>
              <p className="text-[var(--gray-400)] text-sm mb-4">
                Leadership that delivers. Join us in building a prosperous, inclusive Jigawa.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--gold-primary)] transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                {['About', 'Vision', 'Scorecard', 'News', 'Events'].map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase()}`} className="hover:text-[var(--gold-primary)] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Involved */}
            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                {['Volunteer', 'Donate', 'Host an Event', 'Become a Member'].map((link) => (
                  <li key={link}>
                    <Link href="/get-involved" className="hover:text-[var(--gold-primary)] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-[var(--gray-400)]">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>123 Campaign HQ, Dutse, Jigawa</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>+234 800 123 4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>contact@musadanladi.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>WhatsApp: +234 800 123 4568</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--gray-500)]">
              © 2026 Musa Danladi Campaign. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[var(--gray-500)]">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
