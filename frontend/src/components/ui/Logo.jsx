/**
 * Logo oficial Law Kit: texto "lawkit" en minúsculas + punto morado.
 * Sin símbolo, solo tipografía + punto.
 *
 * Props:
 *  - light: si true, el texto va en blanco hueso (para fondos oscuros).
 *           Si false (default), va en negro carbón.
 *  - size:  'sm' | 'md' | 'lg' | 'xl'
 */
export default function Logo({ light = false, size = 'md', className = '' }) {
  const sizes = {
    sm: { text: 'text-base',   dot: 'w-1.5 h-1.5 ml-0.5' },
    md: { text: 'text-xl',     dot: 'w-2   h-2   ml-1' },
    lg: { text: 'text-3xl',    dot: 'w-2.5 h-2.5 ml-1' },
    xl: { text: 'text-5xl',    dot: 'w-3.5 h-3.5 ml-1.5' },
  }
  const s = sizes[size] || sizes.md

  return (
    <span className={`inline-flex items-end leading-none font-semibold tracking-tight ${className}`}>
      <span className={`${s.text} ${light ? 'text-white' : 'text-carbon'}`}>
        lawkit
      </span>
      <span
        className={`rounded-full bg-primary inline-block ${s.dot}`}
        style={{ marginBottom: '0.15em' }}
        aria-hidden="true"
      />
    </span>
  )
}
