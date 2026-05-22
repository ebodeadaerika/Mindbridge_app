import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // MindBridge Design System — exact tokens from Figma
        background: '#0D0F14',
        surface: '#161B22',
        'surface-elevated': '#1E2530',
        primary: '#00C9A7',
        'primary-dark': '#00A88A',
        secondary: '#7B61FF',
        danger: '#FF5C5C',
        warning: '#FFB347',
        success: '#00C9A7',
        'text-primary': '#F0F2F5',
        'text-secondary': '#8B949E',
        border: '#30363D',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        input: '14px',
        pill: '50px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00C9A7 0%, #7B61FF 100%)',
        'gradient-teal': 'linear-gradient(135deg, #00C9A7 0%, #00A88A 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
