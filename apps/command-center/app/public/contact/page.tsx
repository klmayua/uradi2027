'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowLeft,
  Send,
  Clock,
  User,
  Building2,
  Mic,
  Paperclip,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useContactForm, useChatbot, useOffices } from '@/hooks/usePublicApi';

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

// Office locations
const offices = [
  {
    name: 'Campaign Headquarters',
    address: '123 Main Street, Dutse, Jigawa State',
    phone: '+234 800 123 4567',
    email: 'hq@musadanladi.com',
    hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
    type: 'headquarters',
  },
  {
    name: 'Hadejia Office',
    address: '45 Emir Road, Hadejia, Jigawa State',
    phone: '+234 800 123 4568',
    email: 'hadejia@musadanladi.com',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    type: 'regional',
  },
  {
    name: 'Birnin Kudu Office',
    address: '78 Market Road, Birnin Kudu, Jigawa State',
    phone: '+234 800 123 4569',
    email: 'bkudu@musadanladi.com',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    type: 'regional',
  },
  {
    name: 'Gumel Office',
    address: '12 Central Avenue, Gumel, Jigawa State',
    phone: '+234 800 123 4570',
    email: 'gumel@musadanladi.com',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    type: 'regional',
  },
];

// Contact methods
const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    value: '+234 800 123 4567',
    description: 'Call us Mon-Fri, 8am-6pm',
    action: 'tel:+2348001234567',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@musadanladi.com',
    description: 'We reply within 24 hours',
    action: 'mailto:contact@musadanladi.com',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+234 800 123 4568',
    description: 'Chat with us anytime',
    action: 'https://wa.me/2348001234568',
  },
];

// Social media
const socialLinks = [
  { icon: Facebook, name: 'Facebook', url: '#', followers: '45K+' },
  { icon: Twitter, name: 'Twitter', url: '#', followers: '32K+' },
  { icon: Instagram, name: 'Instagram', url: '#', followers: '28K+' },
  { icon: Youtube, name: 'YouTube', url: '#', followers: '15K+' },
];

// Press contact
const pressContact = {
  name: 'Ibrahim Abdullahi',
  title: 'Director of Communications',
  email: 'press@musadanladi.com',
  phone: '+234 800 123 4571',
};

// Chatbot quick replies
const quickReplies = [
  'What are your policies?',
  'How can I volunteer?',
  'Where do I vote?',
  'Upcoming events?',
  'Make a donation',
];

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m the Musa Danladi Campaign Assistant. How can I help you today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  // API hooks
  const contactMutation = useContactForm();
  const chatbotMutation = useChatbot();
  const { data: officesData, isLoading: officesLoading } = useOffices();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');

    try {
      const response = await chatbotMutation.mutateAsync({
        message: userMessage,
        session_id: sessionId,
      });

      // Save session ID for continued conversation
      if (response?.session_id) {
        setSessionId(response.session_id);
      }

      setChatMessages(prev => [...prev, { type: 'bot', text: response?.message || 'Thank you for your message.' }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again later.' }]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--gray-200)]">
        <div className="container-premium">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-[var(--navy-deep)] text-lg leading-tight">Musa Danladi</p>
                <p className="text-xs text-[var(--gray-500)]">For Jigawa 2027</p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.href === '/contact'
                      ? 'text-[var(--gold-primary)]'
                      : 'text-[var(--gray-700)] hover:text-[var(--gold-primary)]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link href="/get-involved" className="btn-secondary text-sm py-2.5 px-5">
                Volunteer
              </Link>
              <Link href="/donate" className="btn-primary text-sm py-2.5 px-5">
                Donate
              </Link>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--gray-200)]">
            <div className="container-premium py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-[var(--gray-700)] hover:text-[var(--gold-primary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-royal)] to-[var(--navy-deep)]">
        <div className="container-premium">
          <div className="max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--gold-light)] hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-[var(--gray-300)]">
              We\'d love to hear from you. Reach out through any of our channels or visit an office near you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.action}
                className="card-premium p-6 hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <method.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-1">{method.title}</h3>
                <p className="text-[var(--gold-primary)] font-medium mb-2">{method.value}</p>
                <p className="text-sm text-[var(--gray-500)]">{method.description}</p>
              </a>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-6">Send us a Message</h2>

              {isSubmitted ? (
                <div className="card-premium p-8 text-center">
                  <div className="w-16 h-16 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">Message Sent!</h3>
                  <p className="text-[var(--gray-600)] mb-6">Thank you for reaching out. We\'ll get back to you within 24 hours.</p>
                  <button onClick={() => setIsSubmitted(false)} className="btn-secondary">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-premium p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Email *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Subject *</label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      >
                        <option value="">Select a subject...</option>
                        <option value="general">General Inquiry</option>
                        <option value="volunteer">Volunteering</option>
                        <option value="donate">Donation</option>
                        <option value="event">Events</option>
                        <option value="press">Press/Media</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                  {contactMutation.isError && (
                    <p className="text-red-500 text-sm text-center">
                      Failed to send message. Please try again.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Office Locations */}
            <div>
              <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-6">Our Offices</h2>
              {officesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {officesData?.items?.map((office: any) => (
                    <div key={office.id} className="card-premium p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--gold-light)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-[var(--gold-dark)]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[var(--navy-deep)]">{office.name}</h3>
                            {office.type === 'headquarters' && (
                              <span className="px-2 py-0.5 bg-[var(--gold-primary)] text-white text-xs rounded-full">HQ</span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-[var(--gray-600)]">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[var(--gray-400)]" />
                              {office.address}
                            </p>
                            {office.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[var(--gray-400)]" />
                                {office.phone}
                              </p>
                            )}
                            {office.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[var(--gray-400)]" />
                                {office.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">Press Inquiries</h2>
            <p className="text-[var(--gray-600)] mb-8">
              For media requests, interviews, and press materials, please contact our Communications Director.
            </p>

            <div className="card-premium p-8 inline-block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--navy-deep)] text-lg">{pressContact.name}</p>
                  <p className="text-[var(--gray-600)]">{pressContact.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <a href={`mailto:${pressContact.email}`} className="text-[var(--gold-primary)] hover:underline">
                      {pressContact.email}
                    </a>
                    <span className="text-[var(--gray-400)]">|</span>
                    <a href={`tel:${pressContact.phone}`} className="text-[var(--gold-primary)] hover:underline">
                      {pressContact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">Connect With Us</h2>
            <p className="text-[var(--gray-600)]">
              Follow us on social media for the latest updates, behind-the-scenes content, and campaign news.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                className="card-premium p-6 text-center hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <social.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--navy-deep)] mb-1">{social.name}</h3>
                <p className="text-sm text-[var(--gray-500)]">{social.followers} followers</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden border border-[var(--gray-200)]">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[var(--navy-deep)] to-[var(--navy-royal)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Campaign Assistant</p>
                  <p className="text-xs text-white/70">Online</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[var(--gray-50)]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.type === 'user'
                      ? 'bg-[var(--navy-royal)] text-white rounded-br-none'
                      : 'bg-white text-[var(--gray-700)] rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-[var(--gray-200)] flex gap-2 overflow-x-auto">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => {
                    setChatInput(reply);
                    handleChatSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="px-3 py-1 bg-[var(--gray-100)] text-[var(--gray-700)] text-xs rounded-full whitespace-nowrap hover:bg-[var(--gold-light)] hover:text-[var(--gold-dark)] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-[var(--gray-200)] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                disabled={chatbotMutation.isPending}
                className="flex-1 px-4 py-2 border border-[var(--gray-300)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)] text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatbotMutation.isPending || !chatInput.trim()}
                className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center text-white hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {chatbotMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[var(--navy-deep)] text-white py-16">
        <div className="container-premium">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <p className="font-display font-bold">Musa Danladi</p>
                  <p className="text-xs text-[var(--gray-400)]">For Jigawa 2027</p>
                </div>
              </div>
              <p className="text-[var(--gray-400)] text-sm">
                Leadership that delivers. Join us in building a prosperous, inclusive Jigawa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/vision">Vision</Link></li>
                <li><Link href="/scorecard">Scorecard</Link></li>
                <li><Link href="/news">News</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                <li><Link href="/get-involved">Volunteer</Link></li>
                <li><Link href="/donate">Donate</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-[var(--gray-400)]">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dutse, Jigawa</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +234 800 123 4567</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@musadanladi.com</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-[var(--gray-500)]">
            © 2026 Musa Danladi Campaign. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
