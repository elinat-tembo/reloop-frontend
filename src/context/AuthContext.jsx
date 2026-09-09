import { createContext, useContext, useState } from 'react'
import { login as loginRequest } from '../api/auth'

const STORAGE_KEY = 'auth'

const AuthContext = createContext(null)

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    const parsed = JSON.parse(raw)
    return { user: parsed.user ?? null, token: parsed.token ?? null }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setAuth] = useState(loadStoredAuth)

  async function login(email, password) {
    const data = await loginRequest({ email, password })
    const nextAuth = { user: data.user, token: data.token }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth))
    setAuth(nextAuth)
    return nextAuth
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setAuth({ user: null, token: null })
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
