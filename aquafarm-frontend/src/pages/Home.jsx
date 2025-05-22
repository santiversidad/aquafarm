"use client"

import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section con imagen de fondo */}
      <div
        className="hero-section text-white d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="animate__animated animate__fadeIn">
                <h1 className="display-3 fw-bold mb-4">
                  <span className="text-info">Aqua</span>
                  <span className="text-primary">Farm</span>
                </h1>
                <p className="lead fs-4 mb-5">Gestión inteligente de recursos acuáticos para un futuro sostenible</p>
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center mt-4">
                  <Link to="/login" className="btn btn-primary btn-lg px-5 py-3 shadow-lg">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3">
                    <i className="bi bi-person-plus me-2"></i>
                    Registrarse
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-light py-5">
        <div className="container py-5">
          <h2 className="text-center mb-5 fw-bold text-primary">¿Por qué elegir AquaFarm?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary bg-gradient text-white mb-4 mx-auto">
                    <i className="bi bi-droplet-fill"></i>
                  </div>
                  <h4 className="card-title">Monitoreo en Tiempo Real</h4>
                  <p className="card-text text-muted">
                    Supervisa la calidad del agua, temperatura y niveles de oxígeno en tiempo real.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-success bg-gradient text-white mb-4 mx-auto">
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <h4 className="card-title">Análisis Avanzado</h4>
                  <p className="card-text text-muted">
                    Obtén estadísticas detalladas y predicciones para optimizar tu producción.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-info bg-gradient text-white mb-4 mx-auto">
                    <i className="bi bi-gear-fill"></i>
                  </div>
                  <h4 className="card-title">Automatización</h4>
                  <p className="card-text text-muted">
                    Automatiza procesos clave como alimentación y control de calidad del agua.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary text-white py-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-8 text-center text-lg-start">
              <h3 className="fw-bold mb-3">¿Listo para revolucionar tu acuicultura?</h3>
              <p className="lead mb-lg-0">Únete a miles de productores que ya optimizan sus recursos con AquaFarm.</p>
            </div>
            <div className="col-lg-4 text-center text-lg-end mt-4 mt-lg-0">
              <Link to="/register" className="btn btn-light btn-lg px-4">
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white-50 py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">&copy; 2025 AquaFarm. Todos los derechos reservados.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="social-icons">
                <a href="#" className="text-white-50 me-3">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="text-white-50 me-3">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-white-50 me-3">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="text-white-50">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}