import { createContext, useState, useCallback } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

const DEMO_USUARIO = {
  id: 0,
  nombre: 'Demo Admin',
  email: 'admin@legalcheck.cl',
  rol: 'admin',
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem('usuario')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  // Establece sesión demo en localStorage sin tocar el backend
  const loginDemo = useCallback(() => {
    localStorage.setItem('token', 'demo-local-token')
    localStorage.setItem('usuario', JSON.stringify(DEMO_USUARIO))
    localStorage.setItem('demo_mode', 'true')
    setUsuario(DEMO_USUARIO)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('demo_mode')
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, login, loginDemo, logout, isAdmin: usuario?.rol === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}
