import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute, AdminRoute } from './routes/PrivateRoute'
import Layout          from './components/layout/Layout'
import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import ClientesLista   from './pages/clientes/ClientesLista'
import ClienteForm     from './pages/clientes/ClienteForm'
import ClienteFicha    from './pages/clientes/ClienteFicha'
import CausasLista     from './pages/causas/CausasLista'
import CausaForm       from './pages/causas/CausaForm'
import CobrosResumen   from './pages/cobros/CobrosResumen'
import AcuerdosLista   from './pages/cobros/AcuerdosLista'
import AcuerdoForm     from './pages/cobros/AcuerdoForm'
import AcuerdoDetalle  from './pages/cobros/AcuerdoDetalle'
import UsuariosAdmin   from './pages/admin/UsuariosAdmin'
import PresupuestosLista  from './pages/presupuestos/PresupuestosLista'
import PresupuestoForm    from './pages/presupuestos/PresupuestoForm'
import PresupuestoPublico from './pages/presupuestos/PresupuestoPublico'

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/presupuesto/:token" element={<PresupuestoPublico />} />

      {/* Privadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Clientes */}
          <Route path="/clientes"            element={<ClientesLista />} />
          <Route path="/clientes/nuevo"      element={<ClienteForm />} />
          <Route path="/clientes/:id"        element={<ClienteFicha />} />
          <Route path="/clientes/:id/editar" element={<ClienteForm />} />

          {/* Causas */}
          <Route path="/causas"              element={<CausasLista />} />
          <Route path="/causas/nueva"        element={<CausaForm />} />
          <Route path="/causas/:id/editar"   element={<CausaForm />} />

          {/* Presupuestos */}
          <Route path="/presupuestos"             element={<PresupuestosLista />} />
          <Route path="/presupuestos/nuevo"       element={<PresupuestoForm />} />
          <Route path="/presupuestos/:id/editar"  element={<PresupuestoForm />} />

          {/* Cobros */}
          <Route path="/cobros"                    element={<CobrosResumen />} />
          <Route path="/cobros/nuevo"              element={<AcuerdoForm />} />
          <Route path="/cobros/causa/:causaId"     element={<AcuerdosLista />} />
          <Route path="/cobros/acuerdo/:id"        element={<AcuerdoDetalle />} />

          {/* Solo admin */}
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UsuariosAdmin />} />
          </Route>

        </Route>
      </Route>

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
