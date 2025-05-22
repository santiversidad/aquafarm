"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useFarms } from "../context/FarmContext"
import { methodService } from "../api/services"

function AddFarm() {
    const navigate = useNavigate()
    const { createFarm, error, setError } = useFarms()
    const [formData, setFormData] = useState({
        nombre: "",
        ubicacion: "",
        idMetodoAcuicola: "",
    })
    const [methods, setMethods] = useState([])
    const [loading, setLoading] = useState(false)
    const [methodsLoading, setMethodsLoading] = useState(true)
    const [formErrors, setFormErrors] = useState({})

    // Cargar métodos acuícolas
    useEffect(() => {
        const loadMethods = async () => {
            try {
                const result = await methodService.getAllMethods()

                if (result.success) {
                    setMethods(result.data)
                } else {
                    console.error("Error al cargar métodos:", result.error)
                }
            } catch (error) {
                console.error("Error al cargar métodos:", error)
            } finally {
                setMethodsLoading(false)
            }
        }

        loadMethods()
    }, [])

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

        setLoading(true)
        setError(null)

        try {
            // Preparar datos para la API
            const farmData = {
                ...formData,
                idMetodoAcuicola: Number.parseInt(formData.idMetodoAcuicola),
            }

            const result = await createFarm(farmData)

            if (result.success) {
                navigate("/dashboard")
            } else {
                setError(result.error)
            }
        } catch (error) {
            console.error("Error al crear finca:", error)
            setError("Error al crear finca")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="d-flex align-items-center mb-4">
                        <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <h1 className="mb-0">Agregar Nueva Finca</h1>
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
                                        disabled={loading}
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
                                        disabled={loading}
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
                                        disabled={loading || methodsLoading}
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
                                        onClick={() => navigate("/dashboard")}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Guardando...
                                            </>
                                        ) : (
                                            "Guardar Finca"
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

export default AddFarm