/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./login.html",
    "./signup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bee-yellow': '#FFD700',
        'bee-dark-yellow': '#FFC107',
        'bee-black': '#1A1A1A',
        'bee-gray': '#2D2D2D',
        'bee-light-gray': '#F5F5F5',
        'bee-white': '#FFFFFF'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
}