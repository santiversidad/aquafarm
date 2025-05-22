"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

const InventoryContext = createContext()

export const useInventory = () => useContext(InventoryContext)

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  // Cargar inventario al iniciar
  useEffect(() => {
    const loadInventory = async () => {
      if (!currentUser) {
        setInventory([])
        setLoading(false)
        return
      }

      try {
        // No cargamos todo el inventario al inicio, ya que puede ser muy grande
        // y normalmente se filtra por finca
        setInventory([])
      } catch (error) {
        console.error("Error al cargar el inventario:", error)
        setError(error.message)
        setInventory([])
      } finally {
        setLoading(false)
      }
    }

    loadInventory()
  }, [currentUser])

  // Función para obtener inventario por ID de finca
  const getInventoryByFarm = async (farmId) => {
    if (!farmId) {
      console.error("ID de finca no proporcionado")
      return []
    }

    try {
      // Implementación simplificada - en un caso real, esto vendría de la API
      // Aquí simulamos obtener el inventario basado en las siembras activas
      return []
    } catch (error) {
      console.error(`Error al obtener inventario de finca ${farmId}:`, error)
      return []
    }
  }

  // Valor del contexto
  const value = {
    inventory,
    getInventoryByFarm,
    loading,
    error,
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}
