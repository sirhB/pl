import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Glassmorphism utility classes
export const glassStyles = {
  card: "glass-morphism rounded-2xl p-6",
  cardHover: "glass-morphism rounded-2xl p-6 glass-card-hover cursor-pointer",
  gold: "glass-gold rounded-2xl p-6",
  navigation: "glass-navigation sticky top-0 z-50",
  button: {
    primary: "glass-button-primary px-6 py-3 rounded-xl font-semibold",
    secondary: "glass-button-secondary px-6 py-3 rounded-xl font-semibold",
  },
  modal: "glass-morphism rounded-3xl p-8 max-w-2xl mx-auto",
}

// Animation utilities
export const animations = {
  fadeIn: "animate-in fade-in duration-700",
  slideUp: "animate-in slide-in-from-bottom-10 duration-700",
  float: "animate-float",
  shimmer: "animate-glass-shimmer",
}

// Responsive breakpoints
export const breakpoints = {
  mobile: "max-w-sm",
  tablet: "max-w-4xl",
  desktop: "max-w-7xl",
}

// Color palette helpers
export const colors = {
  gold: {
    primary: "#f59e0b",
    secondary: "#d97706", 
    dark: "#b45309",
  },
  glass: {
    white: "rgba(255, 255, 255, 0.1)",
    light: "rgba(255, 255, 255, 0.05)",
    dark: "rgba(0, 0, 0, 0.05)",
    gold: "rgba(251, 191, 36, 0.15)",
  }
}