import { useEffect, useState } from 'react'
import api from '../services/api'

const clp = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const pct = (cobrado, esperado) =>
  esperado > 0 ? Math.round((cobrado / esperado) * 100) : 0

function StatCard({ titulo, valor, subtitulo, icono, colorIcono, colorBg }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorBg}`}>
        <span className={colorIcono}>{icono}</span>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{titulo}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{valor}</p>
        {subtitulo && <p className="text-xs text-slate-400 mt-0.5">{subtitulo}</p>}
      </div>
    </div>
  )
}

function BadgeEstado({ estado }) {
  const map = {
    activa:     'bg-emerald-100 text-emerald-700',
    cerrada:    'bg-slate-100 text-slate-600',
    suspendida: 'bg-amber-100 text-amber-700',
    archivada:  'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`badge ${map[estado] ?? 'bg-slate-100 text-slate-600'}`}>
      {estado}
    </span>
  )
}

export default function Dashboard() {
  const [datos, setDatos]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/dashboard/resumen')
      .then(r => setDatos(r.data))
      .catch(() => setError('No se pudo cargar el resumen'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
    )
  }

  const { clientes_activos, cuotas_vencidas, causas_con_vencimiento_proximo, cobros_mes } = datos
  const gestionesSemana = datos.gestiones_semana ?? []
  const porcentajeCobrado = pct(cobros_mes.cobrado, cobros_mes.esperado)

  const TIPO_DOT = {
    audiencia: 'bg-red-500', gestion: 'bg-primary',
    reunion: 'bg-sky-600', plazo: 'bg-amber-500', otro: 'bg-zinc-400',
  }
  const fechaCorta = (iso) =>
    new Date(iso).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
  const horaDe = (iso) =>
    new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen general del estudio</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          titulo="Clientes activos"
          valor={clientes_activos}
          icono={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          colorBg="bg-blue-50"
          colorIcono="text-blue-600"
        />

        <StatCard
          titulo="Cuotas vencidas"
          valor={cuotas_vencidas.cantidad}
          subtitulo={`Total: ${clp(cuotas_vencidas.monto_total)}`}
          icono={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          colorBg="bg-red-50"
          colorIcono="text-red-600"
        />

        <StatCard
          titulo="Vencimientos próximos"
          valor={causas_con_vencimiento_proximo.length}
          subtitulo="Causas con cuotas en 7 días"
          icono={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          colorBg="bg-amber-50"
          colorIcono="text-amber-600"
        />

        <StatCard
          titulo="Cobrado este mes"
          valor={clp(cobros_mes.cobrado)}
          subtitulo={`${porcentajeCobrado}% de ${clp(cobros_mes.esperado)} esperado`}
          icono={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          colorBg="bg-emerald-50"
          colorIcono="text-emerald-600"
        />
      </div>

      {/* Barra de progreso cobros */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-slate-700">Progreso de cobros — mes actual</p>
          <span className="text-sm font-semibold text-slate-800">{porcentajeCobrado}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all"
            style={{ width: `${Math.min(porcentajeCobrado, 100)}%`, backgroundColor: '#1C6E63' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Cobrado: {clp(cobros_mes.cobrado)}</span>
          <span>Esperado: {clp(cobros_mes.esperado)}</span>
        </div>
      </div>

      {/* Gestiones / eventos de la semana */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-carbon">
            Agenda — próximos 7 días
          </h2>
          <a href="/agenda" className="text-xs font-medium text-primary hover:underline">
            Ver agenda completa →
          </a>
        </div>
        {gestionesSemana.length === 0 ? (
          <p className="px-6 py-6 text-sm text-muted">
            No tienes gestiones ni audiencias agendadas para esta semana.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {gestionesSemana.map((g) => (
              <li key={g.id} className="px-6 py-3 flex items-center gap-3 hover:bg-soft transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TIPO_DOT[g.tipo] || TIPO_DOT.otro}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-carbon truncate">{g.titulo}</p>
                  {(g.causa_titulo || g.cliente_nombre) && (
                    <p className="text-xs text-muted truncate">
                      {g.causa_titulo}
                      {g.cliente_nombre ? ` · ${g.cliente_nombre} ${g.cliente_apellidos || ''}` : ''}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-carbon capitalize">{fechaCorta(g.fecha)}</p>
                  <p className="text-xs text-muted">{horaDe(g.fecha)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabla de causas con vencimiento próximo */}
      {causas_con_vencimiento_proximo.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Causas con vencimiento en los próximos 7 días
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ROL / Causa</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Próxima cuota</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {causas_con_vencimiento_proximo.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{c.titulo}</p>
                      {c.rol_causa && <p className="text-xs text-slate-400">{c.rol_causa}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.cliente_nombre} {c.cliente_apellidos}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-amber-700">
                        {new Date(c.proxima_cuota).toLocaleDateString('es-CL')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <BadgeEstado estado={c.estado ?? 'activa'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {causas_con_vencimiento_proximo.length === 0 && (
        <div className="card text-center py-10">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-500 text-sm">Sin vencimientos en los próximos 7 días</p>
        </div>
      )}
    </div>
  )
}
