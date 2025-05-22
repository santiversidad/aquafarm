import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Página no encontrada</h2>
      <p className="lead mb-4">Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Volver al Dashboard
      </Link>
    </div>
  )
}

export default NotFound
