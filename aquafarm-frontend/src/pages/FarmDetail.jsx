"use client"

import { useRef } from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useFarms } from "../context/FarmContext"
import { usePonds } from "../context/PondContext"
import { useSpecies } from "../context/SpeciesContext"
import { useSeedings } from "../context/SeedingContext"
import { useInventory } from "../context/InventoryContext"
import { useMonitoring } from "../context/MonitoringContext"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import PondCard from "../components/PondCard"
import MonitoringCard from "../components/MonitoringCard"
import SearchBar from "../components/SearchBar"
import PondSplitModal from "../components/PondSplitModal"
import { useSplitOperations } from "../context/SplitOperationsContext"

export default function FarmDetail() {
  const navigate = useNavigate()
  const { farmId } = useParams()
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getFarmById, getUserFarms } = useFarms() || {}
  const { getPondsByFarmId, addPond, updatePond } = usePonds() || {}
  const { getUserSpecies } = useSpecies() || {}
  const { getSeedingsByFarmId, addSeeding } = useSeedings() || {}
  const { getInventoryByFarm } = useInventory() || {}
  const { getMonitoringByFarmId } = useMonitoring() || {}
  const { getSplitOperationsByFarmId } = useSplitOperations() || {}

  const [farm, setFarm] = useState(null)
  const [ponds, setPonds] = useState([])
  const [activeTab, setActiveTab] = useState("ponds")
  const [inventory, setInventory] = useState([])
  const [seedings, setSeedings] = useState([])
  const [species, setSpecies] = useState([])
  const [monitoringData, setMonitoringData] = useState([])
  const [splitOperations, setSplitOperations] = useState([])
  const [notAuthorized, setNotAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para búsqueda
  const [filteredPonds, setFilteredPonds] = useState([])
  const [filteredSeedings, setFilteredSeedings] = useState([])
  const [filteredSplitOperations, setFilteredSplitOperations] = useState([])
  const [searchAppliedPonds, setSearchAppliedPonds] = useState(false)
  const [searchAppliedSeedings, setSearchAppliedSeedings] = useState(false)
  const [searchAppliedSplitOperations, setSearchAppliedSplitOperations] = useState(false)

  // Estados para modales
  const [showAddPondModal, setShowAddPondModal] = useState(false)
  const [showEditPondModal, setShowEditPondModal] = useState(false)
  const [showAddSeedingModal, setShowAddSeedingModal] = useState(false)
  const [showSplitPondModal, setShowSplitPondModal] = useState(false)
  const [currentPond, setCurrentPond] = useState(null)
  const [currentPondInventory, setCurrentPondInventory] = useState([])

  // Estados para formularios
  const [pondFormData, setPondFormData] = useState({
    name: "",
    type: "",
    length: "",
    width: "",
    depth: "",
    volume: "",
    temperature: "",
    status: "Activo",
  })

  const [seedingFormData, setSeedingFormData] = useState({
    speciesId: "",
    pondId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    investment: "",
  })

  const [formErrors, setFormErrors] = useState({})

  // Referencias para los modales
  const addPondModalRef = useRef(null)
  const editPondModalRef = useRef(null)
  const addSeedingModalRef = useRef(null)

  // Opciones para el tipo de estanque
  const pondTypeOptions = ["Circular", "Rectangular", "Irregular", "Otro"]

  // Opciones para el estado del estanque
  const pondStatusOptions = ["Activo", "Inactivo", "Mantenimiento", "Construcción"]

  // Campos de búsqueda para estanques
  const pondSearchFields = [
    { label: "Nombre", value: "name" },
    { label: "Tipo", value: "type" },
    { label: "Estado", value: "status" },
  ]

  // Campos de búsqueda para siembras
  const seedingSearchFields = [
    { label: "Especie", value: "speciesName" },
    { label: "Estanque", value: "pondName" },
    { label: "Fecha", value: "date" },
  ]

  // Campos de búsqueda para operaciones de desdoble
  const splitOperationSearchFields = [
    { label: "Estanque origen", value: "sourcePondName" },
    { label: "Estanque destino", value: "targetPondName" },
    { label: "Especie", value: "speciesName" },
  ]

  // Efecto para manejar el scroll del body cuando hay modales abiertos
  useEffect(() => {
    if (showAddPondModal || showEditPondModal || showAddSeedingModal || showSplitPondModal) {
      // Deshabilitar scroll cuando un modal está abierto
      document.body.style.overflow = "hidden"
    } else {
      // Restaurar scroll cuando no hay modales
      document.body.style.overflow = "auto"
    }

    // Limpieza al desmontar
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showAddPondModal, showEditPondModal, showAddSeedingModal, showSplitPondModal])

  // Modificar el useEffect para mejorar el manejo de errores y la depuración
  // Cargar datos de la finca, estanques, especies, siembras e inventario
  useEffect(() => {
    console.log("FarmDetail - useEffect ejecutándose, farmId:", farmId)

    const loadFarmData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar que las funciones necesarias existan
        if (!getFarmById) {
          setError("Error: La función getFarmById no está disponible")
          setIsLoading(false)
          return
        }

        // Obtener la finca por ID
        console.log("Intentando obtener finca con ID:", farmId)
        let farmData = await getFarmById(farmId)
        console.log("Datos de finca obtenidos:", farmData)

        if (!farmData || !farmData.success) {
          console.error("No se encontró la finca con ID:", farmId)

          // Intentar obtener todas las fincas del usuario
          if (getUserFarms) {
            const userFarms = await getUserFarms()
            console.log("Fincas del usuario:", userFarms)

            if (userFarms && userFarms.length > 0) {
              // Usar la primera finca como alternativa
              farmData = userFarms[0]
              console.log("Usando primera finca disponible:", farmData)

              // Actualizar la URL sin recargar la página
              window.history.replaceState(null, "", `/farm/${farmData.id}`)
            } else {
              setError("No se encontró la finca solicitada y no hay fincas disponibles.")
              setIsLoading(false)
              return
            }
          } else {
            setError("No se encontró la finca solicitada y no se pueden obtener las fincas del usuario.")
            setIsLoading(false)
            return
          }
        } else {
          farmData = farmData.data
        }

        setFarm(farmData)

        // Verificar si el usuario actual es el propietario de la finca
        if (farmData.userId !== currentUser?.id) {
          console.error("Usuario no autorizado para ver esta finca")
          setNotAuthorized(true)
          setIsLoading(false)
          return
        }

        // Resto del código para cargar estanques, especies, etc.
        // Cargar estanques
        let farmPonds = []
        if (getPondsByFarmId) {
          farmPonds = await getPondsByFarmId(farmId)
        } else {
          console.warn("La función getPondsByFarmId no está disponible")
        }
        setPonds(farmPonds)
        setFilteredPonds(farmPonds)

        // Cargar especies
        let userSpecies = []
        if (getUserSpecies) {
          userSpecies = await getUserSpecies()
        } else {
          console.warn("La función getUserSpecies no está disponible")
        }
        setSpecies(userSpecies)

        // Cargar siembras
        let farmSeedings = []
        if (getSeedingsByFarmId) {
          farmSeedings = await getSeedingsByFarmId(farmId)
        } else {
          console.warn("La función getSeedingsByFarmId no está disponible")
        }
        setSeedings(farmSeedings)

        // Enriquecer los datos de siembras con nombres de especies y estanques
        const enrichedSeedings = farmSeedings.map((seeding) => {
          const speciesName = userSpecies.find((s) => s.id === seeding.speciesId)?.name || "Desconocida"
          const pondName = farmPonds.find((p) => p.id === seeding.pondId)?.name || "Desconocido"
          return {
            ...seeding,
            speciesName,
            pondName,
          }
        })
        setSeedings(enrichedSeedings)
        setFilteredSeedings(enrichedSeedings)

        // Cargar inventario
        let farmInventory = []
        if (getInventoryByFarm) {
          farmInventory = await getInventoryByFarm(farmId)
        } else {
          console.warn("La función getInventoryByFarm no está disponible")
        }
        setInventory(farmInventory)

        // Cargar datos de monitoreo
        let farmMonitoring = []
        if (getMonitoringByFarmId) {
          farmMonitoring = await getMonitoringByFarmId(farmId)
        } else {
          console.warn("La función getMonitoringByFarmId no está disponible")
        }
        setMonitoringData(farmMonitoring)

        // Cargar operaciones de desdoble
        let farmSplitOperations = []
        if (getSplitOperationsByFarmId) {
          farmSplitOperations = await getSplitOperationsByFarmId(farmId)
        } else {
          console.warn("La función getSplitOperationsByFarmId no está disponible")
        }

        // Enriquecer los datos de operaciones de desdoble con nombres
        const enrichedSplitOperations = farmSplitOperations.map((operation) => {
          const sourcePondName = farmPonds.find((p) => p.id === operation.sourcePondId)?.name || "Desconocido"
          const targetPondName = farmPonds.find((p) => p.id === operation.targetPondId)?.name || "Desconocido"
          const speciesName = userSpecies.find((s) => s.id === operation.speciesId)?.name || "Desconocida"
          return {
            ...operation,
            sourcePondName,
            targetPondName,
            speciesName,
          }
        })

        setSplitOperations(enrichedSplitOperations)
        setFilteredSplitOperations(enrichedSplitOperations)
      } catch (error) {
        console.error("Error al cargar datos de la finca:", error)
        setError(`Error al cargar los datos de la finca: ${error.message || "Error desconocido"}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadFarmData()
  }, [
    farmId,
    getFarmById,
    getPondsByFarmId,
    getUserSpecies,
    getSeedingsByFarmId,
    getInventoryByFarm,
    getMonitoringByFarmId,
    getSplitOperationsByFarmId,
    navigate,
    currentUser,
    getUserFarms,
  ])

  // Resto del código...
  // (El resto del componente se mantiene igual)

  // Manejar búsqueda de estanques
  const handlePondSearch = (searchTerm, searchField) => {
    if (!searchTerm.trim()) {
      setFilteredPonds(ponds)
      setSearchAppliedPonds(false)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const filtered = ponds.filter((pond) => {
      const fieldValue = pond[searchField]?.toLowerCase() || ""
      return fieldValue.includes(term)
    })

    setFilteredPonds(filtered)
    setSearchAppliedPonds(true)
  }

  // Manejar búsqueda de siembras
  const handleSeedingSearch = (searchTerm, searchField) => {
    if (!searchTerm.trim()) {
      setFilteredSeedings(seedings)
      setSearchAppliedSeedings(false)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const filtered = seedings.filter((seeding) => {
      const fieldValue = seeding[searchField]?.toLowerCase() || ""
      return fieldValue.includes(term)
    })

    setFilteredSeedings(filtered)
    setSearchAppliedSeedings(true)
  }

  // Manejar búsqueda de operaciones de desdoble
  const handleSplitOperationSearch = (searchTerm, searchField) => {
    if (!searchTerm.trim()) {
      setFilteredSplitOperations(splitOperations)
      setSearchAppliedSplitOperations(false)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const filtered = splitOperations.filter((operation) => {
      const fieldValue = operation[searchField]?.toLowerCase() || ""
      return fieldValue.includes(term)
    })

    setFilteredSplitOperations(filtered)
    setSearchAppliedSplitOperations(true)
  }

  // Manejar cambios en el formulario de estanque
  const handlePondFormChange = (e) => {
    const { name, value } = e.target
    setPondFormData({
      ...pondFormData,
      [name]: value,
    })

    // Si cambian las dimensiones, calcular el volumen automáticamente
    if (["length", "width", "depth"].includes(name)) {
      const length = name === "length" ? Number.parseFloat(value) || 0 : Number.parseFloat(pondFormData.length) || 0
      const width = name === "width" ? Number.parseFloat(value) || 0 : Number.parseFloat(pondFormData.width) || 0
      const depth = name === "depth" ? Number.parseFloat(value) || 0 : Number.parseFloat(pondFormData.depth) || 0

      // Calcular volumen según el tipo de estanque
      let volume = 0
      const pondType = pondFormData.type.toLowerCase()

      if (pondType === "circular") {
        // Para estanques circulares, length es el diámetro
        const radius = length / 2
        volume = Math.PI * radius * radius * depth
      } else {
        // Para otros tipos, usar fórmula rectangular
        volume = length * width * depth
      }

      // Redondear a 2 decimales
      volume = Math.round(volume * 100) / 100

      setPondFormData({
        ...pondFormData,
        [name]: value,
        volume: volume.toString(),
      })
    }

    // Limpiar errores al escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  // Manejar cambios en el formulario de siembra
  const handleSeedingFormChange = (e) => {
    const { name, value } = e.target
    setSeedingFormData({
      ...seedingFormData,
      [name]: value,
    })

    // Limpiar errores al escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  // Validar formulario de estanque
  const validatePondForm = () => {
    const errors = {}
    if (!pondFormData.name.trim()) errors.name = "El nombre es obligatorio"
    if (!pondFormData.type) errors.type = "Selecciona un tipo de estanque"
    if (!pondFormData.length || isNaN(pondFormData.length))
      errors.length = "Ingresa un valor numérico válido para la longitud"
    if (!pondFormData.width || isNaN(pondFormData.width))
      errors.width = "Ingresa un valor numérico válido para el ancho"
    if (!pondFormData.depth || isNaN(pondFormData.depth))
      errors.depth = "Ingresa un valor numérico válido para la profundidad"
    if (!pondFormData.temperature || isNaN(pondFormData.temperature))
      errors.temperature = "Ingresa un valor numérico válido para la temperatura"
    return errors
  }

  // Validar formulario de siembra
  const validateSeedingForm = () => {
    const errors = {}
    if (!seedingFormData.speciesId) errors.speciesId = "Selecciona una especie"
    if (!seedingFormData.pondId) errors.pondId = "Selecciona un estanque"
    if (!seedingFormData.quantity || isNaN(seedingFormData.quantity) || Number.parseInt(seedingFormData.quantity) <= 0)
      errors.quantity = "Ingresa una cantidad válida mayor a cero"
    if (!seedingFormData.date) errors.date = "La fecha es obligatoria"
    if (
      !seedingFormData.investment ||
      isNaN(seedingFormData.investment) ||
      Number.parseFloat(seedingFormData.investment) < 0
    )
      errors.investment = "Ingresa un valor válido para la inversión"
    return errors
  }

  // Abrir modal para añadir estanque
  const handleOpenAddPondModal = () => {
    setPondFormData({
      name: "",
      type: "",
      length: "",
      width: "",
      depth: "",
      volume: "",
      temperature: "",
      status: "Activo",
    })
    setFormErrors({})
    setShowAddPondModal(true)
  }

  // Cerrar modal para añadir estanque
  const handleCloseAddPondModal = () => {
    setShowAddPondModal(false)
  }

  // Abrir modal para editar estanque
  const handleOpenEditPondModal = (pond) => {
    setCurrentPond(pond)
    setPondFormData({
      name: pond.name,
      type: pond.type,
      length: pond.length,
      width: pond.width,
      depth: pond.depth,
      volume: pond.volume,
      temperature: pond.temperature,
      status: pond.status,
    })
    setFormErrors({})
    setShowEditPondModal(true)
  }

  // Cerrar modal para editar estanque
  const handleCloseEditPondModal = () => {
    setShowEditPondModal(false)
  }

  // Abrir modal para añadir siembra
  const handleOpenAddSeedingModal = (pondId = "") => {
    setSeedingFormData({
      speciesId: "",
      pondId: pondId,
      quantity: "",
      date: new Date().toISOString().split("T")[0],
      investment: "",
    })
    setFormErrors({})
    setShowAddSeedingModal(true)
  }

  // Cerrar modal para añadir siembra
  const handleCloseAddSeedingModal = () => {
    setShowAddSeedingModal(false)
  }

  // Abrir modal para realizar desdoble
  const handleOpenSplitPondModal = (pond, pondInventory) => {
    setCurrentPond(pond)
    setCurrentPondInventory(pondInventory)
    setShowSplitPondModal(true)
  }

  // Cerrar modal para realizar desdoble
  const handleCloseSplitPondModal = () => {
    setShowSplitPondModal(false)

    // Recargar inventario después de un desdoble
    const farmInventory = getInventoryByFarm(farmId)
    setInventory(farmInventory)

    // Recargar operaciones de desdoble
    const farmSplitOperations = getSplitOperationsByFarmId(farmId)

    // Enriquecer los datos de operaciones de desdoble con nombres
    const enrichedSplitOperations = farmSplitOperations.map((operation) => {
      const sourcePondName = ponds.find((p) => p.id === operation.sourcePondId)?.name || "Desconocido"
      const targetPondName = ponds.find((p) => p.id === operation.targetPondId)?.name || "Desconocido"
      const speciesName = species.find((s) => s.id === operation.speciesId)?.name || "Desconocida"
      return {
        ...operation,
        sourcePondName,
        targetPondName,
        speciesName,
      }
    })

    setSplitOperations(enrichedSplitOperations)
    setFilteredSplitOperations(enrichedSplitOperations)
  }

  // Guardar nuevo estanque
  const handleAddPond = (e) => {
    e.preventDefault()
    const errors = validatePondForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Crear nuevo estanque
    const newPond = {
      ...pondFormData,
      farmId: farmId,
      userId: currentUser.id, // Asociar el estanque al usuario actual
    }

    const addedPond = addPond(newPond)
    const updatedPonds = [...ponds, addedPond]
    setPonds(updatedPonds)
    setFilteredPonds(updatedPonds)
    handleCloseAddPondModal()
  }

  // Actualizar estanque existente
  const handleUpdatePond = (e) => {
    e.preventDefault()
    const errors = validatePondForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Actualizar estanque
    updatePond(currentPond.id, pondFormData)
    const updatedPonds = ponds.map((pond) => (pond.id === currentPond.id ? { ...pond, ...pondFormData } : pond))
    setPonds(updatedPonds)
    setFilteredPonds(updatedPonds)
    handleCloseEditPondModal()
  }

  // Guardar nueva siembra
  const handleAddSeeding = (e) => {
    e.preventDefault()
    const errors = validateSeedingForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Crear nueva siembra
    const newSeeding = {
      ...seedingFormData,
      farmId: farmId,
      userId: currentUser.id,
    }

    const addedSeeding = addSeeding(newSeeding)

    // Añadir nombres de especie y estanque para la búsqueda
    const speciesName = species.find((s) => s.id === addedSeeding.speciesId)?.name || "Desconocida"
    const pondName = ponds.find((p) => p.id === addedSeeding.pondId)?.name || "Desconocido"
    const enrichedSeeding = {
      ...addedSeeding,
      speciesName,
      pondName,
    }

    const updatedSeedings = [...seedings, enrichedSeeding]
    setSeedings(updatedSeedings)
    setFilteredSeedings(updatedSeedings)

    // Actualizar inventario
    const updatedInventory = getInventoryByFarm(farmId)
    setInventory(updatedInventory)

    handleCloseAddSeedingModal()
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Formatear número con separador de miles
  const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number)
  }

  // Modificar la sección de error para mostrar más detalles y opciones al usuario
  // Mostrar mensaje de error si hay alguno
  // Cargar datos de la finca y estanques
  const [loading, setLoading] = useState(true);
  const pondService = {};

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

        setFarm(farmResult.data)

        // Cargar estanques
        const pondsResult = await pondService.getPondsByFarm(id)

        if (pondsResult.success) {
          setPonds(pondsResult.data)
        } else {
          console.error("Error al cargar estanques:", pondsResult.error)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, getFarmById])

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="container py-5 flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="container py-5 flex-grow-1">
          <div className="alert alert-danger">
            <h4>Error</h4>
            <p>{error}</p>
            <div className="mt-3">
              <button className="btn btn-primary me-2" onClick={() => navigate("/dashboard")}>
                Volver al Dashboard
              </button>
              <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>
                Intentar de nuevo
              </button>
            </div>
            <div className="mt-3 border-top pt-3">
              <h5>Información de depuración:</h5>
              <p>
                <strong>ID de finca solicitado:</strong> {farmId}
              </p>
              <p>
                <strong>Usuario actual:</strong> {currentUser ? currentUser.id : "No autenticado"}
              </p>
              <p>
                <strong>URL actual:</strong> {window.location.href}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si el usuario no está autorizado, mostrar mensaje
  if (notAuthorized) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="container py-5 flex-grow-1">
          <div className="alert alert-danger">
            <h4>Acceso denegado</h4>
            <p>No tienes permiso para ver esta finca.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/dashboard")}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay finca, mostrar mensaje
  if (!farm) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-light">
        <Navbar />
        <div className="container py-5 flex-grow-1">
          <div className="alert alert-warning">
            <h4>Finca no encontrada</h4>
            <p>No se encontró la finca solicitada.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/dashboard")}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Resto del componente...
  return (
    <div className="farm-detail-page min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-4 flex-grow-1">
        {/* Header con información de la finca */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h1 className="fw-bold mb-0">{farm.name}</h1>
              <p className="text-muted mb-0">
                <i className="bi bi-geo-alt me-1"></i> {farm.location} | <i className="bi bi-droplet-half me-1"></i>{" "}
                {farm.method}
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to={`/edit-farm/${farm.id}`} className="btn btn-outline-primary">
              <i className="bi bi-pencil me-2"></i>
              Editar Finca
            </Link>
            <button className="btn btn-primary" onClick={() => handleOpenAddSeedingModal()}>
              <i className="bi bi-plus-circle me-2"></i>
              Registrar Siembra
            </button>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "ponds" ? "active" : ""}`}
              onClick={() => setActiveTab("ponds")}
            >
              <i className="bi bi-water me-2"></i>
              Estanques
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "inventory" ? "active" : ""}`}
              onClick={() => setActiveTab("inventory")}
            >
              <i className="bi bi-clipboard-data me-2"></i>
              Inventario
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "seedings" ? "active" : ""}`}
              onClick={() => setActiveTab("seedings")}
            >
              <i className="bi bi-calendar-plus me-2"></i>
              Siembras
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "splits" ? "active" : ""}`}
              onClick={() => setActiveTab("splits")}
            >
              <i className="bi bi-arrows-move me-2"></i>
              Desdobles
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "monitoring" ? "active" : ""}`}
              onClick={() => setActiveTab("monitoring")}
            >
              <i className="bi bi-activity me-2"></i>
              Monitoreo
            </button>
          </li>
        </ul>

        {/* Contenido de la pestaña Estanques */}
        {activeTab === "ponds" && (
          <div className="tab-content">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-water me-2 text-info"></i>
                    Estanques
                  </h5>
                  <button className="btn btn-info text-white" onClick={handleOpenAddPondModal}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar Estanque
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Barra de búsqueda para estanques */}
                {ponds.length > 0 && (
                  <SearchBar
                    onSearch={handlePondSearch}
                    placeholder="Buscar estanques..."
                    searchFields={pondSearchFields}
                  />
                )}

                {ponds.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-droplet-half text-muted display-1"></i>
                    <h4 className="mt-3">No hay estanques registrados</h4>
                    <p className="text-muted">Comienza agregando tu primer estanque</p>
                    <button className="btn btn-primary mt-2" onClick={handleOpenAddPondModal}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Agregar Estanque
                    </button>
                  </div>
                ) : filteredPonds.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-search text-muted display-1"></i>
                    <h4 className="mt-3">No se encontraron resultados</h4>
                    <p className="text-muted">Intenta con otros términos de búsqueda</p>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {filteredPonds.map((pond) => (
                      <div className="col" key={pond.id}>
                        <PondCard
                          pond={pond}
                          onEdit={handleOpenEditPondModal}
                          onAddSeeding={() => handleOpenAddSeedingModal(pond.id)}
                          onSplitPond={handleOpenSplitPondModal}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Inventario */}
        {activeTab === "inventory" && (
          <div className="tab-content">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-clipboard-data me-2 text-success"></i>
                    Inventario
                  </h5>
                  <button className="btn btn-success" onClick={() => handleOpenAddSeedingModal()}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Registrar Siembra
                  </button>
                </div>
              </div>
              <div className="card-body">
                {inventory.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-clipboard-x text-muted display-1"></i>
                    <h4 className="mt-3">No hay inventario registrado</h4>
                    <p className="text-muted">Comienza registrando una siembra</p>
                    <button className="btn btn-success mt-2" onClick={() => handleOpenAddSeedingModal()}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Registrar Siembra
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Especie</th>
                          <th>Estanque</th>
                          <th className="text-end">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item, index) => {
                          const pondName = ponds.find((p) => p.id === item.pondId)?.name || "Desconocido"
                          const speciesName = species.find((s) => s.id === item.speciesId)?.name || "Desconocida"

                          return (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-fish text-primary me-2 fs-5"></i>
                                  <div>
                                    <span className="fw-semibold">{speciesName}</span>
                                    <small className="d-block text-muted">ID: {item.speciesId}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{pondName}</td>
                              <td className="text-end fw-bold">{formatNumber(item.quantity)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="2" className="fw-bold">
                            Total
                          </td>
                          <td className="text-end fw-bold">
                            {formatNumber(inventory.reduce((sum, item) => sum + item.quantity, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Siembras */}
        {activeTab === "seedings" && (
          <div className="tab-content">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-calendar-plus me-2 text-primary"></i>
                    Registro de Siembras
                  </h5>
                  <button className="btn btn-primary" onClick={() => handleOpenAddSeedingModal()}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Registrar Siembra
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Barra de búsqueda para siembras */}
                {seedings.length > 0 && (
                  <SearchBar
                    onSearch={handleSeedingSearch}
                    placeholder="Buscar siembras..."
                    searchFields={seedingSearchFields}
                  />
                )}

                {seedings.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x text-muted display-1"></i>
                    <h4 className="mt-3">No hay siembras registradas</h4>
                    <p className="text-muted">Comienza registrando una siembra</p>
                    <button className="btn btn-primary mt-2" onClick={() => handleOpenAddSeedingModal()}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Registrar Siembra
                    </button>
                  </div>
                ) : filteredSeedings.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-search text-muted display-1"></i>
                    <h4 className="mt-3">No se encontraron resultados</h4>
                    <p className="text-muted">Intenta con otros términos de búsqueda</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Especie</th>
                          <th>Estanque</th>
                          <th className="text-end">Cantidad</th>
                          <th className="text-end">Inversión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSeedings.map((seeding) => (
                          <tr key={seeding.id}>
                            <td>{formatDate(seeding.date)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-fish text-primary me-2"></i>
                                <span>{seeding.speciesName}</span>
                              </div>
                            </td>
                            <td>{seeding.pondName}</td>
                            <td className="text-end">{formatNumber(seeding.quantity)}</td>
                            <td className="text-end">${formatNumber(seeding.investment)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="3" className="fw-bold">
                            Total
                          </td>
                          <td className="text-end fw-bold">
                            {formatNumber(
                              filteredSeedings.reduce((sum, seeding) => sum + Number.parseInt(seeding.quantity), 0),
                            )}
                          </td>
                          <td className="text-end fw-bold">
                            $
                            {formatNumber(
                              filteredSeedings.reduce((sum, seeding) => sum + Number.parseFloat(seeding.investment), 0),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Desdobles */}
        {activeTab === "splits" && (
          <div className="tab-content">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-arrows-move me-2 text-warning"></i>
                    Registro de Desdobles
                  </h5>
                </div>
              </div>
              <div className="card-body">
                {/* Barra de búsqueda para operaciones de desdoble */}
                {splitOperations.length > 0 && (
                  <SearchBar
                    onSearch={handleSplitOperationSearch}
                    placeholder="Buscar desdobles..."
                    searchFields={splitOperationSearchFields}
                  />
                )}

                {splitOperations.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-arrows-move text-muted display-1"></i>
                    <h4 className="mt-3">No hay desdobles registrados</h4>
                    <p className="text-muted">Realiza un desdoble desde la sección de estanques</p>
                  </div>
                ) : filteredSplitOperations.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-search text-muted display-1"></i>
                    <h4 className="mt-3">No se encontraron resultados</h4>
                    <p className="text-muted">Intenta con otros términos de búsqueda</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Estanque Origen</th>
                          <th>Estanque Destino</th>
                          <th>Especie</th>
                          <th className="text-end">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSplitOperations.map((operation) => (
                          <tr key={operation.id}>
                            <td>{formatDateTime(operation.timestamp)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-box-arrow-right text-danger me-2"></i>
                                <span>{operation.sourcePondName}</span>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-box-arrow-in-right text-success me-2"></i>
                                <span>{operation.targetPondName}</span>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-fish text-primary me-2"></i>
                                <span>{operation.speciesName}</span>
                              </div>
                            </td>
                            <td className="text-end">{formatNumber(operation.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="4" className="fw-bold">
                            Total
                          </td>
                          <td className="text-end fw-bold">
                            {formatNumber(
                              filteredSplitOperations.reduce((sum, operation) => sum + Number(operation.quantity), 0),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Monitoreo */}
        {activeTab === "monitoring" && (
          <div className="tab-content">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-activity me-2 text-danger"></i>
                    Monitoreo de Estanques
                  </h5>
                  <div className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Datos actualizados en tiempo real
                  </div>
                </div>
              </div>
              <div className="card-body">
                {ponds.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-droplet-half text-muted display-1"></i>
                    <h4 className="mt-3">No hay estanques para monitorear</h4>
                    <p className="text-muted">Comienza agregando tu primer estanque</p>
                    <button className="btn btn-primary mt-2" onClick={handleOpenAddPondModal}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Agregar Estanque
                    </button>
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-lg-2 g-4">
                    {ponds.map((pond) => (
                      <div className="col" key={pond.id}>
                        <MonitoringCard pond={pond} farmId={farmId} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas de la finca */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <i className="bi bi-water fs-4 text-info"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Estanques</h6>
                  <h3 className="mb-0">{ponds.length}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <i className="bi bi-fish fs-4 text-success"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Especies</h6>
                  <h3 className="mb-0">{new Set(inventory.map((item) => item.speciesId)).size}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <i className="bi bi-clipboard-data fs-4 text-primary"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Individuos</h6>
                  <h3 className="mb-0">{formatNumber(inventory.reduce((sum, item) => sum + item.quantity, 0))}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <i className="bi bi-currency-dollar fs-4 text-warning"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Inversión</h6>
                  <h3 className="mb-0">
                    ${formatNumber(seedings.reduce((sum, seeding) => sum + Number.parseFloat(seeding.investment), 0))}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal personalizado para agregar estanque */}
      {showAddPondModal && (
        <div
          className="custom-modal-overlay"
          onClick={handleCloseAddPondModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="modal-title">
                <i className="bi bi-plus-circle me-2 text-primary"></i>
                Agregar Nuevo Estanque
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAddPondModal}
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "1rem" }}>
              <form onSubmit={handleAddPond}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Nombre del Estanque
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                      id="name"
                      name="name"
                      value={pondFormData.name}
                      onChange={handlePondFormChange}
                      placeholder="Ej: Estanque 1"
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="type" className="form-label fw-semibold">
                      Tipo de Estanque
                    </label>
                    <select
                      className={`form-select ${formErrors.type ? "is-invalid" : ""}`}
                      id="type"
                      name="type"
                      value={pondFormData.type}
                      onChange={handlePondFormChange}
                    >
                      <option value="">Selecciona un tipo</option>
                      {pondTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {formErrors.type && <div className="invalid-feedback">{formErrors.type}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="length" className="form-label fw-semibold">
                      Longitud (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.length ? "is-invalid" : ""}`}
                      id="length"
                      name="length"
                      value={pondFormData.length}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 10.5"
                    />
                    {formErrors.length && <div className="invalid-feedback">{formErrors.length}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="width" className="form-label fw-semibold">
                      Ancho (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.width ? "is-invalid" : ""}`}
                      id="width"
                      name="width"
                      value={pondFormData.width}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 5.2"
                    />
                    {formErrors.width && <div className="invalid-feedback">{formErrors.width}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="depth" className="form-label fw-semibold">
                      Profundidad (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.depth ? "is-invalid" : ""}`}
                      id="depth"
                      name="depth"
                      value={pondFormData.depth}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 2.0"
                    />
                    {formErrors.depth && <div className="invalid-feedback">{formErrors.depth}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="volume" className="form-label fw-semibold">
                      Volumen (m³)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="volume"
                      name="volume"
                      value={pondFormData.volume}
                      readOnly
                      disabled
                    />
                    <div className="form-text">Calculado automáticamente</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="temperature" className="form-label fw-semibold">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className={`form-control ${formErrors.temperature ? "is-invalid" : ""}`}
                      id="temperature"
                      name="temperature"
                      value={pondFormData.temperature}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 25.5"
                    />
                    {formErrors.temperature && <div className="invalid-feedback">{formErrors.temperature}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="status" className="form-label fw-semibold">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={pondFormData.status}
                      onChange={handlePondFormChange}
                    >
                      {pondStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseAddPondModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Agregar Estanque
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal personalizado para editar estanque */}
      {showEditPondModal && (
        <div
          className="custom-modal-overlay"
          onClick={handleCloseEditPondModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="modal-title">
                <i className="bi bi-pencil me-2 text-primary"></i>
                Editar Estanque
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseEditPondModal}
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "1rem" }}>
              <form onSubmit={handleUpdatePond}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="edit-name" className="form-label fw-semibold">
                      Nombre del Estanque
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                      id="edit-name"
                      name="name"
                      value={pondFormData.name}
                      onChange={handlePondFormChange}
                      placeholder="Ej: Estanque 1"
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="edit-type" className="form-label fw-semibold">
                      Tipo de Estanque
                    </label>
                    <select
                      className={`form-select ${formErrors.type ? "is-invalid" : ""}`}
                      id="edit-type"
                      name="type"
                      value={pondFormData.type}
                      onChange={handlePondFormChange}
                    >
                      <option value="">Selecciona un tipo</option>
                      {pondTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {formErrors.type && <div className="invalid-feedback">{formErrors.type}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="edit-length" className="form-label fw-semibold">
                      Longitud (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.length ? "is-invalid" : ""}`}
                      id="edit-length"
                      name="length"
                      value={pondFormData.length}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 10.5"
                    />
                    {formErrors.length && <div className="invalid-feedback">{formErrors.length}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="edit-width" className="form-label fw-semibold">
                      Ancho (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.width ? "is-invalid" : ""}`}
                      id="edit-width"
                      name="width"
                      value={pondFormData.width}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 5.2"
                    />
                    {formErrors.width && <div className="invalid-feedback">{formErrors.width}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="edit-depth" className="form-label fw-semibold">
                      Profundidad (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.depth ? "is-invalid" : ""}`}
                      id="edit-depth"
                      name="depth"
                      value={pondFormData.depth}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 2.0"
                    />
                    {formErrors.depth && <div className="invalid-feedback">{formErrors.depth}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="edit-volume" className="form-label fw-semibold">
                      Volumen (m³)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="edit-volume"
                      name="volume"
                      value={pondFormData.volume}
                      readOnly
                      disabled
                    />
                    <div className="form-text">Calculado automáticamente</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="edit-temperature" className="form-label fw-semibold">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className={`form-control ${formErrors.temperature ? "is-invalid" : ""}`}
                      id="edit-temperature"
                      name="temperature"
                      value={pondFormData.temperature}
                      onChange={handlePondFormChange}
                      placeholder="Ej: 25.5"
                    />
                    {formErrors.temperature && <div className="invalid-feedback">{formErrors.temperature}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="edit-status" className="form-label fw-semibold">
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="edit-status"
                      name="status"
                      value={pondFormData.status}
                      onChange={handlePondFormChange}
                    >
                      {pondStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseEditPondModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal personalizado para registrar siembra */}
      {showAddSeedingModal && (
        <div
          className="custom-modal-overlay"
          onClick={handleCloseAddSeedingModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <div className="modal-header" style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="modal-title">
                <i className="bi bi-calendar-plus me-2 text-primary"></i>
                Registrar Nueva Siembra
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAddSeedingModal}
                style={{ cursor: "pointer" }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "1rem" }}>
              <form onSubmit={handleAddSeeding}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="speciesId" className="form-label fw-semibold">
                      Especie
                    </label>
                    <select
                      className={`form-select ${formErrors.speciesId ? "is-invalid" : ""}`}
                      id="speciesId"
                      name="speciesId"
                      value={seedingFormData.speciesId}
                      onChange={handleSeedingFormChange}
                    >
                      <option value="">Selecciona una especie</option>
                      {species.map((species) => (
                        <option key={species.id} value={species.id}>
                          {species.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.speciesId && <div className="invalid-feedback">{formErrors.speciesId}</div>}
                    {species.length === 0 && (
                      <div className="form-text text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        No hay especies registradas.{" "}
                        <Link to="/species" className="text-decoration-none">
                          Registrar especies
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="pondId" className="form-label fw-semibold">
                      Estanque
                    </label>
                    <select
                      className={`form-select ${formErrors.pondId ? "is-invalid" : ""}`}
                      id="pondId"
                      name="pondId"
                      value={seedingFormData.pondId}
                      onChange={handleSeedingFormChange}
                    >
                      <option value="">Selecciona un estanque</option>
                      {ponds.map((pond) => (
                        <option key={pond.id} value={pond.id}>
                          {pond.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.pondId && <div className="invalid-feedback">{formErrors.pondId}</div>}
                    {ponds.length === 0 && (
                      <div className="form-text text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        No hay estanques registrados. Registra un estanque primero.
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="quantity" className="form-label fw-semibold">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      className={`form-control ${formErrors.quantity ? "is-invalid" : ""}`}
                      id="quantity"
                      name="quantity"
                      value={seedingFormData.quantity}
                      onChange={handleSeedingFormChange}
                    <input
                      type="number"
                      className={`form-control ${formErrors.quantity ? "is-invalid" : ""}`}
                      id="quantity"
                      name="quantity"
                      value={seedingFormData.quantity}
                      onChange={handleSeedingFormChange}
                      placeholder="Ej: 1000"
                    />
                    {formErrors.quantity && <div className="invalid-feedback">{formErrors.quantity}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="date" className="form-label fw-semibold">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.date ? "is-invalid" : ""}`}
                      id="date"
                      name="date"
                      value={seedingFormData.date}
                      onChange={handleSeedingFormChange}
                    />
                    {formErrors.date && <div className="invalid-feedback">{formErrors.date}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="investment" className="form-label fw-semibold">
                      Inversión ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${formErrors.investment ? "is-invalid" : ""}`}
                      id="investment"
                      name="investment"
                      value={seedingFormData.investment}
                      onChange={handleSeedingFormChange}
                      placeholder="Ej: 5000.00"
                    />
                    {formErrors.investment && <div className="invalid-feedback">{formErrors.investment}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseAddSeedingModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Registrar Siembra
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para realizar desdoble */}
      <PondSplitModal
        show={showSplitPondModal}
        onClose={handleCloseSplitPondModal}
        sourcePond={currentPond}
        sourceInventory={currentPondInventory}
        farmId={farmId}
      />
    </div>
  )
}
