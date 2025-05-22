from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import (
    TipoUsuario, MetodoAcuicola, Finca, Usuario, TipoEstanque, 
    Estanque, Especie, Inventario, Siembra, HistorialSiembra, 
    Desdoble, BitacoraDesdoble, HistorialEstanques, Sensor, 
    Monitoreo, Alerta, InformacionNutricional, Vitamina, Mineral,
    TasaCrecimiento, TasaReproduccion
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class TipoUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoUsuario
        fields = '__all__'

class MetodoAcuicolaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoAcuicola
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    tipo_usuario = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['idUsuario', 'user', 'nombre', 'apellido', 'correo', 'idTipoUsuario', 'tipo_usuario']
        read_only_fields = ['idUsuario']
        extra_kwargs = {
            'contrasena': {'write_only': True}
        }
    
    def get_tipo_usuario(self, obj):
        return obj.idTipoUsuario.nombre if obj.idTipoUsuario else None

class FincaSerializer(serializers.ModelSerializer):
    metodo_acuicola = serializers.SerializerMethodField()
    usuario = serializers.SerializerMethodField()
    
    class Meta:
        model = Finca
        fields = ['idFinca', 'nombre', 'idMetodoAcuicola', 'metodo_acuicola', 'ubicacion', 'idUsuario', 'usuario']
        read_only_fields = ['idUsuario']  # Marcar idUsuario como solo lectura
    
    def get_metodo_acuicola(self, obj):
        return obj.idMetodoAcuicola.nombre if obj.idMetodoAcuicola else None
    
    def get_usuario(self, obj):
        return f"{obj.idUsuario.nombre} {obj.idUsuario.apellido}" if obj.idUsuario else None
    
    def validate_idMetodoAcuicola(self, value):
        """
        Validar que el método acuícola sea un número entero.
        """
        if isinstance(value, int):
            try:
                return MetodoAcuicola.objects.get(idMetodoAcuicola=value)
            except MetodoAcuicola.DoesNotExist:
                raise serializers.ValidationError(f"El método acuícola con ID {value} no existe.")
        return value

class TipoEstanqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEstanque
        fields = '__all__'

class EstanqueSerializer(serializers.ModelSerializer):
    finca = serializers.SerializerMethodField()
    tipo_estanque = serializers.SerializerMethodField()
    
    class Meta:
        model = Estanque
        fields = ['idEstanque', 'idFinca', 'finca', 'litros', 'capacidad', 'idTipoEstanque', 'tipo_estanque']
    
    def get_finca(self, obj):
        return obj.idFinca.nombre if obj.idFinca else None
    
    def get_tipo_estanque(self, obj):
        return obj.idTipoEstanque.nombre if obj.idTipoEstanque else None

# Nuevos serializadores para los modelos de información nutricional
class VitaminaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vitamina
        fields = ['idVitamina', 'nombre', 'cantidad']

class MineralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mineral
        fields = ['idMineral', 'nombre', 'cantidad']

class InformacionNutricionalSerializer(serializers.ModelSerializer):
    vitaminas = VitaminaSerializer(many=True, read_only=True)
    minerales = MineralSerializer(many=True, read_only=True)
    
    class Meta:
        model = InformacionNutricional
        fields = ['idInformacionNutricional', 'proteinas', 'grasas', 'calorias', 
                 'carbohidratos', 'fibra', 'sodio', 'vitaminas', 'minerales']

class TasaCrecimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TasaCrecimiento
        fields = ['idTasaCrecimiento', 'descripcion', 'crecimiento_mensual_promedio', 
                 'tiempo_para_peso_maximo', 'peso_maximo']

class TasaReproduccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TasaReproduccion
        fields = ['idTasaReproduccion', 'frecuencia', 'numero_huevos_por_puesta', 
                 'periodo_incubacion', 'edad_madurez_sexual', 'metodo_reproduccion']

# Serializador actualizado para Especie
class EspecieSerializer(serializers.ModelSerializer):
    informacion_nutricional = InformacionNutricionalSerializer(read_only=True)
    tasa_crecimiento = TasaCrecimientoSerializer(read_only=True)
    tasa_reproduccion = TasaReproduccionSerializer(read_only=True)
    vitaminas = serializers.SerializerMethodField()
    minerales = serializers.SerializerMethodField()
    temperatura_rango = serializers.SerializerMethodField()
    ph_rango = serializers.SerializerMethodField()
    
    class Meta:
        model = Especie
        fields = [
            'idEspecie', 'nombre', 'nombre_cientifico', 
            'informacion_nutricional', 'tasa_crecimiento', 'tasa_reproduccion',
            'habitat', 'dieta', 'comportamiento', 
            'temperatura_optima_min', 'temperatura_optima_max', 'temperatura_rango',
            'ph_optimo_min', 'ph_optimo_max', 'ph_rango',
            'oxigeno_minimo', 'densidad_siembra_recomendada',
            'vitaminas', 'minerales',
            # Campos legacy
            'informacionNutricional', 'tasaCrecimiento', 'tasaReproduccion'
        ]
    
    def get_vitaminas(self, obj):
        return obj.get_vitaminas_list()
    
    def get_minerales(self, obj):
        return obj.get_minerales_list()
    
    def get_temperatura_rango(self, obj):
        return obj.get_temperatura_rango()
    
    def get_ph_rango(self, obj):
        return obj.get_ph_rango()

# Serializador para crear/actualizar especies con información relacionada
class EspecieCreateUpdateSerializer(serializers.ModelSerializer):
    informacion_nutricional = InformacionNutricionalSerializer(required=False)
    tasa_crecimiento = TasaCrecimientoSerializer(required=False)
    tasa_reproduccion = TasaReproduccionSerializer(required=False)
    vitaminas = VitaminaSerializer(many=True, required=False)
    minerales = MineralSerializer(many=True, required=False)
    
    class Meta:
        model = Especie
        fields = [
            'idEspecie', 'nombre', 'nombre_cientifico', 
            'informacion_nutricional', 'tasa_crecimiento', 'tasa_reproduccion',
            'habitat', 'dieta', 'comportamiento', 
            'temperatura_optima_min', 'temperatura_optima_max',
            'ph_optimo_min', 'ph_optimo_max',
            'oxigeno_minimo', 'densidad_siembra_recomendada',
            'vitaminas', 'minerales'
        ]
    
    def create(self, validated_data):
        informacion_nutricional_data = validated_data.pop('informacion_nutricional', None)
        tasa_crecimiento_data = validated_data.pop('tasa_crecimiento', None)
        tasa_reproduccion_data = validated_data.pop('tasa_reproduccion', None)
        vitaminas_data = validated_data.pop('vitaminas', [])
        minerales_data = validated_data.pop('minerales', [])
        
        # Crear especie
        especie = Especie.objects.create(**validated_data)
        
        # Crear información nutricional si existe
        if informacion_nutricional_data:
            info_nutricional = InformacionNutricional.objects.create(**informacion_nutricional_data)
            especie.informacion_nutricional = info_nutricional
            
            # Crear vitaminas
            for vitamina_data in vitaminas_data:
                Vitamina.objects.create(informacion_nutricional=info_nutricional, **vitamina_data)
            
            # Crear minerales
            for mineral_data in minerales_data:
                Mineral.objects.create(informacion_nutricional=info_nutricional, **mineral_data)
        
        # Crear tasa de crecimiento si existe
        if tasa_crecimiento_data:
            tasa_crecimiento = TasaCrecimiento.objects.create(**tasa_crecimiento_data)
            especie.tasa_crecimiento = tasa_crecimiento
        
        # Crear tasa de reproducción si existe
        if tasa_reproduccion_data:
            tasa_reproduccion = TasaReproduccion.objects.create(**tasa_reproduccion_data)
            especie.tasa_reproduccion = tasa_reproduccion
        
        especie.save()
        return especie
    
    def update(self, instance, validated_data):
        informacion_nutricional_data = validated_data.pop('informacion_nutricional', None)
        tasa_crecimiento_data = validated_data.pop('tasa_crecimiento', None)
        tasa_reproduccion_data = validated_data.pop('tasa_reproduccion', None)
        vitaminas_data = validated_data.pop('vitaminas', [])
        minerales_data = validated_data.pop('minerales', [])
        
        # Actualizar campos básicos de la especie
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Actualizar o crear información nutricional
        if informacion_nutricional_data:
            if instance.informacion_nutricional:
                for attr, value in informacion_nutricional_data.items():
                    setattr(instance.informacion_nutricional, attr, value)
                instance.informacion_nutricional.save()
            else:
                info_nutricional = InformacionNutricional.objects.create(**informacion_nutricional_data)
                instance.informacion_nutricional = info_nutricional
            
            # Actualizar vitaminas
            if vitaminas_data and instance.informacion_nutricional:
                # Eliminar vitaminas existentes
                instance.informacion_nutricional.vitaminas.all().delete()
                # Crear nuevas vitaminas
                for vitamina_data in vitaminas_data:
                    Vitamina.objects.create(informacion_nutricional=instance.informacion_nutricional, **vitamina_data)
            
            # Actualizar minerales
            if minerales_data and instance.informacion_nutricional:
                # Eliminar minerales existentes
                instance.informacion_nutricional.minerales.all().delete()
                # Crear nuevos minerales
                for mineral_data in minerales_data:
                    Mineral.objects.create(informacion_nutricional=instance.informacion_nutricional, **mineral_data)
        
        # Actualizar o crear tasa de crecimiento
        if tasa_crecimiento_data:
            if instance.tasa_crecimiento:
                for attr, value in tasa_crecimiento_data.items():
                    setattr(instance.tasa_crecimiento, attr, value)
                instance.tasa_crecimiento.save()
            else:
                tasa_crecimiento = TasaCrecimiento.objects.create(**tasa_crecimiento_data)
                instance.tasa_crecimiento = tasa_crecimiento
        
        # Actualizar o crear tasa de reproducción
        if tasa_reproduccion_data:
            if instance.tasa_reproduccion:
                for attr, value in tasa_reproduccion_data.items():
                    setattr(instance.tasa_reproduccion, attr, value)
                instance.tasa_reproduccion.save()
            else:
                tasa_reproduccion = TasaReproduccion.objects.create(**tasa_reproduccion_data)
                instance.tasa_reproduccion = tasa_reproduccion
        
        instance.save()
        return instance

# Serializador actualizado para Inventario
class InventarioSerializer(serializers.ModelSerializer):
    especie = serializers.SerializerMethodField()
    finca = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventario
        fields = ['idInventario', 'idEspecie', 'especie', 'idFinca', 'finca', 'cantidad', 'fechaActualizacion']
    
    def get_especie(self, obj):
        return obj.idEspecie.nombre if obj.idEspecie else None
    
    def get_finca(self, obj):
        return obj.idFinca.nombre if obj.idFinca else None

class SiembraSerializer(serializers.ModelSerializer):
    especie = serializers.SerializerMethodField()
    estanque = serializers.SerializerMethodField()
    
    class Meta:
        model = Siembra
        fields = ['idSiembra', 'idEspecie', 'especie', 'idEstanque', 'estanque', 'cantidad', 'fecha', 'inversion']
    
    def get_especie(self, obj):
        return obj.idEspecie.nombre if obj.idEspecie else None
    
    def get_estanque(self, obj):
        return f"Estanque {obj.idEstanque.idEstanque}" if obj.idEstanque else None

# Serializador actualizado para HistorialSiembra
class HistorialSiembraSerializer(serializers.ModelSerializer):
    siembra = serializers.SerializerMethodField()
    ingresos_totales = serializers.SerializerMethodField()
    rentabilidad = serializers.SerializerMethodField()
    supervivencia = serializers.SerializerMethodField()
    tiempo_cultivo = serializers.SerializerMethodField()
    
    class Meta:
        model = HistorialSiembra
        fields = [
            'idHistorialSiembra', 'idSiembra', 'siembra', 
            'fechaComercializacion', 'kilosVendidos', 'precioVenta',
            'kiloPorPez', 'totalKilos', 'pecesComercializados',
            'tasaMortandad', 'fechaCreacion', 'fechaActualizacion',
            'estado', 'ingresos_totales', 'rentabilidad', 'supervivencia',
            'tiempo_cultivo'
        ]
    
    def get_siembra(self, obj):
        return f"Siembra {obj.idSiembra.idSiembra}" if obj.idSiembra else None
    
    def get_ingresos_totales(self, obj):
        return obj.calcular_ingresos_totales()
    
    def get_rentabilidad(self, obj):
        return obj.calcular_rentabilidad()
    
    def get_supervivencia(self, obj):
        return obj.get_supervivencia_porcentaje()
    
    def get_tiempo_cultivo(self, obj):
        return obj.get_tiempo_cultivo_dias()

class DesdobleSerializer(serializers.ModelSerializer):
    estanque_origen = serializers.SerializerMethodField()
    estanque_destino = serializers.SerializerMethodField()
    siembra = serializers.SerializerMethodField()
    
    class Meta:
        model = Desdoble
        fields = ['idDesdoble', 'idEstanqueOrigen', 'estanque_origen', 'idEstanqueDestino', 'estanque_destino', 'idSiembra', 'siembra', 'fecha']
    
    def get_estanque_origen(self, obj):
        return f"Estanque {obj.idEstanqueOrigen.idEstanque}" if obj.idEstanqueOrigen else None
    
    def get_estanque_destino(self, obj):
        return f"Estanque {obj.idEstanqueDestino.idEstanque}" if obj.idEstanqueDestino else None
    
    def get_siembra(self, obj):
        return f"Siembra {obj.idSiembra.idSiembra}" if obj.idSiembra else None

# Serializador actualizado para BitacoraDesdoble
class BitacoraDesdobleSerializer(serializers.ModelSerializer):
    desdoble = serializers.SerializerMethodField()
    
    class Meta:
        model = BitacoraDesdoble
        fields = ['idBitacoraDesdoble', 'idDesdoble', 'desdoble', 'fechaCreacion', 'cambioRealizado']
    
    def get_desdoble(self, obj):
        return f"Desdoble {obj.idDesdoble.idDesdoble}" if obj.idDesdoble else None

class HistorialEstanquesSerializer(serializers.ModelSerializer):
    estanque = serializers.SerializerMethodField()
    
    class Meta:
        model = HistorialEstanques
        fields = ['idHistorialEstanques', 'idEstanque', 'estanque', 'fecha', 'cambioRealizado']
    
    def get_estanque(self, obj):
        return f"Estanque {obj.idEstanque.idEstanque}" if obj.idEstanque else None

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class MonitoreoSerializer(serializers.ModelSerializer):
    estanque = serializers.SerializerMethodField()
    sensor = serializers.SerializerMethodField()
    
    class Meta:
        model = Monitoreo
        fields = ['idMonitoreo', 'idEstanque', 'estanque', 'idSensor', 'sensor', 'valor', 'fecha']
    
    def get_estanque(self, obj):
        return f"Estanque {obj.idEstanque.idEstanque}" if obj.idEstanque else None
    
    def get_sensor(self, obj):
        return obj.idSensor.nombreSensor if obj.idSensor else None

# Serializador actualizado para Alerta
class AlertaSerializer(serializers.ModelSerializer):
    monitoreo = serializers.SerializerMethodField()
    especie = serializers.SerializerMethodField()
    
    class Meta:
        model = Alerta
        fields = [
            'idAlerta', 'idMonitoreo', 'monitoreo', 'idEspecie', 'especie',
            'tipoAlerta', 'mensaje', 'valorMedido', 'valorLimite',
            'estado', 'fechaCreacion', 'fechaResolucion'
        ]
    
    def get_monitoreo(self, obj):
        return f"Monitoreo {obj.idMonitoreo.idMonitoreo}" if obj.idMonitoreo else None
    
    def get_especie(self, obj):
        return obj.idEspecie.nombre if obj.idEspecie else None

class RegistroUsuarioSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    tipo_usuario = serializers.IntegerField(required=False, default=1)
    
    def create(self, validated_data):
        # Crear usuario de Django
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Obtener el tipo de usuario
        try:
            tipo_usuario = TipoUsuario.objects.get(idTipoUsuario=validated_data.get('tipo_usuario', 1))
        except TipoUsuario.DoesNotExist:
            # Si no existe el tipo de usuario especificado, usar el primero disponible
            tipo_usuario = TipoUsuario.objects.first()
            if not tipo_usuario:
                # Si no hay tipos de usuario, crear uno por defecto
                tipo_usuario = TipoUsuario.objects.create(
                    nombre="Usuario Estándar",
                    descripcion="Usuario creado por defecto"
                )
        
        # Crear perfil de usuario personalizado
        usuario = Usuario.objects.create(
            user=user,
            nombre=validated_data['first_name'],
            apellido=validated_data['last_name'],
            correo=validated_data['email'],
            contrasena=make_password(validated_data['password']),
            idTipoUsuario=tipo_usuario
        )
        
        return usuario

class UsuarioLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
