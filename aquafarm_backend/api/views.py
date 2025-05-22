from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, permission_classes, api_view, authentication_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    TipoUsuario, MetodoAcuicola, Finca, Usuario, TipoEstanque, 
    Estanque, Especie, Inventario, Siembra, HistorialSiembra, 
    Desdoble, BitacoraDesdoble, HistorialEstanques, Sensor, 
    Monitoreo, Alerta, InformacionNutricional, Vitamina, Mineral,
    TasaCrecimiento, TasaReproduccion
)
from .serializers import (
    UserSerializer, TipoUsuarioSerializer, MetodoAcuicolaSerializer, 
    FincaSerializer, UsuarioSerializer, TipoEstanqueSerializer, 
    EstanqueSerializer, EspecieSerializer, EspecieCreateUpdateSerializer,
    InventarioSerializer, SiembraSerializer, HistorialSiembraSerializer, 
    DesdobleSerializer, BitacoraDesdobleSerializer, HistorialEstanquesSerializer, 
    SensorSerializer, MonitoreoSerializer, AlertaSerializer,
    RegistroUsuarioSerializer, InformacionNutricionalSerializer,
    VitaminaSerializer, MineralSerializer, TasaCrecimientoSerializer,
    TasaReproduccionSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import transaction
import json
import logging

# Configurar logger
logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])  # No authentication required
def registro_usuario(request):
    """
    Vista para registrar un nuevo usuario.
    No requiere autenticación.
    """
    logger.info("Recibida solicitud de registro: %s", request.data)
    
    with transaction.atomic():
        try:
            # Obtener datos del request
            nombre = request.data.get('nombre', '')
            apellido = request.data.get('apellido', '')
            correo = request.data.get('correo')
            contrasena = request.data.get('contrasena')
            
            # Usar el correo como nombre de usuario
            username = correo
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=username).exists() or User.objects.filter(email=correo).exists():
                return Response(
                    {"error": "Ya existe un usuario con este correo electrónico"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear usuario de Django
            user = User.objects.create_user(
                username=username,
                email=correo,
                password=contrasena,
                first_name=nombre,
                last_name=apellido
            )
            
            # Obtener o crear tipo de usuario (por defecto 1)
            tipo_usuario_id = request.data.get('idTipoUsuario', 1)
            try:
                tipo_usuario = TipoUsuario.objects.get(idTipoUsuario=tipo_usuario_id)
            except TipoUsuario.DoesNotExist:
                # Si no existe el tipo de usuario, crear uno por defecto
                tipo_usuario = TipoUsuario.objects.create(
                    nombre="Usuario Estándar",
                    descripcion="Usuario con permisos básicos"
                )
            
            # Crear perfil de usuario
            usuario = Usuario.objects.create(
                user=user,
                nombre=nombre,
                apellido=apellido,
                correo=correo,
                contrasena=contrasena,  # Guardar la contraseña en texto plano para el modelo Usuario
                idTipoUsuario=tipo_usuario
            )
            
            # Generar tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usuario': UsuarioSerializer(usuario).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error("Error en registro: %s", str(e))
            return Response(
                {"error": f"Error al registrar usuario: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])  # No authentication required
def login_usuario(request):
    """
    Vista para iniciar sesión.
    No requiere autenticación.
    """
    logger.info("Recibida solicitud de login: %s", request.data)
    
    try:
        # Obtener credenciales
        username = request.data.get('username')
        password = request.data.get('password')
        
        logger.info("Intentando autenticar usuario: %s", username)
        
        if not username or not password:
            return Response(
                {"error": "Se requieren nombre de usuario y contraseña"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Intentar autenticar por username
        user = authenticate(username=username, password=password)
        
        # Si no funciona, intentar autenticar por email
        if user is None:
            # Buscar usuario por email
            try:
                user_by_email = User.objects.get(email=username)
                # Intentar autenticar con el username real
                user = authenticate(username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is None:
            logger.warning("Autenticación fallida para usuario: %s", username)
            
            # Verificar si el usuario existe
            try:
                user_obj = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()
                if user_obj:
                    logger.warning("El usuario %s existe, pero la contraseña es incorrecta", username)
                else:
                    logger.warning("El usuario %s no existe", username)
            except Exception as e:
                logger.error("Error al verificar usuario: %s", str(e))
            
            return Response(
                {"error": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        logger.info("Usuario autenticado correctamente: %s", user.username)
        
        try:
            # Obtener perfil de usuario
            usuario = Usuario.objects.get(user=user)
            
            # Generar tokens
            refresh = RefreshToken.for_user(user)
            
            # Preparar respuesta
            response_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usuario': UsuarioSerializer(usuario).data
            }
            
            logger.info("Respuesta de login preparada")
            
            return Response(response_data)
        except Usuario.DoesNotExist:
            logger.warning("Perfil de usuario no encontrado para: %s", user.username)
            
            # Crear perfil de usuario si no existe
            try:
                # Obtener tipo de usuario por defecto
                tipo_usuario = TipoUsuario.objects.first()
                if not tipo_usuario:
                    tipo_usuario = TipoUsuario.objects.create(
                        nombre="Usuario Estándar",
                        descripcion="Usuario con permisos básicos"
                    )
                
                # Crear perfil de usuario
                usuario = Usuario.objects.create(
                    user=user,
                    nombre=user.first_name,
                    apellido=user.last_name,
                    correo=user.email or user.username,
                    contrasena="",  # No tenemos acceso a la contraseña en texto plano
                    idTipoUsuario=tipo_usuario
                )
                
                # Generar tokens
                refresh = RefreshToken.for_user(user)
                
                # Preparar respuesta
                response_data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'usuario': UsuarioSerializer(usuario).data
                }
                
                logger.info("Perfil de usuario creado y respuesta preparada")
                
                return Response(response_data)
            except Exception as e:
                logger.error("Error al crear perfil de usuario: %s", str(e))
                return Response(
                    {"error": f"Error al crear perfil de usuario: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    except Exception as e:
        logger.error("Error en login: %s", str(e))
        return Response(
            {"error": f"Error al iniciar sesión: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class TipoUsuarioViewSet(viewsets.ModelViewSet):
    queryset = TipoUsuario.objects.all().order_by('idTipoUsuario')
    serializer_class = TipoUsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

class MetodoAcuicolaViewSet(viewsets.ModelViewSet):
    queryset = MetodoAcuicola.objects.all().order_by('idMetodoAcuicola')
    serializer_class = MetodoAcuicolaSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoEstanqueViewSet(viewsets.ModelViewSet):
    queryset = TipoEstanque.objects.all().order_by('idTipoEstanque')
    serializer_class = TipoEstanqueSerializer
    permission_classes = [permissions.IsAuthenticated]

class FincaViewSet(viewsets.ModelViewSet):
    queryset = Finca.objects.all().order_by('idFinca')
    serializer_class = FincaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Imprimir los datos recibidos para depuración
        logger.info("Datos recibidos para crear finca: %s", serializer.validated_data)
        
        try:
            # Asignar automáticamente el usuario actual como propietario de la finca
            usuario = Usuario.objects.get(user=self.request.user)
            logger.info("Usuario encontrado: %s - %s", usuario.idUsuario, usuario.nombre)
            serializer.save(idUsuario=usuario)
        except Usuario.DoesNotExist:
            logger.warning("No se encontró perfil para el usuario: %s", self.request.user.username)
            # Si el usuario no tiene perfil, crear uno
            tipo_usuario = TipoUsuario.objects.first()
            if not tipo_usuario:
                tipo_usuario = TipoUsuario.objects.create(
                    nombre="Usuario Estándar",
                    descripcion="Usuario con permisos básicos"
                )
            
            usuario = Usuario.objects.create(
                user=self.request.user,
                nombre=self.request.user.first_name or self.request.user.username,
                apellido=self.request.user.last_name or "",
                correo=self.request.user.email or self.request.user.username,
                contrasena="",
                idTipoUsuario=tipo_usuario
            )
            logger.info("Perfil de usuario creado: %s - %s", usuario.idUsuario, usuario.nombre)
            serializer.save(idUsuario=usuario)
        except Exception as e:
            logger.error("Error al crear finca: %s", str(e))
            raise

    def create(self, request, *args, **kwargs):
        logger.info("Datos recibidos en create: %s", request.data)
        try:
            # Ensure idMetodoAcuicola is an integer
            data = request.data.copy()
            if 'idMetodoAcuicola' in data:
                try:
                    data['idMetodoAcuicola'] = int(data['idMetodoAcuicola'])
                except (ValueError, TypeError):
                    # If conversion fails, use a default value
                    data['idMetodoAcuicola'] = 1
                    logger.warning("Conversión de idMetodoAcuicola fallida, usando valor por defecto: 1")
                
            # Replace the request data with our modified version
            request._full_data = data
        
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error("Error en create: %s", str(e))
            return Response(
                {"error": f"Error al crear finca: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def mis_fincas(self, request):
        """Obtener todas las fincas del usuario actual"""
        try:
            usuario = Usuario.objects.get(user=request.user)
            fincas = Finca.objects.filter(idUsuario=usuario).order_by('idFinca')
            serializer = self.get_serializer(fincas, many=True)
            return Response(serializer.data)
        except Usuario.DoesNotExist:
            return Response({"error": "Perfil de usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def by_usuario(self, request):
        """Obtener todas las fincas de un usuario específico"""
        usuario_id = request.query_params.get('usuario_id')
        if not usuario_id:
            return Response({"error": "Se requiere el ID del usuario"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            fincas = Finca.objects.filter(idUsuario=usuario_id).order_by('idFinca')
            serializer = self.get_serializer(fincas, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener fincas: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('idUsuario')
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener el perfil del usuario actual"""
        try:
            usuario = Usuario.objects.get(user=request.user)
            serializer = self.get_serializer(usuario)
            return Response(serializer.data)
        except Usuario.DoesNotExist:
            return Response({"error": "Perfil de usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

class EstanqueViewSet(viewsets.ModelViewSet):
    queryset = Estanque.objects.all().order_by('idEstanque')
    serializer_class = EstanqueSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_finca(self, request):
        """Obtener todos los estanques de una finca específica"""
        finca_id = request.query_params.get('finca_id')
        if not finca_id:
            return Response({"error": "Se requiere el ID de la finca"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            estanques = Estanque.objects.filter(idFinca=finca_id).order_by('idEstanque')
            serializer = self.get_serializer(estanques, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener estanques: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vistas para los nuevos modelos
class InformacionNutricionalViewSet(viewsets.ModelViewSet):
    queryset = InformacionNutricional.objects.all()
    serializer_class = InformacionNutricionalSerializer
    permission_classes = [permissions.IsAuthenticated]

class VitaminaViewSet(viewsets.ModelViewSet):
    queryset = Vitamina.objects.all()
    serializer_class = VitaminaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_info_nutricional(self, request):
        """Obtener todas las vitaminas de una información nutricional específica"""
        info_id = request.query_params.get('info_id')
        if not info_id:
            return Response({"error": "Se requiere el ID de la información nutricional"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            vitaminas = Vitamina.objects.filter(informacion_nutricional_id=info_id)
            serializer = self.get_serializer(vitaminas, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener vitaminas: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MineralViewSet(viewsets.ModelViewSet):
    queryset = Mineral.objects.all()
    serializer_class = MineralSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_info_nutricional(self, request):
        """Obtener todos los minerales de una información nutricional específica"""
        info_id = request.query_params.get('info_id')
        if not info_id:
            return Response({"error": "Se requiere el ID de la información nutricional"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            minerales = Mineral.objects.filter(informacion_nutricional_id=info_id)
            serializer = self.get_serializer(minerales, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener minerales: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TasaCrecimientoViewSet(viewsets.ModelViewSet):
    queryset = TasaCrecimiento.objects.all()
    serializer_class = TasaCrecimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TasaReproduccionViewSet(viewsets.ModelViewSet):
    queryset = TasaReproduccion.objects.all()
    serializer_class = TasaReproduccionSerializer
    permission_classes = [permissions.IsAuthenticated]

class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all().order_by('idEspecie')
    serializer_class = EspecieSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EspecieCreateUpdateSerializer
        return EspecieSerializer
    
    @action(detail=True, methods=['get'])
    def info_completa(self, request, pk=None):
        """Obtener información completa de una especie, incluyendo relaciones"""
        try:
            especie = self.get_object()
            serializer = self.get_serializer(especie)
            
            # Obtener vitaminas y minerales si existe información nutricional
            vitaminas = []
            minerales = []
            if especie.informacion_nutricional:
                vitaminas = VitaminaSerializer(especie.informacion_nutricional.vitaminas.all(), many=True).data
                minerales = MineralSerializer(especie.informacion_nutricional.minerales.all(), many=True).data
            
            # Combinar datos
            data = serializer.data
            data['vitaminas_detalle'] = vitaminas
            data['minerales_detalle'] = minerales
            
            return Response(data)
        except Exception as e:
            return Response({"error": f"Error al obtener información completa: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Crear una especie con toda su información relacionada"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error("Error al crear especie: %s", str(e))
            return Response({"error": f"Error al crear especie: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Actualizar una especie con toda su información relacionada"""
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error("Error al actualizar especie: %s", str(e))
            return Response({"error": f"Error al actualizar especie: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """Eliminar una especie y toda su información relacionada"""
        try:
            especie = self.get_object()
            
            # Eliminar información relacionada
            if especie.informacion_nutricional:
                # Eliminar vitaminas y minerales
                especie.informacion_nutricional.vitaminas.all().delete()
                especie.informacion_nutricional.minerales.all().delete()
                especie.informacion_nutricional.delete()
            
            if especie.tasa_crecimiento:
                especie.tasa_crecimiento.delete()
            
            if especie.tasa_reproduccion:
                especie.tasa_reproduccion.delete()
            
            # Eliminar la especie
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            logger.error("Error al eliminar especie: %s", str(e))
            return Response({"error": f"Error al eliminar especie: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# Vista actualizada para Inventario
class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all().order_by('idInventario')
    serializer_class = InventarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_especie(self, request):
        """Obtener todo el inventario de una especie específica"""
        especie_id = request.query_params.get('especie_id')
        if not especie_id:
            return Response({"error": "Se requiere el ID de la especie"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            inventario = Inventario.objects.filter(idEspecie=especie_id).order_by('idInventario')
            serializer = self.get_serializer(inventario, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener inventario: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_finca(self, request):
        """Obtener todo el inventario de una finca específica"""
        finca_id = request.query_params.get('finca_id')
        if not finca_id:
            return Response({"error": "Se requiere el ID de la finca"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            inventario = Inventario.objects.filter(idFinca=finca_id).order_by('idInventario')
            serializer = self.get_serializer(inventario, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener inventario: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def agregar_cantidad(self, request, pk=None):
        """Agregar cantidad al inventario"""
        try:
            inventario = self.get_object()
            cantidad = request.data.get('cantidad')
            
            if not cantidad:
                return Response({"error": "Se requiere la cantidad a agregar"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                cantidad = int(cantidad)
            except (ValueError, TypeError):
                return Response({"error": "La cantidad debe ser un número entero"}, status=status.HTTP_400_BAD_REQUEST)
            
            inventario.agregar_cantidad(cantidad)
            serializer = self.get_serializer(inventario)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al agregar cantidad: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def reducir_cantidad(self, request, pk=None):
        """Reducir cantidad del inventario"""
        try:
            inventario = self.get_object()
            cantidad = request.data.get('cantidad')
            
            if not cantidad:
                return Response({"error": "Se requiere la cantidad a reducir"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                cantidad = int(cantidad)
            except (ValueError, TypeError):
                return Response({"error": "La cantidad debe ser un número entero"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                inventario.reducir_cantidad(cantidad)
                serializer = self.get_serializer(inventario)
                return Response(serializer.data)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error al reducir cantidad: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SiembraViewSet(viewsets.ModelViewSet):
    queryset = Siembra.objects.all().order_by('idSiembra')
    serializer_class = SiembraSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_estanque(self, request):
        """Obtener todas las siembras de un estanque específico"""
        estanque_id = request.query_params.get('estanque_id')
        if not estanque_id:
            return Response({"error": "Se requiere el ID del estanque"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            siembras = Siembra.objects.filter(idEstanque=estanque_id).order_by('idSiembra')
            serializer = self.get_serializer(siembras, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener siembras: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_finca(self, request):
        """Obtener todas las siembras de una finca específica"""
        finca_id = request.query_params.get('finca_id')
        if not finca_id:
            return Response({"error": "Se requiere el ID de la finca"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Obtener todos los estanques de la finca
            estanques = Estanque.objects.filter(idFinca=finca_id)
            
            # Obtener todas las siembras de esos estanques
            siembras = Siembra.objects.filter(idEstanque__in=estanques).order_by('idSiembra')
            serializer = self.get_serializer(siembras, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener siembras: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vista actualizada para HistorialSiembra
class HistorialSiembraViewSet(viewsets.ModelViewSet):
    queryset = HistorialSiembra.objects.all().order_by('idHistorialSiembra')
    serializer_class = HistorialSiembraSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_siembra(self, request):
        """Obtener el historial de una siembra específica"""
        siembra_id = request.query_params.get('siembra_id')
        if not siembra_id:
            return Response({"error": "Se requiere el ID de la siembra"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            historial = HistorialSiembra.objects.filter(idSiembra=siembra_id).order_by('idHistorialSiembra')
            serializer = self.get_serializer(historial, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener historial: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_estado(self, request):
        """Obtener historiales por estado"""
        estado = request.query_params.get('estado')
        if not estado:
            return Response({"error": "Se requiere el estado"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            historial = HistorialSiembra.objects.filter(estado=estado).order_by('idHistorialSiembra')
            serializer = self.get_serializer(historial, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener historial: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def comercializar(self, request, pk=None):
        """Comercializar una siembra"""
        try:
            historial = self.get_object()
            
            # Verificar que el historial esté en estado PENDIENTE
            if historial.estado != 'PENDIENTE':
                return Response(
                    {"error": f"No se puede comercializar un historial en estado {historial.estado}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener datos de comercialización
            fecha_comercializacion = request.data.get('fechaComercializacion')
            kilos_vendidos = request.data.get('kilosVendidos')
            precio_venta = request.data.get('precioVenta')
            kilo_por_pez = request.data.get('kiloPorPez')
            total_kilos = request.data.get('totalKilos')
            
            # Validar datos requeridos
            if not fecha_comercializacion:
                return Response({"error": "Se requiere la fecha de comercialización"}, status=status.HTTP_400_BAD_REQUEST)
            if not kilos_vendidos:
                return Response({"error": "Se requieren los kilos vendidos"}, status=status.HTTP_400_BAD_REQUEST)
            if not precio_venta:
                return Response({"error": "Se requiere el precio de venta"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Actualizar historial
            historial.fechaComercializacion = fecha_comercializacion
            historial.kilosVendidos = float(kilos_vendidos)
            historial.precioVenta = float(precio_venta)
            
            if kilo_por_pez:
                historial.kiloPorPez = float(kilo_por_pez)
            
            if total_kilos:
                historial.totalKilos = float(total_kilos)
            
            # Cambiar estado a COMERCIALIZADO
            historial.estado = 'COMERCIALIZADO'
            historial.save()
            
            serializer = self.get_serializer(historial)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al comercializar: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancelar un historial de siembra"""
        try:
            historial = self.get_object()
            
            # Verificar que el historial esté en estado PENDIENTE
            if historial.estado != 'PENDIENTE':
                return Response(
                    {"error": f"No se puede cancelar un historial en estado {historial.estado}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cambiar estado a CANCELADO
            historial.estado = 'CANCELADO'
            historial.save()
            
            serializer = self.get_serializer(historial)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al cancelar: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DesdobleViewSet(viewsets.ModelViewSet):
    queryset = Desdoble.objects.all().order_by('idDesdoble')
    serializer_class = DesdobleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_finca(self, request):
        """Obtener todos los desdobles de una finca específica"""
        finca_id = request.query_params.get('finca_id')
        if not finca_id:
            return Response({"error": "Se requiere el ID de la finca"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Obtener todos los estanques de la finca
            estanques = Estanque.objects.filter(idFinca=finca_id)
            
            # Obtener todos los desdobles donde el estanque origen o destino pertenece a la finca
            desdobles = Desdoble.objects.filter(idEstanqueOrigen__in=estanques) | Desdoble.objects.filter(idEstanqueDestino__in=estanques)
            desdobles = desdobles.order_by('idDesdoble')
            serializer = self.get_serializer(desdobles, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener desdobles: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_estanque_origen(self, request):
        """Obtener todos los desdobles donde un estanque específico es el origen"""
        estanque_id = request.query_params.get('estanque_id')
        if not estanque_id:
            return Response({"error": "Se requiere el ID del estanque"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            desdobles = Desdoble.objects.filter(idEstanqueOrigen=estanque_id).order_by('idDesdoble')
            serializer = self.get_serializer(desdobles, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener desdobles: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_estanque_destino(self, request):
        """Obtener todos los desdobles donde un estanque específico es el destino"""
        estanque_id = request.query_params.get('estanque_id')
        if not estanque_id:
            return Response({"error": "Se requiere el ID del estanque"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            desdobles = Desdoble.objects.filter(idEstanqueDestino=estanque_id).order_by('idDesdoble')
            serializer = self.get_serializer(desdobles, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener desdobles: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vista actualizada para BitacoraDesdoble
class BitacoraDesdobleViewSet(viewsets.ModelViewSet):
    queryset = BitacoraDesdoble.objects.all().order_by('idBitacoraDesdoble')
    serializer_class = BitacoraDesdobleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_desdoble(self, request):
        """Obtener todas las bitácoras de un desdoble específico"""
        desdoble_id = request.query_params.get('desdoble_id')
        if not desdoble_id:
            return Response({"error": "Se requiere el ID del desdoble"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            bitacoras = BitacoraDesdoble.objects.filter(idDesdoble=desdoble_id).order_by('idBitacoraDesdoble')
            serializer = self.get_serializer(bitacoras, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener bitácoras: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HistorialEstanquesViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstanques.objects.all().order_by('idHistorialEstanques')
    serializer_class = HistorialEstanquesSerializer
    permission_classes = [permissions.IsAuthenticated]

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all().order_by('idSensor')
    serializer_class = SensorSerializer
    permission_classes = [permissions.IsAuthenticated]

class MonitoreoViewSet(viewsets.ModelViewSet):
    queryset = Monitoreo.objects.all().order_by('idMonitoreo')
    serializer_class = MonitoreoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_estanque(self, request):
        """Obtener todos los monitoreos de un estanque específico"""
        estanque_id = request.query_params.get('estanque_id')
        latest = request.query_params.get('latest', 'false').lower() == 'true'
        
        if not estanque_id:
            return Response({"error": "Se requiere el ID del estanque"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if latest:
                # Obtener el último monitoreo para cada sensor del estanque
                from django.db.models import Max
                
                # Obtener los IDs de los sensores que tienen monitoreos para este estanque
                sensor_ids = Monitoreo.objects.filter(idEstanque=estanque_id).values('idSensor').distinct()
                
                latest_monitoreos = []
                for sensor_id_dict in sensor_ids:
                    sensor_id = sensor_id_dict['idSensor']
                    # Obtener el último monitoreo para este sensor y estanque
                    latest_monitoreo = Monitoreo.objects.filter(
                        idEstanque=estanque_id,
                        idSensor=sensor_id
                    ).order_by('-fecha').first()
                    
                    if latest_monitoreo:
                        latest_monitoreos.append(latest_monitoreo)
                
                serializer = self.get_serializer(latest_monitoreos, many=True)
            else:
                # Obtener todos los monitoreos del estanque
                monitoreos = Monitoreo.objects.filter(idEstanque=estanque_id).order_by('-fecha')
                serializer = self.get_serializer(monitoreos, many=True)
            
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener monitoreos: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vista actualizada para Alerta
class AlertaViewSet(viewsets.ModelViewSet):
    queryset = Alerta.objects.all().order_by('-fechaCreacion')
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_estanque(self, request):
        """Obtener todas las alertas de un estanque específico"""
        estanque_id = request.query_params.get('estanque_id')
        if not estanque_id:
            return Response({"error": "Se requiere el ID del estanque"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Obtener monitoreos del estanque
            monitoreos = Monitoreo.objects.filter(idEstanque=estanque_id)
            
            # Obtener alertas de esos monitoreos
            alertas = Alerta.objects.filter(idMonitoreo__in=monitoreos).order_by('-fechaCreacion')
            serializer = self.get_serializer(alertas, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener alertas: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_estado(self, request):
        """Obtener alertas por estado"""
        estado = request.query_params.get('estado')
        if not estado:
            return Response({"error": "Se requiere el estado"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            alertas = Alerta.objects.filter(estado=estado).order_by('-fechaCreacion')
            serializer = self.get_serializer(alertas, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al obtener alertas: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def marcar_resuelta(self, request, pk=None):
        """Marcar una alerta como resuelta"""
        try:
            alerta = self.get_object()
            alerta.marcar_como_resuelta()
            serializer = self.get_serializer(alerta)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al marcar como resuelta: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def marcar_ignorada(self, request, pk=None):
        """Marcar una alerta como ignorada"""
        try:
            alerta = self.get_object()
            alerta.marcar_como_ignorada()
            serializer = self.get_serializer(alerta)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": f"Error al marcar como ignorada: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
