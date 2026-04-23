import { useState } from 'react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import Badge from '../../components/ui/Badge'
import AlertaBanner from '../../components/ui/AlertaBanner'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const ROLES = ['abogado', 'admin']

const VACIO_FORM = { nombre: '', email: '', rol: 'abogado', password: '', activo: true }

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

function PanelUsuario({ usuario, onGuardado, onCancelar }) {
  const esEdicion = Boolean(usuario?.id)
  const [form, setForm]       = useState(
    esEdicion
      ? { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, password: '', activo: usuario.activo }
      : { ...VACIO_FORM }
  )
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  const set = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [e.target.name]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!esEdicion && form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setGuardando(true)
    setError('')
    try {
      if (esEdicion) {
        const payload = { nombre: form.nombre, email: form.email, rol: form.rol, activo: form.activo }
        await api.put(`/usuarios/${usuario.id}`, payload)
        if (form.password.length >= 8) {
          await api.patch(`/usuarios/${usuario.id}/password`, { password: form.password })
        }
      } else {
        await api.post('/usuarios', form)
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar usuario')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="card border-l-4 border-l-primary space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          {esEdicion ? `Editar — ${usuario.nombre}` : 'Nuevo usuario'}
        </h3>
        <button onClick={onCancelar} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
      </div>

      {error && <AlertaBanner mensaje={error} tipo="error" onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Nombre completo" requerido>
            <input name="nombre" value={form.nombre} onChange={set} required className="input" placeholder="Nombre" />
          </Campo>
          <Campo label="Correo electrónico" requerido>
            <input name="email" type="email" value={form.email} onChange={set} required className="input" />
          </Campo>
          <Campo label="Rol" requerido>
            <select name="rol" value={form.rol} onChange={set} className="input">
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </Campo>
          <Campo label={esEdicion ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'} requerido={!esEdicion}>
            <input
              name="password" type="password" value={form.password} onChange={set}
              required={!esEdicion} minLength={!esEdicion ? 8 : undefined}
              className="input" placeholder={esEdicion ? 'Mínimo 8 caracteres' : '••••••••'}
            />
          </Campo>
        </div>

        {esEdicion && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" name="activo" checked={form.activo} onChange={set}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-slate-700">Usuario activo</span>
          </label>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onCancelar} className="btn-secondary text-sm">Cancelar</button>
          <button type="submit" disabled={guardando} className="btn-primary text-sm">
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function UsuariosAdmin() {
  const { data: usuarios, loading, error, refetch } = useApi('/usuarios')
  const [panel, setPanel] = useState(null) // null | 'nuevo' | { id, ... }

  const handleGuardado = () => {
    setPanel(null)
    refetch()
  }

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Configuración — Usuarios</h1>
          <p className="text-sm text-slate-500">{usuarios.length} usuarios registrados</p>
        </div>
        {panel === null && (
          <button onClick={() => setPanel('nuevo')} className="btn-primary">
            + Nuevo usuario
          </button>
        )}
      </div>

      {/* Panel de creación */}
      {panel === 'nuevo' && (
        <PanelUsuario
          usuario={null}
          onGuardado={handleGuardado}
          onCancelar={() => setPanel(null)}
        />
      )}

      {/* Lista */}
      {usuarios.length === 0 ? (
        <div className="card">
          <EmptyState titulo="Sin usuarios" descripcion="Crea el primer usuario del sistema" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: '#1e3a5f' }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{u.nombre}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setPanel(panel?.id === u.id ? null : u)}
                      className="text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                    >
                      {panel?.id === u.id ? 'Cancelar' : 'Editar'}
                    </button>
                  </td>
                </tr>
              ))}
              {/* Panel de edición inline bajo la fila */}
            </tbody>
          </table>

          {/* Panel edición (aparece debajo de la tabla) */}
          {panel && panel !== 'nuevo' && (
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <PanelUsuario
                usuario={panel}
                onGuardado={handleGuardado}
                onCancelar={() => setPanel(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
