"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { estanqueService } from "../services/api"

// Crear el contexto
const PondContext = createContext()

// Proveedor del contexto
export function PondProvider({ children }) {
  const [allPonds, setAllPonds] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // Cargar estanques desde la API al iniciar
  useEffect(() => {
    const loadPonds = async () => {
      if (!currentUser) {
        setAllPonds([])
        setLoading(false)
        return
      }

      try {
        const response = await estanqueService.getAllEstanques()
        setAllPonds(response.results || [])
      } catch (error) {
        console.error("Error al cargar los estanques:", error)
        setAllPonds([])
      } finally {
        setLoading(false)
      }
    }

    loadPonds()
  }, [currentUser])

  // Función para agregar un nuevo estanque
  const addPond = async (pondData) => {
    if (!currentUser) return null

    try {
      const newPond = await estanqueService.createEstanque({
        ...pondData,
        idTipoEstanque: pondData.idTipoEstanque || 1, // Valor por defecto si no se proporciona
      })

      setAllPonds((prevPonds) => [...prevPonds, newPond])
      return newPond
    } catch (error) {
      console.error("Error al crear el estanque:", error)
      throw error
    }
  }

  // Función para eliminar un estanque
  const deletePond = async (pondId) => {
    try {
      await estanqueService.deleteEstanque(pondId)
      setAllPonds((prevPonds) => prevPonds.filter((pond) => pond.idEstanque !== pondId))
      return true
    } catch (error) {
      console.error("Error al eliminar el estanque:", error)
      throw error
    }
  }

  // Función para actualizar un estanque
  const updatePond = async (pondId, updatedData) => {
    try {
      const updatedPond = await estanqueService.updateEstanque(pondId, updatedData)

      setAllPonds((prevPonds) => prevPonds.map((pond) => (pond.idEstanque === pondId ? updatedPond : pond)))

      return updatedPond
    } catch (error) {
      console.error("Error al actualizar el estanque:", error)
      throw error
    }
  }

  // Función para obtener estanques por ID de finca
  const getPondsByFarmId = async (farmId) => {
    if (!currentUser) return []

    try {
      // Primero intentamos buscar en el estado local
      const localPonds = allPonds.filter((pond) => pond.idFinca === Number.parseInt(farmId))
      if (localPonds.length > 0) {
        return localPonds
      }

      // Si no están en el estado local, hacemos una petición a la API
      const response = await estanqueService.getEstanquesByFinca(farmId)
      return response.results || []
    } catch (error) {
      console.error("Error al obtener los estanques de la finca:", error)
      return []
    }
  }

  // Función para obtener todos los estanques del usuario actual
  const getUserPonds = async () => {
    if (!currentUser) return []

    // En este caso, asumimos que el usuario puede ver todos los estanques
    // Si hay restricciones específicas, se pueden implementar aquí
    return allPonds
  }

  // Valor del contexto
  const value = {
    allPonds,
    addPond,
    deletePond,
    updatePond,
    getPondsByFarmId,
    getUserPonds,
    loading,
  }

  return <PondContext.Provider value={value}>{!loading && children}</PondContext.Provider>
}

// Hook personalizado para usar el contexto
export function usePonds() {
  return useContext(PondContext)
}
