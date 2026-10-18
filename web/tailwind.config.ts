import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        docker: { blue: "#1D63ED", dark: "#0B214A", navy: "#071340", sky: "#E8F0FE" },
        ink: "#0B1120",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(29,99,237,0.30)",
        card: "0 1px 2px rgba(16,24,40,0.06), 0 8px 24px -12px rgba(16,24,40,0.12)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: { blink: "blink 1s step-end infinite", floaty: "floaty 6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
