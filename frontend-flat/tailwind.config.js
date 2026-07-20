/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#F6F6F8',
          100: '#E8E9ED',
          200: '#C7C9D3',
          300: '#9EA1B0',
          400: '#6B6E80',
          500: '#4A4D5E',
          600: '#34364280',
          700: '#24252F',
          800: '#1A1B22',
          900: '#121218',
          950: '#0B0B0F',
        },
        signal: {
          DEFAULT: '#D4A65A',
          soft: '#E8CD9A',
          deep: '#A67C36',
        },
        mint: {
          DEFAULT: '#4FD1AE',
          soft: '#8FE5CC',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        blink: 'blink 1.2s infinite',
      },
    },
  },
  plugins: [],
}
