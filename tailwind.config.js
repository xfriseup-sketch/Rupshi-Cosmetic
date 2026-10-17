/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      lineClamp: {
        2: "2",
      },
      colors: {
        primary: {
          DEFAULT: "#db2777",
          light: "#fbcfe8",
          dark: "#9d174d",
        },
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translate(-50%, 1rem)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.3s ease-out",
        "confetti-fall": "confetti-fall 4s linear infinite",
        "pop-in": "pop-in 0.5s ease-out both",
        "fade-up": "fade-up 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};
