/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial lawkit — "Grafito + verdemar" (logo: expediente)
        primary: {
          DEFAULT: '#1C6E63',  // verdemar — acento / CTA
          light:   '#2E8A7D',
          dark:    '#155E54',  // hover / pressed
        },
        teal: {
          DEFAULT: '#1C6E63',  // alias de marca (compat)
          soft:    '#D6EBE7',
        },
        ember: '#E2742A',      // acento cálido puntual (chips/alertas suaves)
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
