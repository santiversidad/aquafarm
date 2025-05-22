"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useFarms } from "../context/FarmContext"
import Navbar from "../components/Navbar"
import FarmCard from "../components/FarmCard"

export default function Profile() {
  const { currentUser, logout } = useAuth()
  const { getUserFarms } = useFarms()
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)

  // Inicializar los modales de Bootstrap cuando el componente se monta
  useEffect(() => {
    // Verificar si Bootstrap está disponible
    if (typeof window !== "undefined" && window.bootstrap) {
      // Inicializar todos los modales
      const modalElements = document.querySelectorAll(".modal")
      modalElements.forEach((modalEl) => {
        // Solo inicializar si no está ya inicializado
        if (window.bootstrap.Modal.getInstance(modalEl) === null) {
          new window.bootstrap.Modal(modalEl)
        }
      })
    }
  }, [showConfirmLogout])

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Obtener solo las fincas del usuario actual
  const userFarms = getUserFarms()

  return (
    <div className="profile-page min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        <h1 className="fw-bold mb-4">Mi Perfil</h1>

        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="avatar-placeholder mb-3 mx-auto">
                  <span className="display-4 text-white">{currentUser.name.charAt(0).toUpperCase()}</span>
                </div>
                <h4 className="fw-bold">{currentUser.name}</h4>
                <p className="text-muted mb-3">{currentUser.email}</p>
                <div className="badge bg-primary mb-3">{currentUser.role}</div>
                <p className="text-muted small mb-3">
                  <i className="bi bi-calendar3 me-1"></i>
                  Miembro desde {formatDate(currentUser.createdAt)}
                </p>
                <button className="btn btn-outline-danger w-100" onClick={() => setShowConfirmLogout(true)}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  Información Personal
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row mb-3">
                  <div className="col-sm-4 text-muted">Nombre completo</div>
                  <div className="col-sm-8 fw-semibold">{currentUser.name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4 text-muted">Correo electrónico</div>
                  <div className="col-sm-8 fw-semibold">{currentUser.email}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4 text-muted">Rol</div>
                  <div className="col-sm-8 fw-semibold">{currentUser.role}</div>
                </div>
                <div className="row">
                  <div className="col-sm-4 text-muted">Fecha de registro</div>
                  <div className="col-sm-8 fw-semibold">{formatDate(currentUser.createdAt)}</div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-water me-2 text-primary"></i>
                    Mis Fincas
                  </h5>
                  <Link to="/add-farm" className="btn btn-sm btn-primary">
                    <i className="bi bi-plus-circle me-1"></i>
                    Agregar Finca
                  </Link>
                </div>
              </div>
              <div className="card-body p-4">
                {userFarms.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-droplet-half text-muted display-4"></i>
                    <h5 className="mt-3">No tienes fincas registradas</h5>
                    <p className="text-muted">Comienza agregando tu primera finca acuícola</p>
                    <Link to="/add-farm" className="btn btn-primary mt-2">
                      <i className="bi bi-plus-circle me-2"></i>
                      Agregar Finca
                    </Link>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 g-4">
                    {userFarms.map((farm) => (
                      <div className="col" key={farm.id}>
                        <FarmCard farm={farm} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0">
                  <i className="bi bi-graph-up me-2 text-primary"></i>
                  Estadísticas
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                          <i className="bi bi-water fs-4 text-primary"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Fincas registradas</h6>
                          <h3 className="mb-0">{userFarms.length}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                          <i className="bi bi-geo-alt fs-4 text-success"></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Ubicaciones</h6>
                          <h3 className="mb-0">{new Set(userFarms.map((farm) => farm.location.trim())).size}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para cerrar sesión */}
      {showConfirmLogout && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar cierre de sesión</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmLogout(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas cerrar sesión?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmLogout(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={logout}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  )
}
