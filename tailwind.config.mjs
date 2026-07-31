/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    rtl: true,
    darkTheme: false,
    themes: [
      {
        taganeh: {
          primary: "#16a34a",
          "primary-content": "#ffffff",
          secondary: "#06b6d4",
          "secondary-content": "#083344",
          accent: "#84cc16",
          "accent-content": "#1a2e05",
          neutral: "#1f2937",
          "neutral-content": "#f8fafc",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "base-content": "#0f172a",
          info: "#0ea5e9",
          success: "#16a34a",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "light",
    ],
  },
};

