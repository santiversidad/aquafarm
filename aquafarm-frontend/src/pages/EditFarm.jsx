"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFarms } from "../context/FarmContext"
import { methodService } from "../api/services"

function EditFarm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getFarmById, updateFarm, error, setError } = useFarms()
    const [formData, setFormData] = useState({
        nombre: "",
        ubicacion: "",
        idMetodoAcuicola: "",
    })
    const [methods, setMethods] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [methodsLoading, setMethodsLoading] = useState(true)
    const [formErrors, setFormErrors] = useState({})

    // Cargar datos de la finca y métodos acuícolas
    useEffect(() => {
        const loadData = async () => {
            try {
                // Cargar finca
                const farmResult = await getFarmById(id)

                if (!farmResult.success) {
                    setError("No se pudo cargar la finca")
                    setLoading(false)
                    return
                }

                const farm = farmResult.data

                // Preparar datos del formulario
                setFormData({
                    nombre: farm.nombre || "",
                    ubicacion: farm.ubicacion || "",
                    idMetodoAcuicola: farm.metodoAcuicola?.id || "",
                })

                // Cargar métodos acuícolas
                const methodsResult = await methodService.getAllMethods()

                if (methodsResult.success) {
                    setMethods(methodsResult.data)
                } else {
                    console.error("Error al cargar métodos:", methodsResult.error)
                }
            } catch (error) {
                console.error("Error al cargar datos:", error)
                setError("Error al cargar datos")
            } finally {
                setLoading(false)
                setMethodsLoading(false)
            }
        }

        loadData()
    }, [id, getFarmById, setError])

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Limpiar error del campo
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: null,
            }))
        }
    }

    // Validar formulario
    const validateForm = () => {
        const errors = {}

        if (!formData.nombre.trim()) {
            errors.nombre = "El nombre es obligatorio"
        }

        if (!formData.ubicacion.trim()) {
            errors.ubicacion = "La ubicación es obligatoria"
        }

        if (!formData.idMetodoAcuicola) {
            errors.idMetodoAcuicola = "Debes seleccionar un método acuícola"
        }

        return errors
    }

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validar formulario
        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            // Preparar datos para la API
            const farmData = {
                ...formData,
                idMetodoAcuicola: Number.parseInt(formData.idMetodoAcuicola),
            }

            const result = await updateFarm(id, farmData)

            if (result.success) {
                navigate(`/farms/${id}`)
            } else {
                setError(result.error)
            }
        } catch (error) {
            console.error("Error al actualizar finca:", error)
            setError("Error al actualizar finca")
        } finally {
            setSubmitting(false)
        }
    }

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="container mt-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="d-flex align-items-center mb-4">
                        <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="mb-0">Editar Finca</h1>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">
                                        Nombre de la Finca
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        disabled={submitting}
                                    />
                                    {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="ubicacion" className="form-label">
                                        Ubicación
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${formErrors.ubicacion ? "is-invalid" : ""}`}
                                        id="ubicacion"
                                        name="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={handleChange}
                                        disabled={submitting}
                                    />
                                    {formErrors.ubicacion && <div className="invalid-feedback">{formErrors.ubicacion}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="idMetodoAcuicola" className="form-label">
                                        Método Acuícola
                                    </label>
                                    <select
                                        className={`form-select ${formErrors.idMetodoAcuicola ? "is-invalid" : ""}`}
                                        id="idMetodoAcuicola"
                                        name="idMetodoAcuicola"
                                        value={formData.idMetodoAcuicola}
                                        onChange={handleChange}
                                        disabled={submitting || methodsLoading}
                                    >
                                        <option value="">Selecciona un método</option>
                                        {methods.map((method) => (
                                            <option key={method.id} value={method.id}>
                                                {method.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {methodsLoading && <div className="form-text">Cargando métodos...</div>}
                                    {formErrors.idMetodoAcuicola && <div className="invalid-feedback">{formErrors.idMetodoAcuicola}</div>}
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate(`/farms/${id}`)}
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Guardando...
                                            </>
                                        ) : (
                                            "Guardar Cambios"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditFarm