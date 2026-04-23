import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'

const CAMPOS_INICIALES = {
  rut: '', nombre: '', apellidos: '',
  email: '', telefono: '', direccion: '',
  tipo: 'persona',
  estado_civil: '', ocupacion: '', nacionalidad: 'Chilena', genero: '',
  nombre_conyuge: '', apellidos_conyuge: '', rut_conyuge: '', direccion_conyuge: '',
}

export default function PortalCliente() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [info, setInfo]       = useState(null)
  const [form, setForm]       = useState(CAMPOS_INICIALES)
  const [guardando, setGuardando] = useState(false)
  const [listo, setListo]     = useState(false)

  useEffect(() => {
    api.get(`/portal/${token}`)
      .then(r => {
        setInfo(r.data)
        if (r.data.portal_completado_en) setListo(true)
        setForm(f => ({
          ...f,
          nombre:   r.data.nombre_prospecto?.split(' ')[0] || '',
          apellidos: r.data.nombre_prospecto?.split(' ').slice(1).join(' ') || '',
          email:    r.data.correo   || '',
          telefono: r.data.telefono || '',
        }))
      })
      .catch(e => setError(e.response?.data?.mensaje || 'No se pudo cargar el portal'))
      .finally(() => setLoading(false))
  }, [token])

  const actualizar = (campo) => (e) =>
    setForm(f => ({ ...f, [campo]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post(`/portal/${token}/completar`, form)
      setListo(true)
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al enviar formulario')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <Pantalla><p className="text-slate-500">Cargando...</p></Pantalla>

  if (error) return (
    <Pantalla>
      <div className="max-w-md bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h1 className="text-lg font-semibold text-slate-800 mb-2">No encontrado</h1>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    </Pantalla>
  )

  if (listo) return (
    <Pantalla>
      <div className="max-w-md bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h1 className="text-lg font-semibold text-slate-800 mb-2">¡Listo!</h1>
        <p className="text-sm text-slate-500">
          Hemos recibido tus datos. {info?.abogado_nombre ? `${info.abogado_nombre} se contactará contigo pronto.` : 'Te contactaremos pronto.'}
        </p>
      </div>
    </Pantalla>
  )

  return (
    <Pantalla>
      <div className="max-w-2xl w-full">
        {/* Encabezado */}
        <div className="bg-[#1e3a5f] rounded-t-2xl px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white text-[#1e3a5f] font-bold flex items-center justify-center">LK</div>
            <div>
              <p className="text-xs opacity-75">Law Kit</p>
              <h1 className="font-semibold">Ingreso de cliente</h1>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-3">
            Hola {info?.nombre_prospecto}, completa tus datos para que {info?.abogado_nombre || 'tu abogado'} pueda ingresarte formalmente como cliente.
          </p>
        </div>

        <form onSubmit={enviar} className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <Seccion titulo="Datos personales">
            <Grid>
              <Input label="RUT *" value={form.rut} onChange={actualizar('rut')} placeholder="12.345.678-9" required />
              <Select label="Tipo" value={form.tipo} onChange={actualizar('tipo')}
                      options={[['persona','Persona natural'],['empresa','Empresa']]} />
              <Input label="Nombre *" value={form.nombre} onChange={actualizar('nombre')} required />
              <Input label="Apellidos" value={form.apellidos} onChange={actualizar('apellidos')} />
              <Input label="Correo" type="email" value={form.email} onChange={actualizar('email')} />
              <Input label="Teléfono" value={form.telefono} onChange={actualizar('telefono')} />
            </Grid>
            <Input label="Dirección" value={form.direccion} onChange={actualizar('direccion')} />
          </Seccion>

          <Seccion titulo="Antecedentes">
            <Grid>
              <Select label="Estado civil" value={form.estado_civil} onChange={actualizar('estado_civil')}
                      options={[['',''],['soltero','Soltero/a'],['casado','Casado/a'],['conviviente','Conviviente civil'],['divorciado','Divorciado/a'],['viudo','Viudo/a']]} />
              <Input label="Ocupación" value={form.ocupacion} onChange={actualizar('ocupacion')} />
              <Input label="Nacionalidad" value={form.nacionalidad} onChange={actualizar('nacionalidad')} />
              <Select label="Género" value={form.genero} onChange={actualizar('genero')}
                      options={[['',''],['femenino','Femenino'],['masculino','Masculino'],['otro','Otro'],['prefiero_no_decir','Prefiero no decir']]} />
            </Grid>
          </Seccion>

          {['casado','conviviente'].includes(form.estado_civil) && (
            <Seccion titulo="Datos del cónyuge / conviviente">
              <Grid>
                <Input label="Nombre" value={form.nombre_conyuge} onChange={actualizar('nombre_conyuge')} />
                <Input label="Apellidos" value={form.apellidos_conyuge} onChange={actualizar('apellidos_conyuge')} />
                <Input label="RUT" value={form.rut_conyuge} onChange={actualizar('rut_conyuge')} />
                <Input label="Dirección" value={form.direccion_conyuge} onChange={actualizar('direccion_conyuge')} />
              </Grid>
            </Seccion>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-[#1e3a5f] hover:bg-[#16304d] text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50"
          >
            {guardando ? 'Enviando...' : 'Enviar datos'}
          </button>
          <p className="text-xs text-slate-400 text-center">
            Tus datos serán compartidos solo con {info?.abogado_nombre || 'tu abogado'} para la gestión de tu caso.
          </p>
        </form>
      </div>
    </Pantalla>
  )
}

function Pantalla({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 py-10">
      {children}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</h2>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 mb-1 block">{label}</span>
      <input
        {...props}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
      />
    </label>
  )
}

function Select({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 mb-1 block">{label}</span>
      <select
        {...props}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}
