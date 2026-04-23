import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const ESTADO_CLS = {
  borrador:  'bg-slate-100 text-slate-600',
  enviado:   'bg-blue-100 text-blue-700',
  aceptado:  'bg-emerald-100 text-emerald-700',
  rechazado: 'bg-red-100 text-red-700',
}

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number(n) || 0)

export default function PresupuestosLista() {
  const { data: presupuestos, loading, error } = useApi('/presupuestos')
  const [busqueda, setBusqueda]         = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const filtrados = useMemo(() => {
    if (!presupuestos) return []
    const q = busqueda.toLowerCase()
    return presupuestos.filter(p => {
      const matchQ = !q ||
        p.nombre_prospecto?.toLowerCase().includes(q) ||
        p.correo?.toLowerCase().includes(q)
      const matchE = !filtroEstado || p.estado === filtroEstado
      return matchQ && matchE
    })
  }, [presupuestos, busqueda, filtroEstado])

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Presupuestos</h1>
          <p className="text-sm text-slate-500">{presupuestos.length} presupuestos en total</p>
        </div>
        <Link to="/presupuestos/nuevo" className="btn-primary">
          + Nuevo presupuesto
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por prospecto o correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input flex-1 min-w-[200px]"
          />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="input w-auto"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          {(busqueda || filtroEstado) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroEstado('') }}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="card">
          <EmptyState
            titulo={busqueda || filtroEstado ? 'Sin resultados' : 'No hay presupuestos aún'}
            descripcion={
              busqueda || filtroEstado
                ? 'Prueba ajustando los filtros'
                : 'Crea tu primer presupuesto para un prospecto'
            }
            accion={
              !busqueda && !filtroEstado && (
                <Link to="/presupuestos/nuevo" className="btn-primary text-sm">
                  + Nuevo presupuesto
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prospecto</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacto</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Honorarios</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuotas</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{p.nombre_prospecto}</p>
                      {p.materias?.length > 0 && (
                        <p className="text-xs text-slate-400">{p.materias.join(', ')}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{p.correo || '—'}</p>
                      <p className="text-xs text-slate-400">{p.telefono || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{clp(p.honorarios_total)}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {p.numero_cuotas} × {clp(p.monto_cuota)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_CLS[p.estado]}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/presupuestos/${p.id}/editar`}
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          Ver / editar
                        </Link>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/presupuesto/${p.token_unico}`
                            navigator.clipboard.writeText(url)
                            alert('Link copiado:\n' + url)
                          }}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Copiar link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
