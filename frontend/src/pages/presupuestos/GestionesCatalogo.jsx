import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import AlertaBanner from '../../components/ui/AlertaBanner'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number(n) || 0)

const VACIO = { nombre: '', precio_sugerido: '', descripcion: '' }

export default function GestionesCatalogo() {
  const { data: gestiones, loading, error, refetch } = useApi('/gestiones')
  const [editando, setEditando] = useState(null) // id o 'nueva'
  const [form, setForm]         = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [err, setErr]           = useState('')

  const abrirNueva = () => {
    setEditando('nueva')
    setForm(VACIO)
    setErr('')
  }

  const abrirEdicion = (g) => {
    setEditando(g.id)
    setForm({
      nombre: g.nombre,
      precio_sugerido: g.precio_sugerido,
      descripcion: g.descripcion || '',
    })
    setErr('')
  }

  const cerrar = () => { setEditando(null); setForm(VACIO); setErr('') }

  const guardar = async () => {
    if (!form.nombre.trim()) return setErr('El nombre es requerido')
    setGuardando(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio_sugerido: Number(form.precio_sugerido) || 0,
        descripcion: form.descripcion || null,
      }
      if (editando === 'nueva') {
        await api.post('/gestiones', payload)
      } else {
        await api.put(`/gestiones/${editando}`, payload)
      }
      refetch()
      cerrar()
    } catch (e) {
      setErr(e.response?.data?.mensaje || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (g) => {
    if (!confirm(`¿Eliminar la gestión "${g.nombre}"?`)) return
    try {
      await api.delete(`/gestiones/${g.id}`)
      refetch()
    } catch {
      alert('Error al eliminar')
    }
  }

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/presupuestos" className="hover:text-slate-600">Presupuestos</Link>
            <span>/</span>
            <span>Catálogo de gestiones</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Catálogo de gestiones</h1>
          <p className="text-sm text-slate-500">
            {gestiones.length} gestión(es) guardada(s) para reutilizar en tus presupuestos
          </p>
        </div>
        <button onClick={abrirNueva} className="btn-primary">+ Nueva gestión</button>
      </div>

      {editando && (
        <div className="card space-y-3 border-primary/30">
          <h2 className="text-sm font-semibold text-slate-700">
            {editando === 'nueva' ? 'Nueva gestión' : 'Editar gestión'}
          </h2>
          {err && <AlertaBanner mensaje={err} onClose={() => setErr('')} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                className="input"
                placeholder="Ej: Demanda de alimentos"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Precio sugerido (CLP)</label>
              <input
                type="number" min="0" step="1000"
                value={form.precio_sugerido}
                onChange={e => setForm(p => ({ ...p, precio_sugerido: e.target.value }))}
                className="input"
                placeholder="500000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Descripción / qué incluye (visible para el cliente)
            </label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              className="input resize-none"
              placeholder="Ej: Incluye redacción de demanda, presentación y 2 audiencias."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={cerrar} className="btn-secondary">Cancelar</button>
            <button onClick={guardar} disabled={guardando} className="btn-primary">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {gestiones.length === 0 ? (
        <div className="card">
          <EmptyState
            titulo="No tienes gestiones guardadas"
            descripcion="Crea tu catálogo para reutilizarlas al armar presupuestos. También se guardan automáticamente cuando agregas gestiones nuevas en un presupuesto."
            accion={<button onClick={abrirNueva} className="btn-primary text-sm">+ Nueva gestión</button>}
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio sugerido</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descripción</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gestiones.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{g.nombre}</td>
                    <td className="px-6 py-4 text-slate-700">{clp(g.precio_sugerido)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-md">
                      {g.descripcion || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => abrirEdicion(g)}
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(g)}
                          className="text-slate-400 hover:text-red-600 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
