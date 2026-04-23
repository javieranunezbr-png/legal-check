import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div />

      <div className="flex items-center gap-4">
        {/* Info usuario */}
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{usuario?.nombre}</p>
          <p className="text-xs text-slate-500 capitalize">{usuario?.rol}</p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: '#1e3a5f' }}>
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
