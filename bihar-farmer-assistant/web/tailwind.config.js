/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        leaf: { 50: '#f0f7ec', 100: '#dcefd2', 600: '#2f7d32', 700: '#256628', 800: '#1b4d1e', 900: '#123614' },
        soil: { 50: '#fbf6ee', 100: '#f3e6cf', 700: '#7a4b1c', 900: '#3d2610' },
        sun: { 400: '#f5b800', 500: '#e0a100' },
      },
      fontFamily: { sans: ['"Noto Sans Devanagari"', '"Mukta"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
