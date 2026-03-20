/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'uradi-gold': '#D4AF37',
        'uradi-gold-light': '#E5C158',
        'uradi-gold-dark': '#B8962E',
        'uradi-bg-primary': '#0B1120',
        'uradi-bg-secondary': '#111827',
        'uradi-bg-tertiary': '#1F2937',
        'uradi-text-primary': '#F9FAFB',
        'uradi-text-secondary': '#9CA3AF',
        'uradi-text-tertiary': '#6B7280',
        'uradi-border': '#374151',
        'uradi-status-success': '#10B981',
        'uradi-status-critical': '#EF4444',
        'uradi-status-warning': '#F59E0B',
        'uradi-status-info': '#3B82F6',
        'uradi-status-neutral': '#6B7280',
        'uradi-status-positive': '#10B981',
        'uradi-party-pdp': '#DC2626',
        'uradi-party-apc': '#1E40AF',
        'uradi-party-nnpp': '#7C3AED',
        'uradi-party-adc': '#059669',
      },
    },
  },
  plugins: [],
};
