/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50: "#fff8ed",
          100: "#ffefd6",
          200: "#ffd9a8",
          300: "#ffbe70",
          400: "#ff9e38",
          500: "#ff7900", // Primary orange
          600: "#e66700",
          700: "#cc5a00",
          800: "#a34700",
          900: "#853c00",
          950: "#4c2000",
        },
        purple: {
          50: "#f5f1ff",
          100: "#ede5ff",
          200: "#dccbff",
          300: "#c3a4ff",
          400: "#a979ff",
          500: "#914cff",
          600: "#7c3aed", // Primary purple
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
      },
      fontFamily: {
        halloween: ["Creepster", "cursive"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "spooky-pattern": "url('/src/assets/spooky-pattern.svg')",
        "spider-web": "url('/src/assets/web.svg')",
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "bounce-slow": "bounce 3s infinite",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        gradient: "gradient 15s ease infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      boxShadow: {
        glow: "0 0 15px rgba(255, 121, 0, 0.4)",
        "glow-purple": "0 0 15px rgba(124, 58, 237, 0.4)",
      },
      textShadow: {
        glow: "0 0 10px rgba(255, 121, 0, 0.7)",
        "glow-purple": "0 0 10px rgba(124, 58, 237, 0.7)",
        halloween:
          "2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 154, 0, 0.5)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-glow": {
          textShadow: "0 0 10px rgba(255, 121, 0, 0.7)",
        },
        ".text-shadow-glow-purple": {
          textShadow: "0 0 10px rgba(124, 58, 237, 0.7)",
        },
        ".text-shadow-halloween": {
          textShadow:
            "2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 154, 0, 0.5)",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
