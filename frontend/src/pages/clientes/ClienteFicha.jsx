import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0)

const fmt = (s) => s ? new Date(s).toLocaleDateString('es-CL') : '—'

function Dato({ label, valor }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-700 mt-0.5">{valor || '—'}</p>
    </div>
  )
}

export default function ClienteFicha() {
  const { id } = useParams()
  const [cliente, setCliente]   = useState(null)
  const [causas,  setCausas]    = useState([])
  const [cobros,  setCobros]    = useState({ esperado: 0, cobrado: 0 })
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/clientes/${id}`),
      api.get(`/causas?cliente_id=${id}`),
    ])
      .then(async ([rCliente, rCausas]) => {
        setCliente(rCliente.data)
        const causasData = rCausas.data
        setCausas(causasData)

        // Resumen de cobros: agrega acuerdos de todas las causas
        let esperado = 0, cobrado = 0
        await Promise.all(
          causasData.map(async (ca) => {
            const { data: acuerdos } = await api.get(`/acuerdos/causa/${ca.id}`)
            acuerdos.forEach(a => {
              esperado += parseFloat(a.monto_total ?? 0)
              cobrado  += parseFloat(a.monto_cobrado ?? 0)
            })
          })
        )
        setCobros({ esperado, cobrado })
      })
      .catch(() => setError('No se pudo cargar la ficha del cliente'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>
  if (!cliente) return null

  const tieneConyuge = cliente.nombre_conyuge || cliente.rut_conyuge

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/clientes" className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">
                {cliente.nombre} {cliente.apellidos}
              </h1>
              <Badge estado={cliente.estado} />
            </div>
            <p className="text-sm text-slate-400 font-mono">{cliente.rut}</p>
          </div>
        </div>
        <Link to={`/clientes/${id}/editar`} className="btn-secondary text-sm">
          Editar cliente
        </Link>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-800">{causas.length}</p>
          <p className="text-xs text-slate-400 mt-1">Causas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-800">{clp(cobros.esperado)}</p>
          <p className="text-xs text-slate-400 mt-1">Total esperado</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{clp(cobros.cobrado)}</p>
          <p className="text-xs text-slate-400 mt-1">Total cobrado</p>
        </div>
      </div>

      {/* Datos personales */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
          Datos personales
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Dato label="Tipo"          valor={cliente.tipo} />
          <Dato label="Estado civil"  valor={cliente.estado_civil} />
          <Dato label="Género"        valor={cliente.genero} />
          <Dato label="Ocupación"     valor={cliente.ocupacion} />
          <Dato label="Nacionalidad"  valor={cliente.nacionalidad} />
          <Dato label="Clave Única"   valor={cliente.clave_unica} />
          <Dato label="Email"         valor={cliente.email} />
          <Dato label="Teléfono"      valor={cliente.telefono} />
          <Dato label="Canal llegada" valor={cliente.canal_llegada} />
          <div className="col-span-2 sm:col-span-3">
            <Dato label="Dirección" valor={cliente.direccion} />
          </div>
        </div>
        {cliente.abogado_nombre && (
          <div className="pt-3 border-t border-slate-100">
            <Dato label="Abogado responsable" valor={cliente.abogado_nombre} />
          </div>
        )}
      </div>

      {/* Datos del cónyuge */}
      {tieneConyuge && (
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Datos del cónyuge / conviviente civil
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Dato label="Nombre"    valor={`${cliente.nombre_conyuge ?? ''} ${cliente.apellidos_conyuge ?? ''}`.trim()} />
            <Dato label="RUT"       valor={cliente.rut_conyuge} />
            <div className="col-span-2 sm:col-span-3">
              <Dato label="Dirección" valor={cliente.direccion_conyuge} />
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      {cliente.notas && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-3">Notas</h2>
          <p className="text-sm text-slate-600 whitespace-pre-line">{cliente.notas}</p>
        </div>
      )}

      {/* Causas del cliente */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Causas ({causas.length})
          </h2>
          <Link to={`/causas/nueva?cliente_id=${id}`} className="text-xs text-primary hover:underline font-medium">
            + Nueva causa
          </Link>
        </div>

        {causas.length === 0 ? (
          <div className="px-6">
            <EmptyState
              titulo="Sin causas registradas"
              descripcion="Este cliente no tiene causas activas aún"
              accion={
                <Link to={`/causas/nueva?cliente_id=${id}`} className="btn-primary text-sm">
                  + Crear primera causa
                </Link>
              }
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Causa</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Materia</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Inicio</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {causas.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-800">{c.titulo}</p>
                    {c.rol_causa && <p className="text-xs text-slate-400 font-mono">{c.rol_causa}</p>}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{c.materia || '—'}</td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{fmt(c.fecha_inicio)}</td>
                  <td className="px-6 py-3"><Badge estado={c.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
