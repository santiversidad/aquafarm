"use client"

import { useState, useEffect } from "react"
import { usePonds } from "../context/PondContext"
import { useInventory } from "../context/InventoryContext"
import { useSpecies } from "../context/SpeciesContext"

export default function PondSplitModal({ show, onClose, sourcePond, sourceInventory, farmId }) {
  const { getPondsByFarmId } = usePonds()
  const { getSpeciesById } = useSpecies()
  const { getInventoryByPond, performSplitOperation } = useInventory()

  // Estados para el formulario
  const [formData, setFormData] = useState({
    targetPondId: "",
    speciesId: "",
    quantity: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [compatiblePonds, setCompatiblePonds] = useState([])
  const [availableSpecies, setAvailableSpecies] = useState([])
  const [maxQuantity, setMaxQuantity] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Cargar estanques compatibles y especies disponibles
  useEffect(() => {
    if (show && sourcePond && sourceInventory) {
      // Obtener todos los estanques de la finca
      const farmPonds = getPondsByFarmId(farmId).filter((pond) => pond.id !== sourcePond.id)

      // Obtener las especies en el estanque de origen
      const sourceSpeciesIds = sourceInventory.map((item) => item.speciesId)

      // Encontrar estanques compatibles (que tengan al menos una especie en común o estén vacíos)
      const compatible = farmPonds.filter((pond) => {
        const pondInventory = getInventoryByPond(pond.id)

        // Si el estanque está vacío, es compatible
        if (pondInventory.length === 0) return true

        // Verificar si hay especies en común
        const pondSpeciesIds = pondInventory.map((item) => item.speciesId)
        return sourceSpeciesIds.some((id) => pondSpeciesIds.includes(id))
      })

      setCompatiblePonds(compatible)

      // Establecer especies disponibles para transferir
      const species = sourceInventory.map((item) => ({
        id: item.speciesId,
        name: getSpeciesById(item.speciesId)?.name || "Desconocida",
        quantity: item.quantity,
      }))

      setAvailableSpecies(species)

      // Resetear el formulario
      setFormData({
        targetPondId: "",
        speciesId: "",
        quantity: "",
      })

      setFormErrors({})
      setSuccessMessage("")
    }
  }, [show, sourcePond, sourceInventory, farmId, getPondsByFarmId, getInventoryByPond, getSpeciesById])

  // Actualizar cantidad máxima cuando cambia la especie seleccionada
  useEffect(() => {
    if (formData.speciesId) {
      const selectedSpecies = sourceInventory.find((item) => item.speciesId === formData.speciesId)
      if (selectedSpecies) {
        setMaxQuantity(selectedSpecies.quantity)
      }
    } else {
      setMaxQuantity(0)
    }
  }, [formData.speciesId, sourceInventory])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar errores al escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }

    // Limpiar mensaje de éxito
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = {}

    if (!formData.targetPondId) {
      errors.targetPondId = "Selecciona un estanque destino"
    }

    if (!formData.speciesId) {
      errors.speciesId = "Selecciona una especie"
    }

    if (!formData.quantity || isNaN(formData.quantity)) {
      errors.quantity = "Ingresa una cantidad válida"
    } else {
      const quantity = Number(formData.quantity)
      if (quantity <= 0) {
        errors.quantity = "La cantidad debe ser mayor a cero"
      } else if (quantity > maxQuantity) {
        errors.quantity = `La cantidad no puede ser mayor a ${maxQuantity}`
      }
    }

    return errors
  }

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Realizar la operación de desdoble
      performSplitOperation(sourcePond.id, formData.targetPondId, formData.speciesId, Number(formData.quantity), farmId)

      // Mostrar mensaje de éxito
      setSuccessMessage("Desdoble realizado con éxito")

      // Resetear formulario
      setFormData({
        ...formData,
        quantity: "",
      })

      // Actualizar cantidad máxima
      const updatedSpecies = sourceInventory.find((item) => item.speciesId === formData.speciesId)
      if (updatedSpecies) {
        setMaxQuantity(updatedSpecies.quantity - Number(formData.quantity))
      }
    } catch (error) {
      console.error("Error al realizar el desdoble:", error)
      setFormErrors({
        general: "Error al realizar el desdoble. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para prevenir la propagación de clics dentro del modal
  const handleModalContentClick = (e) => {
    e.stopPropagation()
  }

  // Si no se debe mostrar el modal
  if (!show) return null

  return (
    <div
      className="custom-modal-overlay"
      onClick={onClose}
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
        onClick={handleModalContentClick}
        style={{
          backgroundColor: "white",
          borderRadius: "0.5rem",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
          <h5 className="modal-title">
            <i className="bi bi-arrows-move me-2 text-primary"></i>
            Realizar Desdoble de Estanque
          </h5>
          <button type="button" className="btn-close" onClick={onClose} style={{ cursor: "pointer" }}></button>
        </div>
        <div className="modal-body" style={{ padding: "1rem" }}>
          {successMessage && (
            <div className="alert alert-success mb-3">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
            </div>
          )}

          {formErrors.general && (
            <div className="alert alert-danger mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {formErrors.general}
            </div>
          )}

          <div className="mb-4">
            <h6 className="fw-bold">Estanque de Origen</h6>
            <p className="mb-1">
              <i className="bi bi-water me-2 text-info"></i>
              {sourcePond?.name}
            </p>
            <p className="text-muted small mb-0">
              Inventario actual: {sourceInventory.reduce((sum, item) => sum + item.quantity, 0)} individuos
            </p>
          </div>

          {compatiblePonds.length === 0 ? (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No hay estanques compatibles disponibles para realizar el desdoble.
              <p className="mb-0 mt-2 small">
                Un estanque compatible debe estar vacío o contener al menos una de las mismas especies que el estanque
                de origen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="targetPondId" className="form-label fw-semibold">
                  Estanque Destino
                </label>
                <select
                  className={`form-select ${formErrors.targetPondId ? "is-invalid" : ""}`}
                  id="targetPondId"
                  name="targetPondId"
                  value={formData.targetPondId}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un estanque</option>
                  {compatiblePonds.map((pond) => (
                    <option key={pond.id} value={pond.id}>
                      {pond.name} ({pond.type})
                    </option>
                  ))}
                </select>
                {formErrors.targetPondId && <div className="invalid-feedback">{formErrors.targetPondId}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="speciesId" className="form-label fw-semibold">
                  Especie a Transferir
                </label>
                <select
                  className={`form-select ${formErrors.speciesId ? "is-invalid" : ""}`}
                  id="speciesId"
                  name="speciesId"
                  value={formData.speciesId}
                  onChange={handleChange}
                >
                  <option value="">Selecciona una especie</option>
                  {availableSpecies.map((species) => (
                    <option key={species.id} value={species.id}>
                      {species.name} ({species.quantity} disponibles)
                    </option>
                  ))}
                </select>
                {formErrors.speciesId && <div className="invalid-feedback">{formErrors.speciesId}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="form-label fw-semibold">
                  Cantidad a Transferir
                </label>
                <input
                  type="number"
                  className={`form-control ${formErrors.quantity ? "is-invalid" : ""}`}
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Ingresa la cantidad"
                  min="1"
                  max={maxQuantity}
                />
                {formErrors.quantity && <div className="invalid-feedback">{formErrors.quantity}</div>}
                {maxQuantity > 0 && <div className="form-text">Máximo disponible: {maxQuantity} individuos</div>}
              </div>

              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                El desdoble transferirá los individuos del estanque de origen al estanque destino, actualizando
                automáticamente el inventario en ambos estanques.
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrows-move me-2"></i>
                      Realizar Desdoble
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}