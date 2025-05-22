"use client"

const SpeciesDetailCard = ({ species, onEdit }) => {
  if (!species) return null

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0">
          <i className="bi bi-fish text-primary me-2"></i>
          {species.nombre}
        </h5>
        {onEdit && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(species)}>
            <i className="bi bi-pencil me-1"></i>
            Editar
          </button>
        )}
      </div>
      <div className="card-body">
        {species.nombre_cientifico && <p className="text-muted fst-italic mb-3">{species.nombre_cientifico}</p>}

        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="fw-bold mb-2">Información General</h6>
            <ul className="list-group list-group-flush">
              {species.habitat && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Hábitat:</span> {species.habitat}
                </li>
              )}
              {species.dieta && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Dieta:</span> {species.dieta}
                </li>
              )}
              {species.comportamiento && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Comportamiento:</span> {species.comportamiento}
                </li>
              )}
            </ul>
          </div>
          <div className="col-md-6">
            <h6 className="fw-bold mb-2">Parámetros Óptimos</h6>
            <ul className="list-group list-group-flush">
              {(species.temperatura_optima_min || species.temperatura_optima_max) && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Temperatura:</span>{" "}
                  {species.get_temperatura_rango ||
                    `${species.temperatura_optima_min}°C - ${species.temperatura_optima_max}°C`}
                </li>
              )}
              {(species.ph_optimo_min || species.ph_optimo_max) && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">pH:</span>{" "}
                  {species.get_ph_rango || `${species.ph_optimo_min} - ${species.ph_optimo_max}`}
                </li>
              )}
              {species.oxigeno_minimo && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Oxígeno mínimo:</span> {species.oxigeno_minimo} mg/L
                </li>
              )}
              {species.densidad_siembra_recomendada && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Densidad de siembra:</span> {species.densidad_siembra_recomendada}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Información Nutricional */}
        {species.informacion_nutricional && (
          <div className="mb-4">
            <h6 className="fw-bold mb-2">Información Nutricional</h6>
            <div className="row">
              <div className="col-md-6">
                <ul className="list-group list-group-flush">
                  {species.informacion_nutricional.proteinas && (
                    <li className="list-group-item px-0 py-2 border-0">
                      <span className="fw-semibold">Proteínas:</span> {species.informacion_nutricional.proteinas}
                    </li>
                  )}
                  {species.informacion_nutricional.grasas && (
                    <li className="list-group-item px-0 py-2 border-0">
                      <span className="fw-semibold">Grasas:</span> {species.informacion_nutricional.grasas}
                    </li>
                  )}
                  {species.informacion_nutricional.calorias && (
                    <li className="list-group-item px-0 py-2 border-0">
                      <span className="fw-semibold">Calorías:</span> {species.informacion_nutricional.calorias}
                    </li>
                  )}
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-group list-group-flush">
                  {species.informacion_nutricional.carbohidratos && (
                    <li className="list-group-item px-0 py-2 border-0">
                      <span className="fw-semibold">Carbohidratos:</span>{" "}
                      {species.informacion_nutricional.carbohidratos}
                    </li>
                  )}
                  {species.informacion_nutricional.fibra && (
                    <li className="list-group-item px-0 py-2 border-0">
                      <span className="fw-semibold">Fibra:</span> {species.informacion_nutricional.fibra}
                    </li>
                  )}
                  {species.informacion_nutricional.sodio && (
                    <li className="list-group-item px-0 py-2 border-0">
                      <span className="fw-semibold">Sodio:</span> {species.informacion_nutricional.sodio}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Vitaminas y Minerales */}
            <div className="row mt-2">
              {species.informacion_nutricional.vitaminas && species.informacion_nutricional.vitaminas.length > 0 && (
                <div className="col-md-6">
                  <h6 className="fw-bold mb-2">Vitaminas</h6>
                  <ul className="list-group list-group-flush">
                    {species.informacion_nutricional.vitaminas.map((vitamina, index) => (
                      <li key={index} className="list-group-item px-0 py-1 border-0">
                        <span className="fw-semibold">{vitamina.nombre}:</span> {vitamina.cantidad}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {species.informacion_nutricional.minerales && species.informacion_nutricional.minerales.length > 0 && (
                <div className="col-md-6">
                  <h6 className="fw-bold mb-2">Minerales</h6>
                  <ul className="list-group list-group-flush">
                    {species.informacion_nutricional.minerales.map((mineral, index) => (
                      <li key={index} className="list-group-item px-0 py-1 border-0">
                        <span className="fw-semibold">{mineral.nombre}:</span> {mineral.cantidad}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasa de Crecimiento */}
        {species.tasa_crecimiento && (
          <div className="mb-4">
            <h6 className="fw-bold mb-2">Tasa de Crecimiento</h6>
            <ul className="list-group list-group-flush">
              {species.tasa_crecimiento.descripcion && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Descripción:</span> {species.tasa_crecimiento.descripcion}
                </li>
              )}
              {species.tasa_crecimiento.crecimiento_mensual_promedio && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Crecimiento mensual:</span>{" "}
                  {species.tasa_crecimiento.crecimiento_mensual_promedio}
                </li>
              )}
              {species.tasa_crecimiento.tiempo_para_peso_maximo && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Tiempo para peso máximo:</span>{" "}
                  {species.tasa_crecimiento.tiempo_para_peso_maximo}
                </li>
              )}
              {species.tasa_crecimiento.peso_maximo && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Peso máximo:</span> {species.tasa_crecimiento.peso_maximo}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Tasa de Reproducción */}
        {species.tasa_reproduccion && (
          <div>
            <h6 className="fw-bold mb-2">Tasa de Reproducción</h6>
            <ul className="list-group list-group-flush">
              {species.tasa_reproduccion.frecuencia && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Frecuencia:</span> {species.tasa_reproduccion.frecuencia}
                </li>
              )}
              {species.tasa_reproduccion.numero_huevos_por_puesta && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Huevos por puesta:</span>{" "}
                  {species.tasa_reproduccion.numero_huevos_por_puesta}
                </li>
              )}
              {species.tasa_reproduccion.periodo_incubacion && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Período de incubación:</span>{" "}
                  {species.tasa_reproduccion.periodo_incubacion}
                </li>
              )}
              {species.tasa_reproduccion.edad_madurez_sexual && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Edad de madurez sexual:</span>{" "}
                  {species.tasa_reproduccion.edad_madurez_sexual}
                </li>
              )}
              {species.tasa_reproduccion.metodo_reproduccion && (
                <li className="list-group-item px-0 py-2 border-0">
                  <span className="fw-semibold">Método de reproducción:</span>{" "}
                  {species.tasa_reproduccion.metodo_reproduccion}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpeciesDetailCard