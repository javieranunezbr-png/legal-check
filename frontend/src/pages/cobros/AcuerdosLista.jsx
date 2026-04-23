import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0)

const fmt = (s) => s ? new Date(s).toLocaleDateString('es-CL') : '—'

export default function AcuerdosLista() {
  const { causaId } = useParams()
  const { data: acuerdos, loading, error } = useApi(`/acuerdos/causa/${causaId}`)
  const { data: causa } = useApi(`/causas/${causaId}`)

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/cobros" className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Acuerdos de cobro</h1>
            {causa && (
              <p className="text-sm text-slate-500">
                {causa.titulo}
                {causa.rol_causa && <> · <span className="font-mono">{causa.rol_causa}</span></>}
              </p>
            )}
          </div>
        </div>
        <Link to={`/cobros/nuevo?causa_id=${causaId}`} className="btn-primary">
          + Nuevo acuerdo
        </Link>
      </div>

      {acuerdos.length === 0 ? (
        <div className="card">
          <EmptyState
            titulo="Sin acuerdos de cobro"
            descripcion="Esta causa aún no tiene acuerdos económicos registrados"
            accion={
              <Link to={`/cobros/nuevo?causa_id=${causaId}`} className="btn-primary text-sm">
                + Crear primer acuerdo
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {acuerdos.map(a => {
            const pct = parseFloat(a.monto_total) > 0
              ? Math.min(Math.round((parseFloat(a.monto_cobrado) / parseFloat(a.monto_total)) * 100), 100)
              : 0

            return (
              <div key={a.id} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge estado={a.estado} />
                      <span className="text-xs text-slate-400 capitalize">{a.tipo_cobro}</span>
                    </div>
                    {a.descripcion && (
                      <p className="text-sm text-slate-600 mt-1">{a.descripcion}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Firmado el {fmt(a.fecha_acuerdo)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-800">{clp(a.monto_total)}</p>
                    <p className="text-xs text-emerald-600">Cobrado: {clp(a.monto_cobrado)}</p>
                  </div>
                </div>

                {/* Progreso */}
                <div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16a34a' : '#1e3a5f' }}
                    />
                  </div>
                </div>

                {/* Stats cuotas */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex gap-3">
                    <span className="text-emerald-600">{a.cuotas_pagadas} pagadas</span>
                    <span>{a.cuotas_pendientes} pendientes</span>
                    {parseInt(a.cuotas_vencidas) > 0 && (
                      <span className="text-red-600 font-medium">{a.cuotas_vencidas} vencidas</span>
                    )}
                  </div>
                  <Link
                    to={`/cobros/acuerdo/${a.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Ver cuotas →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
