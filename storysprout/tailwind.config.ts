import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // StorySprout Brand Colors
        sprout: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        story: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Age-appropriate palettes
        'early-childhood': {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#FFE66D',
        },
        'elementary': {
          primary: '#6C5CE7',
          secondary: '#00CEC9',
          accent: '#FDCB6E',
        },
        'middle-school': {
          primary: '#0984E3',
          secondary: '#00B894',
          accent: '#E17055',
        },
        'high-school': {
          primary: '#2D3436',
          secondary: '#636E72',
          accent: '#74B9FF',
        },
      },
      fontFamily: {
        'display': ['var(--font-display)', 'system-ui', 'sans-serif'],
        'reading': ['var(--font-reading)', 'Georgia', 'serif'],
        'dyslexic': ['OpenDyslexic', 'Comic Sans MS', 'sans-serif'],
      },
      fontSize: {
        // Reading-optimized sizes
        'reading-sm': ['1rem', { lineHeight: '1.75' }],
        'reading-base': ['1.125rem', { lineHeight: '1.8' }],
        'reading-lg': ['1.25rem', { lineHeight: '1.85' }],
        'reading-xl': ['1.5rem', { lineHeight: '1.9' }],
        'reading-2xl': ['1.75rem', { lineHeight: '2' }],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'page-turn': 'pageTurn 0.6s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-180deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
