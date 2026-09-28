import type { Config } from "tailwindcss";
import {
  fontFamily,
  lineHeight,
  palette,
  radius,
  shadow,
  typeScale,
} from "./lib/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: palette.ink,
        tar: palette.tar,
        charcoal: {
          DEFAULT: palette.charcoal,
          deep: palette.charcoalDeep,
        },
        paper: {
          DEFAULT: palette.paper,
          bright: palette.paperBright,
        },
        chili: {
          DEFAULT: palette.chili,
          deep: palette.chiliDeep,
        },
        neon: palette.neon,
        haze: palette.haze,
      },
      fontFamily: {
        sans: [...fontFamily.sans],
        display: [...fontFamily.display],
        mono: [...fontFamily.mono],
      },
      fontSize: {
        ...typeScale,
      },
      lineHeight: {
        ...lineHeight,
      },
      borderRadius: {
        ...radius,
      },
      boxShadow: {
        ...shadow,
      },
      keyframes: {
        // A cold neon tube stuttering to life, then holding steady.
        "neon-flicker": {
          "0%, 7%": { opacity: "0.2" },
          "8%, 14%": { opacity: "1" },
          "15%, 22%": { opacity: "0.35" },
          "23%, 30%": { opacity: "1" },
          "31%, 34%": { opacity: "0.55" },
          "35%, 100%": { opacity: "1" },
        },
        // Receipt unrolling from the top of the column.
        unroll: {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "neon-flicker": "neon-flicker 2.4s steps(1, end) 1 both",
        unroll: "unroll 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
