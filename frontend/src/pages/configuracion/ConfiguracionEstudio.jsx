import { useState, useEffect } from 'react'
import api from '../../services/api'
import Spinner from '../../components/ui/Spinner'

const MENSAJE_DEFAULT =
  'Hemos recibido tus datos correctamente. Bienvenido/a a nuestro estudio jurídico — ' +
  'a partir de ahora trabajaremos contigo de forma personalizada y bajo estricto secreto profesional. ' +
  'Te contactaremos a la brevedad para coordinar los próximos pasos.'

export default function ConfiguracionEstudio() {
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/configuracion')
      .then(r => setMensaje(r.data.mensaje_bienvenida_portal || MENSAJE_DEFAULT))
      .catch(() => setError('No se pudo cargar la configuración'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await api.put('/configuracion', { mensaje_bienvenida_portal: mensaje })
      setToast('Cambios guardados')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const restaurar = () => setMensaje(MENSAJE_DEFAULT)

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg">
          ✓ {toast}
        </div>
      )}

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Configuración del estudio</h1>
        <p className="text-sm text-slate-500">Personaliza la comunicación con tus clientes.</p>
      </div>

      {/* Mensaje del portal */}
      <form onSubmit={guardar} className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Mensaje de bienvenida del portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Es el texto que verá el cliente justo después de completar su ficha en el portal de
            ingreso (<code className="text-slate-600">/ingreso/[token]</code>). Mantén un tono
            profesional acorde a tu estudio jurídico.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          rows={6}
          className="input resize-none text-sm leading-relaxed"
          placeholder={MENSAJE_DEFAULT}
        />
        <p className="text-xs text-slate-400">
          {mensaje.length} caracteres · Puedes usar saltos de línea para separar párrafos.
        </p>

        {/* Vista previa */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Vista previa
          </p>
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">✓</div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              ¡Tus datos fueron recibidos. Bienvenido/a!
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {mensaje || MENSAJE_DEFAULT}
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={restaurar}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Restaurar mensaje sugerido
          </button>
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
