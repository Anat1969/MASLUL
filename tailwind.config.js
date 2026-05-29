/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#EAE5D9',
          800: '#2E2B25',
          900: '#1C1A16',
        },
        journal: {
          ochre: '#C2843E',
          sage: '#4D7C5D',
          clay: '#C86A4B',
          charcoal: '#2D3033'
        }
      },
      fontFamily: {
        serif: ['Secular One', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
