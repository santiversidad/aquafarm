"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { authService } from "../api/services"

// Crear el contexto
export const AuthContext = createContext()

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay un token y usuario en localStorage
        const user = authService.getCurrentUser()
        const isAuth = authService.isAuthenticated()

        if (isAuth && user) {
          setCurrentUser(user)
        } else {
          // Si hay token pero no hay usuario, intentar obtener el usuario
          if (isAuth) {
            try {
              const response = await fetch("http://localhost:8000/api/usuarios/me/", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
              })

              if (response.ok) {
                const userData = await response.json()
                localStorage.setItem("user", JSON.stringify(userData))
                setCurrentUser(userData)
              } else {
                // Si falla, limpiar tokens
                authService.logout()
              }
            } catch (error) {
              console.error("Error al obtener usuario:", error)
              authService.logout()
            }
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [])

  // Función de login
  const login = async (username, password) => {
    setError(null)
    try {
      const result = await authService.login(username, password)

      if (result.success) {
        setCurrentUser(result.user)
        return true
      } else {
        setError(result.error)
        return false
      }
    } catch (error) {
      console.error("Error en login:", error)
      setError("Error al iniciar sesión")
      return false
    }
  }

  // Función de registro
  const register = async (userData) => {
    setError(null)
    try {
      const result = await authService.register(userData)

      if (result.success) {
        setCurrentUser(result.user)
        return true
      } else {
        setError(result.error)
        return false
      }
    } catch (error) {
      console.error("Error en registro:", error)
      setError("Error al registrar usuario")
      return false
    }
  }

  // Función de logout
  const logout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  // Valor del contexto
  const value = {
    currentUser,
    loading,
    error,
    isInitialized,
    login,
    register,
    logout,
    setError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext)
}