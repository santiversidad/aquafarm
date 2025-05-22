import axios from "axios"

// URL base de la API
const API_URL = "http://localhost:8000/api"

// Crear instancia de axios con configuración por defecto
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 (Unauthorized) y no estamos intentando refrescar el token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) {
          // Si no hay refresh token, redirigir al login
          window.location.href = "/login"
          return Promise.reject(error)
        }

        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        })

        if (response.data.access) {
          // Guardar el nuevo token
          localStorage.setItem("access_token", response.data.access)

          // Actualizar el header de la petición original
          originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`

          // Reintentar la petición original
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        console.error("Error al refrescar el token:", refreshError)

        // Limpiar tokens y redirigir al login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")

        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
