"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { monitoreoService } from "../services/api"

// Crear el contexto
const MonitoringContext = createContext()

// Proveedor del contexto
export function MonitoringProvider({ children }) {
  const [allMonitoringData, setAllMonitoringData] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // Cargar datos de monitoreo desde la API al iniciar
  useEffect(() => {
    const loadMonitoringData = async () => {
      if (!currentUser) {
        setAllMonitoringData([])
        setLoading(false)
        return
      }

      try {
        const response = await monitoreoService.getAllMonitoreos()
        setAllMonitoringData(response.results || [])
      } catch (error) {
        console.error("Error al cargar los datos de monitoreo:", error)
        setAllMonitoringData([])
      } finally {
        setLoading(false)
      }
    }

    loadMonitoringData()
  }, [currentUser])

  // Función para agregar un nuevo registro de monitoreo
  const addMonitoringRecord = async (recordData) => {
    if (!currentUser) return null

    try {
      const newRecord = await monitoreoService.createMonitoreo({
        ...recordData,
        fecha: recordData.fecha || new Date().toISOString(),
      })

      setAllMonitoringData((prevData) => [...prevData, newRecord])
      return newRecord
    } catch (error) {
      console.error("Error al crear el registro de monitoreo:", error)
      throw error
    }
  }

  // Función para obtener registros de monitoreo por ID de estanque
  const getMonitoringByPondId = async (pondId) => {
    if (!currentUser) return []

    try {
      const response = await monitoreoService.getMonitoreosByEstanque(pondId)
      return response.results || []
    } catch (error) {
      console.error("Error al obtener los registros de monitoreo del estanque:", error)
      return []
    }
  }

  // Función para obtener el último registro de monitoreo por ID de estanque
  const getLatestMonitoringByPondId = async (pondId) => {
    if (!currentUser) return null

    try {
      const response = await monitoreoService.getLatestMonitoreosByEstanque(pondId)
      return response.results && response.results.length > 0 ? response.results[0] : null
    } catch (error) {
      console.error("Error al obtener el último registro de monitoreo del estanque:", error)
      return null
    }
  }

  // Función para generar datos de monitoreo simulados para un estanque
  const generateSimulatedData = async (pondId, farmId) => {
    if (!currentUser) return null

    // Generar valores aleatorios dentro de rangos normales para acuicultura
    const temperature = (Math.random() * (30 - 20) + 20).toFixed(1) // 20-30°C
    const pH = (Math.random() * (8.5 - 6.5) + 6.5).toFixed(1) // 6.5-8.5
    const oxygen = (Math.random() * (12 - 4) + 4).toFixed(1) // 4-12 mg/L
    const conductivity = Math.floor(Math.random() * (1500 - 200) + 200) // 200-1500 μS/cm
    const turbidity = Math.floor(Math.random() * (50 - 5) + 5) // 5-50 NTU
    const ammonia = (Math.random() * (2 - 0) + 0).toFixed(2) // 0-2 mg/L

    // Asumimos que tenemos sensores con IDs del 1 al 6 para cada parámetro
    const monitoreos = []

    try {
      // Temperatura (sensor ID 1)
      const tempMonitoreo = await monitoreoService.createMonitoreo({
        idEstanque: pondId,
        idSensor: 1,
        valor: Number.parseFloat(temperature),
        fecha: new Date().toISOString(),
      })
      monitoreos.push(tempMonitoreo)

      // pH (sensor ID 2)
      const phMonitoreo = await monitoreoService.createMonitoreo({
        idEstanque: pondId,
        idSensor: 2,
        valor: Number.parseFloat(pH),
        fecha: new Date().toISOString(),
      })
      monitoreos.push(phMonitoreo)

      // Oxígeno (sensor ID 3)
      const oxygenMonitoreo = await monitoreoService.createMonitoreo({
        idEstanque: pondId,
        idSensor: 3,
        valor: Number.parseFloat(oxygen),
        fecha: new Date().toISOString(),
      })
      monitoreos.push(oxygenMonitoreo)

      // Conductividad (sensor ID 4)
      const conductivityMonitoreo = await monitoreoService.createMonitoreo({
        idEstanque: pondId,
        idSensor: 4,
        valor: conductivity,
        fecha: new Date().toISOString(),
      })
      monitoreos.push(conductivityMonitoreo)

      // Turbidez (sensor ID 5)
      const turbidityMonitoreo = await monitoreoService.createMonitoreo({
        idEstanque: pondId,
        idSensor: 5,
        valor: turbidity,
        fecha: new Date().toISOString(),
      })
      monitoreos.push(turbidityMonitoreo)

      // Amoniaco (sensor ID 6)
      const ammoniaMonitoreo = await monitoreoService.createMonitoreo({
        idEstanque: pondId,
        idSensor: 6,
        valor: Number.parseFloat(ammonia),
        fecha: new Date().toISOString(),
      })
      monitoreos.push(ammoniaMonitoreo)

      // Actualizar el estado con los nuevos registros
      setAllMonitoringData((prevData) => [...prevData, ...monitoreos])

      return monitoreos
    } catch (error) {
      console.error("Error al generar datos simulados:", error)
      throw error
    }
  }

  // Función para obtener todos los registros de monitoreo por ID de finca
  const getMonitoringByFarmId = async (farmId) => {
    if (!currentUser) return []

    try {
      // No hay un endpoint directo para esto, así que obtenemos todos los estanques de la finca
      // y luego obtenemos los monitoreos de cada estanque
      const estanqueService = await import("../services/api").then((module) => module.estanqueService)
      const estanquesResponse = await estanqueService.getEstanquesByFinca(farmId)
      const estanques = estanquesResponse.results || []

      let allMonitoreos = []
      for (const estanque of estanques) {
        const monitoreos = await getMonitoringByPondId(estanque.idEstanque)
        allMonitoreos = [...allMonitoreos, ...monitoreos]
      }

      return allMonitoreos
    } catch (error) {
      console.error("Error al obtener los registros de monitoreo de la finca:", error)
      return []
    }
  }

  // Valor del contexto
  const value = {
    allMonitoringData,
    addMonitoringRecord,
    getMonitoringByPondId,
    getLatestMonitoringByPondId,
    generateSimulatedData,
    getMonitoringByFarmId,
    loading,
  }

  return <MonitoringContext.Provider value={value}>{!loading && children}</MonitoringContext.Provider>
}

// Hook personalizado para usar el contexto
export function useMonitoring() {
  return useContext(MonitoringContext)
}
