"use client"

import React from "react"
import { alertService } from "../api/services"

const AlertCard = ({ alert, onStatusChange }) => {
  const [loading, setLoading] = React.useState(false)

  // Función para marcar como resuelta
  const handleMarkAsResolved = async () => {
    setLoading(true)
    try {
      const result = await alertService.markAlertAsResolved(alert.idAlerta)
      if (result.success) {
        if (onStatusChange) {
          onStatusChange(alert.idAlerta, "RESUELTA")
        }
      } else {
        console.error("Error al marcar como resuelta:", result.error)
      }
    } catch (error) {
      console.error("Error al marcar como resuelta:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para marcar como ignorada
  const handleMarkAsIgnored = async () => {
    setLoading(true)
    try {
      const result = await alertService.markAlertAsIgnored(alert.idAlerta)
      if (result.success) {
        if (onStatusChange) {
          onStatusChange(alert.idAlerta, "IGNORADA")
        }
      } else {
        console.error("Error al marcar como ignorada:", result.error)
      }
    } catch (error) {
      console.error("Error al marcar como ignorada:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el color según el tipo de alerta
  const getAlertColor = (tipo) => {
    switch (tipo) {
      case "TEMPERATURA":
        return "danger"
      case "PH":
        return "warning"
      case "OXIGENO":
        return "info"
      default:
        return "secondary"
    }
  }

  // Función para obtener el icono según el tipo de alerta
  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case "TEMPERATURA":
        return "bi-thermometer-high"
      case "PH":
        return "bi-droplet"
      case "OXIGENO":
        return "bi-water"
      default:
        return "bi-exclamation-triangle"
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className={`card border-${getAlertColor(alert.tipoAlerta)} mb-3`}>
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <div>
          <i className={`bi ${getAlertIcon(alert.tipoAlerta)} text-${getAlertColor(alert.tipoAlerta)} me-2`}></i>
          <span className="fw-bold">{alert.tipoAlerta}</span>
          <span
            className={`badge bg-${alert.estado === "ACTIVA" ? "danger" : alert.estado === "RESUELTA" ? "success" : "secondary"} ms-2`}
          >
            {alert.estado}
          </span>
        </div>
        <small className="text-muted">{formatDate(alert.fechaCreacion)}</small>
      </div>
      <div className="card-body">
        <p className="card-text">{alert.mensaje}</p>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">
              Valor medido: <span className="fw-bold">{alert.valorMedido}</span>
            </small>
            <br />
            <small className="text-muted">
              Valor límite: <span className="fw-bold">{alert.valorLimite}</span>
            </small>
          </div>
          <div>
            {alert.especie && (
              <small className="text-muted">
                Especie: <span className="fw-bold">{alert.especie}</span>
              </small>
            )}
          </div>
        </div>
      </div>
      {alert.estado === "ACTIVA" && (
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={handleMarkAsIgnored} disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="bi bi-eye-slash me-1"></i>
              )}
              Ignorar
            </button>
            <button className="btn btn-sm btn-success" onClick={handleMarkAsResolved} disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="bi bi-check-circle me-1"></i>
              )}
              Marcar como resuelta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertCard
