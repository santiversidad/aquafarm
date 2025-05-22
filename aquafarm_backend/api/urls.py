from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet)
router.register(r'tipos-usuario', views.TipoUsuarioViewSet)
router.register(r'metodos-acuicolas', views.MetodoAcuicolaViewSet)
router.register(r'fincas', views.FincaViewSet)
router.register(r'tipos-estanque', views.TipoEstanqueViewSet)
router.register(r'estanques', views.EstanqueViewSet)
router.register(r'especies', views.EspecieViewSet)
router.register(r'inventarios', views.InventarioViewSet)
router.register(r'siembras', views.SiembraViewSet)
router.register(r'historiales-siembra', views.HistorialSiembraViewSet)
router.register(r'desdobles', views.DesdobleViewSet)
router.register(r'bitacoras-desdoble', views.BitacoraDesdobleViewSet)
router.register(r'historiales-estanque', views.HistorialEstanquesViewSet)
router.register(r'sensores', views.SensorViewSet)
router.register(r'monitoreos', views.MonitoreoViewSet)
router.register(r'alertas', views.AlertaViewSet)
router.register(r'users', views.UserViewSet)

# Nuevos endpoints para los modelos adicionales
router.register(r'informacion-nutricional', views.InformacionNutricionalViewSet)
router.register(r'vitaminas', views.VitaminaViewSet)
router.register(r'minerales', views.MineralViewSet)
router.register(r'tasas-crecimiento', views.TasaCrecimientoViewSet)
router.register(r'tasas-reproduccion', views.TasaReproduccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Rutas personalizadas para autenticación
    path('token/', views.login_usuario, name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('usuarios/register/', views.registro_usuario, name='registro_usuario'),
]
