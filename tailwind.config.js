/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/app.js"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#17324D",
          deep: "#0F2438",
          soft: "#23435F",
        },
        cream: "#F7F7F4",
        copper: {
          DEFAULT: "#C47B43",
          soft: "#DDA06F",
          dark: "#9F5A2C",
        },
        ink: "#252B33",
      },
      fontFamily: {
        sans: ['"Manrope"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', '"Arial Narrow"', "Arial", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      opacity: {
        8: "0.08",
        10: "0.1",
        12: "0.12",
        15: "0.15",
        20: "0.2",
        25: "0.25",
        28: "0.28",
        30: "0.3",
        32: "0.32",
        35: "0.35",
        38: "0.38",
        42: "0.42",
        45: "0.45",
        48: "0.48",
        52: "0.52",
        55: "0.55",
        58: "0.58",
        62: "0.62",
        65: "0.65",
        68: "0.68",
        72: "0.72",
        78: "0.78",
        82: "0.82",
        85: "0.85",
        88: "0.88",
        92: "0.92",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 36, 56, 0.10)",
      },
    },
  },
  plugins: [],
};
