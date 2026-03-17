'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle,
  Share2,
  Video,
  Mic,
  UserPlus,
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

// Event categories
const eventCategories = [
  { id: 'all', name: 'All Events' },
  { id: 'rally', name: 'Rallies' },
  { id: 'townhall', name: 'Town Halls' },
  { id: 'fundraiser', name: 'Fundraisers' },
  { id: 'volunteer', name: 'Volunteer Events' },
  { id: 'virtual', name: 'Virtual' },
];

// Events data
const events = [
  {
    id: 1,
    title: 'Jigawa Unity Rally',
    category: 'rally',
    date: '2026-03-25',
    time: '14:00',
    location: 'Dutse Stadium',
    address: 'Dutse, Jigawa State',
    description: 'Join thousands of supporters for our biggest rally yet. Music, speeches, and community celebration.',
    image: 'rally',
    attendees: 2500,
    maxAttendees: 5000,
    rsvpOpen: true,
    featured: true,
  },
  {
    id: 2,
    title: 'Town Hall: Education Reform',
    category: 'townhall',
    date: '2026-03-28',
    time: '10:00',
    location: 'Jigawa State Polytechnic',
    address: 'Birnin Kudu, Jigawa State',
    description: 'An open discussion on our education initiatives. Parents, teachers, and students welcome.',
    image: 'townhall',
    attendees: 180,
    maxAttendees: 300,
    rsvpOpen: true,
    featured: false,
  },
  {
    id: 3,
    title: 'Youth Empowerment Summit',
    category: 'volunteer',
    date: '2026-04-02',
    time: '09:00',
    location: 'Youth Center',
    address: 'Hadejia, Jigawa State',
    description: 'Skills training, job fair, and networking for young professionals and entrepreneurs.',
    image: 'youth',
    attendees: 450,
    maxAttendees: 600,
    rsvpOpen: true,
    featured: false,
  },
  {
    id: 4,
    title: 'Virtual Policy Briefing',
    category: 'virtual',
    date: '2026-04-05',
    time: '19:00',
    location: 'Online (Zoom)',
    address: 'Virtual Event',
    description: 'Join us online for a detailed presentation on our economic development plan. Q&A session included.',
    image: 'virtual',
    attendees: 320,
    maxAttendees: 1000,
    rsvpOpen: true,
    featured: false,
  },
  {
    id: 5,
    title: 'Farmers Forum',
    category: 'townhall',
    date: '2026-04-08',
    time: '09:00',
    location: 'Agricultural Center',
    address: 'Gumel, Jigawa State',
    description: 'Discussing agricultural support programs, equipment distribution, and market access.',
    image: 'agriculture',
    attendees: 280,
    maxAttendees: 400,
    rsvpOpen: true,
    featured: false,
  },
  {
    id: 6,
    title: 'Fundraising Dinner',
    category: 'fundraiser',
    date: '2026-04-12',
    time: '18:00',
    location: 'Grand Hotel',
    address: 'Dutse, Jigawa State',
    description: 'An evening of inspiration and support. Keynote address by the candidate.',
    image: 'dinner',
    attendees: 150,
    maxAttendees: 200,
    rsvpOpen: true,
    featured: false,
  },
];

// Past events
const pastEvents = [
  {
    id: 101,
    title: 'Campaign Launch',
    date: '2026-02-15',
    location: 'Dutse Stadium',
    attendees: 5000,
    hasVideo: true,
  },
  {
    id: 102,
    title: 'Women in Leadership Forum',
    date: '2026-02-28',
    location: 'Community Center',
    attendees: 800,
    hasVideo: true,
  },
  {
    id: 103,
    title: 'Healthcare Workers Meeting',
    date: '2026-03-05',
    location: 'General Hospital',
    attendees: 350,
    hasVideo: false,
  },
];

// Host event form
const hostEventTypes = [
  'House Meeting',
  'Community Forum',
  'Fundraising Event',
  'Volunteer Training',
  'Voter Registration Drive',
  'Other',
];

export default function EventsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpEvent, setRsvpEvent] = useState<typeof events[0] | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [showHostForm, setShowHostForm] = useState(false);

  const filteredEvents = events.filter((event) => {
    const matchesCategory = activeCategory === 'all' || event.category === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredEvent = events.find((e) => e.featured);

  const handleRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSuccess(true);
    setTimeout(() => {
      setRsvpEvent(null);
      setRsvpSuccess(false);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      weekday: date.toLocaleString('en-US', { weekday: 'long' }),
      full: date.toLocaleDateString('en-US', { dateStyle: 'long' }),
    };
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
                    item.href === '/events'
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
              Events & Appearances
            </h1>
            <p className="text-xl text-[var(--gray-300)]">
              Join us at upcoming events across Jigawa. Meet the candidate, connect with supporters, and be part of the movement.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="section-padding pb-0">
          <div className="container-premium">
            <div className="card-premium overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] flex items-center justify-center">
                  <div className="text-center text-white">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Featured Event</p>
                  </div>
                </div>
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[var(--gold-light)] text-[var(--gold-dark)] text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-[var(--gray-100)] text-[var(--gray-600)] text-sm rounded-full capitalize">
                      {featuredEvent.category}
                    </span>
                  </div>

                  <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">{featuredEvent.title}</h2>
                  <p className="text-[var(--gray-600)] mb-6">{featuredEvent.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-[var(--gray-700)]">
                      <Calendar className="w-5 h-5 text-[var(--gold-primary)]" />
                      <span>{formatDate(featuredEvent.date).full}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--gray-700)]">
                      <Clock className="w-5 h-5 text-[var(--gold-primary)]" />
                      <span>{featuredEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--gray-700)]">
                      <MapPin className="w-5 h-5 text-[var(--gold-primary)]" />
                      <span>{featuredEvent.location}, {featuredEvent.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--gray-700)]">
                      <Users className="w-5 h-5 text-[var(--gold-primary)]" />
                      <span>{featuredEvent.attendees} attending · {featuredEvent.maxAttendees - featuredEvent.attendees} spots left</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setRsvpEvent(featuredEvent)}
                    className="btn-primary"
                  >
                    RSVP Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter & Search */}
      <section className="sticky top-20 z-40 bg-white border-b shadow-sm">
        <div className="container-premium">
          <div className="py-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--gray-400)]" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                />
              </div>

              <button
                onClick={() => setShowHostForm(true)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Host an Event
              </button>
            </div>

            <div className="flex overflow-x-auto gap-2 no-scrollbar">
              {eventCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[var(--navy-deep)] text-white'
                      : 'bg-[var(--gray-100)] text-[var(--gray-700)] hover:bg-[var(--gray-200)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.filter((e) => !e.featured).map((event) => {
              const date = formatDate(event.date);
              return (
                <div key={event.id} className="card-premium overflow-hidden group">
                  <div className="aspect-video bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)] flex items-center justify-center">
                    <div className="text-center text-[var(--gray-400)]">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm capitalize">{event.category}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-[var(--gray-100)] text-[var(--gray-600)] text-xs rounded-full capitalize">
                        {event.category}
                      </span>
                      {event.attendees >= event.maxAttendees * 0.8 && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Almost Full
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2 group-hover:text-[var(--gold-primary)] transition-colors">{event.title}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
                        <Calendar className="w-4 h-4 text-[var(--gold-primary)]" />
                        <span>{date.month} {date.day}, {date.weekday}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
                        <Clock className="w-4 h-4 text-[var(--gold-primary)]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
                        <MapPin className="w-4 h-4 text-[var(--gold-primary)]" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--gray-500)]">{event.attendees} attending</span>
                      <button
                        onClick={() => setRsvpEvent(event)}
                        className="text-[var(--gold-primary)] font-medium hover:underline"
                      >
                        RSVP →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-[var(--gray-300)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">No events found</h3>
              <p className="text-[var(--gray-600)]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">Past Events</h2>
            <p className="text-[var(--gray-600)]">
              Missed an event? Watch recordings and view photos from past campaign events.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div key={event.id} className="card-premium p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[var(--gray-200)] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-[var(--navy-deep)]">{new Date(event.date).getDate()}</span>
                    <span className="text-xs text-[var(--gray-500)]">{new Date(event.date).toLocaleString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--navy-deep)] mb-1">{event.title}</h3>
                    <p className="text-sm text-[var(--gray-500)] mb-2">{event.location}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--gray-500)]">{event.attendees.toLocaleString()} attended</span>
                      {event.hasVideo && (
                        <button className="flex items-center gap-1 text-sm text-[var(--gold-primary)] hover:underline">
                          <Video className="w-4 h-4" />
                          Watch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      {rsvpEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {rsvpSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">You\'re Registered!</h3>
                <p className="text-[var(--gray-600)]">We\'ll send you a confirmation email with event details.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[var(--navy-deep)]">RSVP: {rsvpEvent.title}</h3>
                  <button onClick={() => setRsvpEvent(null)} className="p-2 hover:bg-[var(--gray-100)] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleRsvp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                      placeholder="+234 800 000 0000"
                    />
                  </div>

                  <div className="p-4 bg-[var(--gray-50)] rounded-lg">
                    <p className="text-sm text-[var(--gray-600)]">
                      <strong>Event Details:</strong><br />
                      {formatDate(rsvpEvent.date).full} at {rsvpEvent.time}<br />
                      {rsvpEvent.location}
                    </p>
                  </div>

                  <button type="submit" className="w-full btn-primary">
                    Confirm RSVP
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Host Event Modal */}
      {showHostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[var(--navy-deep)]">Host an Event</h3>
              <button onClick={() => setShowHostForm(false)} className="p-2 hover:bg-[var(--gray-100)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Email *</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Phone *</label>
                <input
                  required
                  type="tel"
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Event Type *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                >
                  <option value="">Select event type...</option>
                  {hostEventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Proposed Date *</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Location/Address *</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                  placeholder="Your address or venue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Expected Attendees *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                >
                  <option value="">Select range...</option>
                  <option value="10-20">10-20 people</option>
                  <option value="20-50">20-50 people</option>
                  <option value="50-100">50-100 people</option>
                  <option value="100+">100+ people</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--gray-700)] mb-1">Additional Information</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
                  placeholder="Tell us more about your event idea..."
                />
              </div>

              <button type="submit" className="w-full btn-primary">
                Submit Event Request
              </button>
            </form>
          </div>
        </div>
      )}

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
                <li><Link href="/events">Events</Link></li>
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
