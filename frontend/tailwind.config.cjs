/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        moon: {
          bg: '#0D0D0D',
          primary: '#00AEEF',
          secondary: '#8A2BE2',
          card: '#151515',
          border: '#1f1f1f',
        },
      },
      boxShadow: {
        moon: '0 0 24px rgba(0, 174, 239, 0.15), 0 0 24px rgba(138, 43, 226, 0.08)',
        soft: '0 6px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
