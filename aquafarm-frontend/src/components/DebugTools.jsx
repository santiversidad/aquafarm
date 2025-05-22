"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"

function DebugTools() {
  const [debugOutput, setDebugOutput] = useState('Haz clic en "Mostrar fincas" para ver los datos')
  const navigate = useNavigate()

  const showFarms = () => {
    try {
      const farms = JSON.parse(localStorage.getItem("aquafarmFarms") || "[]")
      console.log("Fincas en localStorage:", farms)
      setDebugOutput(JSON.stringify(farms, null, 2))
    } catch (error) {
      setDebugOutput(`Error al leer fincas: ${error.message}`)
    }
  }

  const clearLocalStorage = () => {
    if (window.confirm("¿Estás seguro? Esto eliminará todos los datos almacenados.")) {
      localStorage.clear()
      alert("localStorage limpiado. La página se recargará.")
      window.location.reload()
    }
  }

  const showAllStorage = () => {
    try {
      const output = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        try {
          output[key] = JSON.parse(localStorage.getItem(key))
        } catch (e) {
          output[key] = localStorage.getItem(key)
        }
      }
      setDebugOutput(JSON.stringify(output, null, 2))
    } catch (error) {
      setDebugOutput(`Error al leer localStorage: ${error.message}`)
    }
  }

  const resetFarms = () => {
    if (window.confirm("¿Estás seguro? Esto eliminará todas las fincas.")) {
      localStorage.setItem("aquafarmFarms", JSON.stringify([]))
      alert("Fincas reiniciadas. La página se recargará.")
      window.location.reload()
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Herramientas de Depuración</h2>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-0">
              <i className="bi bi-tools me-2 text-primary"></i>
              Información del localStorage
            </h5>
          </div>
          <div className="card-body">
            <div className="btn-group mb-3">
              <button className="btn btn-primary" onClick={showFarms}>
                <i className="bi bi-list-ul me-2"></i>
                Mostrar fincas
              </button>
              <button className="btn btn-info text-white" onClick={showAllStorage}>
                <i className="bi bi-database me-2"></i>
                Mostrar todo el localStorage
              </button>
            </div>
            <pre
              className="bg-light p-3 border rounded"
              style={{
                maxHeight: "400px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {debugOutput}
            </pre>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-0">
              <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
              Acciones Peligrosas
            </h5>
          </div>
          <div className="card-body">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-circle me-2"></i>
              Estas acciones pueden resultar en pérdida de datos. Úsalas con precaución.
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-warning" onClick={resetFarms}>
                <i className="bi bi-trash me-2"></i>
                Reiniciar fincas
              </button>
              <button className="btn btn-danger" onClick={clearLocalStorage}>
                <i className="bi bi-trash-fill me-2"></i>
                Limpiar todo el localStorage
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="mb-0">
              <i className="bi bi-info-circle me-2 text-info"></i>
              Información del Sistema
            </h5>
          </div>
          <div className="card-body">
            <table className="table">
              <tbody>
                <tr>
                  <th style={{ width: "200px" }}>URL actual</th>
                  <td>{window.location.href}</td>
                </tr>
                <tr>
                  <th>Navegador</th>
                  <td>{navigator.userAgent}</td>
                </tr>
                <tr>
                  <th>Tamaño del localStorage</th>
                  <td>{new Blob([JSON.stringify(localStorage)]).size} bytes</td>
                </tr>
                <tr>
                  <th>Fecha y hora</th>
                  <td>{new Date().toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebugTools