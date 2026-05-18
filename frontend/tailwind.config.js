/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial lawkit — dirección "Estudio sereno"
        primary: {
          DEFAULT: '#2F4A3C',  // verde pino — acento de marca, botones
          light:   '#3D6150',
          dark:    '#243A2F',
        },
        // Neutros cálidos tintados (impeccable: nada de #000/#fff puro)
        carbon:  '#20211C',    // tinta de oliva casi-negra — superficies oscuras, texto
        bone:    '#F4F1EA',    // papel cálido — fondos
        soft:    '#ECE8DE',    // papel secundario — fondos secundarios, hover
        muted:   '#6B6A5F',    // gris-oliva — texto secundario
      },
      fontFamily: {
        sans:    ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        display: ['Spectral', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
