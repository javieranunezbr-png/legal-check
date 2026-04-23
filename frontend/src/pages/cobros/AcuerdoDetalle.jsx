import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import CuotaCard from '../../components/cobros/CuotaCard'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0)

const fmt = (s) => s ? new Date(s).toLocaleDateString('es-CL') : '—'

export default function AcuerdoDetalle() {
  const { id } = useParams()
  const { data: acuerdo, loading, error, setData } = useApi(`/acuerdos/${id}`)

  // Actualiza la cuota en el estado local tras marcarla como pagada
  const handleCuotaPagada = useCallback((cuotaActualizada) => {
    setData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(c =>
        c.id === cuotaActualizada.id ? cuotaActualizada : c
      ),
    }))
  }, [setData])

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>
  if (!acuerdo) return null

  const cuotas       = acuerdo.cuotas ?? []
  const pagadas      = cuotas.filter(c => c.estado === 'pagada')
  const vencidas     = cuotas.filter(c => c.estado === 'vencida')
  const pendientes   = cuotas.filter(c => c.estado === 'pendiente')
  const montoCobrado = pagadas.reduce((s, c) => s + parseFloat(c.monto ?? 0), 0)
  const pct          = acuerdo.monto_total > 0
    ? Math.round((montoCobrado / parseFloat(acuerdo.monto_total)) * 100)
    : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={acuerdo.causa_id ? `/cobros/causa/${acuerdo.causa_id}` : '/cobros'}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Acuerdo de cobro</h1>
            <p className="text-sm text-slate-500">
              {acuerdo.causa_titulo}
              {acuerdo.rol_causa && <> · <span className="font-mono">{acuerdo.rol_causa}</span></>}
            </p>
            {acuerdo.cliente_nombre && (
              <p className="text-xs text-slate-400">{acuerdo.cliente_nombre} {acuerdo.cliente_apellidos}</p>
            )}
          </div>
        </div>
        <Badge estado={acuerdo.estado} />
      </div>

      {/* Resumen del acuerdo */}
      <div className="card space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-400">Monto total</p>
            <p className="font-bold text-slate-800">{clp(acuerdo.monto_total)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tipo</p>
            <p className="font-medium text-slate-700 capitalize">{acuerdo.tipo_cobro}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Fecha acuerdo</p>
            <p className="font-medium text-slate-700">{fmt(acuerdo.fecha_acuerdo)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cobrado</p>
            <p className="font-bold text-emerald-600">{clp(montoCobrado)}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{pagadas.length} de {cuotas.length} cuotas pagadas</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16a34a' : '#1e3a5f' }}
            />
          </div>
        </div>

        {/* Badges resumen */}
        <div className="flex gap-3 text-xs flex-wrap">
          <span className="text-emerald-600 font-medium">{pagadas.length} pagadas</span>
          <span className="text-slate-500">{pendientes.length} pendientes</span>
          {vencidas.length > 0 && (
            <span className="text-red-600 font-medium">{vencidas.length} vencidas</span>
          )}
        </div>

        {acuerdo.descripcion && (
          <p className="text-sm text-slate-600 border-t border-slate-100 pt-3">{acuerdo.descripcion}</p>
        )}
      </div>

      {/* Lista de cuotas */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Cuotas ({cuotas.length})
        </h2>

        {cuotas.length === 0 ? (
          <div className="card">
            <EmptyState
              titulo="Sin cuotas generadas"
              descripcion="Este acuerdo no tiene cuotas asociadas (tipo honorarios o éxito)"
            />
          </div>
        ) : (
          // Orden: vencidas primero, luego pendientes, luego pagadas
          [...vencidas, ...pendientes, ...pagadas].map(c => (
            <CuotaCard
              key={c.id}
              cuota={c}
              total={cuotas.length}
              onPagada={handleCuotaPagada}
            />
          ))
        )}
      </div>

      {acuerdo.notas && (
        <div className="card">
          <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Notas</p>
          <p className="text-sm text-slate-600">{acuerdo.notas}</p>
        </div>
      )}
    </div>
  )
}
