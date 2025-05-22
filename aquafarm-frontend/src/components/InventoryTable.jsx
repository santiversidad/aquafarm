"use client"

import React from "react"
import { inventoryService } from "../api/services"

const InventoryTable = ({ inventory, onInventoryChange }) => {
  const [loading, setLoading] = React.useState({})
  const [quantities, setQuantities] = React.useState({})
  const [errors, setErrors] = React.useState({})

  // Función para formatear números con separador de miles
  const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number)
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Función para manejar cambios en las cantidades
  const handleQuantityChange = (inventoryId, value) => {
    setQuantities({
      ...quantities,
      [inventoryId]: value,
    })

    // Limpiar error si existe
    if (errors[inventoryId]) {
      setErrors({
        ...errors,
        [inventoryId]: null,
      })
    }
  }

  // Función para agregar cantidad al inventario
  const handleAddQuantity = async (inventoryId) => {
    const quantity = quantities[inventoryId]

    // Validar cantidad
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setErrors({
        ...errors,
        [inventoryId]: "Ingrese una cantidad válida mayor a cero",
      })
      return
    }

    setLoading({
      ...loading,
      [inventoryId]: "add",
    })

    try {
      const result = await inventoryService.addToInventory(inventoryId, quantity)
      if (result.success) {
        // Limpiar cantidad
        setQuantities({
          ...quantities,
          [inventoryId]: "",
        })

        // Notificar cambio
        if (onInventoryChange) {
          onInventoryChange(result.data)
        }
      } else {
        setErrors({
          ...errors,
          [inventoryId]: result.error,
        })
      }
    } catch (error) {
      console.error("Error al agregar cantidad:", error)
      setErrors({
        ...errors,
        [inventoryId]: "Error al agregar cantidad",
      })
    } finally {
      setLoading({
        ...loading,
        [inventoryId]: null,
      })
    }
  }

  // Función para reducir cantidad del inventario
  const handleReduceQuantity = async (inventoryId) => {
    const quantity = quantities[inventoryId]

    // Validar cantidad
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setErrors({
        ...errors,
        [inventoryId]: "Ingrese una cantidad válida mayor a cero",
      })
      return
    }

    setLoading({
      ...loading,
      [inventoryId]: "reduce",
    })

    try {
      const result = await inventoryService.reduceFromInventory(inventoryId, quantity)
      if (result.success) {
        // Limpiar cantidad
        setQuantities({
          ...quantities,
          [inventoryId]: "",
        })

        // Notificar cambio
        if (onInventoryChange) {
          onInventoryChange(result.data)
        }
      } else {
        setErrors({
          ...errors,
          [inventoryId]: result.error,
        })
      }
    } catch (error) {
      console.error("Error al reducir cantidad:", error)
      setErrors({
        ...errors,
        [inventoryId]: "Error al reducir cantidad",
      })
    } finally {
      setLoading({
        ...loading,
        [inventoryId]: null,
      })
    }
  }

  if (!inventory || inventory.length === 0) {
    return <div className="alert alert-info">No hay inventario disponible.</div>
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Especie</th>
            <th>Finca</th>
            <th className="text-end">Cantidad</th>
            <th>Última actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.idInventario}>
              <td>
                <div className="d-flex align-items-center">
                  <i className="bi bi-fish text-primary me-2 fs-5"></i>
                  <span className="fw-semibold">{item.especie}</span>
                </div>
              </td>
              <td>{item.finca}</td>
              <td className="text-end fw-bold">{formatNumber(item.cantidad)}</td>
              <td>{formatDate(item.fechaActualizacion)}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="input-group input-group-sm" style={{ maxWidth: "150px" }}>
                    <input
                      type="number"
                      className={`form-control ${errors[item.idInventario] ? "is-invalid" : ""}`}
                      placeholder="Cantidad"
                      value={quantities[item.idInventario] || ""}
                      onChange={(e) => handleQuantityChange(item.idInventario, e.target.value)}
                      min="1"
                    />
                    <button
                      className="btn btn-outline-success"
                      onClick={() => handleAddQuantity(item.idInventario)}
                      disabled={loading[item.idInventario] === "add"}
                    >
                      {loading[item.idInventario] === "add" ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-plus"></i>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleReduceQuantity(item.idInventario)}
                      disabled={loading[item.idInventario] === "reduce"}
                    >
                      {loading[item.idInventario] === "reduce" ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-dash"></i>
                      )}
                    </button>
                  </div>
                </div>
                {errors[item.idInventario] && (
                  <div className="invalid-feedback d-block">{errors[item.idInventario]}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
