/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { 
    extend: {
      colors: {
        // AurenWorks Brand Colors
        auren: {
          gold: '#FFD166',      // Primary "Auren Gold" - Warm golden-yellow
          slate: '#2F2F3A',     // Secondary Deep Slate - Dark neutral
          ember: '#F25C54',     // Accent Ember - Fiery accent
          sky: '#06AED5',       // Accent Sky - Cool counterpoint
        },
        // Semantic color mappings
        primary: {
          DEFAULT: '#FFD166',
          foreground: '#2F2F3A',
        },
        secondary: {
          DEFAULT: '#2F2F3A',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F25C54',
          secondary: '#06AED5',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FA',
          dark: '#2F2F3A',
        },
        foreground: {
          DEFAULT: '#2F2F3A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          secondary: '#D1D5DB',
        },
        success: {
          DEFAULT: '#10B981',
          background: '#D1FAE5',
          foreground: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          background: '#FEF3C7',
          foreground: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444',
          background: '#FEE2E2',
          foreground: '#991B1B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'auren': '0 4px 6px -1px rgba(47, 47, 58, 0.1), 0 2px 4px -1px rgba(47, 47, 58, 0.06)',
        'auren-lg': '0 10px 15px -3px rgba(47, 47, 58, 0.1), 0 4px 6px -2px rgba(47, 47, 58, 0.05)',
      },
    }
  },
  plugins: [],
};
