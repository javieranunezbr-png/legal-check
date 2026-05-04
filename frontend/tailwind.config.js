/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Law Kit
        primary: {
          DEFAULT: '#8B5CF6',  // morado — color de acento, botones principales
          light:   '#A78BFA',
          dark:    '#7C3AED',
        },
        carbon:  '#0A0A0A',    // negro carbón — sidebar, textos
        bone:    '#FAFAFA',    // blanco hueso — fondos
        soft:    '#F4F4F5',    // gris suave — fondos secundarios, hover
        muted:   '#71717A',    // gris texto — textos secundarios
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
