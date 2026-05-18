/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial lawkit — dirección "Grafito + mandarina"
        primary: {
          DEFAULT: '#FF7A2E',  // mandarina — acento / CTA
          light:   '#FF9A5C',
          dark:    '#E2620F',  // hover / pressed
        },
        teal: {
          DEFAULT: '#1C6E63',  // verdemar — 2º acento, links, acciones secundarias
          soft:    '#D6EBE7',
        },
        // Neutros cálidos (impeccable: nada de #000/#fff puro)
        carbon:  '#1F2125',    // grafito — superficies oscuras, texto fuerte
        ink2:    '#3A3D44',    // tinta media — texto secundario
        bone:    '#FAFAF7',    // papel — fondos
        soft:    '#EFEEEA',    // papel 2 — fondos secundarios, hover
        line:    '#DED9CF',    // bordes cálidos
        muted:   '#6F6C64',    // piedra oscura — texto secundario legible
      },
      fontFamily: {
        sans:    ['Figtree', 'system-ui', 'sans-serif'],
        display: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
