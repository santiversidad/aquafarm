import api from "./axiosConfig"

// Servicio de autenticación
export const authService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await api.post("/token/", {
        username: username,
        password: password,
      })

      // Guardar tokens y datos del usuario
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)

      // Obtener datos del usuario
      const userResponse = await api.get("/usuarios/me/")
      localStorage.setItem("user", JSON.stringify(userResponse.data))

      return {
        success: true,
        user: userResponse.data,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh,
        },
      }
    } catch (error) {
      console.error("Error en login:", error)
      console.error("Respuesta detallada:", error.response?.data)
      return {
        success: false,
        error: error.response?.data?.detail || "Error al iniciar sesión",
      }
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await api.post("/usuarios/register/", userData)

      // Iniciar sesión automáticamente después del registro
      const loginResponse = await authService.login(userData.username, userData.password)

      return {
        success: true,
        user: loginResponse.user,
        tokens: loginResponse.tokens,
      }
    } catch (error) {
      console.error("Error en registro:", error)
      return {
        success: false,
        error: error.response?.data || "Error al registrar usuario",
      }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    return { success: true }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error("Error al obtener usuario actual:", error)
      return null
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token")
  },
}

// Servicio de fincas
export const farmService = {
  // Obtener todas las fincas
  getAllFarms: async () => {
    try {
      const response = await api.get("/fincas/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener fincas:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener fincas",
      }
    }
  },

  // Obtener mis fincas
  getMyFarms: async () => {
    try {
      const response = await api.get("/fincas/mis_fincas/")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al obtener mis fincas:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener mis fincas",
      }
    }
  },

  // Obtener una finca por ID
  getFarm: async (id) => {
    try {
      const response = await api.get(`/fincas/${id}/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener finca ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener finca",
      }
    }
  },

  // Crear una nueva finca
  createFarm: async (farmData) => {
    try {
      const response = await api.post("/fincas/", farmData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al crear finca:", error)
      return {
        success: false,
        error: error.response?.data || "Error al crear finca",
      }
    }
  },

  // Actualizar una finca
  updateFarm: async (id, farmData) => {
    try {
      const response = await api.put(`/fincas/${id}/`, farmData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al actualizar finca ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al actualizar finca",
      }
    }
  },

  // Eliminar una finca
  deleteFarm: async (id) => {
    try {
      await api.delete(`/fincas/${id}/`)
      return { success: true }
    } catch (error) {
      console.error(`Error al eliminar finca ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al eliminar finca",
      }
    }
  },
}

// Servicio de estanques
export const pondService = {
  // Obtener todos los estanques
  getAllPonds: async () => {
    try {
      const response = await api.get("/estanques/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener estanques:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener estanques",
      }
    }
  },

  // Obtener estanques por finca
  getPondsByFarm: async (farmId) => {
    try {
      const response = await api.get(`/estanques/by_finca/?finca_id=${farmId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener estanques de finca ${farmId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener estanques",
      }
    }
  },

  // Crear un nuevo estanque
  createPond: async (pondData) => {
    try {
      const response = await api.post("/estanques/", pondData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al crear estanque:", error)
      return {
        success: false,
        error: error.response?.data || "Error al crear estanque",
      }
    }
  },

  // Actualizar un estanque
  updatePond: async (id, pondData) => {
    try {
      const response = await api.put(`/estanques/${id}/`, pondData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al actualizar estanque ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al actualizar estanque",
      }
    }
  },

  // Eliminar un estanque
  deletePond: async (id) => {
    try {
      await api.delete(`/estanques/${id}/`)
      return { success: true }
    } catch (error) {
      console.error(`Error al eliminar estanque ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al eliminar estanque",
      }
    }
  },
}

// Servicio de métodos acuícolas
export const methodService = {
  // Obtener todos los métodos
  getAllMethods: async () => {
    try {
      const response = await api.get("/metodos-acuicolas/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener métodos acuícolas:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener métodos acuícolas",
      }
    }
  },
}

// Servicio de especies actualizado para manejar la nueva estructura
export const speciesService = {
  // Obtener todas las especies
  getAllSpecies: async () => {
    try {
      const response = await api.get("/especies/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener especies:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener especies",
      }
    }
  },

  // Obtener una especie por ID
  getSpeciesById: async (id) => {
    try {
      const response = await api.get(`/especies/${id}/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener especie ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener especie",
      }
    }
  },

  // Obtener información completa de una especie
  getSpeciesInfo: async (id) => {
    try {
      const response = await api.get(`/especies/${id}/info_completa/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener información completa de especie ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener información completa de especie",
      }
    }
  },

  // Crear una nueva especie con información detallada
  createSpecies: async (speciesData) => {
    try {
      const response = await api.post("/especies/", speciesData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al crear especie:", error)
      return {
        success: false,
        error: error.response?.data || "Error al crear especie",
      }
    }
  },

  // Actualizar una especie
  updateSpecies: async (id, speciesData) => {
    try {
      const response = await api.put(`/especies/${id}/`, speciesData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al actualizar especie ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al actualizar especie",
      }
    }
  },

  // Eliminar una especie
  deleteSpecies: async (id) => {
    try {
      await api.delete(`/especies/${id}/`)
      return { success: true }
    } catch (error) {
      console.error(`Error al eliminar especie ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al eliminar especie",
      }
    }
  },
}

// Servicio de inventario actualizado
export const inventoryService = {
  // Obtener todo el inventario
  getAllInventory: async () => {
    try {
      const response = await api.get("/inventarios/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener inventario:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener inventario",
      }
    }
  },

  // Obtener inventario por finca
  getInventoryByFarm: async (farmId) => {
    try {
      const response = await api.get(`/inventarios/by_finca/?finca_id=${farmId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener inventario de finca ${farmId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener inventario",
      }
    }
  },

  // Obtener inventario por especie
  getInventoryBySpecies: async (speciesId) => {
    try {
      const response = await api.get(`/inventarios/by_especie/?especie_id=${speciesId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener inventario de especie ${speciesId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener inventario",
      }
    }
  },

  // Agregar cantidad al inventario
  addToInventory: async (inventoryId, quantity) => {
    try {
      const response = await api.post(`/inventarios/${inventoryId}/agregar_cantidad/`, {
        cantidad: quantity,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al agregar cantidad al inventario ${inventoryId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al agregar cantidad al inventario",
      }
    }
  },

  // Reducir cantidad del inventario
  reduceFromInventory: async (inventoryId, quantity) => {
    try {
      const response = await api.post(`/inventarios/${inventoryId}/reducir_cantidad/`, {
        cantidad: quantity,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al reducir cantidad del inventario ${inventoryId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al reducir cantidad del inventario",
      }
    }
  },
}

// Servicio de siembras
export const seedingService = {
  // Obtener todas las siembras
  getAllSeedings: async () => {
    try {
      const response = await api.get("/siembras/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener siembras:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener siembras",
      }
    }
  },

  // Obtener siembras por estanque
  getSeedingsByPond: async (pondId) => {
    try {
      const response = await api.get(`/siembras/by_estanque/?estanque_id=${pondId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener siembras de estanque ${pondId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener siembras",
      }
    }
  },

  // Obtener siembras por finca
  getSeedingsByFarm: async (farmId) => {
    try {
      const response = await api.get(`/siembras/by_finca/?finca_id=${farmId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener siembras de finca ${farmId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener siembras",
      }
    }
  },

  // Crear una nueva siembra
  createSeeding: async (seedingData) => {
    try {
      const response = await api.post("/siembras/", seedingData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al crear siembra:", error)
      return {
        success: false,
        error: error.response?.data || "Error al crear siembra",
      }
    }
  },

  // Actualizar una siembra
  updateSeeding: async (id, seedingData) => {
    try {
      const response = await api.put(`/siembras/${id}/`, seedingData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al actualizar siembra ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al actualizar siembra",
      }
    }
  },

  // Eliminar una siembra
  deleteSeeding: async (id) => {
    try {
      await api.delete(`/siembras/${id}/`)
      return { success: true }
    } catch (error) {
      console.error(`Error al eliminar siembra ${id}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al eliminar siembra",
      }
    }
  },
}

// Servicio de historial de siembras
export const seedingHistoryService = {
  // Obtener historial por siembra
  getHistoryBySeeding: async (seedingId) => {
    try {
      const response = await api.get(`/historiales-siembra/by_siembra/?siembra_id=${seedingId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener historial de siembra ${seedingId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener historial de siembra",
      }
    }
  },

  // Obtener historial por estado
  getHistoryByStatus: async (status) => {
    try {
      const response = await api.get(`/historiales-siembra/by_estado/?estado=${status}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener historial por estado ${status}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener historial por estado",
      }
    }
  },

  // Comercializar una siembra
  commercializeSeeding: async (historyId, commercializationData) => {
    try {
      const response = await api.post(`/historiales-siembra/${historyId}/comercializar/`, commercializationData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al comercializar siembra ${historyId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al comercializar siembra",
      }
    }
  },

  // Cancelar una siembra
  cancelSeeding: async (historyId) => {
    try {
      const response = await api.post(`/historiales-siembra/${historyId}/cancelar/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al cancelar siembra ${historyId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al cancelar siembra",
      }
    }
  },
}

// Servicio de desdobles
export const splitService = {
  // Obtener todos los desdobles
  getAllSplits: async () => {
    try {
      const response = await api.get("/desdobles/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener desdobles:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener desdobles",
      }
    }
  },

  // Obtener desdobles por finca
  getSplitsByFarm: async (farmId) => {
    try {
      const response = await api.get(`/desdobles/by_finca/?finca_id=${farmId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener desdobles de finca ${farmId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener desdobles",
      }
    }
  },

  // Obtener desdobles por estanque origen
  getSplitsBySourcePond: async (pondId) => {
    try {
      const response = await api.get(`/desdobles/by_estanque_origen/?estanque_id=${pondId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener desdobles de estanque origen ${pondId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener desdobles",
      }
    }
  },

  // Crear un nuevo desdoble
  createSplit: async (splitData) => {
    try {
      const response = await api.post("/desdobles/", splitData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al crear desdoble:", error)
      return {
        success: false,
        error: error.response?.data || "Error al crear desdoble",
      }
    }
  },
}

// Servicio de monitoreos
export const monitoringService = {
  // Obtener monitoreos por estanque
  getMonitoringByPond: async (pondId, latest = false) => {
    try {
      const response = await api.get(`/monitoreos/by_estanque/?estanque_id=${pondId}&latest=${latest}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener monitoreos de estanque ${pondId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener monitoreos",
      }
    }
  },

  // Crear un nuevo monitoreo
  createMonitoring: async (monitoringData) => {
    try {
      const response = await api.post("/monitoreos/", monitoringData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error al crear monitoreo:", error)
      return {
        success: false,
        error: error.response?.data || "Error al crear monitoreo",
      }
    }
  },

  // Obtener todos los sensores
  getAllSensors: async () => {
    try {
      const response = await api.get("/sensores/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener sensores:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener sensores",
      }
    }
  },
}

// Servicio de alertas
export const alertService = {
  // Obtener todas las alertas
  getAllAlerts: async () => {
    try {
      const response = await api.get("/alertas/")
      return {
        success: true,
        data: response.data.results || response.data,
      }
    } catch (error) {
      console.error("Error al obtener alertas:", error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener alertas",
      }
    }
  },

  // Obtener alertas por estanque
  getAlertsByPond: async (pondId) => {
    try {
      const response = await api.get(`/alertas/by_estanque/?estanque_id=${pondId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener alertas de estanque ${pondId}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener alertas",
      }
    }
  },

  // Obtener alertas por estado
  getAlertsByStatus: async (status) => {
    try {
      const response = await api.get(`/alertas/by_estado/?estado=${status}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al obtener alertas por estado ${status}:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al obtener alertas",
      }
    }
  },

  // Marcar alerta como resuelta
  markAlertAsResolved: async (alertId) => {
    try {
      const response = await api.post(`/alertas/${alertId}/marcar_resuelta/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al marcar alerta ${alertId} como resuelta:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al marcar alerta como resuelta",
      }
    }
  },

  // Marcar alerta como ignorada
  markAlertAsIgnored: async (alertId) => {
    try {
      const response = await api.post(`/alertas/${alertId}/marcar_ignorada/`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error(`Error al marcar alerta ${alertId} como ignorada:`, error)
      return {
        success: false,
        error: error.response?.data || "Error al marcar alerta como ignorada",
      }
    }
  },
}
