import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import AlertaBanner from '../../components/ui/AlertaBanner'
import Spinner from '../../components/ui/Spinner'

const ESTADOS  = ['activa', 'cerrada', 'suspendida', 'archivada']
const MATERIAS = ['Civil', 'Familia', 'Laboral', 'Penal', 'Comercial', 'Administrativo', 'Otra']

const VACIO = {
  titulo: '', descripcion: '', rol_causa: '', tribunal: '', materia: '',
  estado: 'activa', cliente_id: '', abogado_id: '', fecha_inicio: '', fecha_termino: '',
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

export default function CausaForm() {
  const { id }             = useParams()
  const [searchParams]     = useSearchParams()
  const navigate           = useNavigate()
  const { isAdmin, usuario } = useAuth()
  const esEdicion          = Boolean(id)

  const { data: clientes } = useApi('/clientes')
  const { data: usuarios } = useApi(isAdmin ? '/usuarios' : null)

  const [form, setForm]       = useState({
    ...VACIO,
    cliente_id: searchParams.get('cliente_id') ?? '',
  })
  const [loading,   setLoading]   = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  // Pre-carga en modo edición
  useEffect(() => {
    if (!esEdicion) return
    api.get(`/causas/${id}`)
      .then(r => {
        const d = r.data
        setForm({
          titulo:       d.titulo ?? '',
          descripcion:  d.descripcion ?? '',
          rol_causa:    d.rol_causa ?? '',
          tribunal:     d.tribunal ?? '',
          materia:      d.materia ?? '',
          estado:       d.estado ?? 'activa',
          cliente_id:   d.cliente_id ?? '',
          abogado_id:   d.abogado_id ?? '',
          fecha_inicio:  d.fecha_inicio?.split('T')[0] ?? '',
          fecha_termino: d.fecha_termino?.split('T')[0] ?? '',
        })
      })
      .catch(() => setError('No se pudo cargar la causa'))
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
        fecha_termino: form.fecha_termino || null,
      }
      if (esEdicion) {
        await api.put(`/causas/${id}`, payload)
        navigate('/causas')
      } else {
        await api.post('/causas', payload)
        // Si venía de una ficha de cliente, volver a ella
        const clienteOrigen = searchParams.get('cliente_id')
        navigate(clienteOrigen ? `/clientes/${clienteOrigen}` : '/causas')
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar la causa')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <Spinner />

  const abogados  = usuarios?.filter(u => u.rol === 'abogado') ?? []
  const volver    = esEdicion ? '/causas' : (searchParams.get('cliente_id') ? `/clientes/${searchParams.get('cliente_id')}` : '/causas')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link to={volver} className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {esEdicion ? 'Editar causa' : 'Nueva causa'}
          </h1>
          <p className="text-sm text-slate-500">
            {esEdicion ? 'Modifica los datos de la causa' : 'Registra una nueva causa judicial'}
          </p>
        </div>
      </div>

      {error && <AlertaBanner mensaje={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Identificación */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Identificación
          </h2>
          <Campo label="Título de la causa" requerido>
            <input name="titulo" value={form.titulo} onChange={set} required className="input"
              placeholder="Ej: Demanda por incumplimiento de contrato" />
          </Campo>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="ROL / Nº expediente">
              <input name="rol_causa" value={form.rol_causa} onChange={set} className="input"
                placeholder="Ej: C-1234-2024" />
            </Campo>
            <Campo label="Tribunal">
              <input name="tribunal" value={form.tribunal} onChange={set} className="input"
                placeholder="Ej: Juzgado Civil de Santiago" />
            </Campo>
            <Campo label="Materia">
              <select name="materia" value={form.materia} onChange={set} className="input">
                <option value="">— Seleccionar —</option>
                {MATERIAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Campo>
            <Campo label="Estado">
              <select name="estado" value={form.estado} onChange={set} className="input">
                {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </Campo>
          </div>
          <Campo label="Descripción / Antecedentes">
            <textarea name="descripcion" value={form.descripcion} onChange={set} rows={3}
              className="input resize-none" placeholder="Contexto del caso, pretensiones, observaciones..." />
          </Campo>
        </div>

        {/* Asignación */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Asignación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Cliente" requerido>
              <select name="cliente_id" value={form.cliente_id} onChange={set} required className="input">
                <option value="">— Seleccionar cliente —</option>
                {(clientes ?? []).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellidos} — {c.rut}
                  </option>
                ))}
              </select>
            </Campo>
            {isAdmin ? (
              <Campo label="Abogado responsable" requerido>
                <select name="abogado_id" value={form.abogado_id} onChange={set} required className="input">
                  <option value="">— Seleccionar —</option>
                  {abogados.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </Campo>
            ) : (
              <div className="flex items-end pb-1">
                <p className="text-sm text-slate-500">Abogado: <strong>{usuario.nombre}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Fechas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Fecha de inicio" requerido>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={set}
                required className="input" />
            </Campo>
            <Campo label="Fecha de término (opcional)">
              <input type="date" name="fecha_termino" value={form.fecha_termino} onChange={set}
                className="input" />
            </Campo>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link to={volver} className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear causa'}
          </button>
        </div>
      </form>
    </div>
  )
}
