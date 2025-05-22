"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { siembraService } from "../services/api"

// Crear el contexto
const SeedingContext = createContext()

// Proveedor del contexto
export function SeedingProvider({ children }) {
  const [allSeedings, setAllSeedings] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // Cargar siembras desde la API al iniciar
  useEffect(() => {
    const loadSeedings = async () => {
      if (!currentUser) {
        setAllSeedings([])
        setLoading(false)
        return
      }

      try {
        const response = await siembraService.getAllSiembras()
        setAllSeedings(response.results || [])
      } catch (error) {
        console.error("Error al cargar las siembras:", error)
        setAllSeedings([])
      } finally {
        setLoading(false)
      }
    }

    loadSeedings()
  }, [currentUser])

  // Función para agregar una nueva siembra
  const addSeeding = async (seedingData) => {
    if (!currentUser) return null

    try {
      const newSeeding = await siembraService.createSiembra({
        ...seedingData,
        fecha: seedingData.fecha || new Date().toISOString(),
      })

      setAllSeedings((prevSeedings) => [...prevSeedings, newSeeding])
      return newSeeding
    } catch (error) {
      console.error("Error al crear la siembra:", error)
      throw error
    }
  }

  // Función para eliminar una siembra
  const deleteSeeding = async (seedingId) => {
    try {
      await siembraService.deleteSiembra(seedingId)
      setAllSeedings((prevSeedings) => prevSeedings.filter((seeding) => seeding.idSiembra !== seedingId))
      return true
    } catch (error) {
      console.error("Error al eliminar la siembra:", error)
      throw error
    }
  }

  // Función para actualizar una siembra
  const updateSeeding = async (seedingId, updatedData) => {
    try {
      const updatedSeeding = await siembraService.updateSiembra(seedingId, updatedData)

      setAllSeedings((prevSeedings) =>
        prevSeedings.map((seeding) => (seeding.idSiembra === seedingId ? updatedSeeding : seeding)),
      )

      return updatedSeeding
    } catch (error) {
      console.error("Error al actualizar la siembra:", error)
      throw error
    }
  }

  // Función para obtener las siembras del usuario actual
  const getUserSeedings = async () => {
    if (!currentUser) return []

    // En este caso, asumimos que el usuario puede ver todas las siembras
    // Si hay restricciones específicas, se pueden implementar aquí
    return allSeedings
  }

  // Función para obtener siembras por ID de finca
  const getSeedingsByFarmId = async (farmId) => {
    if (!currentUser) return []

    try {
      const response = await siembraService.getSiembrasByFinca(farmId)
      return response.results || []
    } catch (error) {
      console.error("Error al obtener las siembras de la finca:", error)
      return []
    }
  }

  // Función para obtener siembras por ID de estanque
  const getSeedingsByPondId = async (pondId) => {
    if (!currentUser) return []

    try {
      const response = await siembraService.getSiembrasByEstanque(pondId)
      return response.results || []
    } catch (error) {
      console.error("Error al obtener las siembras del estanque:", error)
      return []
    }
  }

  // Valor del contexto
  const value = {
    allSeedings,
    addSeeding,
    deleteSeeding,
    updateSeeding,
    getUserSeedings,
    getSeedingsByFarmId,
    getSeedingsByPondId,
    loading,
  }

  return <SeedingContext.Provider value={value}>{!loading && children}</SeedingContext.Provider>
}

// Hook personalizado para usar el contexto
export function useSeedings() {
  return useContext(SeedingContext)
}
