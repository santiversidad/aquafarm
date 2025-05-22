"use client"

import { useState } from "react"
import { useMonitoring } from "../context/MonitoringContext"

export default function MonitoringCard({ pond, farmId }) {
  const { getLatestMonitoringByPondId, generateSimulatedData } = useMonitoring()
  const [isLoading, setIsLoading] = useState(false)

  // Obtener el último registro de monitoreo para este estanque
  const latestRecord = getLatestMonitoringByPondId(pond.id)

  // Función para generar nuevos datos simulados
  const handleRefreshData = () => {
    setIsLoading(true)

    // Simular una pequeña demora para dar sensación de carga de datos reales
    setTimeout(() => {
      generateSimulatedData(pond.id, farmId)
      setIsLoading(false)
    }, 800)
  }

  // Función para formatear la fecha y hora
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Función para determinar el color de estado según el valor
  const getStatusColor = (value, type) => {
    switch (type) {
      case "temperature":
        if (value < 22) return "text-info" // Frío
        if (value > 28) return "text-danger" // Caliente
        return "text-success" // Normal
      case "pH":
        if (value < 6.8) return "text-warning" // Ácido
        if (value > 8.2) return "text-warning" // Alcalino
        return "text-success" // Normal
      case "oxygen":
        if (value < 5) return "text-danger" // Bajo
        if (value > 10) return "text-info" // Alto
        return "text-success" // Normal
      case "conductivity":
        if (value < 300) return "text-info" // Baja
        if (value > 1200) return "text-warning" // Alta
        return "text-success" // Normal
      case "turbidity":
        if (value > 30) return "text-warning" // Alta
        return "text-success" // Normal
      case "ammonia":
        if (value > 1) return "text-danger" // Alto
        if (value > 0.5) return "text-warning" // Medio
        return "text-success" // Normal
      default:
        return "text-secondary"
    }
  }

  // Función para determinar el mensaje de estado según el valor
  const getStatusMessage = (value, type) => {
    switch (type) {
      case "temperature":
        if (value < 22) return "Bajo"
        if (value > 28) return "Alto"
        return "Normal"
      case "pH":
        if (value < 6.8) return "Ácido"
        if (value > 8.2) return "Alcalino"
        return "Normal"
      case "oxygen":
        if (value < 5) return "Bajo"
        if (value > 10) return "Alto"
        return "Normal"
      case "conductivity":
        if (value < 300) return "Bajo"
        if (value > 1200) return "Alto"
        return "Normal"
      case "turbidity":
        if (value > 30) return "Alto"
        return "Normal"
      case "ammonia":
        if (value > 1) return "Alto"
        if (value > 0.5) return "Medio"
        return "Normal"
      default:
        return "Normal"
    }
  }

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-header bg-primary bg-opacity-10 border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 text-primary">
            <i className="bi bi-water me-2"></i>
            {pond.name}
          </h5>
          <button className="btn btn-sm btn-primary" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </button>
        </div>
      </div>
      <div className="card-body">
        {!latestRecord ? (
          <div className="text-center py-4">
            <i className="bi bi-activity text-muted display-4"></i>
            <p className="mt-3">No hay datos de monitoreo disponibles</p>
            <button className="btn btn-primary mt-2" onClick={handleRefreshData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Generando datos...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Generar Datos
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <small className="text-muted d-block mb-2">
                Última actualización: {formatDateTime(latestRecord.timestamp)}
              </small>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Temperatura</small>
                      <span className={`fw-bold fs-5 ${getStatusColor(latestRecord.temperature, "temperature")}`}>
                        {latestRecord.temperature} °C
                      </span>
                    </div>
                    <span
                      className={`badge ${getStatusColor(latestRecord.temperature, "temperature").replace("text", "bg")}`}
                    >
                      {getStatusMessage(latestRecord.temperature, "temperature")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">pH</small>
                      <span className={`fw-bold fs-5 ${getStatusColor(latestRecord.pH, "pH")}`}>{latestRecord.pH}</span>
                    </div>
                    <span className={`badge ${getStatusColor(latestRecord.pH, "pH").replace("text", "bg")}`}>
                      {getStatusMessage(latestRecord.pH, "pH")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Oxígeno Disuelto</small>
                      <span className={`fw-bold fs-5 ${getStatusColor(latestRecord.oxygen, "oxygen")}`}>
                        {latestRecord.oxygen} mg/L
                      </span>
                    </div>
                    <span className={`badge ${getStatusColor(latestRecord.oxygen, "oxygen").replace("text", "bg")}`}>
                      {getStatusMessage(latestRecord.oxygen, "oxygen")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Conductividad</small>
                      <span className={`fw-bold fs-5 ${getStatusColor(latestRecord.conductivity, "conductivity")}`}>
                        {latestRecord.conductivity} μS/cm
                      </span>
                    </div>
                    <span
                      className={`badge ${getStatusColor(latestRecord.conductivity, "conductivity").replace("text", "bg")}`}
                    >
                      {getStatusMessage(latestRecord.conductivity, "conductivity")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Turbidez</small>
                      <span className={`fw-bold fs-5 ${getStatusColor(latestRecord.turbidity, "turbidity")}`}>
                        {latestRecord.turbidity} NTU
                      </span>
                    </div>
                    <span
                      className={`badge ${getStatusColor(latestRecord.turbidity, "turbidity").replace("text", "bg")}`}
                    >
                      {getStatusMessage(latestRecord.turbidity, "turbidity")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Amonio</small>
                      <span className={`fw-bold fs-5 ${getStatusColor(latestRecord.ammonia, "ammonia")}`}>
                        {latestRecord.ammonia} mg/L
                      </span>
                    </div>
                    <span className={`badge ${getStatusColor(latestRecord.ammonia, "ammonia").replace("text", "bg")}`}>
                      {getStatusMessage(latestRecord.ammonia, "ammonia")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-end">
              <button className="btn btn-sm btn-outline-primary" onClick={handleRefreshData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Actualizar Datos
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
