"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { desdobleService } from "../services/api"

// Crear el contexto
const SplitOperationsContext = createContext()

// Proveedor del contexto
export function SplitOperationsProvider({ children }) {
  const [allSplitOperations, setAllSplitOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // Cargar operaciones de desdoble desde la API al iniciar
  useEffect(() => {
    const loadSplitOperations = async () => {
      if (!currentUser) {
        setAllSplitOperations([])
        setLoading(false)
        return
      }

      try {
        const response = await desdobleService.getAllDesdobles()
        setAllSplitOperations(response.results || [])
      } catch (error) {
        console.error("Error al cargar las operaciones de desdoble:", error)
        setAllSplitOperations([])
      } finally {
        setLoading(false)
      }
    }

    loadSplitOperations()
  }, [currentUser])

  // Función para añadir una nueva operación de desdoble
  const addSplitOperation = async (operationData) => {
    if (!currentUser) return null

    try {
      const newOperation = await desdobleService.createDesdoble({
        ...operationData,
        fecha: operationData.fecha || new Date().toISOString(),
      })

      setAllSplitOperations((prevOperations) => [...prevOperations, newOperation])
      return newOperation
    } catch (error) {
      console.error("Error al crear la operación de desdoble:", error)
      throw error
    }
  }

  // Función para obtener operaciones por ID de finca
  const getSplitOperationsByFarmId = async (farmId) => {
    if (!farmId) {
      console.error("ID de finca no proporcionado")
      return []
    }

    try {
      const response = await desdobleService.getDesdoblesByFinca(farmId)
      return response.results || []
    } catch (error) {
      console.error("Error al obtener las operaciones de desdoble de la finca:", error)
      return []
    }
  }

  // Función para obtener operaciones por ID de estanque
  const getSplitOperationsByPondId = async (pondId) => {
    if (!pondId) {
      console.error("ID de estanque no proporcionado")
      return []
    }

    try {
      // Obtener operaciones donde el estanque es origen o destino
      const responseOrigen = await desdobleService.getDesdoblesByEstanqueOrigen(pondId)
      const responseDestino = await desdobleService.getDesdoblesByEstanqueDestino(pondId)

      // Combinar los resultados
      const operacionesOrigen = responseOrigen.results || []
      const operacionesDestino = responseDestino.results || []

      // Eliminar duplicados (si los hay)
      const operacionesMap = new Map()
      ;[...operacionesOrigen, ...operacionesDestino].forEach((op) => {
        operacionesMap.set(op.idDesdoble, op)
      })

      return Array.from(operacionesMap.values())
    } catch (error) {
      console.error("Error al obtener las operaciones de desdoble del estanque:", error)
      return []
    }
  }

  // Valor del contexto
  const value = {
    allSplitOperations,
    addSplitOperation,
    getSplitOperationsByFarmId,
    getSplitOperationsByPondId,
    loading,
  }

  return <SplitOperationsContext.Provider value={value}>{!loading && children}</SplitOperationsContext.Provider>
}

// Hook personalizado para usar el contexto
export function useSplitOperations() {
  return useContext(SplitOperationsContext)
}
