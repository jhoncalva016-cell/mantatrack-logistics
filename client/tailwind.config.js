/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#101826',
          800: '#182234',
          700: '#22304a',
        },
        amber: {
          DEFAULT: '#F5A623',
          50: '#FFF7E8',
          100: '#FFEBC2',
          500: '#F5A623',
          600: '#D98C0F',
        },
        ocean: {
          50: '#EEF5FB',
          100: '#DCEBF7',
          500: '#1D6FA5',
          700: '#144E76',
        },
        alertred: '#DC3B33',
        alertamber: '#E8A020',
        alertgreen: '#1E9E5A',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 38, 0.04), 0 4px 16px rgba(16, 24, 38, 0.06)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
}

