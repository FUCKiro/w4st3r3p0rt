/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#1a1a1a',
          lighter: '#2a2a2a',
          darker: '#0a0a0a'
        }
      }
    },
  },
  plugins: [],
}