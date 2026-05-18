import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n ?? 0)

const fmt = (s) => s ? new Date(s).toLocaleDateString('es-CL') : null

function BarraProgreso({ cobrado, total }) {
  const pct = total > 0 ? Math.min(Math.round((cobrado / total) * 100), 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{clp(cobrado)}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16a34a' : '#FF7A2E' }}
        />
      </div>
    </div>
  )
}

function TarjetaAcuerdo({ a }) {
  const tieneVencidas = parseInt(a.cuotas_vencidas) > 0
  const tieneProximas = a.proxima_cuota && (() => {
    const dias = Math.ceil((new Date(a.proxima_cuota) - new Date()) / 86400000)
    return dias >= 0 && dias <= 7
  })()

  return (
    <div className={`card space-y-3 border-l-4 ${
      tieneVencidas   ? 'border-l-red-400' :
      tieneProximas   ? 'border-l-amber-400' :
                        'border-l-slate-200'
    }`}>
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {tieneVencidas && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {a.cuotas_vencidas} vencida{a.cuotas_vencidas > 1 ? 's' : ''}
              </span>
            )}
            {!tieneVencidas && tieneProximas && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Vence pronto
              </span>
            )}
            <Badge estado={a.estado} />
          </div>
          <p className="font-semibold text-slate-800 mt-1 truncate">{a.causa_titulo}</p>
          <p className="text-xs text-slate-400">
            {a.cliente_nombre} {a.cliente_apellidos}
            {a.rol_causa && <> · <span className="font-mono">{a.rol_causa}</span></>}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-slate-800">{clp(a.monto_total)}</p>
          <p className="text-xs text-slate-400 capitalize">{a.tipo_cobro}</p>
        </div>
      </div>

      {/* Progreso */}
      <BarraProgreso cobrado={parseFloat(a.monto_cobrado)} total={parseFloat(a.monto_total)} />

      {/* Estadísticas de cuotas */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex gap-3">
          <span className="text-emerald-600 font-medium">{a.cuotas_pagadas} pagadas</span>
          <span>{a.cuotas_pendientes} pendientes</span>
          {parseInt(a.cuotas_vencidas) > 0 && (
            <span className="text-red-600 font-medium">{a.cuotas_vencidas} vencidas</span>
          )}
        </div>
        {a.proxima_cuota && (
          <span>Próxima: {fmt(a.proxima_cuota)}</span>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">{a.abogado_nombre}</p>
        <Link
          to={`/cobros/acuerdo/${a.id}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver cuotas →
        </Link>
      </div>
    </div>
  )
}

export default function CobrosResumen() {
  const { isAdmin } = useAuth()
  const { data: acuerdos, loading, error } = useApi('/acuerdos')

  if (loading) return <Spinner />
  if (error)   return <div className="card text-red-600 text-sm">{error}</div>

  const conVencidas  = acuerdos.filter(a => parseInt(a.cuotas_vencidas) > 0)
  const sinVencidas  = acuerdos.filter(a => parseInt(a.cuotas_vencidas) === 0)

  const totalEsperado = acuerdos.reduce((s, a) => s + parseFloat(a.monto_total ?? 0), 0)
  const totalCobrado  = acuerdos.reduce((s, a) => s + parseFloat(a.monto_cobrado ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Cobros</h1>
          <p className="text-sm text-slate-500">{acuerdos.length} acuerdos vigentes</p>
        </div>
        <Link to="/cobros/nuevo" className="btn-primary">+ Nuevo acuerdo</Link>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-800">{clp(totalEsperado)}</p>
          <p className="text-xs text-slate-400 mt-1">Total comprometido</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{clp(totalCobrado)}</p>
          <p className="text-xs text-slate-400 mt-1">Total cobrado</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-500">
            {acuerdos.reduce((s, a) => s + parseInt(a.cuotas_vencidas ?? 0), 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Cuotas vencidas</p>
        </div>
      </div>

      {acuerdos.length === 0 ? (
        <div className="card">
          <EmptyState
            titulo="Sin acuerdos vigentes"
            descripcion="Los acuerdos de cobro se crean desde la ficha de cada causa"
            accion={
              <Link to="/causas" className="btn-primary text-sm">Ver causas</Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Con cuotas vencidas primero */}
          {conVencidas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Requieren atención ({conVencidas.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {conVencidas.map(a => <TarjetaAcuerdo key={a.id} a={a} />)}
              </div>
            </div>
          )}

          {/* El resto */}
          {sinVencidas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600">
                Al día ({sinVencidas.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sinVencidas.map(a => <TarjetaAcuerdo key={a.id} a={a} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
