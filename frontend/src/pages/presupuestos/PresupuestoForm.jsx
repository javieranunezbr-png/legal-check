import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import AlertaBanner from '../../components/ui/AlertaBanner'
import Spinner from '../../components/ui/Spinner'

const MATERIAS = [
  'Familia', 'Civil', 'Laboral', 'Penal', 'Comercial',
  'Tributario', 'Inmobiliario', 'Migratorio', 'Administrativo', 'Otro',
]

const VACIO = {
  nombre_prospecto: '', correo: '', telefono: '', descripcion: '',
  materias: [], honorarios_total: '', numero_cuotas: 1, monto_cuota: '',
  fecha_primera_cuota: '', notas: '', estado: 'borrador',
}

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number(n) || 0)

function Campo({ label, children, requerido }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{requerido && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function PresupuestoForm() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const esEdicion = Boolean(id)

  const [form, setForm]           = useState(VACIO)
  const [token, setToken]         = useState('')
  const [loading, setLoading]     = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (!esEdicion) return
    api.get(`/presupuestos/${id}`)
      .then(r => {
        const d = r.data
        setForm({
          ...VACIO,
          ...d,
          materias: d.materias || [],
          fecha_primera_cuota: d.fecha_primera_cuota?.slice(0, 10) || '',
          honorarios_total: d.honorarios_total || '',
          monto_cuota: d.monto_cuota || '',
        })
        setToken(d.token_unico)
      })
      .catch(() => setError('No se pudo cargar el presupuesto'))
      .finally(() => setLoading(false))
  }, [id, esEdicion])

  const set = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? value : value }))
  }

  // Auto-calcular monto de cuota si hay total y número de cuotas
  useEffect(() => {
    const total = Number(form.honorarios_total)
    const n     = Number(form.numero_cuotas)
    if (total > 0 && n > 0) {
      setForm(prev => ({ ...prev, monto_cuota: Math.round(total / n) }))
    }
  }, [form.honorarios_total, form.numero_cuotas])

  const toggleMateria = (m) => {
    setForm(prev => ({
      ...prev,
      materias: prev.materias.includes(m)
        ? prev.materias.filter(x => x !== m)
        : [...prev.materias, m],
    }))
  }

  const handleSubmit = async (e, nuevoEstado) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const payload = {
        ...form,
        estado: nuevoEstado || form.estado,
        honorarios_total: Number(form.honorarios_total) || 0,
        numero_cuotas:    Number(form.numero_cuotas)    || 1,
        monto_cuota:      Number(form.monto_cuota)      || 0,
        fecha_primera_cuota: form.fecha_primera_cuota || null,
      }
      if (esEdicion) {
        await api.put(`/presupuestos/${id}`, payload)
        navigate('/presupuestos')
      } else {
        const { data } = await api.post('/presupuestos', payload)
        navigate(`/presupuestos/${data.id}/editar`)
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el presupuesto')
    } finally {
      setGuardando(false)
    }
  }

  const linkPublico = useMemo(() => {
    if (!token) return null
    return `${window.location.origin}/presupuesto/${token}`
  }, [token])

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/presupuestos" className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {esEdicion ? 'Editar presupuesto' : 'Nuevo presupuesto'}
          </h1>
          <p className="text-sm text-slate-500">
            {esEdicion ? 'Modifica los datos del presupuesto' : 'Completa los datos para generar el link al prospecto'}
          </p>
        </div>
      </div>

      {error && <AlertaBanner mensaje={error} onClose={() => setError('')} />}

      {linkPublico && (
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
            Link para el prospecto
          </p>
          <div className="flex gap-2 items-center">
            <input readOnly value={linkPublico} className="input flex-1 text-xs font-mono" />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(linkPublico)
                alert('Link copiado')
              }}
              className="btn-primary text-sm whitespace-nowrap"
            >
              Copiar
            </button>
          </div>
          <p className="text-xs text-blue-800 mt-2">
            Envíale este link al prospecto para que pueda revisar y aceptar o rechazar el presupuesto.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Datos del prospecto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Nombre del prospecto" requerido>
              <input name="nombre_prospecto" value={form.nombre_prospecto} onChange={set} required
                className="input" placeholder="Nombre completo" />
            </Campo>
            <Campo label="Correo electrónico">
              <input name="correo" type="email" value={form.correo} onChange={set}
                className="input" placeholder="correo@ejemplo.cl" />
            </Campo>
            <Campo label="Teléfono">
              <input name="telefono" value={form.telefono} onChange={set}
                className="input" placeholder="+56 9 1234 5678" />
            </Campo>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Descripción del servicio
          </h2>
          <Campo label="Materias">
            <div className="flex flex-wrap gap-2">
              {MATERIAS.map(m => {
                const activa = form.materias.includes(m)
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMateria(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      activa
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </Campo>
          <Campo label="Descripción del caso / servicio">
            <textarea name="descripcion" value={form.descripcion} onChange={set} rows={4}
              className="input resize-none"
              placeholder="Explica en qué consiste el servicio legal que ofreces..." />
          </Campo>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Honorarios y pagos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Honorarios totales (CLP)" requerido>
              <input name="honorarios_total" type="number" min="0" step="1000"
                value={form.honorarios_total} onChange={set} required
                className="input" placeholder="1500000" />
            </Campo>
            <Campo label="Número de cuotas">
              <input name="numero_cuotas" type="number" min="1" max="60"
                value={form.numero_cuotas} onChange={set} className="input" />
            </Campo>
            <Campo label="Monto por cuota (CLP)">
              <input name="monto_cuota" type="number" min="0" step="1000"
                value={form.monto_cuota} onChange={set} className="input" />
            </Campo>
            <Campo label="Fecha primera cuota">
              <input name="fecha_primera_cuota" type="date"
                value={form.fecha_primera_cuota} onChange={set} className="input" />
            </Campo>
          </div>
          {form.honorarios_total > 0 && form.numero_cuotas > 0 && (
            <p className="text-xs text-slate-500">
              Resumen: {form.numero_cuotas} cuota(s) de {clp(form.monto_cuota)} = {clp(Number(form.monto_cuota) * Number(form.numero_cuotas))}
            </p>
          )}
        </div>

        <div className="card">
          <Campo label="Notas internas">
            <textarea name="notas" value={form.notas} onChange={set} rows={3}
              className="input resize-none"
              placeholder="Observaciones que solo tú verás..." />
          </Campo>
        </div>

        <div className="flex items-center justify-between gap-3 pb-6 flex-wrap">
          <Link to="/presupuestos" className="btn-secondary">
            Cancelar
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'borrador')}
              disabled={guardando}
              className="btn-secondary"
            >
              {guardando ? 'Guardando...' : 'Guardar borrador'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'enviado')}
              disabled={guardando}
              className="btn-primary"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Marcar como enviado' : 'Crear y enviar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
