"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSpecies } from "../contexts/SpeciesContext"
import Navbar from "../components/Navbar"
import SpeciesCard from "../components/SpeciesCard"
import SpeciesDetailCard from "../components/SpeciesDetailCard"
import SearchBar from "../components/SearchBar"

const SpeciesManagement = () => {
  const navigate = useNavigate()
  const { allSpecies, loading, error, deleteSpecies } = useSpecies()
  const [filteredSpecies, setFilteredSpecies] = useState([])
  const [searchApplied, setSearchApplied] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [speciesIdToDelete, setSpeciesIdToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // Inicializar especies filtradas
  useEffect(() => {
    setFilteredSpecies(allSpecies)
  }, [allSpecies])

  // Campos de búsqueda para especies
  const speciesSearchFields = [
    { label: "Nombre", value: "nombre" },
    { label: "Nombre científico", value: "nombre_cientifico" },
  ]

  // Manejar búsqueda de especies
  const handleSpeciesSearch = (searchTerm, searchField) => {
    if (!searchTerm.trim()) {
      setFilteredSpecies(allSpecies)
      setSearchApplied(false)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const filtered = allSpecies.filter((species) => {
      const fieldValue = species[searchField]?.toLowerCase() || ""
      return fieldValue.includes(term)
    })

    setFilteredSpecies(filtered)
    setSearchApplied(true)
  }

  // Manejar vista de detalles
  const handleViewSpecies = (species) => {
    setSelectedSpecies(species)
    setShowDetailModal(true)
  }

  // Manejar edición de especie
  const handleEditSpecies = (species) => {
    navigate(`/edit-species/${species.idEspecie}`)
  }

  // Manejar confirmación de eliminación
  const handleDeleteConfirmation = (species) => {
    setSpeciesIdToDelete(species.idEspecie)
    setShowDeleteModal(true)
  }

  // Manejar eliminación de especie
  const handleDeleteSpecies = async () => {
    if (!speciesIdToDelete) return

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      await deleteSpecies(speciesIdToDelete)
      setShowDeleteModal(false)
      setSpeciesIdToDelete(null)
    } catch (error) {
      console.error("Error al eliminar especie:", error)
      setDeleteError("Error al eliminar la especie")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Cerrar modal de detalles
  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedSpecies(null)
  }

  // Cerrar modal de eliminación
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSpeciesIdToDelete(null)
    setDeleteError(null)
  }

  // Mostrar indicador de carga
  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="container py-5 flex-grow-1">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="container py-5 flex-grow-1">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="fw-bold mb-0">Gestión de Especies</h1>
              <p className="text-muted mb-0">Administra las especies disponibles para tus cultivos acuícolas</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/add-species")}>
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Especie
          </button>
        </div>

        {/* Barra de búsqueda */}
        {allSpecies.length > 0 && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <SearchBar
                onSearch={handleSpeciesSearch}
                placeholder="Buscar especies..."
                searchFields={speciesSearchFields}
              />
            </div>
          </div>
        )}

        {/* Lista de especies */}
        {allSpecies.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-fish text-muted display-1"></i>
              <h4 className="mt-3">No hay especies registradas</h4>
              <p className="text-muted">Comienza agregando tu primera especie</p>
              <button className="btn btn-primary mt-2" onClick={() => navigate("/add-species")}>
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Especie
              </button>
            </div>
          </div>
        ) : filteredSpecies.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-search text-muted display-1"></i>
              <h4 className="mt-3">No se encontraron resultados</h4>
              <p className="text-muted">Intenta con otros términos de búsqueda</p>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredSpecies.map((species) => (
              <div className="col" key={species.idEspecie}>
                <SpeciesCard
                  species={species}
                  onView={handleViewSpecies}
                  onEdit={handleEditSpecies}
                  onDelete={handleDeleteConfirmation}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles de especie */}
      {showDetailModal && (
        <div
          className="modal-backdrop"
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
          onClick={handleCloseDetailModal}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="modal-title">Detalles de la Especie</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseDetailModal}
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "1rem" }}>
              <SpeciesDetailCard species={selectedSpecies} onEdit={handleEditSpecies} />
            </div>
            <div className="modal-footer" style={{ padding: "1rem", borderTop: "1px solid #dee2e6" }}>
              <button type="button" className="btn btn-secondary" onClick={handleCloseDetailModal}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleCloseDetailModal()
                  handleEditSpecies(selectedSpecies)
                }}
              >
                <i className="bi bi-pencil me-2"></i>
                Editar Especie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div
          className="modal-backdrop"
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
          onClick={handleCloseDeleteModal}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "90%",
              maxWidth: "500px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="modal-title">Confirmar Eliminación</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseDeleteModal}
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "1rem" }}>
              <p>¿Estás seguro de que deseas eliminar esta especie?</p>
              <p className="text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Esta acción no se puede deshacer.
              </p>
              {deleteError && (
                <div className="alert alert-danger mt-3" role="alert">
                  {deleteError}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ padding: "1rem", borderTop: "1px solid #dee2e6" }}>
              <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteSpecies} disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeciesManagement
