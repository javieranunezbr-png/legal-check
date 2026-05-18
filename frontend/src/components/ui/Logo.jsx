/**
 * Logo oficial lawkit — concepto "Expediente".
 * Wordmark "lawkit" + una pestaña de carpeta como marca. La pestaña
 * funciona sola como ícono (favicon / app / avatar de correo) y es
 * animable (la carpeta puede abrirse / guardarse).
 *
 * Props:
 *  - light:    texto/marca en papel para fondos oscuros (default: tinta)
 *  - size:     'sm' | 'md' | 'lg' | 'xl'
 *  - iconOnly: solo la pestaña (sin wordmark)
 *  - animated: micro-animación de "abrir carpeta" en hover/entrada
 */
export function LogoMark({ className = '', accent = 'currentColor', animated = false }) {
  return (
    <svg viewBox="0 0 32 28" className={className} role="img" aria-label="lawkit"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* cuerpo de la carpeta */}
      <path
        d="M3 8.5A3 3 0 0 1 6 5.5h5.7a3 3 0 0 1 2.2 1l1.5 1.7a3 3 0 0 0 2.2 1H26a3 3 0 0 1 3 3v9.3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8.5Z"
        fill={accent}
      />
      {/* documento que asoma (tapa que se abre) */}
      <rect
        x="8" y="3" width="16" height="7" rx="2"
        fill={accent} fillOpacity="0.42"
        className={animated ? 'lk-fold origin-bottom' : ''}
      />
    </svg>
  )
}

export default function Logo({
  light = false, size = 'md', iconOnly = false, animated = false, className = '',
}) {
  const sizes = {
    sm: { text: 'text-lg',              mark: 'w-[18px] h-[16px] mr-2' },
    md: { text: 'text-2xl',             mark: 'w-[24px] h-[21px] mr-2.5' },
    lg: { text: 'text-4xl',             mark: 'w-[34px] h-[30px] mr-3' },
    xl: { text: 'text-5xl sm:text-6xl', mark: 'w-[44px] h-[39px] mr-3.5' },
  }
  const s = sizes[size] || sizes.md
  const accent = light ? '#FAFAF7' : '#FF7A2E'

  if (iconOnly) {
    return <LogoMark className={`${s.mark} mr-0 ${className}`} accent={accent} animated={animated} />
  }

  return (
    <span className={`inline-flex items-center leading-none font-display font-extrabold tracking-[-0.025em] ${className}`}>
      <LogoMark className={s.mark} accent={accent} animated={animated} />
      <span className={`${s.text} ${light ? 'text-bone' : 'text-carbon'}`}>lawkit</span>
    </span>
  )
}
