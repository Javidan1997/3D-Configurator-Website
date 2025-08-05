/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B0B12",
        accent: "#00E0FF",
        surface: "#0F1020",
        muted: "#8A8F98",
      },
      boxShadow: {
        glow: "0 0 40px rgba(0,224,255,0.35)",
      }
    },
  },
  plugins: [],
}
