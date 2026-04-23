import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const ESTADOS = ['', 'vigente', 'terminado', 'derivado']

export default function ClientesLista() {
  const { isAdmin } = useAuth()
  const { data: clientes, loading, error } = useApi('/clientes')
  const { data: usuarios } = useApi(isAdmin ? '/usuarios' : null)

  const [busqueda,      setBusqueda]      = useState('')
  const [filtroEstado,  setFiltroEstado]  = useState('')
  const [filtroAbogado, setFiltroAbogado] = useState('')

  const filtrados = useMemo(() => {
    if (!clientes) return []
    const q = busqueda.toLowerCase()
    return clientes.filter(c => {
      const matchBusqueda = !q ||
        c.nombre?.toLowerCase().includes(q) ||
        c.apellidos?.toLowerCase().includes(q) ||
        c.rut?.toLowerCase().includes(q)
      const matchEstado  = !filtroEstado  || c.estado === filtroEstado
      const matchAbogado = !filtroAbogado || String(c.abogado_id) === filtroAbogado
      return matchBusqueda && matchEstado && matchAbogado
    })
  }, [clientes, busqueda, filtroEstado, filtroAbogado])

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">{clientes.length} clientes en total</p>
        </div>
        <Link to="/clientes/nuevo" className="btn-primary">
          + Nuevo cliente
        </Link>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o RUT..."
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
            {ESTADOS.filter(Boolean).map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
          {isAdmin && usuarios && (
            <select
              value={filtroAbogado}
              onChange={e => setFiltroAbogado(e.target.value)}
              className="input w-auto"
            >
              <option value="">Todos los abogados</option>
              {usuarios.filter(u => u.rol === 'abogado').map(u => (
                <option key={u.id} value={String(u.id)}>{u.nombre}</option>
              ))}
            </select>
          )}
          {(busqueda || filtroEstado || filtroAbogado) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroAbogado('') }}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <div className="card">
          <EmptyState
            titulo={busqueda || filtroEstado ? 'Sin resultados' : 'No hay clientes aún'}
            descripcion={
              busqueda || filtroEstado
                ? 'Prueba ajustando los filtros de búsqueda'
                : 'Comienza registrando el primer cliente del estudio'
            }
            accion={
              !busqueda && !filtroEstado && (
                <Link to="/clientes/nuevo" className="btn-primary text-sm">
                  + Nuevo cliente
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
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">RUT</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacto</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Abogado</th>
                  )}
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Canal</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {c.nombre} {c.apellidos}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">{c.tipo}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{c.rut}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{c.email || '—'}</p>
                      <p className="text-xs text-slate-400">{c.telefono || ''}</p>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-slate-600">{c.abogado_nombre || '—'}</td>
                    )}
                    <td className="px-6 py-4">
                      <Badge estado={c.estado} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{c.canal_llegada || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/clientes/${c.id}`}
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          Ver ficha
                        </Link>
                        <Link
                          to={`/clientes/${c.id}/editar`}
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
            Mostrando {filtrados.length} de {clientes.length} clientes
          </div>
        </div>
      )}
    </div>
  )
}
