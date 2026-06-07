/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#102033',
        muted: '#64748b',
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          500: '#5b7cfa',
          600: '#435ee8',
          700: '#3343c5'
        },
        mint: '#12b886',
        coral: '#fb7185',
        amber: '#f59e0b'
      },
      boxShadow: {
        glass: '0 24px 80px rgba(37, 56, 111, 0.16)',
        glow: '0 18px 60px rgba(91, 124, 250, 0.22)'
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        sheen: 'sheen 5s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' }
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' }
        }
      }
    }
  },
  plugins: []
};
