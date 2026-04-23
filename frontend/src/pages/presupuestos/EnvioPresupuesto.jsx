import { useState } from 'react'
import api from '../../services/api'

const asuntoDefault = 'Presupuesto de servicios legales - Law Kit'

const mensajeCorreoDefault = (nombre) =>
  `Hola ${nombre || ''}, te enviamos el presupuesto por nuestros servicios legales. Puedes revisarlo y aceptarlo en este link: [link]. Quedamos atentos a cualquier consulta.`

const mensajeWhatsappDefault = (nombre, link) =>
  `Hola ${nombre || ''}, te envío el presupuesto por nuestros servicios legales. Puedes revisarlo aquí: ${link}. Cualquier consulta estoy disponible.`

// Quita todo menos dígitos; si no empieza con 56 (Chile), lo agrega
function telefonoParaWhatsapp(tel) {
  if (!tel) return ''
  const digitos = String(tel).replace(/\D/g, '')
  if (!digitos) return ''
  if (digitos.startsWith('56')) return digitos
  // Si empieza con 9 y tiene 9 dígitos, es móvil chileno → anteponer 56
  if (digitos.length === 9 && digitos.startsWith('9')) return '56' + digitos
  return digitos
}

function Modal({ titulo, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4"
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
  presupuestoId, link, nombreProspecto, correoProspecto, telefonoProspecto,
}) {
  const [modal, setModal] = useState(null) // 'correo' | 'whatsapp' | null

  // Estado para correo
  const [asunto, setAsunto]             = useState(asuntoDefault)
  const [mensajeCorreo, setMensajeCorreo] = useState(mensajeCorreoDefault(nombreProspecto))
  const [destinatario, setDestinatario] = useState(correoProspecto || '')
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)
  const [errorCorreo, setErrorCorreo]   = useState('')
  const [okCorreo, setOkCorreo]         = useState('')

  // Estado para whatsapp
  const [mensajeWpp, setMensajeWpp] = useState(mensajeWhatsappDefault(nombreProspecto, link))
  const [telefonoWpp, setTelefonoWpp] = useState(telefonoProspecto || '')

  const abrirCorreo = () => {
    setAsunto(asuntoDefault)
    setMensajeCorreo(mensajeCorreoDefault(nombreProspecto))
    setDestinatario(correoProspecto || '')
    setErrorCorreo('')
    setOkCorreo('')
    setModal('correo')
  }

  const abrirWhatsapp = () => {
    setMensajeWpp(mensajeWhatsappDefault(nombreProspecto, link))
    setTelefonoWpp(telefonoProspecto || '')
    setModal('whatsapp')
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
      await api.post(`/presupuestos/${presupuestoId}/enviar-correo`, {
        asunto,
        mensaje: mensajeCorreo,
        destinatario: destinatario.trim(),
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
    const url = tel
      ? `https://wa.me/${tel}?text=${texto}`
      : `https://wa.me/?text=${texto}`
    window.open(url, '_blank')
    // Marca como enviado si estaba en borrador
    try {
      await api.post(`/presupuestos/${presupuestoId}/marcar-enviado`)
    } catch { /* no bloquea */ }
    setModal(null)
  }

  return (
    <div className="card bg-blue-50 border-blue-200 space-y-4">
      <div>
        <p className="text-sm font-bold text-blue-900 mb-1">
          📤 Enviar presupuesto al prospecto
        </p>
        <p className="text-xs text-blue-800 mb-3">
          Elige cómo quieres enviarle el link. Puedes editar el mensaje antes.
        </p>

        {/* Botones prominentes de envío */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={abrirCorreo}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#16314f] shadow-sm"
          >
            <span className="text-lg">📧</span>
            <span>Enviar por correo</span>
          </button>
          <button
            type="button"
            onClick={abrirWhatsapp}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] shadow-sm"
          >
            <span className="text-lg">💬</span>
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-blue-200">
        <p className="text-xs font-medium text-blue-900 mb-1.5">
          O copia el link manualmente:
        </p>
        <div className="flex gap-2 items-center">
          <input readOnly value={link} className="input flex-1 text-xs font-mono bg-white" />
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(link); alert('Link copiado') }}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            Copiar
          </button>
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
              <input
                type="email"
                value={destinatario}
                onChange={e => setDestinatario(e.target.value)}
                className="input text-sm"
                placeholder="correo@ejemplo.cl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Asunto</label>
              <input
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mensaje <span className="text-slate-400 font-normal">(puedes editarlo; <code>[link]</code> se reemplaza por el link)</span>
              </label>
              <textarea
                value={mensajeCorreo}
                onChange={e => setMensajeCorreo(e.target.value)}
                rows={6}
                className="input resize-none text-sm"
              />
            </div>
            <p className="text-xs text-slate-400">
              El correo incluirá automáticamente un botón grande con el link al presupuesto.
            </p>
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
                Teléfono <span className="text-slate-400 font-normal">(opcional; si lo dejas vacío, elegirás el contacto en WhatsApp)</span>
              </label>
              <input
                value={telefonoWpp}
                onChange={e => setTelefonoWpp(e.target.value)}
                className="input text-sm"
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mensaje <span className="text-slate-400 font-normal">(puedes editarlo antes de enviar)</span>
              </label>
              <textarea
                value={mensajeWpp}
                onChange={e => setMensajeWpp(e.target.value)}
                rows={6}
                className="input resize-none text-sm"
              />
            </div>
            <p className="text-xs text-slate-400">
              Se abrirá WhatsApp con el mensaje ya escrito. Solo tienes que apretar enviar.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
              <button
                onClick={abrirWhatsappLink}
                className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#20bd5a]"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
