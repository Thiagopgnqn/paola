/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          elevated: 'rgb(var(--c-surface-elevated) / <alpha-value>)',
          hover: 'rgb(var(--c-surface-hover) / <alpha-value>)',
          subtle: 'rgb(var(--c-surface-subtle) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          hover: 'rgb(var(--c-brand-deep) / <alpha-value>)',
          deep: 'rgb(var(--c-brand-deep) / <alpha-value>)',
          muted: 'rgb(var(--c-mauve) / <alpha-value>)',
          border: 'rgb(var(--c-line) / <alpha-value>)',
        },
        mauve: {
          DEFAULT: 'rgb(var(--c-mauve) / <alpha-value>)',
          light: 'rgb(var(--c-surface-elevated) / <alpha-value>)',
          dark: 'rgb(var(--c-brand-deep) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          subtle: 'rgb(var(--c-line) / 0.65)',
          strong: '#D99AB9',
          accent: 'rgb(var(--c-brand) / <alpha-value>)',
        },
        content: {
          DEFAULT: 'rgb(var(--c-content) / <alpha-value>)',
          main: 'rgb(var(--c-content) / <alpha-value>)',
          secondary: 'rgb(var(--c-content-secondary) / <alpha-value>)',
          muted: 'rgb(var(--c-content-muted) / <alpha-value>)',
          subtle: 'rgb(var(--c-content-subtle) / <alpha-value>)',
        },
        status: {
          success: '#15803D',
          'success-bg': '#DCFCE7',
          'success-border': '#86EFAC',
          warning: '#B45309',
          'warning-bg': '#FEF3C7',
          'warning-border': '#FCD34D',
          error: '#BE123C',
          'error-bg': '#FFE4E6',
          'error-border': '#FDA4AF',
        },
      },
      borderColor: {
        DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        script: ['Pacifico', 'cursive'],
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgba(20, 16, 20, 0.05), 0 3px 10px -3px rgba(230, 0, 126, 0.08)',
        'lifted': '0 10px 28px -8px rgba(20, 16, 20, 0.14), 0 4px 12px -4px rgba(230, 0, 126, 0.12)',
        'overlay': '0 24px 60px -16px rgba(20, 16, 20, 0.24)',
        'brand': '0 8px 20px -4px rgba(230, 0, 126, 0.28)',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '10px',
        'xl': '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
