/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#34D399",
          dark: "#10B981",
          bg: "#064E3B",
        },
        accent: {
          green: "#34D399",
          pink: "#FF4D8D",
        },
        slate: {
          850: "#172033",
          950: "#0B1120",
        },
      },
    },
  },
  plugins: [],
}
