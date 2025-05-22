"use client"

import { useState, useEffect } from "react"
import { usePonds } from "../context/PondContext"
import { useInventory } from "../context/InventoryContext"

export default function PondCard({ pond, onEdit, onAddSeeding, onSplitPond }) {
  const { deletePond } = usePonds()
  const { getInventoryByPond } = useInventory()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Obtener inventario del estanque
  const pondInventory = getInventoryByPond(pond.id)
  const totalSpecies = new Set(pondInventory.map((item) => item.speciesId)).size
  const totalQuantity = pondInventory.reduce((sum, item) => sum + item.quantity, 0)

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Función para determinar el icono según el tipo de estanque
  const getPondTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "circular":
        return "bi-circle"
      case "rectangular":
        return "bi-square"
      case "irregular":
        return "bi-pentagon"
      default:
        return "bi-water"
    }
  }

  // Función para formatear el volumen
  const formatVolume = (volume) => {
    return new Intl.NumberFormat().format(volume)
  }

  // Modificar la función para cerrar el modal de confirmación de eliminación
  // Manejar eliminación de estanque
  const handleDeletePond = () => {
    deletePond(pond.id)
    setShowDeleteConfirm(false)
  }

  // Añadir función para cerrar el modal sin eliminar
  const handleCloseDeleteModal = () => {
    setShowDeleteConfirm(false)
  }

  // Efecto para manejar el scroll del body cuando hay modales abiertos
  useEffect(() => {
    if (showDeleteConfirm) {
      // Deshabilitar scroll cuando un modal está abierto
      document.body.style.overflow = "hidden"
    } else {
      // Restaurar scroll cuando no hay modales
      document.body.style.overflow = "auto"
    }

    // Limpieza al desmontar
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showDeleteConfirm])

  return (
    <div className="card h-100 border-0 shadow-sm hover-card">
      <div className="card-header bg-info bg-opacity-10 border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 text-info">
            <i className={`bi ${getPondTypeIcon(pond.type)} me-2`}></i>
            {pond.name}
          </h5>
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light"
              type="button"
              id={`dropdownMenuButton-${pond.id}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${pond.id}`}>
              <li>
                <button className="dropdown-item" onClick={() => onEdit(pond)}>
                  <i className="bi bi-pencil me-2"></i>
                  Editar
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => onAddSeeding(pond.id)}>
                  <i className="bi bi-calendar-plus me-2"></i>
                  Registrar Siembra
                </button>
              </li>
              {pondInventory.length > 0 && (
                <li>
                  <button className="dropdown-item" onClick={() => onSplitPond(pond, pondInventory)}>
                    <i className="bi bi-arrows-move me-2"></i>
                    Realizar Desdoble
                  </button>
                </li>
              )}
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => setShowDeleteConfirm(true)}>
                  <i className="bi bi-trash me-2"></i>
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <span className="badge bg-info me-2">{pond.type}</span>
          <span className="badge bg-secondary">{pond.status}</span>
        </div>
        <p className="card-text">
          <i className="bi bi-rulers text-secondary me-2"></i>
          <strong>Dimensiones:</strong> {pond.length}m x {pond.width}m x {pond.depth}m
        </p>
        <p className="card-text">
          <i className="bi bi-droplet-half text-info me-2"></i>
          <strong>Volumen:</strong> {formatVolume(pond.volume)} m³
        </p>
        <p className="card-text">
          <i className="bi bi-thermometer-half text-danger me-2"></i>
          <strong>Temperatura:</strong> {pond.temperature}°C
        </p>

        {/* Información de inventario */}
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between">
            <div>
              <small className="text-muted d-block">Especies</small>
              <span className="fw-bold">{totalSpecies}</span>
            </div>
            <div>
              <small className="text-muted d-block">Individuos</small>
              <span className="fw-bold">{formatVolume(totalQuantity)}</span>
            </div>
          </div>
        </div>

        <p className="card-text text-muted small mt-3">
          <i className="bi bi-calendar3 me-2"></i>
          Registrado el {formatDate(pond.createdAt)}
        </p>
      </div>

      {/* Modal personalizado para confirmar eliminación */}
      {showDeleteConfirm && (
        <div
          className="custom-modal-overlay"
          onClick={handleCloseDeleteModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "500px",
              position: "relative",
            }}
          >
            <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseDeleteModal}
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "1rem" }}>
              <p>
                ¿Estás seguro de que deseas eliminar el estanque <strong>{pond.name}</strong>?
              </p>
              <p className="text-danger">Esta acción no se puede deshacer y eliminará todo el inventario asociado.</p>
            </div>
            <div className="modal-footer" style={{ padding: "1rem", borderTop: "1px solid #dee2e6" }}>
              <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeletePond}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}