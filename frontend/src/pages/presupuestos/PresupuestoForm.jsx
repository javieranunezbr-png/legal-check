import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import AlertaBanner from '../../components/ui/AlertaBanner'
import Spinner from '../../components/ui/Spinner'
import EnvioPresupuesto from './EnvioPresupuesto'

const MATERIAS = [
  'Familia', 'Civil', 'Laboral', 'Penal', 'Comercial',
  'Tributario', 'Inmobiliario', 'Migratorio', 'Administrativo', 'Otro',
]

const VACIO = {
  nombre_prospecto: '', correo: '', telefono: '', descripcion: '',
  materias: [], numero_cuotas: 1,
  notas: '', estado: 'borrador',
  items: [],
}

const itemVacio = () => ({ nombre: '', precio: '', detalle: '', gestion_id: null })

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

  const { data: gestionesCatalogo, refetch: refetchGestiones } = useApi('/gestiones')

  const [form, setForm]           = useState({ ...VACIO, items: [itemVacio()] })
  const [token, setToken]         = useState('')
  const [idActual, setIdActual]   = useState(id || null)
  const [loading, setLoading]     = useState(esEdicion)
  const [error, setError]         = useState('')
  const [acuerdoId, setAcuerdoId] = useState(null)

  useEffect(() => {
    if (!esEdicion) return
    api.get(`/presupuestos/${id}`)
      .then(r => {
        const d = r.data
        setForm({
          ...VACIO,
          ...d,
          materias: d.materias || [],
          items: (d.items && d.items.length > 0)
            ? d.items.map(it => ({
                nombre: it.nombre,
                precio: it.precio,
                detalle: it.detalle || '',
                gestion_id: it.gestion_id,
              }))
            : [itemVacio()],
        })
        setToken(d.token_unico)
        setAcuerdoId(d.acuerdo_id || null)
      })
      .catch(() => setError('No se pudo cargar el presupuesto'))
      .finally(() => setLoading(false))
  }, [id, esEdicion])

  const set = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleMateria = (m) => {
    setForm(prev => ({
      ...prev,
      materias: prev.materias.includes(m)
        ? prev.materias.filter(x => x !== m)
        : [...prev.materias, m],
    }))
  }

  // ---------- Items ----------

  const setItem = (idx, cambios) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, ...cambios } : it),
    }))
  }

  const agregarItem  = () => setForm(prev => ({ ...prev, items: [...prev.items, itemVacio()] }))
  const quitarItem   = (idx) => setForm(prev => ({
    ...prev,
    items: prev.items.length === 1 ? [itemVacio()] : prev.items.filter((_, i) => i !== idx),
  }))

  // Al elegir una gestión del catálogo, autorrellena precio + detalle
  const seleccionarGestion = (idx, nombreElegido) => {
    const g = gestionesCatalogo?.find(x => x.nombre === nombreElegido)
    if (g) {
      setItem(idx, {
        nombre: g.nombre,
        precio: g.precio_sugerido,
        detalle: g.descripcion || '',
        gestion_id: g.id,
      })
    } else {
      setItem(idx, { nombre: nombreElegido, gestion_id: null })
    }
  }

  const totalItems = useMemo(
    () => form.items.reduce((sum, it) => sum + (Number(it.precio) || 0), 0),
    [form.items]
  )

  const montoCuota = useMemo(() => {
    const n = Number(form.numero_cuotas) || 1
    return n > 0 ? Math.round(totalItems / n) : 0
  }, [totalItems, form.numero_cuotas])

  // ---------- Submit / guardado ----------

  /**
   * Guarda el presupuesto (crea o actualiza) sin navegar.
   * Retorna { id, token } del presupuesto guardado.
   */
  const guardarPresupuesto = async (nuevoEstado) => {
    if (!form.nombre_prospecto?.trim()) {
      throw new Error('Ingresa el nombre del prospecto antes de continuar')
    }

    const itemsLimpios = form.items
      .filter(it => it.nombre && it.nombre.trim())
      .map(it => ({
        nombre: it.nombre.trim(),
        precio: Number(it.precio) || 0,
        detalle: it.detalle || null,
        gestion_id: it.gestion_id || null,
      }))

    const payload = {
      ...form,
      estado: nuevoEstado || form.estado || 'borrador',
      honorarios_total: totalItems,
      numero_cuotas: Number(form.numero_cuotas) || 1,
      monto_cuota: montoCuota,
      items: itemsLimpios,
    }

    if (idActual) {
      const { data } = await api.put(`/presupuestos/${idActual}`, payload)
      refetchGestiones()
      setToken(data.token_unico)
      return { id: idActual, token: data.token_unico }
    } else {
      const { data } = await api.post('/presupuestos', payload)
      refetchGestiones()
      setIdActual(data.id)
      setToken(data.token_unico)
      // Actualiza URL sin recargar para que reload mantenga contexto
      window.history.replaceState(null, '', `/presupuestos/${data.id}/editar`)
      return { id: data.id, token: data.token_unico }
    }
  }

  /**
   * Handler para "Guardar borrador" de la barra inferior (se queda en la página).
   */
  const handleGuardarBorrador = async () => {
    setError('')
    await guardarPresupuesto('borrador')
  }

  /**
   * Asegura que exista un presupuesto guardado antes de enviar/copiar.
   */
  const ensureSaved = async () => {
    if (idActual && token) {
      await guardarPresupuesto(form.estado || 'borrador')
      return { id: idActual, token }
    }
    return guardarPresupuesto('borrador')
  }

  const linkPublico = useMemo(() => {
    if (!token) return null
    return `${window.location.origin}/presupuesto/${token}`
  }, [token])

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28">
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

      <form className="space-y-6">

        {/* Prospecto */}
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

        {/* Descripción */}
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
          <Campo label="Descripción general (opcional)">
            <textarea name="descripcion" value={form.descripcion} onChange={set} rows={3}
              className="input resize-none"
              placeholder="Contexto general del caso. Las gestiones específicas se detallan abajo." />
          </Campo>
        </div>

        {/* Gestiones / items */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-semibold text-slate-700">Gestiones</h2>
            <span className="text-xs text-slate-400">
              {form.items.filter(it => it.nombre?.trim()).length} gestión(es)
            </span>
          </div>

          <datalist id="catalogo-gestiones">
            {gestionesCatalogo?.map(g => (
              <option key={g.id} value={g.nombre} />
            ))}
          </datalist>

          <div className="space-y-3">
            {form.items.map((it, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Gestión
                    </label>
                    <input
                      list="catalogo-gestiones"
                      value={it.nombre}
                      onChange={(e) => seleccionarGestion(idx, e.target.value)}
                      placeholder="Ej: Demanda alimentos, Redacción contrato..."
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Precio (CLP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={it.precio}
                      onChange={(e) => setItem(idx, { precio: e.target.value })}
                      placeholder="500000"
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => quitarItem(idx)}
                      className="w-full h-[38px] rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 text-lg"
                      title="Eliminar gestión"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Detalle / qué incluye <span className="text-slate-400 font-normal">(visible para el cliente)</span>
                  </label>
                  <textarea
                    value={it.detalle}
                    onChange={(e) => setItem(idx, { detalle: e.target.value })}
                    rows={2}
                    placeholder="Ej: Incluye redacción, presentación y 2 audiencias."
                    className="input resize-none text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarItem}
            className="w-full py-2 rounded-lg border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-primary hover:text-primary transition-colors"
          >
            + Agregar gestión
          </button>

          {gestionesCatalogo?.length > 0 && (
            <p className="text-xs text-slate-400">
              💡 Al escribir el nombre puedes elegir de tu catálogo ({gestionesCatalogo.length} gestión(es) guardada(s)). Las gestiones nuevas se guardan automáticamente para reutilizarlas.
            </p>
          )}
        </div>

        {/* Cuotas y total */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
            Forma de pago
          </h2>

          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total honorarios</p>
              <p className="text-2xl font-bold text-slate-800">{clp(totalItems)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Por cuota</p>
              <p className="text-lg font-semibold text-slate-700">
                {form.numero_cuotas} × {clp(montoCuota)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Campo label="Número de cuotas">
              <input name="numero_cuotas" type="number" min="1" max="60"
                value={form.numero_cuotas} onChange={set} className="input" />
            </Campo>
            <p className="text-xs text-slate-500 leading-relaxed pb-2">
              💡 La fecha de la primera cuota se asignará automáticamente cuando marques
              el primer pago como recibido. Las cuotas siguientes se calcularán mensualmente
              desde esa fecha (siempre podrás editarlas manualmente).
            </p>
          </div>
        </div>

        {/* Notas */}
        <div className="card">
          <Campo label="Notas internas">
            <textarea name="notas" value={form.notas} onChange={set} rows={3}
              className="input resize-none"
              placeholder="Observaciones que solo tú verás..." />
          </Campo>
        </div>

      </form>

      <EnvioPresupuesto
        presupuestoId={idActual}
        nombreProspecto={form.nombre_prospecto}
        correoProspecto={form.correo}
        telefonoProspecto={form.telefono}
        estado={form.estado}
        acuerdoId={acuerdoId}
        ensureSaved={ensureSaved}
        onGuardarBorrador={handleGuardarBorrador}
        permiteEliminar={Boolean(idActual)}
      />
    </div>
  )
}
