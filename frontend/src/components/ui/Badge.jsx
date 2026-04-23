const config = {
  // Clientes
  vigente:    'bg-emerald-100 text-emerald-700',
  terminado:  'bg-slate-100 text-slate-600',
  derivado:   'bg-blue-100 text-blue-700',
  // Causas
  activa:     'bg-emerald-100 text-emerald-700',
  cerrada:    'bg-slate-100 text-slate-600',
  suspendida: 'bg-amber-100 text-amber-700',
  archivada:  'bg-slate-100 text-slate-500',
  // Cuotas
  pendiente:  'bg-blue-100 text-blue-700',
  pagada:     'bg-emerald-100 text-emerald-700',
  vencida:    'bg-red-100 text-red-700',
  condonada:  'bg-slate-100 text-slate-500',
}

export default function Badge({ estado }) {
  const cls = config[estado] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {estado}
    </span>
  )
}
