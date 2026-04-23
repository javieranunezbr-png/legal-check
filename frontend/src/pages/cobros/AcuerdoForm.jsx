import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import AlertaBanner from '../../components/ui/AlertaBanner'

const TIPOS_COBRO   = ['honorarios', 'cuotas', 'exito', 'mixto']
const PERIODICIDAD  = ['mensual', 'quincenal', 'semanal']

const VACIO = {
  causa_id: '', descripcion: '', monto_total: '', tipo_cobro: 'cuotas',
  fecha_acuerdo: '', porcentaje_exito: '', notas: '',
  cantidad_cuotas: '1', fecha_primera_cuota: '', periodicidad: 'mensual',
}

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

export default function AcuerdoForm() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const { data: causas } = useApi('/causas')

  const [form, setForm]       = useState({ ...VACIO, causa_id: searchParams.get('causa_id') ?? '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError]     = useState('')

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const necesitaCuotas = ['cuotas', 'mixto'].includes(form.tipo_cobro)
  const necesitaExito  = ['exito', 'mixto'].includes(form.tipo_cobro)

  // Preview automático del monto por cuota
  const montoCuota = necesitaCuotas && form.monto_total && form.cantidad_cuotas > 0
    ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
        .format(parseFloat(form.monto_total) / parseInt(form.cantidad_cuotas))
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const payload = {
        ...form,
        monto_total:     parseFloat(form.monto_total),
        cantidad_cuotas: necesitaCuotas ? parseInt(form.cantidad_cuotas) : undefined,
        porcentaje_exito: form.porcentaje_exito ? parseFloat(form.porcentaje_exito) : undefined,
        fecha_primera_cuota: necesitaCuotas ? form.fecha_primera_cuota : undefined,
        periodicidad: necesitaCuotas ? form.periodicidad : undefined,
      }
      const { data } = await api.post('/acuerdos', payload)
      navigate(`/cobros/acuerdo/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el acuerdo')
    } finally {
      setGuardando(false)
    }
  }

  const volver = form.causa_id
    ? `/cobros/causa/${form.causa_id}`
    : '/cobros'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link to={volver} className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Nuevo acuerdo de cobro</h1>
          <p className="text-sm text-slate-500">Define las condiciones de pago para la causa</p>
        </div>
      </div>

      {error && <AlertaBanner mensaje={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Causa */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Causa asociada</h2>
          <Campo label="Causa" requerido>
            <select name="causa_id" value={form.causa_id} onChange={set} required className="input">
              <option value="">— Seleccionar causa —</option>
              {(causas ?? []).map(c => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                  {c.rol_causa ? ` (${c.rol_causa})` : ''}
                  {c.cliente_nombre ? ` — ${c.cliente_nombre} ${c.cliente_apellidos ?? ''}` : ''}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {/* Condiciones económicas */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Condiciones económicas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Monto total (CLP)" requerido>
              <input
                name="monto_total" type="number" min="0" step="1"
                value={form.monto_total} onChange={set} required
                className="input" placeholder="1500000"
              />
            </Campo>
            <Campo label="Tipo de cobro" requerido>
              <select name="tipo_cobro" value={form.tipo_cobro} onChange={set} required className="input">
                {TIPOS_COBRO.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Campo>
            {necesitaExito && (
              <Campo label="Porcentaje de éxito (%)">
                <input
                  name="porcentaje_exito" type="number" min="0" max="100" step="0.5"
                  value={form.porcentaje_exito} onChange={set}
                  className="input" placeholder="Ej: 15"
                />
              </Campo>
            )}
            <Campo label="Fecha del acuerdo" requerido>
              <input
                name="fecha_acuerdo" type="date"
                value={form.fecha_acuerdo} onChange={set} required className="input"
              />
            </Campo>
          </div>
        </div>

        {/* Plan de cuotas */}
        {necesitaCuotas && (
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
              Plan de cuotas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Campo label="Cantidad de cuotas" requerido>
                <input
                  name="cantidad_cuotas" type="number" min="1" max="120"
                  value={form.cantidad_cuotas} onChange={set} required className="input"
                />
              </Campo>
              <Campo label="Periodicidad" requerido>
                <select name="periodicidad" value={form.periodicidad} onChange={set} required className="input">
                  {PERIODICIDAD.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Fecha 1ª cuota" requerido>
                <input
                  name="fecha_primera_cuota" type="date"
                  value={form.fecha_primera_cuota} onChange={set} required className="input"
                />
              </Campo>
            </div>

            {/* Preview monto cuota */}
            {montoCuota && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                Cada cuota: <strong>{montoCuota}</strong>
                {' '}— {form.cantidad_cuotas} cuotas {form.periodicidad}es
                {form.fecha_primera_cuota && (
                  <> a partir del {new Date(form.fecha_primera_cuota).toLocaleDateString('es-CL')}</>
                )}
              </div>
            )}
          </div>
        )}

        {/* Descripción y notas */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Detalles</h2>
          <Campo label="Descripción del acuerdo">
            <textarea name="descripcion" value={form.descripcion} onChange={set} rows={2}
              className="input resize-none" placeholder="Descripción breve del acuerdo, condiciones especiales..." />
          </Campo>
          <Campo label="Notas internas">
            <textarea name="notas" value={form.notas} onChange={set} rows={2}
              className="input resize-none" placeholder="Observaciones, antecedentes del acuerdo..." />
          </Campo>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link to={volver} className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Creando...' : 'Crear acuerdo'}
          </button>
        </div>
      </form>
    </div>
  )
}
