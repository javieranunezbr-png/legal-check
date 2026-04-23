export default function AlertaBanner({ mensaje, tipo = 'error', onClose }) {
  const estilos = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  return (
    <div className={`flex items-start justify-between p-3 border rounded-lg text-sm ${estilos[tipo]}`}>
      <span>{mensaje}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  )
}
