
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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