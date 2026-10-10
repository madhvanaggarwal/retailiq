/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDFA',
          100: '#EEF4F4',
          200: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0B4F5C',
          800: '#083B45',
          900: '#1B2A2F',
          coral: '#E4572E',
          sea: '#5FA8A0',
          amber: '#F59E0B'
        },
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
