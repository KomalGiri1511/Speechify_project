/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(-10px)" },
          "50%": { transform: "translateY(10px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 1 },
        },
      },
      animation: {
        gradientMove: "gradientMove 10s ease infinite",
        glow: "glow 4s ease-in-out infinite",
        bounceSlow: "bounceSlow 4s ease-in-out infinite",
        floatSlow: "floatSlow 6s ease-in-out infinite",
        spinSlow: "spinSlow 12s linear infinite",
        fadeIn: "fadeIn 1.2s ease-out forwards",
        pulseSlow: "pulseSlow 3s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 25px rgba(99, 102, 241, 0.4)",
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
};
