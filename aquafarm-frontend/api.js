import axios from "axios"

// Base URL for API requests
const API_URL = "http://localhost:8000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data on 401 Unauthorized
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("currentUser")

      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Authentication service
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login/", { correo: email, contrasena: password })

      // Store token and user data
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken || "")
      localStorage.setItem("currentUser", JSON.stringify(response.data.usuario))

      return { success: true, usuario: response.data.usuario }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Error al iniciar sesión",
      }
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register/", userData)

      // Store token and user data
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("refreshToken", response.data.refreshToken || "")
      localStorage.setItem("currentUser", JSON.stringify(response.data.usuario))

      return { success: true, usuario: response.data.usuario }
    } catch (error) {
      console.error("Register error:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Error al registrar usuario",
      }
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("currentUser")
  },
}

// Farm service
export const fincaService = {
  getAllFincas: async () => {
    try {
      const response = await api.get("/fincas/")
      return response.data
    } catch (error) {
      console.error("Error al obtener fincas:", error)
      return { results: [] }
    }
  },

  getFinca: async (id) => {
    try {
      const response = await api.get(`/fincas/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener finca ${id}:`, error)
      throw error
    }
  },

  createFinca: async (data) => {
    try {
      // Ensure idMetodoAcuicola is a number
      const fincaData = {
        ...data,
        idMetodoAcuicola: Number(data.idMetodoAcuicola),
      }

      console.log("Enviando datos de finca:", fincaData)
      const response = await api.post("/fincas/", fincaData)
      return response.data
    } catch (error) {
      console.error("Error al crear finca:", error)
      throw error
    }
  },

  updateFinca: async (id, data) => {
    try {
      // Ensure idMetodoAcuicola is a number if present
      const fincaData = { ...data }
      if (fincaData.idMetodoAcuicola) {
        fincaData.idMetodoAcuicola = Number(fincaData.idMetodoAcuicola)
      }

      const response = await api.put(`/fincas/${id}/`, fincaData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar finca ${id}:`, error)
      throw error
    }
  },

  deleteFinca: async (id) => {
    try {
      await api.delete(`/fincas/${id}/`)
      return true
    } catch (error) {
      console.error(`Error al eliminar finca ${id}:`, error)
      throw error
    }
  },
}

// Pond service
export const estanqueService = {
  getAllEstanques: async () => {
    try {
      const response = await api.get("/estanques/")
      return response.data
    } catch (error) {
      console.error("Error al obtener estanques:", error)
      return { results: [] }
    }
  },

  getEstanquesByFinca: async (fincaId) => {
    try {
      const response = await api.get(`/estanques/?idFinca=${fincaId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener estanques de finca ${fincaId}:`, error)
      return { results: [] }
    }
  },

  createEstanque: async (data) => {
    try {
      const response = await api.post("/estanques/", data)
      return response.data
    } catch (error) {
      console.error("Error al crear estanque:", error)
      throw error
    }
  },
}

// Species service
export const especieService = {
  getAllEspecies: async () => {
    try {
      const response = await api.get("/especies/")
      return response.data
    } catch (error) {
      console.error("Error al obtener especies:", error)
      return { results: [] }
    }
  },

  createEspecie: async (data) => {
    try {
      const response = await api.post("/especies/", data)
      return response.data
    } catch (error) {
      console.error("Error al crear especie:", error)
      throw error
    }
  },
}

// Seeding service
export const siembraService = {
  getAllSiembras: async () => {
    try {
      const response = await api.get("/siembras/")
      return response.data
    } catch (error) {
      console.error("Error al obtener siembras:", error)
      return { results: [] }
    }
  },

  getSiembrasByEstanque: async (estanqueId) => {
    try {
      const response = await api.get(`/siembras/?idEstanque=${estanqueId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener siembras de estanque ${estanqueId}:`, error)
      return { results: [] }
    }
  },

  createSiembra: async (data) => {
    try {
      const response = await api.post("/siembras/", data)
      return response.data
    } catch (error) {
      console.error("Error al crear siembra:", error)
      throw error
    }
  },
}

// Monitoring service
export const monitoreoService = {
  getAllMonitoreos: async () => {
    try {
      const response = await api.get("/monitoreos/")
      return response.data
    } catch (error) {
      console.error("Error al obtener monitoreos:", error)
      return { results: [] }
    }
  },

  getMonitoreosByEstanque: async (estanqueId) => {
    try {
      const response = await api.get(`/monitoreos/?idEstanque=${estanqueId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener monitoreos de estanque ${estanqueId}:`, error)
      return { results: [] }
    }
  },

  createMonitoreo: async (data) => {
    try {
      const response = await api.post("/monitoreos/", data)
      return response.data
    } catch (error) {
      console.error("Error al crear monitoreo:", error)
      throw error
    }
  },
}

// Split operations service
export const desdobleService = {
  getAllDesdobles: async () => {
    try {
      const response = await api.get("/desdobles/")
      return response.data
    } catch (error) {
      console.error("Error al obtener desdobles:", error)
      return { results: [] }
    }
  },

  getDesdoblesByEstanqueOrigen: async (estanqueId) => {
    try {
      const response = await api.get(`/desdobles/?idEstanqueOrigen=${estanqueId}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener desdobles de estanque ${estanqueId}:`, error)
      return { results: [] }
    }
  },

  createDesdoble: async (data) => {
    try {
      const response = await api.post("/desdobles/", data)
      return response.data
    } catch (error) {
      console.error("Error al crear desdoble:", error)
      throw error
    }
  },
}

// Aquaculture methods service
export const metodoService = {
  getAllMetodos: async () => {
    try {
      const response = await api.get("/metodos-acuicolas/")
      return response.data
    } catch (error) {
      console.error("Error al obtener métodos acuícolas:", error)
      return { results: [] }
    }
  },
}

// Default export for backward compatibility
export default {
  authService,
  fincaService,
  estanqueService,
  especieService,
  siembraService,
  monitoreoService,
  desdobleService,
  metodoService,
}