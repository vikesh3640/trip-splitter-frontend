/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 6px 18px rgba(0,0,0,0.08)"
      },
      colors: {
        brand: { teal: "#23A094" }
      }
    }
  },
  plugins: []
};
