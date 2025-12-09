/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#21c884",
        "primary-light": "#8de4bc",
        "primary-hover": "#1bb173",
      },
      borderRadius: {
        xl: "18px",
      },
      maxWidth: {
        'mobile': '480px',
        'desktop': '720px',
      }
    },
  },
  plugins: [],
};
