import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Spinner from '../../components/ui/Spinner'

/**
 * Vista imprimible de un documento autogenerado (mandato / contrato).
 * Full-screen (sin sidebar). El botón "Descargar PDF" usa la impresión
 * del navegador (Imprimir → Guardar como PDF). El CSS de impresión
 * deja solo la hoja del documento.
 */
export default function DocumentoView() {
  const { id, tipo } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/documentos/cliente/${id}?tipo=${tipo}`)
      .then(r => setDoc(r.data))
      .catch(e => setError(e.response?.data?.mensaje || 'No se pudo generar el documento'))
      .finally(() => setLoading(false))
  }, [id, tipo])

  if (loading) return <div className="min-h-screen bg-soft flex items-center justify-center"><Spinner /></div>
  if (error) return (
    <div className="min-h-screen bg-soft flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm">Volver</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-soft">
      <style>{`
        @media print {
          .doc-toolbar { display: none !important; }
          .doc-sheet { box-shadow: none !important; margin: 0 !important; }
          @page { margin: 2.2cm; }
          body { background: #fff !important; }
        }
        .doc-body h1 {
          font-size: 17px; font-weight: 800; text-align: center;
          letter-spacing: .02em; margin: 0 0 26px; color: #1F2125;
        }
        .doc-body p { margin: 0 0 14px; }
        .doc-body .firmas {
          display: flex; gap: 48px; margin-top: 64px;
          text-align: center; font-size: 13px;
        }
        .doc-body .firmas > div { flex: 1; }
        .doc-body .firmas .linea {
          border-top: 1px solid #1F2125; margin-bottom: 6px;
        }
        .doc-body .firmas span { color: #6F6C64; font-size: 11px; }
      `}</style>

      {/* Toolbar (oculta al imprimir) */}
      <div className="doc-toolbar sticky top-0 z-10 bg-carbon text-white">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="text-sm text-zinc-300 hover:text-white transition-colors">
            ← Volver a la ficha
          </button>
          <span className="text-sm font-medium hidden sm:block">
            {doc.titulo} · {doc.cliente}
          </span>
          <button onClick={() => window.print()}
            className="bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Hoja del documento */}
      <div className="py-8 px-4 flex justify-center">
        <div className="doc-sheet bg-white w-full max-w-3xl shadow-xl rounded-sm"
          style={{ padding: '3.2rem clamp(1.5rem, 5vw, 4rem)' }}>
          <div className="doc-body text-[15px] leading-[1.75] text-justify"
            style={{ color: '#2A2A2E', fontFamily: 'Georgia, "Times New Roman", serif' }}
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </div>

      <p className="doc-toolbar text-center text-xs text-muted pb-10 px-6 max-w-xl mx-auto">
        Documento generado automáticamente desde la ficha. Revísalo y completa los
        datos faltantes (marcados con líneas) antes de firmar.
      </p>
    </div>
  )
}
