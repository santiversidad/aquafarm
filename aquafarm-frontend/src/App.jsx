"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { FarmProvider } from "./context/FarmContext"
import { PondProvider } from "./context/PondContext"
import { SpeciesProvider } from "./context/SpeciesContext"
import { SeedingProvider } from "./context/SeedingContext"
import { InventoryProvider } from "./context/InventoryContext"
import { MonitoringProvider } from "./context/MonitoringContext"
import { SplitOperationsProvider } from "./context/SplitOperationsContext"

// Importar páginas desde la carpeta pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import FarmDetail from "./pages/FarmDetail"
import AddFarm from "./pages/AddFarm"
import EditFarm from "./pages/EditFarm"
import Profile from "./pages/Profile"
import Home from "./pages/Home"

// Importar componentes desde la carpeta components
import Navbar from "./components/Navbar"

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Componente principal de la aplicación
function AppContent() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentUser && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farms/:id"
          element={
            <ProtectedRoute>
              <FarmDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-farm"
          element={
            <ProtectedRoute>
              <AddFarm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-farm/:id"
          element={
            <ProtectedRoute>
              <EditFarm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FarmProvider>
          <PondProvider>
            <SpeciesProvider>
              <SeedingProvider>
                <InventoryProvider>
                  <MonitoringProvider>
                    <SplitOperationsProvider>
                      <AppContent />
                    </SplitOperationsProvider>
                  </MonitoringProvider>
                </InventoryProvider>
              </SeedingProvider>
            </SpeciesProvider>
          </PondProvider>
        </FarmProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
