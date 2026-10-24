export const COLORS = {
  primary: {
    DEFAULT: "#2D476F", // Base color (Navy Blue)
    50: "#EEF1F7", // Lightest
    100: "#D4DBE9",
    200: "#A9B7D3",
    300: "#7E93BD",
    400: "#536FA7", // Pre-base transition
    500: "#2D476F", // Base
    600: "#243A59",
    700: "#1B2C43",
    800: "#121D2C",
    900: "#090F16", // Darkest
  },
  secondary: {
    DEFAULT: "#f3c855",
    50: "#fefbf0",
    100: "#fdf7e1",
    200: "#fbefc3",
    300: "#f9e7a5",
    400: "#f7df87",
    500: "#f3c855",
    600: "#c2a044",
    700: "#917833",
    800: "#605022",
    900: "#302811",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
} as const;

export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
} as const;

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;
