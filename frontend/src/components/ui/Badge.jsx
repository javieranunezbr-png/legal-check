// Códigos de color por significado:
//   verde  → estados "OK / vivo / pagado / aceptado"
//   rojo   → alertas, pendientes que requieren acción, vencidos, rechazos
//   ámbar  → suspendidos / pausados
//   gris   → neutros / cerrados / archivados
//   verdemar → estados "informativos en curso" (enviado, derivado)
const config = {
  // Clientes
  vigente:     'bg-emerald-100 text-emerald-700',
  activo:      'bg-emerald-100 text-emerald-700',
  pendiente:   'bg-red-100     text-red-700',
  terminado:   'bg-zinc-100    text-zinc-500',
  derivado:    'bg-teal-soft   text-teal',

  // Causas
  activa:      'bg-emerald-100 text-emerald-700',
  cerrada:     'bg-zinc-100    text-zinc-500',
  suspendida:  'bg-amber-100   text-amber-700',
  archivada:   'bg-zinc-100    text-zinc-500',

  // Acuerdos
  // ('vigente' ya está mapeado arriba)
  completado:  'bg-emerald-100 text-emerald-700',
  incumplido:  'bg-red-100     text-red-700',
  anulado:     'bg-zinc-100    text-zinc-500',

  // Cuotas
  pagada:      'bg-emerald-100 text-emerald-700',
  vencida:     'bg-red-100     text-red-700',
  condonada:   'bg-zinc-100    text-zinc-500',

  // Presupuestos
  borrador:    'bg-zinc-100    text-zinc-600',
  enviado:     'bg-teal-soft   text-teal',
  aceptado:    'bg-emerald-100 text-emerald-700',
  rechazado:   'bg-red-100     text-red-700',
}

export default function Badge({ estado }) {
  const cls = config[estado] ?? 'bg-zinc-100 text-zinc-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {estado}
    </span>
  )
}
