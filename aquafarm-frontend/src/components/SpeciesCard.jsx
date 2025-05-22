"use client"

const SpeciesCard = ({ species, onView, onEdit, onDelete }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="bi bi-fish text-primary me-2"></i>
            {species.nombre}
          </h5>
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              id={`dropdownMenuButton-${species.idEspecie}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${species.idEspecie}`}>
              {onView && (
                <li>
                  <button className="dropdown-item" onClick={() => onView(species)}>
                    <i className="bi bi-eye me-2"></i>
                    Ver detalles
                  </button>
                </li>
              )}
              {onEdit && (
                <li>
                  <button className="dropdown-item" onClick={() => onEdit(species)}>
                    <i className="bi bi-pencil me-2"></i>
                    Editar
                  </button>
                </li>
              )}
              {onDelete && (
                <li>
                  <button className="dropdown-item text-danger" onClick={() => onDelete(species)}>
                    <i className="bi bi-trash me-2"></i>
                    Eliminar
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {species.nombre_cientifico && <p className="text-muted fst-italic mb-3">{species.nombre_cientifico}</p>}

        <div className="mb-3">
          {(species.temperatura_optima_min || species.temperatura_optima_max) && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="bi bi-thermometer-half me-1"></i>
                Temperatura óptima:{" "}
                {species.get_temperatura_rango ||
                  `${species.temperatura_optima_min}°C - ${species.temperatura_optima_max}°C`}
              </small>
            </div>
          )}

          {(species.ph_optimo_min || species.ph_optimo_max) && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="bi bi-droplet-half me-1"></i>
                pH óptimo: {species.get_ph_rango || `${species.ph_optimo_min} - ${species.ph_optimo_max}`}
              </small>
            </div>
          )}

          {species.oxigeno_minimo && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="bi bi-water me-1"></i>
                Oxígeno mínimo: {species.oxigeno_minimo} mg/L
              </small>
            </div>
          )}
        </div>

        {onView && (
          <button className="btn btn-sm btn-primary w-100" onClick={() => onView(species)}>
            <i className="bi bi-info-circle me-2"></i>
            Ver información completa
          </button>
        )}
      </div>
    </div>
  )
}

export default SpeciesCard
