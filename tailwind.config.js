/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 16px 60px rgba(79, 70, 229, 0.18)"
      }
    }
  },
  plugins: []
};
