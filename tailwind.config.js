/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F5ECE1',
          300: '#EFE1CF',
          400: '#E4CFB5',
          500: '#D8BC98',
          DEFAULT: '#FAF6F0',
        },
        gold: {
          100: '#FBF7EE',
          200: '#F5ECD7',
          300: '#EAD9B5',
          400: '#DCC38C',
          500: '#C8A951',
          600: '#AD8B38',
          700: '#8A6D2A',
          DEFAULT: '#C8A951',
        },
        charcoal: {
          800: '#262628',
          900: '#161617',
          950: '#0E0E0F',
          DEFAULT: '#161617',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(22, 22, 23, 0.06)',
        'luxury-hover': '0 20px 40px -15px rgba(22, 22, 23, 0.12)',
        'luxury-card': '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spinSlow 12s linear infinite',
      }
    },
  },
  plugins: [],
}
