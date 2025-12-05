/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B5D7FF',
        secondary: '#FFF9E9',
        accent: '#10B981',
      },
    },
  },
  plugins: [],
}
