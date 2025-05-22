"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useFarms } from "../context/FarmContext"
import { useAuth } from "../context/AuthContext"
import FarmCard from "../components/FarmCard"

function Dashboard() {
    const { farms, loading, error } = useFarms()
    const { currentUser } = useAuth()
    const [filteredFarms, setFilteredFarms] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    // Filtrar fincas cuando cambia la búsqueda o las fincas
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredFarms(farms)
            return
        }

        const term = searchTerm.toLowerCase()
        const filtered = farms.filter(
            (farm) => farm.nombre.toLowerCase().includes(term) || farm.ubicacion.toLowerCase().includes(term),
        )

        setFilteredFarms(filtered)
    }, [searchTerm, farms])

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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-0">Dashboard</h1>
                    <p className="text-muted">Bienvenido, {currentUser?.nombre || "Usuario"}</p>
                </div>
                <Link to="/add-farm" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar Finca
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="card mb-4">
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar fincas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Mis Fincas</h5>
                        </div>
                        <div className="card-body">
                            {filteredFarms.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="bi bi-water fs-1 text-muted"></i>
                                    <h4 className="mt-3">No hay fincas disponibles</h4>
                                    <p className="text-muted">
                                        {searchTerm
                                            ? "No se encontraron resultados para tu búsqueda"
                                            : "Comienza agregando tu primera finca"}
                                    </p>
                                    {!searchTerm && (
                                        <Link to="/add-farm" className="btn btn-primary mt-2">
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Agregar Finca
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                                    {filteredFarms.map((farm) => (
                                        <div className="col" key={farm.id}>
                                            <FarmCard farm={farm} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard