import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#0b57d0', // Material Primary Blue
          700: '#0842a0', // Primary Hover
          800: '#063278',
          900: '#041e49',
        },
        md: {
          primary: '#0b57d0',
          'on-primary': '#ffffff',
          'primary-container': '#d3e3fd',
          'on-primary-container': '#041e49',
          surface: '#ffffff',
          'surface-dim': '#f8f9fa',
          'surface-container-low': '#f7f9fc',
          'surface-container': '#f0f4f9',
          'surface-container-high': '#e9eef6',
          'surface-container-highest': '#e3e8f0',
          outline: '#c4c7c5',
          'outline-variant': '#e0e2ec',
          'on-surface': '#1f1f1f',
          'on-surface-variant': '#444746',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'm3-1': '0 1px 3px 1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'm3-2': '0 2px 6px 2px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'm3-3': '0 4px 12px 3px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
