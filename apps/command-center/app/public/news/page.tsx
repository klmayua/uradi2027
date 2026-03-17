'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Share2,
  Bookmark,
  Eye,
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

// Categories
const categories = [
  { id: 'all', name: 'All News', count: 24 },
  { id: 'policy', name: 'Policy', count: 8 },
  { id: 'events', name: 'Events', count: 6 },
  { id: 'press', name: 'Press Releases', count: 5 },
  { id: 'community', name: 'Community', count: 5 },
];

// News articles
const newsArticles = [
  {
    id: 1,
    title: 'Free Primary Education Initiative Launches',
    excerpt: 'Over 45,000 children enrolled in the first month of our free education program, with new schools opening across all LGAs.',
    category: 'policy',
    date: 'March 15, 2026',
    readTime: '3 min read',
    author: 'Campaign Team',
    image: 'education',
    featured: true,
    views: 1247,
  },
  {
    id: 2,
    title: 'Healthcare Center Upgrades Complete in Dutse',
    excerpt: 'Five primary healthcare centers in Dutse LGA now equipped with modern medical equipment and staffed with trained personnel.',
    category: 'policy',
    date: 'March 12, 2026',
    readTime: '2 min read',
    author: 'Health Desk',
    image: 'healthcare',
    featured: false,
    views: 892,
  },
  {
    id: 3,
    title: 'Town Hall Meeting: Governor Listens to Citizens',
    excerpt: 'Over 500 residents attended the monthly town hall to share concerns and feedback directly with the Governor.',
    category: 'events',
    date: 'March 10, 2026',
    readTime: '4 min read',
    author: 'Communications Team',
    image: 'event',
    featured: false,
    views: 756,
  },
  {
    id: 4,
    title: 'Road Construction Progress: 234km Completed',
    excerpt: 'Major infrastructure milestone reached as 234km of rural roads are completed, connecting previously isolated communities.',
    category: 'policy',
    date: 'March 8, 2026',
    readTime: '3 min read',
    author: 'Infrastructure Desk',
    image: 'infrastructure',
    featured: false,
    views: 623,
  },
  {
    id: 5,
    title: 'Youth Employment Program Creates 5,000 New Jobs',
    excerpt: 'Tech sector initiative provides training and placement for young people across Jigawa State.',
    category: 'policy',
    date: 'March 5, 2026',
    readTime: '3 min read',
    author: 'Youth Desk',
    image: 'youth',
    featured: false,
    views: 1089,
  },
  {
    id: 6,
    title: 'International Development Partners Visit Jigawa',
    excerpt: 'Delegation from World Bank impressed by transparency and progress in governance scorecard implementation.',
    category: 'press',
    date: 'March 3, 2026',
    readTime: '2 min read',
    author: 'Press Office',
    image: 'partners',
    featured: false,
    views: 445,
  },
];

// Featured article
const featuredArticle = newsArticles.find((a) => a.featured);

export default function NewsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = newsArticles.filter((article) => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                    item.href === '/news'
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
              News & Updates
            </h1>
            <p className="text-xl text-[var(--gray-300)]">
              Stay informed about our campaign, policies, and progress.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="sticky top-20 z-40 bg-white border-b shadow-sm">
        <div className="container-premium">
          <div className="py-4 space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--gray-400)]" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
              />
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto gap-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[var(--navy-deep)] text-white'
                      : 'bg-[var(--gray-100)] text-[var(--gray-700)] hover:bg-[var(--gray-200)]'
                  }`}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === cat.id ? 'bg-white/20' : 'bg-[var(--gray-200)]'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && activeCategory === 'all' && !searchQuery && (
        <section className="section-padding pb-0">
          <div className="container-premium">
            <div className="card-premium overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-dark)] flex items-center justify-center">
                  <div className="text-center text-white">
                    <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Featured Image</p>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[var(--gold-light)] text-[var(--gold-dark)] text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-[var(--gray-100)] text-[var(--gray-600)] text-sm rounded-full capitalize">
                      {featuredArticle.category}
                    </span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-[var(--gray-600)] mb-6">{featuredArticle.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-[var(--gray-500)] mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredArticle.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{featuredArticle.views.toLocaleString()} views</span>
                    </div>
                  </div>

                  <button className="btn-primary inline-flex items-center gap-2">
                    Read Full Story
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.filter((a) => !a.featured || activeCategory !== 'all' || searchQuery).map((article) => (
              <article key={article.id} className="card-premium overflow-hidden group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-[var(--gray-200)] to-[var(--gray-300)] flex items-center justify-center">
                  <div className="text-center text-[var(--gray-400)]">
                    <Tag className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">{article.category}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-[var(--gray-100)] text-[var(--gray-600)] text-xs rounded-full capitalize">
                      {article.category}
                    </span>
                    <span className="text-xs text-[var(--gray-400)]">{article.readTime}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--navy-deep)] mb-2 group-hover:text-[var(--gold-primary)] transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-sm text-[var(--gray-600)] mb-4 line-clamp-2">{article.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-[var(--gray-500)]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="hover:text-[var(--gold-primary)]">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="hover:text-[var(--gold-primary)]">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[var(--gray-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[var(--gray-400)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--navy-deep)] mb-2">No articles found</h3>
              <p className="text-[var(--gray-600)]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-[var(--off-white)]">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-[var(--navy-deep)] mb-4">
              Stay Updated
            </h2>
            <p className="text-[var(--gray-600)] mb-8">
              Subscribe to our newsletter for the latest news and updates delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-[var(--gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-primary)]"
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

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
                <li><Link href="/get-involved">Host Event</Link></li>
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
