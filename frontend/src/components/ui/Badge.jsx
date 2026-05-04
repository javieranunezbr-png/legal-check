// Paleta Law Kit: morado para estados activos/vigentes,
// verde para confirmaciones (pagada), rojo para alertas (vencida),
// gris para neutros, ámbar para suspendido.
const config = {
  // Clientes
  vigente:    'bg-violet-100 text-violet-700',
  activo:     'bg-violet-100 text-violet-700',
  pendiente:  'bg-zinc-100  text-zinc-600',
  terminado:  'bg-zinc-100  text-zinc-500',
  derivado:   'bg-zinc-100  text-zinc-600',
  // Causas
  activa:     'bg-violet-100 text-violet-700',
  cerrada:    'bg-zinc-100  text-zinc-500',
  suspendida: 'bg-amber-100 text-amber-700',
  archivada:  'bg-zinc-100  text-zinc-500',
  // Acuerdos
  vigente_acuerdo: 'bg-violet-100 text-violet-700',
  // Cuotas
  pagada:     'bg-emerald-100 text-emerald-700',
  vencida:    'bg-red-100  text-red-700',
  condonada:  'bg-zinc-100 text-zinc-500',
  // Presupuestos
  borrador:   'bg-zinc-100 text-zinc-600',
  enviado:    'bg-violet-100 text-violet-700',
  aceptado:   'bg-emerald-100 text-emerald-700',
  rechazado:  'bg-red-100 text-red-700',
}

export default function Badge({ estado }) {
  const cls = config[estado] ?? 'bg-zinc-100 text-zinc-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {estado}
    </span>
  )
}
