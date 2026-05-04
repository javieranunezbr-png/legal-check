import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

const asuntoDefault = 'Presupuesto de servicios legales — lawkit'

const mensajeCorreoDefault = (nombre) =>
  `Hola ${nombre || ''}, te enviamos el presupuesto por nuestros servicios legales. Puedes revisarlo y aceptarlo en este link: [link]. Quedamos atentos a cualquier consulta.`

const mensajeWhatsappDefault = (nombre, link) =>
  `Hola ${nombre || ''}, te envío el presupuesto por nuestros servicios legales. Puedes revisarlo aquí: ${link || ''}. Cualquier consulta estoy disponible.`

function telefonoParaWhatsapp(tel) {
  if (!tel) return ''
  const digitos = String(tel).replace(/\D/g, '')
  if (!digitos) return ''
  if (digitos.startsWith('56')) return digitos
  if (digitos.length === 9 && digitos.startsWith('9')) return '56' + digitos
  return digitos
}

function Modal({ titulo, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{titulo}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function EnvioPresupuesto({
  presupuestoId, nombreProspecto, correoProspecto, telefonoProspecto,
  estado, acuerdoId,
  ensureSaved, onGuardarBorrador, permiteEliminar,
}) {
  const navigate = useNavigate()

  const [modal, setModal]             = useState(null) // 'correo' | 'whatsapp' | null
  const [preparando, setPreparando]   = useState(null) // 'copiar' | 'correo' | 'whatsapp' | 'guardar' | null
  const [toast, setToast]             = useState('')   // mensaje verde temporal
  const [errorGlobal, setErrorGlobal] = useState('')

  const [idGuardado, setIdGuardado]   = useState(presupuestoId)

  // correo
  const [asunto, setAsunto]                 = useState(asuntoDefault)
  const [mensajeCorreo, setMensajeCorreo]   = useState('')
  const [destinatario, setDestinatario]     = useState('')
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)
  const [errorCorreo, setErrorCorreo]       = useState('')
  const [okCorreo, setOkCorreo]             = useState('')

  // whatsapp
  const [mensajeWpp, setMensajeWpp]         = useState('')
  const [telefonoWpp, setTelefonoWpp]       = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2000)
    return () => clearTimeout(t)
  }, [toast])

  /** Guarda (si no estaba) y retorna { id, link }. */
  const prepararEnvio = async (tipo) => {
    setErrorGlobal('')
    setPreparando(tipo)
    try {
      const { id, token } = await ensureSaved()
      const link = `${window.location.origin}/presupuesto/${token}`
      setIdGuardado(id)
      return { id, link }
    } catch (err) {
      setErrorGlobal(err.response?.data?.mensaje || err.message || 'Error al guardar el presupuesto')
      throw err
    } finally {
      setPreparando(null)
    }
  }

  const handleGuardarBorrador = async () => {
    setErrorGlobal('')
    setPreparando('guardar')
    try {
      await onGuardarBorrador()
      setToast('Borrador guardado')
    } catch (err) {
      setErrorGlobal(err.response?.data?.mensaje || err.message || 'Error al guardar')
    } finally {
      setPreparando(null)
    }
  }

  const handleCopiar = async () => {
    try {
      const { link } = await prepararEnvio('copiar')
      await navigator.clipboard.writeText(link)
      setToast('¡Link copiado!')
    } catch { /* seteado */ }
  }

  const handleAbrirCorreo = async () => {
    try {
      await prepararEnvio('correo')
      setAsunto(asuntoDefault)
      setMensajeCorreo(mensajeCorreoDefault(nombreProspecto))
      setDestinatario(correoProspecto || '')
      setErrorCorreo('')
      setOkCorreo('')
      setModal('correo')
    } catch { /* seteado */ }
  }

  const handleAbrirWhatsapp = async () => {
    try {
      const { link } = await prepararEnvio('whatsapp')
      setMensajeWpp(mensajeWhatsappDefault(nombreProspecto, link))
      setTelefonoWpp(telefonoProspecto || '')
      setModal('whatsapp')
    } catch { /* seteado */ }
  }

  const enviarCorreo = async () => {
    setErrorCorreo('')
    setOkCorreo('')
    if (!destinatario.trim()) {
      setErrorCorreo('Falta el correo del destinatario')
      return
    }
    setEnviandoCorreo(true)
    try {
      await api.post(`/presupuestos/${idGuardado}/enviar-correo`, {
        asunto, mensaje: mensajeCorreo, destinatario: destinatario.trim(),
      })
      setOkCorreo(`Correo enviado a ${destinatario}`)
      setTimeout(() => setModal(null), 1200)
    } catch (err) {
      setErrorCorreo(err.response?.data?.mensaje || 'Error al enviar el correo')
    } finally {
      setEnviandoCorreo(false)
    }
  }

  const abrirWhatsappLink = async () => {
    const tel = telefonoParaWhatsapp(telefonoWpp)
    const texto = encodeURIComponent(mensajeWpp)
    const url = tel ? `https://wa.me/${tel}?text=${texto}` : `https://wa.me/?text=${texto}`
    window.open(url, '_blank')
    try { await api.post(`/presupuestos/${idGuardado}/marcar-enviado`) } catch { /* no bloquea */ }
    setModal(null)
  }

  const handleEliminar = async () => {
    if (!idGuardado) return
    if (!confirm('¿Estás seguro que deseas eliminar este presupuesto?')) return
    try {
      await api.delete(`/presupuestos/${idGuardado}`)
      navigate('/presupuestos')
    } catch (err) {
      setErrorGlobal(err.response?.data?.mensaje || 'Error al eliminar presupuesto')
    }
  }

  const ocupado     = preparando !== null
  const hayCorreo   = Boolean(correoProspecto?.trim())
  const hayTelefono = Boolean(telefonoProspecto?.trim())

  // El portal del cliente ahora se dispara automáticamente al marcar la primera
  // cuota como pagada (ver backend cuotas.service). Ya no se controla desde aquí.

  return (
    <>
      {/* Toast flotante */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg">
          ✓ {toast}
        </div>
      )}

      {/* Banner: presupuesto aceptado → ya hay acuerdo de cobro */}
      {estado === 'aceptado' && acuerdoId && (
        <div className="max-w-3xl mx-auto mb-4">
          <div className="card border-2 border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg flex-shrink-0">✓</div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-sm">Presupuesto aceptado</h3>
              <p className="text-xs text-slate-600 mt-1">
                Se creó automáticamente el cliente, la causa, el acuerdo y las cuotas.
                Cuando marques la primera cuota como pagada, se enviará el formulario al cliente.
              </p>
            </div>
            <Link
              to={`/cobros/acuerdo/${acuerdoId}`}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap"
            >
              Ver cobros →
            </Link>
          </div>
        </div>
      )}

      {/* Barra sticky de acciones */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)] z-30">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {errorGlobal && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorGlobal}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              {permiteEliminar && idGuardado && (
                <button
                  type="button"
                  onClick={handleEliminar}
                  disabled={ocupado}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap items-center justify-end">
              <button
                type="button"
                onClick={handleGuardarBorrador}
                disabled={ocupado}
                className="btn-secondary text-sm"
              >
                {preparando === 'guardar' ? 'Guardando...' : 'Guardar borrador'}
              </button>

              <button
                type="button"
                onClick={handleCopiar}
                disabled={ocupado}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                <span>🔗</span>
                <span>{preparando === 'copiar' ? '...' : 'Copiar link'}</span>
              </button>

              {hayCorreo && (
                <button
                  type="button"
                  onClick={handleAbrirCorreo}
                  disabled={ocupado}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  <span>📧</span>
                  <span>{preparando === 'correo' ? '...' : 'Enviar por correo'}</span>
                </button>
              )}

              {hayTelefono && (
                <button
                  type="button"
                  onClick={handleAbrirWhatsapp}
                  disabled={ocupado}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] disabled:opacity-50"
                >
                  <span>💬</span>
                  <span>{preparando === 'whatsapp' ? '...' : 'WhatsApp'}</span>
                </button>
              )}
            </div>
          </div>

          {!hayCorreo && !hayTelefono && (
            <p className="text-xs text-slate-400 mt-2 text-right">
              Agrega correo o teléfono al prospecto para habilitar el envío directo.
            </p>
          )}
        </div>
      </div>

      {/* Modal Correo */}
      {modal === 'correo' && (
        <Modal titulo="Enviar por correo" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {errorCorreo && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{errorCorreo}</div>}
            {okCorreo && <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">{okCorreo}</div>}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Destinatario</label>
              <input type="email" value={destinatario} onChange={e => setDestinatario(e.target.value)} className="input text-sm" placeholder="correo@ejemplo.cl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Asunto</label>
              <input value={asunto} onChange={e => setAsunto(e.target.value)} className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mensaje <span className="text-slate-400 font-normal">(<code>[link]</code> se reemplaza por el link)</span>
              </label>
              <textarea value={mensajeCorreo} onChange={e => setMensajeCorreo(e.target.value)} rows={6} className="input resize-none text-sm" />
            </div>
            <p className="text-xs text-slate-400">El correo incluirá automáticamente un botón con el link al presupuesto.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
              <button onClick={enviarCorreo} disabled={enviandoCorreo} className="btn-primary">
                {enviandoCorreo ? 'Enviando...' : 'Enviar correo'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal WhatsApp */}
      {modal === 'whatsapp' && (
        <Modal titulo="Enviar por WhatsApp" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input value={telefonoWpp} onChange={e => setTelefonoWpp(e.target.value)} className="input text-sm" placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mensaje</label>
              <textarea value={mensajeWpp} onChange={e => setMensajeWpp(e.target.value)} rows={6} className="input resize-none text-sm" />
            </div>
            <p className="text-xs text-slate-400">Se abrirá WhatsApp con el mensaje escrito. Solo apretas enviar.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
              <button onClick={abrirWhatsappLink} className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#20bd5a]">
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
