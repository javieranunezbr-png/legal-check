import { useState, useMemo, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import Spinner from '../../components/ui/Spinner'

const TIPOS = {
  audiencia: { label: 'Audiencia', dot: 'bg-red-500',     chip: 'bg-red-50 text-red-700 border-red-200' },
  gestion:   { label: 'Gestión',   dot: 'bg-violet-500',  chip: 'bg-violet-50 text-violet-700 border-violet-200' },
  reunion:   { label: 'Reunión',   dot: 'bg-blue-500',    chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  plazo:     { label: 'Plazo',     dot: 'bg-amber-500',   chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  otro:      { label: 'Otro',      dot: 'bg-zinc-400',    chip: 'bg-zinc-50 text-zinc-600 border-zinc-200' },
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

const ymd = (d) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
const horaDe = (iso) =>
  new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

export default function Agenda() {
  const hoy = new Date()
  const [cursor, setCursor] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [modal, setModal]     = useState(null) // { fecha } | { evento }
  const { data: causas } = useApi('/causas')

  const rango = useMemo(() => {
    const desde = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const hasta = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59)
    return { desde: ymd(desde), hasta: ymd(hasta) }
  }, [cursor])

  const cargar = useCallback(() => {
    setLoading(true)
    api.get(`/agenda?desde=${rango.desde}&hasta=${rango.hasta}`)
      .then(r => setEventos(r.data))
      .catch(() => setError('No se pudo cargar la agenda'))
      .finally(() => setLoading(false))
  }, [rango])

  useEffect(() => { cargar() }, [cargar])

  // Mapa día(YYYY-MM-DD) -> eventos
  const porDia = useMemo(() => {
    const m = {}
    for (const e of eventos) {
      const k = ymd(new Date(e.fecha))
      ;(m[k] = m[k] || []).push(e)
    }
    return m
  }, [eventos])

  // Construye la grilla del mes (semanas que empiezan lunes)
  const celdas = useMemo(() => {
    const primero = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const offset  = (primero.getDay() + 6) % 7 // lunes=0
    const inicio  = new Date(primero)
    inicio.setDate(primero.getDate() - offset)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      return d
    })
  }, [cursor])

  const proximos = useMemo(
    () => [...eventos]
      .filter(e => e.estado === 'pendiente' && new Date(e.fecha) >= new Date(ymd(hoy)))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 8),
    [eventos] // eslint-disable-line
  )

  const cambiarMes = (delta) =>
    setCursor(c => new Date(c.getFullYear(), c.getMonth() + delta, 1))

  if (loading && eventos.length === 0) return <Spinner />

  const mesActual = cursor.getMonth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-carbon">Agenda</h1>
          <p className="text-sm text-muted">Audiencias, gestiones, plazos y reuniones</p>
        </div>
        <button
          onClick={() => setModal({ fecha: ymd(hoy) })}
          className="btn-primary text-sm"
        >
          + Nuevo evento
        </button>
      </div>

      {error && <div className="card text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => cambiarMes(-1)}
              className="w-8 h-8 rounded-lg hover:bg-soft text-muted hover:text-carbon">‹</button>
            <h2 className="font-semibold text-carbon">
              {MESES[mesActual]} {cursor.getFullYear()}
            </h2>
            <button onClick={() => cambiarMes(1)}
              className="w-8 h-8 rounded-lg hover:bg-soft text-muted hover:text-carbon">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {celdas.map((d, i) => {
              const k = ymd(d)
              const esOtroMes = d.getMonth() !== mesActual
              const esHoy = k === ymd(hoy)
              const evs = porDia[k] || []
              return (
                <button
                  key={i}
                  onClick={() => setModal({ fecha: k })}
                  className={`min-h-[78px] rounded-lg border p-1.5 text-left transition-colors ${
                    esOtroMes ? 'bg-soft/40 border-transparent' : 'bg-white border-zinc-100 hover:border-primary/40'
                  }`}
                >
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                    esHoy ? 'bg-primary text-white' : esOtroMes ? 'text-zinc-300' : 'text-carbon'
                  }`}>
                    {d.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {evs.slice(0, 3).map(e => {
                      const t = TIPOS[e.tipo] || TIPOS.otro
                      return (
                        <div
                          key={e.id}
                          onClick={(ev) => { ev.stopPropagation(); setModal({ evento: e }) }}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate border ${t.chip} ${
                            e.estado !== 'pendiente' ? 'opacity-50 line-through' : ''
                          }`}
                          title={e.titulo}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dot}`} />
                          <span className="truncate">{e.titulo}</span>
                        </div>
                      )
                    })}
                    {evs.length > 3 && (
                      <p className="text-[10px] text-muted pl-1">+{evs.length - 3} más</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Próximos */}
        <div className="card">
          <h2 className="text-sm font-semibold text-carbon mb-3">Próximos eventos</h2>
          {proximos.length === 0 ? (
            <p className="text-sm text-muted">No hay eventos pendientes este mes.</p>
          ) : (
            <ul className="space-y-2">
              {proximos.map(e => {
                const t = TIPOS[e.tipo] || TIPOS.otro
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => setModal({ evento: e })}
                      className="w-full text-left p-2.5 rounded-lg border border-zinc-100 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`} />
                        <span className="text-sm font-medium text-carbon truncate flex-1">{e.titulo}</span>
                      </div>
                      <p className="text-xs text-muted mt-1 capitalize">
                        {fechaLarga(e.fecha)} · {horaDe(e.fecha)}
                      </p>
                      {e.causa_titulo && (
                        <p className="text-xs text-muted truncate">📁 {e.causa_titulo}</p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {modal && (
        <EventoModal
          inicial={modal}
          causas={causas || []}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargar() }}
        />
      )}
    </div>
  )
}

function EventoModal({ inicial, causas, onClose, onGuardado }) {
  const editando = Boolean(inicial.evento)
  const ev = inicial.evento

  const fechaInicial = ev
    ? new Date(ev.fecha)
    : new Date(`${inicial.fecha}T09:00`)

  const [form, setForm] = useState({
    titulo:      ev?.titulo || '',
    tipo:        ev?.tipo || 'gestion',
    causa_id:    ev?.causa_id || '',
    descripcion: ev?.descripcion || '',
    fecha:       ymd(fechaInicial),
    hora:        new Date(fechaInicial).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }),
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const set = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es obligatorio'); return }
    setGuardando(true)
    setError('')
    const payload = {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      causa_id: form.causa_id || null,
      descripcion: form.descripcion || null,
      fecha: `${form.fecha}T${form.hora || '09:00'}:00`,
    }
    try {
      if (editando) await api.put(`/agenda/${ev.id}`, payload)
      else          await api.post('/agenda', payload)
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (estado) => {
    setGuardando(true)
    try {
      await api.put(`/agenda/${ev.id}`, { estado })
      onGuardado()
    } catch {
      setError('Error al actualizar estado')
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar este evento?')) return
    setGuardando(true)
    try {
      await api.delete(`/agenda/${ev.id}`)
      onGuardado()
    } catch {
      setError('Error al eliminar')
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-semibold text-carbon">
            {editando ? 'Editar evento' : 'Nuevo evento'}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-carbon text-xl leading-none">×</button>
        </div>

        <form onSubmit={guardar} className="p-6 space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Título *</label>
            <input value={form.titulo} onChange={set('titulo')} className="input" placeholder="Ej: Audiencia preparatoria" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Tipo</label>
              <select value={form.tipo} onChange={set('tipo')} className="input">
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Causa (opcional)</label>
              <select value={form.causa_id} onChange={set('causa_id')} className="input">
                <option value="">Sin causa</option>
                {causas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}{c.cliente_nombre ? ` — ${c.cliente_nombre}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={set('fecha')} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Hora</label>
              <input type="time" value={form.hora} onChange={set('hora')} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={set('descripcion')} rows={3}
              className="input resize-none" placeholder="Notas, ubicación, recordatorios..." />
          </div>

          {editando && (
            <div className="flex flex-wrap gap-2 pt-1">
              {ev.estado === 'pendiente' && (
                <button type="button" onClick={() => cambiarEstado('realizado')} disabled={guardando}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                  ✓ Marcar realizado
                </button>
              )}
              {ev.estado !== 'pendiente' && (
                <button type="button" onClick={() => cambiarEstado('pendiente')} disabled={guardando}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100">
                  Reabrir
                </button>
              )}
              <button type="button" onClick={eliminar} disabled={guardando}
                className="text-xs px-3 py-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50">
                Eliminar
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={guardando} className="btn-primary text-sm">
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
