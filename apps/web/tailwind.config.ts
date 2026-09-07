import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pos: {
          bg: '#0B0F17',
          surface: '#131B2A',
          card: '#1B2436',
          border: '#2A364F',
          primary: '#10B981',      // Emerald vibrancy
          primaryHover: '#059669',
          accent: '#6366F1',       // Indigo highlight
          warning: '#F59E0B',
          danger: '#EF4444',
          muted: '#94A3B8',
          text: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-accent': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
