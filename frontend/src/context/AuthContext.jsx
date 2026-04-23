import { createContext, useState, useCallback } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

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

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAdmin: usuario?.rol === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}
