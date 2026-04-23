import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const ESTADOS  = ['activa', 'cerrada', 'suspendida', 'archivada']
const MATERIAS = ['Civil', 'Familia', 'Laboral', 'Penal', 'Comercial', 'Administrativo', 'Otra']

const formatFecha = (s) => s ? new Date(s).toLocaleDateString('es-CL') : null

function IndicadorCuota({ causa }) {
  const hoy  = new Date()
  hoy.setHours(0, 0, 0, 0)

  if (causa.tiene_cuotas_vencidas) {
    return (
      <span title="Tiene cuotas vencidas"
        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Cuotas vencidas
      </span>
    )
  }

  if (causa.proxima_cuota_fecha) {
    const proxima = new Date(causa.proxima_cuota_fecha)
    const diasRestantes = Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24))

    if (diasRestantes <= 7) {
      return (
        <span title={`Cuota vence el ${formatFecha(causa.proxima_cuota_fecha)}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Vence en {diasRestantes}d
        </span>
      )
    }
  }

  return null
}

export default function CausasLista() {
  const { isAdmin } = useAuth()
  const { data: causas, loading, error } = useApi('/causas')

  const [busqueda,      setBusqueda]      = useState('')
  const [filtroEstado,  setFiltroEstado]  = useState('')
  const [filtroMateria, setFiltroMateria] = useState('')

  const filtradas = useMemo(() => {
    if (!causas) return []
    const q = busqueda.toLowerCase()
    return causas.filter(c => {
      const matchBusqueda = !q ||
        c.titulo?.toLowerCase().includes(q) ||
        c.rol_causa?.toLowerCase().includes(q) ||
        c.cliente_nombre?.toLowerCase().includes(q) ||
        c.cliente_apellidos?.toLowerCase().includes(q)
      const matchEstado  = !filtroEstado  || c.estado === filtroEstado
      const matchMateria = !filtroMateria || c.materia === filtroMateria
      return matchBusqueda && matchEstado && matchMateria
    })
  }, [causas, busqueda, filtroEstado, filtroMateria])

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Causas</h1>
          <p className="text-sm text-slate-500">{causas.length} causas en total</p>
        </div>
        <Link to="/causas/nueva" className="btn-primary">
          + Nueva causa
        </Link>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por título, ROL o cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input flex-1 min-w-[220px]"
          />
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="input w-auto">
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} className="input w-auto">
            <option value="">Todas las materias</option>
            {MATERIAS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(busqueda || filtroEstado || filtroMateria) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroMateria('') }}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {filtradas.length === 0 ? (
        <div className="card">
          <EmptyState
            titulo={busqueda || filtroEstado ? 'Sin resultados' : 'No hay causas aún'}
            descripcion={
              busqueda || filtroEstado
                ? 'Prueba con otros términos o filtros'
                : 'Crea la primera causa para un cliente del estudio'
            }
            accion={
              !busqueda && !filtroEstado && (
                <Link to="/causas/nueva" className="btn-primary text-sm">+ Nueva causa</Link>
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
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Causa</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Materia</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Abogado</th>
                  )}
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Inicio</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cobros</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 max-w-[260px]">
                      <p className="font-medium text-slate-800 truncate">{c.titulo}</p>
                      {c.rol_causa && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{c.rol_causa}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/clientes/${c.cliente_id}`}
                        className="text-primary hover:underline"
                      >
                        {c.cliente_nombre} {c.cliente_apellidos}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono">{c.cliente_rut}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.materia || '—'}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-slate-600">{c.abogado_nombre}</td>
                    )}
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatFecha(c.fecha_inicio)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge estado={c.estado} />
                    </td>
                    <td className="px-6 py-4">
                      <IndicadorCuota causa={c} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/causas/${c.id}/editar`}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            Mostrando {filtradas.length} de {causas.length} causas
          </div>
        </div>
      )}
    </div>
  )
}
