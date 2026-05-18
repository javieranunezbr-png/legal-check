/**
 * Logo oficial lawkit — dirección "Estudio sereno".
 * Wordmark "lawkit" en serif humanista (Spectral), minúsculas, sereno,
 * con un punto pino al final como sello discreto. Sin símbolo.
 *
 * Props:
 *  - light: texto en papel para fondos oscuros (default: tinta).
 *  - size:  'sm' | 'md' | 'lg' | 'xl'
 */
export default function Logo({ light = false, size = 'md', className = '' }) {
  const sizes = {
    sm: { text: 'text-lg',              dot: 'w-[5px] h-[5px] ml-[3px]' },
    md: { text: 'text-2xl',             dot: 'w-1.5   h-1.5   ml-1' },
    lg: { text: 'text-4xl',             dot: 'w-2     h-2     ml-1.5' },
    xl: { text: 'text-5xl sm:text-6xl', dot: 'w-2.5   h-2.5   ml-2' },
  }
  const s = sizes[size] || sizes.md

  return (
    <span className={`inline-flex items-end leading-none font-display font-semibold ${className}`}>
      <span className={`${s.text} ${light ? 'text-bone' : 'text-carbon'}`}>
        lawkit
      </span>
      <span
        className={`rounded-full bg-primary inline-block ${s.dot}`}
        style={{ marginBottom: '0.16em' }}
        aria-hidden="true"
      />
    </span>
  )
}
