import { Link } from "react-router-dom"

function FarmCard({ farm }) {
  if (!farm) return null

  const {
    id,
    nombre = "Sin nombre",
    ubicacion = "Sin ubicación",
    metodoAcuicola = { nombre: "No especificado" },
    cantidadEstanques = 0,
    fechaCreacion,
  } = farm

  // Formatear fecha
  const formattedDate = fechaCreacion
    ? new Date(fechaCreacion).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha desconocida"

  // Determinar icono según el método acuícola
  let methodIcon = "bi-droplet"
  let methodColor = "primary"

  const methodName = metodoAcuicola?.nombre?.toLowerCase() || ""

  if (methodName.includes("biofloc")) {
    methodIcon = "bi-water"
    methodColor = "info"
  } else if (methodName.includes("recirculación") || methodName.includes("recirculacion")) {
    methodIcon = "bi-arrow-repeat"
    methodColor = "success"
  } else if (methodName.includes("tradicional")) {
    methodIcon = "bi-droplet-half"
    methodColor = "primary"
  }

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className={`badge bg-${methodColor} bg-opacity-10 text-${methodColor} px-3 py-2 rounded-pill`}>
            <i className={`bi ${methodIcon} me-1`}></i>
            {metodoAcuicola?.nombre || "No especificado"}
          </span>
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light rounded-circle"
              type="button"
              id={`dropdownMenuButton-${id}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${id}`}>
              <li>
                <Link className="dropdown-item" to={`/edit-farm/${id}`}>
                  <i className="bi bi-pencil me-2"></i>
                  Editar
                </Link>
              </li>
              <li>
                <button className="dropdown-item text-danger">
                  <i className="bi bi-trash me-2"></i>
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>

        <h5 className="card-title mb-1">{nombre}</h5>
        <p className="text-muted mb-3">
          <i className="bi bi-geo-alt me-1"></i>
          {ubicacion}
        </p>

        <div className="d-flex align-items-center mb-3">
          <div className="me-3">
            <span className="d-block fw-bold">{cantidadEstanques}</span>
            <small className="text-muted">Estanques</small>
          </div>
          <div>
            <span className="d-block fw-bold">{farm.especies?.length || 0}</span>
            <small className="text-muted">Especies</small>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="bi bi-calendar3 me-1"></i>
            {formattedDate}
          </small>
          <Link to={`/farms/${id}`} className="btn btn-sm btn-primary">
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FarmCard
