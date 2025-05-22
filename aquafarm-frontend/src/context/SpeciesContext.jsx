"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { speciesService } from "../api/services"

// Crear el contexto
const SpeciesContext = createContext()

// Proveedor del contexto
export function SpeciesProvider({ children }) {
  const [allSpecies, setAllSpecies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser, isInitialized } = useAuth()

  // Cargar especies desde la API al iniciar
  useEffect(() => {
    const loadSpecies = async () => {
      if (!isInitialized) return

      if (!currentUser) {
        setAllSpecies([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await speciesService.getAllSpecies()

        if (result.success) {
          setAllSpecies(result.data)
        } else {
          setError(result.error)
          setAllSpecies([])
        }
      } catch (error) {
        console.error("Error al cargar las especies:", error)
        setError("Error al cargar las especies")
        setAllSpecies([])
      } finally {
        setLoading(false)
      }
    }

    loadSpecies()
  }, [currentUser, isInitialized])

  // Función para agregar una nueva especie
  const addSpecies = async (speciesData) => {
    if (!currentUser) return null

    try {
      const result = await speciesService.createSpecies(speciesData)

      if (result.success) {
        setAllSpecies((prevSpecies) => [...prevSpecies, result.data])
        return result.data
      } else {
        setError(result.error)
        return null
      }
    } catch (error) {
      console.error("Error al crear la especie:", error)
      setError("Error al crear la especie")
      throw error
    }
  }

  // Función para eliminar una especie
  const deleteSpecies = async (speciesId) => {
    try {
      const result = await speciesService.deleteSpecies(speciesId)

      if (result.success) {
        setAllSpecies((prevSpecies) => prevSpecies.filter((species) => species.idEspecie !== speciesId))
        return true
      } else {
        setError(result.error)
        return false
      }
    } catch (error) {
      console.error("Error al eliminar la especie:", error)
      setError("Error al eliminar la especie")
      throw error
    }
  }

  // Función para actualizar una especie
  const updateSpecies = async (speciesId, updatedData) => {
    try {
      const result = await speciesService.updateSpecies(speciesId, updatedData)

      if (result.success) {
        setAllSpecies((prevSpecies) =>
          prevSpecies.map((species) => (species.idEspecie === speciesId ? result.data : species)),
        )
        return result.data
      } else {
        setError(result.error)
        return null
      }
    } catch (error) {
      console.error("Error al actualizar la especie:", error)
      setError("Error al actualizar la especie")
      throw error
    }
  }

  // Función para obtener las especies del usuario actual
  const getUserSpecies = () => {
    return allSpecies
  }

  // Función para obtener una especie por su ID
  const getSpeciesById = async (speciesId) => {
    try {
      // Primero intentamos buscar en el estado local
      const localSpecies = allSpecies.find((species) => species.idEspecie === Number.parseInt(speciesId))
      if (localSpecies) {
        return { success: true, data: localSpecies }
      }

      // Si no está en el estado local, hacemos una petición a la API
      return await speciesService.getSpeciesById(speciesId)
    } catch (error) {
      console.error("Error al obtener la especie:", error)
      return { success: false, error: "Error al obtener la especie" }
    }
  }

  // Valor del contexto
  const value = {
    allSpecies,
    loading,
    error,
    addSpecies,
    deleteSpecies,
    updateSpecies,
    getUserSpecies,
    getSpeciesById,
    setError,
  }

  return <SpeciesContext.Provider value={value}>{children}</SpeciesContext.Provider>
}

// Hook personalizado para usar el contexto
export function useSpecies() {
  return useContext(SpeciesContext)
}