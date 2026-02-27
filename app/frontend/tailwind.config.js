"/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [\"./src/**/*.{js,jsx,ts,tsx}\"],
  darkMode: \"class\",
  theme: {
    extend: {
      colors: {
        background: \"var(--color-background)\",
        foreground: \"var(--color-foreground)\",
        surface: \"var(--color-surface)\",
        \"surface-highlight\": \"var(--color-surface-highlight)\",
        primary: \"var(--color-primary)\",
        \"primary-foreground\": \"var(--color-primary-foreground)\",
        secondary: \"var(--color-secondary)\",
        \"secondary-foreground\": \"var(--color-secondary-foreground)\",
        accent: \"var(--color-accent)\",
        muted: \"var(--color-muted)\",
        border: \"var(--color-border)\",
        success: \"var(--color-success)\",
        warning: \"var(--color-warning)\",
        error: \"var(--color-error)\",
      },
      fontFamily: {
        heading: [\"Fraunces\", \"Playfair Display\", \"serif\"],
        body: [\"Outfit\", \"Nunito\", \"sans-serif\"],
        mono: [\"JetBrains Mono\", \"monospace\"],
      },
      borderRadius: {
        DEFAULT: \"1rem\",
        lg: \"1.5rem\",
        xl: \"2rem\",
        \"2xl\": \"2rem\",
        \"3xl\": \"2.5rem\",
        full: \"9999px\",
      },
      animation: {
        \"fade-in\": \"fadeIn 0.5s ease-out forwards\",
        \"slide-up\": \"slideUp 0.5s ease-out forwards\",
        \"pulse-soft\": \"pulseSoft 3s ease-in-out infinite\",
        shimmer: \"shimmer 2s linear infinite\",
      },
      keyframes: {
        fadeIn: {
          \"0%\": { opacity: \"0\" },
          \"100%\": { opacity: \"1\" },
        },
        slideUp: {
          \"0%\": { opacity: \"0\", transform: \"translateY(16px)\" },
          \"100%\": { opacity: \"1\", transform: \"translateY(0)\" },
        },
        pulseSoft: {
          \"0%, 100%\": { opacity: \"0.6\" },
          \"50%\": { opacity: \"1\" },
        },
        shimmer: {
          \"0%\": { backgroundPosition: \"-200% 0\" },
          \"100%\": { backgroundPosition: \"200% 0\" },
        },
      },
    },
  },
  plugins: [],
};
"
