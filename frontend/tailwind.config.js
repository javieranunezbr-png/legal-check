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
        // Neutros tintados hacia el hue de marca (impeccable: nada de #000/#fff puro)
        carbon:  '#0B0A0F',    // casi-negro violeta — superficies oscuras, textos
        bone:    '#FBFAFC',    // blanco-hueso tintado — fondos
        soft:    '#F4F3F7',    // gris suave tintado — fondos secundarios, hover
        muted:   '#6F6D7B',    // gris-violeta — texto secundario
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Schibsted Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
