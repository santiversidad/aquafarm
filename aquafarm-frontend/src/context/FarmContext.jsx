"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { farmService } from "../api/services"
import { useAuth } from "./AuthContext"

// Crear el contexto
export const FarmContext = createContext()

// Proveedor del contexto
export function FarmProvider({ children }) {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser, isInitialized } = useAuth()

  // Cargar fincas cuando el usuario está autenticado
  useEffect(() => {
    const loadFarms = async () => {
      if (!isInitialized) return

      if (!currentUser) {
        setFarms([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await farmService.getAllFarms()

        if (result.success) {
          setFarms(result.data)
        } else {
          setError(result.error)
          setFarms([])
        }
      } catch (error) {
        console.error("Error al cargar fincas:", error)
        setError("Error al cargar fincas")
        setFarms([])
      } finally {
        setLoading(false)
      }
    }

    loadFarms()
  }, [currentUser, isInitialized])

  // Función para obtener una finca por ID
  const getFarmById = async (id) => {
    try {
      // Primero buscar en el estado local
      const localFarm = farms.find((farm) => farm.id === Number.parseInt(id) || farm.id === id)
      if (localFarm) return { success: true, data: localFarm }

      // Si no está en el estado local, buscar en la API
      return await farmService.getFarm(id)
    } catch (error) {
      console.error(`Error al obtener finca ${id}:`, error)
      return { success: false, error: "Error al obtener finca" }
    }
  }

  // Función para crear una nueva finca
  const createFarm = async (farmData) => {
    try {
      const result = await farmService.createFarm(farmData)

      if (result.success) {
        // Actualizar el estado local
        setFarms((prevFarms) => [...prevFarms, result.data])
      }

      return result
    } catch (error) {
      console.error("Error al crear finca:", error)
      return { success: false, error: "Error al crear finca" }
    }
  }

  // Función para actualizar una finca
  const updateFarm = async (id, farmData) => {
    try {
      const result = await farmService.updateFarm(id, farmData)

      if (result.success) {
        // Actualizar el estado local
        setFarms((prevFarms) => prevFarms.map((farm) => (farm.id === Number.parseInt(id) ? result.data : farm)))
      }

      return result
    } catch (error) {
      console.error(`Error al actualizar finca ${id}:`, error)
      return { success: false, error: "Error al actualizar finca" }
    }
  }

  // Función para eliminar una finca
  const deleteFarm = async (id) => {
    try {
      const result = await farmService.deleteFarm(id)

      if (result.success) {
        // Actualizar el estado local
        setFarms((prevFarms) => prevFarms.filter((farm) => farm.id !== Number.parseInt(id)))
      }

      return result
    } catch (error) {
      console.error(`Error al eliminar finca ${id}:`, error)
      return { success: false, error: "Error al eliminar finca" }
    }
  }

  // Valor del contexto
  const value = {
    farms,
    loading,
    error,
    getFarmById,
    createFarm,
    updateFarm,
    deleteFarm,
    setError,
  }

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>
}

// Hook personalizado para usar el contexto
export function useFarms() {
  return useContext(FarmContext)
}