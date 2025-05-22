"use client"

import { useState } from "react"

export default function SearchBar({ onSearch, placeholder, searchFields }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState(searchFields[0]?.value || "")

  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value, selectedField)
  }

  // Manejar cambio en el campo de búsqueda
  const handleFieldChange = (e) => {
    const value = e.target.value
    setSelectedField(value)
    onSearch(searchTerm, value)
  }

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm("")
    onSearch("", selectedField)
  }

  return (
    <div className="search-bar mb-4">
      <div className="input-group">
        {searchFields.length > 1 && (
          <select
            className="form-select flex-grow-0 w-auto"
            value={selectedField}
            onChange={handleFieldChange}
            aria-label="Campo de búsqueda"
          >
            {searchFields.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          className="form-control"
          placeholder={placeholder || "Buscar..."}
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Término de búsqueda"
        />
        {searchTerm && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleClearSearch}
            aria-label="Limpiar búsqueda"
          >
            <i className="bi bi-x"></i>
          </button>
        )}
        <button className="btn btn-primary" type="button" aria-label="Buscar">
          <i className="bi bi-search"></i>
        </button>
      </div>
    </div>
  )
}
