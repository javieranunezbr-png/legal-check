import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import { COMUNAS_POR_REGION, REGIONES } from '../../data/comunasChile'

const ESTADO_CIVIL = [
  ['', 'Selecciona...'],
  ['soltero', 'Soltero/a'],
  ['casado', 'Casado/a'],
  ['divorciado', 'Divorciado/a'],
  ['viudo', 'Viudo/a'],
  ['conviviente', 'Conviviente civil'],
]

const GENERO = [
  ['', 'Selecciona...'],
  ['masculino', 'Masculino'],
  ['femenino', 'Femenino'],
  ['otro', 'Otro'],
]

const COMO_NOS_CONOCISTE = [
  ['', 'Selecciona...'],
  ['tiktok', 'TikTok'],
  ['instagram', 'Instagram'],
  ['recomendacion', 'Recomendación'],
  ['otro', 'Otro'],
]

const VACIO = {
  nombre: '', apellidos: '', rut: '',
  email: '', telefono: '', ocupacion: '',
  estado_civil: '', nacionalidad: 'Chilena', genero: '',
  clave_unica: '',
  direccion: '', comuna: '', region: '',
  como_nos_conociste: '',
  consideraciones: '',
}

export default function PortalCliente() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [info, setInfo]       = useState(null)
  const [form, setForm]       = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [listo, setListo]     = useState(false)

  useEffect(() => {
    api.get(`/portal/${token}`)
      .then(r => {
        setInfo(r.data)
        if (r.data.ingreso_completado) setListo(true)
        setForm(f => ({
          ...f,
          nombre:    r.data.nombre    || '',
          apellidos: r.data.apellidos || '',
          email:     r.data.email     || '',
          telefono:  r.data.telefono  || '',
        }))
      })
      .catch(e => setError(e.response?.data?.mensaje || 'No pudimos cargar el portal'))
      .finally(() => setLoading(false))
  }, [token])

  const set = (campo) => (e) =>
    setForm(f => ({ ...f, [campo]: e.target.value }))

  // Cambiar de región resetea la comuna
  const setRegion = (e) => {
    const region = e.target.value
    setForm(f => ({ ...f, region, comuna: '' }))
  }

  const comunasDeRegion = useMemo(
    () => (form.region ? COMUNAS_POR_REGION[form.region] || [] : []),
    [form.region]
  )

  const enviar = async (e) => {
    e.preventDefault()
    setErrorEnvio('')
    setGuardando(true)
    try {
      await api.post(`/portal/${token}`, form)
      setListo(true)
    } catch (err) {
      setErrorEnvio(err.response?.data?.mensaje || 'Error al enviar formulario')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <Pantalla><p className="text-slate-500">Cargando...</p></Pantalla>

  if (error) return (
    <Pantalla>
      <Tarjeta>
        <Encabezado />
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Link no válido</h1>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </Tarjeta>
    </Pantalla>
  )

  if (listo) return (
    <Pantalla>
      <Tarjeta>
        <Encabezado />
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h1 className="text-xl font-semibold text-slate-800 mb-3">¡Tus datos fueron recibidos. Bienvenido/a!</h1>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {info?.mensaje_bienvenida ||
              'Hemos recibido tus datos correctamente. Te contactaremos a la brevedad.'}
          </p>
        </div>
      </Tarjeta>
    </Pantalla>
  )

  return (
    <Pantalla>
      <Tarjeta>
        <Encabezado nombreCliente={info?.nombre} abogado={info?.abogado_nombre} />
        <form onSubmit={enviar} className="p-6 sm:p-8 space-y-7" noValidate>

          <Seccion titulo="Datos personales">
            <Grid>
              <Input label="Nombres" value={form.nombre}    onChange={set('nombre')}    required />
              <Input label="Apellidos" value={form.apellidos} onChange={set('apellidos')} required />
              <Input label="RUT" value={form.rut} onChange={set('rut')} placeholder="12.345.678-9" required />
              <Input label="Correo electrónico" type="email" value={form.email} onChange={set('email')} required />
              <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} placeholder="+56 9 1234 5678" required />
              <Input label="Ocupación" value={form.ocupacion} onChange={set('ocupacion')} required />
              <Select label="Estado civil" value={form.estado_civil} onChange={set('estado_civil')} options={ESTADO_CIVIL} required />
              <Input label="Nacionalidad" value={form.nacionalidad} onChange={set('nacionalidad')} required />
              <Select label="Género" value={form.genero} onChange={set('genero')} options={GENERO} required />
            </Grid>

            <CampoClaveUnica value={form.clave_unica} onChange={set('clave_unica')} />
          </Seccion>

          <Seccion titulo="Dirección">
            <Input label="Calle y número" value={form.direccion} onChange={set('direccion')} required />
            <Grid>
              <Select
                label="Región"
                value={form.region}
                onChange={setRegion}
                options={[['', 'Selecciona...'], ...REGIONES.map(r => [r, r])]}
                required
              />
              <Select
                label="Comuna"
                value={form.comuna}
                onChange={set('comuna')}
                options={[
                  ['', form.region ? 'Selecciona...' : 'Selecciona primero la región'],
                  ...comunasDeRegion.map(c => [c, c]),
                ]}
                required
                disabled={!form.region}
              />
            </Grid>
          </Seccion>

          <Seccion titulo="Otros">
            <Select
              label="¿Cómo nos conociste?"
              value={form.como_nos_conociste}
              onChange={set('como_nos_conociste')}
              options={COMO_NOS_CONOCISTE}
              required
            />
            <Textarea
              label="¿Alguna consideración importante?"
              value={form.consideraciones}
              onChange={set('consideraciones')}
              placeholder="Escribe cualquier información que creas relevante (opcional)"
              rows={4}
            />
          </Seccion>

          {errorEnvio && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorEnvio}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-[#1e3a5f] hover:bg-[#16304d] text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Enviando...' : 'Enviar mis datos'}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Tu información es privada y se compartirá únicamente con {info?.abogado_nombre || 'tu abogado'}.
          </p>
        </form>
      </Tarjeta>
    </Pantalla>
  )
}

/* -------------------------------- helpers -------------------------------- */

function Pantalla({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 py-10">
      {children}
    </div>
  )
}

function Tarjeta({ children }) {
  return (
    <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {children}
    </div>
  )
}

function Encabezado({ nombreCliente, abogado }) {
  return (
    <div className="bg-[#1e3a5f] px-6 sm:px-8 py-6 text-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white text-[#1e3a5f] font-bold flex items-center justify-center">LK</div>
        <div>
          <p className="text-xs opacity-75">Law Kit</p>
          <h1 className="font-semibold">Ingreso de cliente</h1>
        </div>
      </div>
      {nombreCliente && (
        <p className="text-sm opacity-90 mt-3">
          Hola {nombreCliente}, completa los siguientes datos para activar tu ficha
          {abogado ? ` con ${abogado}` : ''}.
        </p>
      )}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{titulo}</h2>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}

function Input({ label, hint, required, ...props }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <input
        {...props}
        required={required}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
      />
      {hint && <span className="text-[11px] text-slate-400 mt-1 block">{hint}</span>}
    </label>
  )
}

function Select({ label, options, required, ...props }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <select
        {...props}
        required={required}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:bg-slate-50 disabled:text-slate-400"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600 mb-1 block">{label}</span>
      <textarea
        {...props}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none"
      />
    </label>
  )
}

/**
 * Campo "Clave única" con ícono de candado, mensaje de protección
 * y validación obligatoria. Visualmente más destacado que el resto.
 */
function CampoClaveUnica({ value, onChange }) {
  const [verClave, setVerClave] = useState(false)

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-4 mt-3">
      <div className="flex items-start gap-3">
        {/* Ícono candado */}
        <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.105 0 2 .895 2 2v3a2 2 0 11-4 0v-3c0-1.105.895-2 2-2zm6-2V7a6 6 0 10-12 0v2H4v12h16V9h-2zm-10 0V7a4 4 0 118 0v2H8z" />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Clave única
              <span className="text-red-500 ml-0.5">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              type={verClave ? 'text' : 'password'}
              value={value}
              onChange={onChange}
              required
              autoComplete="off"
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white"
            />
            <button
              type="button"
              onClick={() => setVerClave(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              tabIndex={-1}
            >
              {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-1.5 pt-1">
            <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>
              <b className="text-slate-700">Tu información está protegida.</b> Esta clave será utilizada
              únicamente por tu abogado para realizar gestiones en tu nombre y queda bajo estricto
              <b> secreto profesional</b>. Nunca será compartida con terceros.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
