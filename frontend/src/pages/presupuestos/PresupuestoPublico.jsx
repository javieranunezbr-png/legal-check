import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number(n) || 0)

const formatearFecha = (f) => {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PresupuestoPublico() {
  const { token } = useParams()
  const [p, setP]             = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [enviando, setEnviando] = useState(false)
  const [respuesta, setRespuesta] = useState(null)

  useEffect(() => {
    api.get(`/presupuestos/public/${token}`)
      .then(r => {
        setP(r.data)
        if (['aceptado', 'rechazado'].includes(r.data.estado)) {
          setRespuesta(r.data.estado)
        }
      })
      .catch(e => setError(e.response?.data?.mensaje || 'No se pudo cargar el presupuesto'))
      .finally(() => setLoading(false))
  }, [token])

  const responder = async (accion) => {
    if (!confirm(`¿Confirmas que deseas ${accion === 'aceptado' ? 'aceptar' : 'rechazar'} este presupuesto?`)) return
    setEnviando(true)
    try {
      await api.patch(`/presupuestos/${token}/responder`, { accion })
      setRespuesta(accion)
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al enviar la respuesta')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Cargando presupuesto...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">No encontrado</h1>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-end leading-none font-semibold tracking-tight">
            <span className="text-3xl text-carbon">lawkit</span>
            <span
              className="rounded-full bg-primary inline-block w-2.5 h-2.5 ml-1"
              style={{ marginBottom: '0.15em' }}
            />
          </span>
          <p className="text-muted text-xs mt-3">Propuesta de servicios legales</p>
        </div>

        {/* Respuesta recibida */}
        {respuesta && (
          <div className={`rounded-2xl p-6 mb-6 text-center border ${
            respuesta === 'aceptado'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="text-3xl mb-2">{respuesta === 'aceptado' ? '✅' : '❌'}</div>
            <h2 className="font-semibold mb-1">
              {respuesta === 'aceptado' ? 'Presupuesto aceptado' : 'Presupuesto rechazado'}
            </h2>
            <p className="text-sm">
              {respuesta === 'aceptado'
                ? 'Gracias. El abogado se pondrá en contacto contigo a la brevedad.'
                : 'Hemos registrado tu respuesta. Gracias por tu tiempo.'}
            </p>
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          <div className="px-8 py-6 border-b border-slate-100" style={{ backgroundColor: '#f8fafc' }}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Para</p>
            <h2 className="text-lg font-bold text-slate-800">{p.nombre_prospecto}</h2>
            {p.abogado_nombre && (
              <p className="text-xs text-slate-500 mt-3">
                Presentado por <span className="font-medium text-slate-700">{p.abogado_nombre}</span>
                {p.abogado_email && <span> · {p.abogado_email}</span>}
              </p>
            )}
          </div>

          <div className="px-8 py-6 space-y-6">

            {p.materias?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Materias</p>
                <div className="flex flex-wrap gap-2">
                  {p.materias.map(m => (
                    <span key={m} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {p.descripcion && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Descripción del servicio
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {p.descripcion}
                </p>
              </div>
            )}

            {p.items?.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Gestiones incluidas
                </p>
                <div className="space-y-3">
                  {p.items.map((it, i) => (
                    <div key={it.id || i} className="border border-slate-100 rounded-lg p-3">
                      <div className="flex justify-between items-start gap-3">
                        <p className="font-medium text-slate-800 text-sm">{it.nombre}</p>
                        <p className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                          {clp(it.precio)}
                        </p>
                      </div>
                      {it.detalle && (
                        <p className="text-xs text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                          {it.detalle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Honorarios
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total honorarios</span>
                  <span className="font-semibold text-slate-800">{clp(p.honorarios_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Número de cuotas</span>
                  <span className="text-slate-700">{p.numero_cuotas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monto por cuota</span>
                  <span className="text-slate-700">{clp(p.monto_cuota)}</span>
                </div>
                {p.fecha_primera_cuota && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Primera cuota</span>
                    <span className="text-slate-700 capitalize">{formatearFecha(p.fecha_primera_cuota)}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Acciones */}
          {!respuesta && (
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
              <p className="text-sm text-slate-600 text-center mb-4">
                ¿Estás de acuerdo con esta propuesta?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => responder('rechazado')}
                  disabled={enviando}
                  className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => responder('aceptado')}
                  disabled={enviando}
                  className="flex-1 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {enviando ? 'Enviando...' : 'Aceptar presupuesto'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} lawkit — Chile
        </p>
      </div>
    </div>
  )
}
