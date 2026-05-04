import { useState } from 'react'
import api from '../../services/api'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0)

const fmt = (s) => s ? new Date(s).toLocaleDateString('es-CL') : '—'

const METODOS = ['Transferencia', 'Efectivo', 'Cheque', 'Otro']

const estilosEstado = {
  pagada:    { card: 'border-emerald-200 bg-emerald-50',  dot: 'bg-emerald-500', texto: 'text-emerald-700' },
  vencida:   { card: 'border-red-200 bg-red-50',          dot: 'bg-red-500 animate-pulse', texto: 'text-red-700' },
  pendiente: { card: 'border-slate-200 bg-white',         dot: 'bg-slate-300',  texto: 'text-slate-500' },
  condonada: { card: 'border-slate-100 bg-slate-50',      dot: 'bg-slate-200',  texto: 'text-slate-400' },
}

export default function CuotaCard({ cuota, total, onPagada, onActualizada }) {
  const [abierto,   setAbierto]   = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')
  const [pago, setPago] = useState({ fecha_pago: '', metodo_pago: 'Transferencia', notas: '' })

  const [editandoFecha, setEditandoFecha] = useState(false)
  const [nuevaFecha, setNuevaFecha]       = useState(cuota.fecha_vencimiento?.slice(0, 10) || '')
  const [guardandoFecha, setGuardandoFecha] = useState(false)

  const est = estilosEstado[cuota.estado] ?? estilosEstado.pendiente
  const puedeMarcar = ['pendiente', 'vencida'].includes(cuota.estado)

  const guardarFecha = async () => {
    if (!nuevaFecha) return
    setGuardandoFecha(true)
    try {
      const { data } = await api.patch(`/cuotas/${cuota.id}/fecha`, { fecha_vencimiento: nuevaFecha })
      setEditandoFecha(false)
      onActualizada?.(data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar la fecha')
    } finally {
      setGuardandoFecha(false)
    }
  }

  const handlePagar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const { data } = await api.patch(`/cuotas/${cuota.id}/pagar`, {
        fecha_pago:  pago.fecha_pago  || null,
        metodo_pago: pago.metodo_pago || null,
        notas:       pago.notas       || null,
      })
      setAbierto(false)
      onPagada?.(data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar el pago')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`border rounded-xl p-4 transition-all ${est.card}`}>
      {/* Cabecera de la cuota */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${est.dot}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Cuota {cuota.numero_cuota}
              <span className="text-slate-400 font-normal"> / {total}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              Vencimiento:{' '}
              {editandoFecha ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={e => setNuevaFecha(e.target.value)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                  />
                  <button
                    onClick={guardarFecha}
                    disabled={guardandoFecha}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-medium px-1"
                  >
                    {guardandoFecha ? '...' : '✓'}
                  </button>
                  <button
                    onClick={() => { setEditandoFecha(false); setNuevaFecha(cuota.fecha_vencimiento?.slice(0,10) || '') }}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1"
                  >×</button>
                </span>
              ) : (
                <>
                  <span className={cuota.estado === 'vencida' ? 'text-red-600 font-medium' : ''}>
                    {fmt(cuota.fecha_vencimiento)}
                  </span>
                  {puedeMarcar && (
                    <button
                      onClick={() => setEditandoFecha(true)}
                      className="text-slate-400 hover:text-primary text-xs"
                      title="Editar fecha"
                    >
                      ✎
                    </button>
                  )}
                </>
              )}
            </p>
            {cuota.fecha_pago && (
              <p className="text-xs text-emerald-600 mt-0.5">Pagada el {fmt(cuota.fecha_pago)} · {cuota.metodo_pago}</p>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-slate-800">{clp(cuota.monto)}</p>
          <span className={`text-xs font-medium ${est.texto}`}>{cuota.estado}</span>
        </div>
      </div>

      {/* Botón marcar como pagada */}
      {puedeMarcar && !abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="mt-3 w-full text-sm font-medium text-primary border border-primary rounded-lg py-1.5 hover:bg-primary hover:text-white transition-colors"
        >
          Marcar como pagada
        </button>
      )}

      {/* Formulario de pago inline */}
      {abierto && (
        <form onSubmit={handlePagar} className="mt-3 pt-3 border-t border-slate-200 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de pago</label>
              <input
                type="date"
                value={pago.fecha_pago}
                onChange={e => setPago(p => ({ ...p, fecha_pago: e.target.value }))}
                className="input text-sm py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Método</label>
              <select
                value={pago.metodo_pago}
                onChange={e => setPago(p => ({ ...p, metodo_pago: e.target.value }))}
                className="input text-sm py-1.5"
              >
                {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notas (opcional)</label>
            <input
              type="text"
              value={pago.notas}
              onChange={e => setPago(p => ({ ...p, notas: e.target.value }))}
              placeholder="Nº transferencia, referencia..."
              className="input text-sm py-1.5"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={guardando} className="btn-primary text-sm py-1.5 flex-1">
              {guardando ? 'Registrando...' : 'Confirmar pago'}
            </button>
            <button
              type="button"
              onClick={() => { setAbierto(false); setError('') }}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
