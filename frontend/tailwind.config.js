/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens mapping
        primary: {
          light: '#0F766E', // Deep Teal
          dark: '#14B8A6',  // Bright Teal
          DEFAULT: '#0F766E',
        },
        secondary: {
          light: '#2563EB', // Electric Blue
          dark: '#3B82F6',  // Light Blue
          DEFAULT: '#2563EB',
        },
        accent: {
          light: '#7C3AED', // Violet
          dark: '#8B5CF6',  // Light Violet
          DEFAULT: '#7C3AED',
        },
        success: {
          DEFAULT: '#16A34A',
        },
        warning: {
          DEFAULT: '#D97706',
        },
        error: {
          DEFAULT: '#DC2626',
        },
        bg: {
          light: '#F5F7FA',
          dark: '#0B1220',
          DEFAULT: '#F5F7FA',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
          DEFAULT: '#FFFFFF',
        },
        border: {
          light: '#DCE3EA',
          dark: '#374151',
          DEFAULT: '#DCE3EA',
        },
        text: {
          primaryLight: '#111827',
          secondaryLight: '#6B7280',
          primaryDark: '#F9FAFB',
          secondaryDark: '#D1D5DB',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        button: '12px',
        input: '14px',
        card: '20px',
        modal: '24px',
        table: '16px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(15,23,42,0.08)',
        hover: '0 12px 28px rgba(15,23,42,0.14)',
        modal: '0 24px 60px rgba(15,23,42,0.24)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '72px',
        '4xl': '96px',
      }
    },
  },
  plugins: [],
}
