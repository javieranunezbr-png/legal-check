import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import AlertaBanner from '../../components/ui/AlertaBanner'
import Spinner from '../../components/ui/Spinner'

const TIPOS_PERSONA   = ['persona', 'empresa']
const ESTADOS_CIVIL   = ['soltero/a', 'casado/a', 'divorciado/a', 'viudo/a', 'conviviente civil', 'separado/a']
const GENEROS         = ['masculino', 'femenino', 'no binario', 'prefiero no decir']
const CANALES         = ['referido', 'redes sociales', 'página web', 'directo', 'otro']
const ESTADOS_CLIENTE = ['vigente', 'terminado', 'derivado']

const VACIO = {
  rut: '', nombre: '', apellidos: '', email: '', telefono: '',
  tipo: 'persona', estado_civil: '', ocupacion: '', nacionalidad: 'chilena',
  genero: '', clave_unica: '', canal_llegada: '', estado: 'vigente',
  abogado_id: '', direccion: '', notas: '',
  nombre_conyuge: '', apellidos_conyuge: '', rut_conyuge: '', direccion_conyuge: '',
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

export default function ClienteForm() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const { isAdmin, usuario } = useAuth()
  const esEdicion      = Boolean(id)

  const { data: usuarios } = useApi(isAdmin ? '/usuarios' : null)

  const [form, setForm]           = useState(VACIO)
  const [conyugeAbierto, setConyuge] = useState(false)
  const [loading, setLoading]     = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')

  // Carga datos en modo edición
  useEffect(() => {
    if (!esEdicion) return
    api.get(`/clientes/${id}`)
      .then(r => {
        const d = r.data
        setForm({ ...VACIO, ...d, abogado_id: d.abogado_id ?? '' })
        // Abre la sección cónyuge si hay datos
        if (d.nombre_conyuge || d.rut_conyuge) setConyuge(true)
      })
      .catch(() => setError('No se pudo cargar el cliente'))
      .finally(() => setLoading(false))
  }, [id, esEdicion])

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const payload = {
        ...form,
        abogado_id: form.abogado_id || (!isAdmin ? usuario.id : null),
      }
      if (esEdicion) {
        await api.put(`/clientes/${id}`, payload)
        navigate(`/clientes/${id}`)
      } else {
        const { data } = await api.post('/clientes', payload)
        navigate(`/clientes/${data.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el cliente')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <Spinner />

  const abogados = usuarios?.filter(u => u.rol === 'abogado') ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link to={esEdicion ? `/clientes/${id}` : '/clientes'} className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h1>
          <p className="text-sm text-slate-500">
            {esEdicion ? 'Modifica los datos del cliente' : 'Completa los datos del nuevo cliente'}
          </p>
        </div>
      </div>

      {error && <AlertaBanner mensaje={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Datos personales */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Datos personales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Nombre" requerido>
              <input name="nombre" value={form.nombre} onChange={set} required className="input" placeholder="Nombre(s)" />
            </Campo>
            <Campo label="Apellidos">
              <input name="apellidos" value={form.apellidos} onChange={set} className="input" placeholder="Apellidos" />
            </Campo>
            <Campo label="RUT" requerido>
              <input name="rut" value={form.rut} onChange={set} required className="input"
                placeholder="12.345.678-9" disabled={esEdicion} />
            </Campo>
            <Campo label="Tipo">
              <select name="tipo" value={form.tipo} onChange={set} className="input">
                {TIPOS_PERSONA.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </Campo>
            <Campo label="Correo electrónico">
              <input name="email" type="email" value={form.email} onChange={set} className="input" placeholder="correo@ejemplo.cl" />
            </Campo>
            <Campo label="Teléfono">
              <input name="telefono" value={form.telefono} onChange={set} className="input" placeholder="+56 9 1234 5678" />
            </Campo>
          </div>
        </div>

        {/* Información adicional */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Información adicional
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Estado civil">
              <select name="estado_civil" value={form.estado_civil} onChange={set} className="input">
                <option value="">— Seleccionar —</option>
                {ESTADOS_CIVIL.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </Campo>
            <Campo label="Género">
              <select name="genero" value={form.genero} onChange={set} className="input">
                <option value="">— Seleccionar —</option>
                {GENEROS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </Campo>
            <Campo label="Ocupación">
              <input name="ocupacion" value={form.ocupacion} onChange={set} className="input" placeholder="Ej: ingeniero, comerciante..." />
            </Campo>
            <Campo label="Nacionalidad">
              <input name="nacionalidad" value={form.nacionalidad} onChange={set} className="input" />
            </Campo>
            <Campo label="Clave Única">
              <input name="clave_unica" value={form.clave_unica} onChange={set} className="input" placeholder="Número de documento" />
            </Campo>
            <Campo label="Canal de llegada">
              <select name="canal_llegada" value={form.canal_llegada} onChange={set} className="input">
                <option value="">— Seleccionar —</option>
                {CANALES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Campo>
          </div>
        </div>

        {/* Dirección */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Dirección</h2>
          <Campo label="Dirección">
            <textarea name="direccion" value={form.direccion} onChange={set} rows={2}
              className="input resize-none" placeholder="Calle, número, comuna, ciudad" />
          </Campo>
        </div>

        {/* Datos del cónyuge (colapsable) */}
        <div className="card">
          <button
            type="button"
            onClick={() => setConyuge(v => !v)}
            className="flex items-center justify-between w-full text-sm font-semibold text-slate-700"
          >
            <span>Datos del cónyuge / conviviente civil</span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${conyugeAbierto ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {conyugeAbierto && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <Campo label="Nombre del cónyuge">
                <input name="nombre_conyuge" value={form.nombre_conyuge} onChange={set} className="input" />
              </Campo>
              <Campo label="Apellidos del cónyuge">
                <input name="apellidos_conyuge" value={form.apellidos_conyuge} onChange={set} className="input" />
              </Campo>
              <Campo label="RUT del cónyuge">
                <input name="rut_conyuge" value={form.rut_conyuge} onChange={set} className="input" placeholder="12.345.678-9" />
              </Campo>
              <div className="sm:col-span-2">
                <Campo label="Dirección del cónyuge">
                  <textarea name="direccion_conyuge" value={form.direccion_conyuge} onChange={set} rows={2}
                    className="input resize-none" />
                </Campo>
              </div>
            </div>
          )}
        </div>

        {/* Asignación */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Asignación</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Estado">
              <select name="estado" value={form.estado} onChange={set} className="input">
                {ESTADOS_CLIENTE.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </Campo>
            {isAdmin && (
              <Campo label="Abogado responsable">
                <select name="abogado_id" value={form.abogado_id} onChange={set} className="input">
                  <option value="">— Sin asignar —</option>
                  {abogados.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </Campo>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="card">
          <Campo label="Notas internas">
            <textarea name="notas" value={form.notas} onChange={set} rows={3}
              className="input resize-none" placeholder="Observaciones, antecedentes relevantes..." />
          </Campo>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link to={esEdicion ? `/clientes/${id}` : '/clientes'} className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}
