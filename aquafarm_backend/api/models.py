from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import json

class TipoUsuario(models.Model):
    idTipoUsuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=45)
    descripcion = models.CharField(max_length=45)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'TipoUsuario'
        verbose_name = "Tipo de Usuario"
        verbose_name_plural = "Tipos de Usuario"

class MetodoAcuicola(models.Model):
    idMetodoAcuicola = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=45)
    descripcion = models.CharField(max_length=45)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'MetodoAcuicola'
        verbose_name = "Método Acuícola"
        verbose_name_plural = "Métodos Acuícolas"

class Usuario(models.Model):
    idUsuario = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil', null=True, blank=True)
    nombre = models.CharField(max_length=45)
    apellido = models.CharField(max_length=45)
    correo = models.CharField(max_length=45)
    contrasena = models.CharField(max_length=100)
    idTipoUsuario = models.ForeignKey(TipoUsuario, on_delete=models.CASCADE, db_column='idTipoUsuario')
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"
    
    class Meta:
        db_table = 'Usuario'
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

class Finca(models.Model):
    idFinca = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=45)
    idMetodoAcuicola = models.ForeignKey(MetodoAcuicola, on_delete=models.CASCADE, db_column='idMetodoAcuicola')
    ubicacion = models.CharField(max_length=100)
    idUsuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='fincas', db_column='idUsuario')
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'Finca'
        verbose_name = "Finca"
        verbose_name_plural = "Fincas"

class TipoEstanque(models.Model):
    idTipoEstanque = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=45)
    descripcion = models.CharField(max_length=45)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'TipoEstanque'
        verbose_name = "Tipo de Estanque"
        verbose_name_plural = "Tipos de Estanque"

class Estanque(models.Model):
    idEstanque = models.AutoField(primary_key=True)
    idFinca = models.ForeignKey(Finca, on_delete=models.CASCADE, db_column='idFinca')
    litros = models.IntegerField()
    capacidad = models.IntegerField()
    idTipoEstanque = models.ForeignKey(TipoEstanque, on_delete=models.CASCADE, db_column='idTipoEstanque')
    
    def __str__(self):
        return f"Estanque {self.idEstanque} - {self.idFinca.nombre}"
    
    class Meta:
        db_table = 'Estanque'
        verbose_name = "Estanque"
        verbose_name_plural = "Estanques"

# Nuevos modelos para información nutricional detallada
class InformacionNutricional(models.Model):
    idInformacionNutricional = models.AutoField(primary_key=True)
    proteinas = models.CharField(max_length=50, help_text="Contenido de proteínas (ej: '18-20g por 100g')")
    grasas = models.CharField(max_length=50, help_text="Contenido de grasas (ej: '5-8g por 100g')")
    calorias = models.CharField(max_length=50, help_text="Contenido calórico (ej: '120-150 kcal por 100g')")
    carbohidratos = models.CharField(max_length=50, null=True, blank=True, help_text="Contenido de carbohidratos")
    fibra = models.CharField(max_length=50, null=True, blank=True, help_text="Contenido de fibra")
    sodio = models.CharField(max_length=50, null=True, blank=True, help_text="Contenido de sodio")
    
    def __str__(self):
        return f"Info Nutricional ID: {self.idInformacionNutricional}"
    
    class Meta:
        db_table = 'InformacionNutricional'
        verbose_name = "Información Nutricional"
        verbose_name_plural = "Informaciones Nutricionales"

class Vitamina(models.Model):
    idVitamina = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, help_text="Nombre de la vitamina (ej: 'Vitamina A', 'B12')")
    cantidad = models.CharField(max_length=50, help_text="Cantidad presente (ej: '100 UI por 100g')")
    informacion_nutricional = models.ForeignKey(InformacionNutricional, on_delete=models.CASCADE, related_name='vitaminas')
    
    def __str__(self):
        return f"{self.nombre}: {self.cantidad}"
    
    class Meta:
        db_table = 'Vitamina'
        verbose_name = "Vitamina"
        verbose_name_plural = "Vitaminas"

class Mineral(models.Model):
    idMineral = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, help_text="Nombre del mineral (ej: 'Calcio', 'Fósforo')")
    cantidad = models.CharField(max_length=50, help_text="Cantidad presente (ej: '200mg por 100g')")
    informacion_nutricional = models.ForeignKey(InformacionNutricional, on_delete=models.CASCADE, related_name='minerales')
    
    def __str__(self):
        return f"{self.nombre}: {self.cantidad}"
    
    class Meta:
        db_table = 'Mineral'
        verbose_name = "Mineral"
        verbose_name_plural = "Minerales"

class TasaCrecimiento(models.Model):
    idTasaCrecimiento = models.AutoField(primary_key=True)
    descripcion = models.TextField(help_text="Descripción general del crecimiento")
    crecimiento_mensual_promedio = models.CharField(max_length=100, help_text="Crecimiento promedio mensual (ej: '50-80g por mes')")
    tiempo_para_peso_maximo = models.CharField(max_length=100, null=True, blank=True, help_text="Tiempo para alcanzar peso máximo")
    peso_maximo = models.CharField(max_length=50, null=True, blank=True, help_text="Peso máximo alcanzable (ej: '2-3 kg')")
    
    def __str__(self):
        return f"Tasa Crecimiento ID: {self.idTasaCrecimiento}"
    
    class Meta:
        db_table = 'TasaCrecimiento'
        verbose_name = "Tasa de Crecimiento"
        verbose_name_plural = "Tasas de Crecimiento"

class TasaReproduccion(models.Model):
    idTasaReproduccion = models.AutoField(primary_key=True)
    frecuencia = models.CharField(max_length=100, help_text="Frecuencia de reproducción (ej: 'Cada 2-3 meses')")
    numero_huevos_por_puesta = models.CharField(max_length=100, help_text="Número de huevos por puesta")
    periodo_incubacion = models.CharField(max_length=100, help_text="Tiempo de incubación")
    edad_madurez_sexual = models.CharField(max_length=100, null=True, blank=True, help_text="Edad de madurez sexual")
    metodo_reproduccion = models.CharField(max_length=200, null=True, blank=True, help_text="Método de reproducción")
    
    def __str__(self):
        return f"Tasa Reproducción ID: {self.idTasaReproduccion}"
    
    class Meta:
        db_table = 'TasaReproduccion'
        verbose_name = "Tasa de Reproducción"
        verbose_name_plural = "Tasas de Reproducción"

# Modelo de Especie actualizado con información detallada
class Especie(models.Model):
    idEspecie = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, help_text="Nombre común de la especie")
    nombre_cientifico = models.CharField(max_length=100, null=True, blank=True, help_text="Nombre científico")
    
    # Relaciones con los nuevos modelos detallados
    informacion_nutricional = models.OneToOneField(
        InformacionNutricional, 
        on_delete=models.CASCADE, 
        related_name='especie',
        null=True, 
        blank=True
    )
    tasa_crecimiento = models.OneToOneField(
        TasaCrecimiento, 
        on_delete=models.CASCADE, 
        related_name='especie',
        null=True, 
        blank=True
    )
    tasa_reproduccion = models.OneToOneField(
        TasaReproduccion, 
        on_delete=models.CASCADE, 
        related_name='especie',
        null=True, 
        blank=True
    )
    
    # Campos adicionales para información detallada
    habitat = models.TextField(null=True, blank=True, help_text="Descripción del hábitat natural")
    dieta = models.TextField(null=True, blank=True, help_text="Descripción de la dieta")
    comportamiento = models.TextField(null=True, blank=True, help_text="Descripción del comportamiento")
    temperatura_optima_min = models.FloatField(null=True, blank=True, help_text="Temperatura mínima óptima (°C)")
    temperatura_optima_max = models.FloatField(null=True, blank=True, help_text="Temperatura máxima óptima (°C)")
    ph_optimo_min = models.FloatField(null=True, blank=True, help_text="pH mínimo óptimo")
    ph_optimo_max = models.FloatField(null=True, blank=True, help_text="pH máximo óptimo")
    oxigeno_minimo = models.FloatField(null=True, blank=True, help_text="Oxígeno disuelto mínimo (mg/L)")
    densidad_siembra_recomendada = models.CharField(max_length=100, null=True, blank=True, help_text="Densidad de siembra recomendada")
    
    # Campos heredados (mantener compatibilidad)
    informacionNutricional = models.CharField(max_length=100, null=True, blank=True, help_text="Campo legacy - usar informacion_nutricional")
    tasaCrecimiento = models.CharField(max_length=45, null=True, blank=True, help_text="Campo legacy - usar tasa_crecimiento")
    tasaReproduccion = models.CharField(max_length=45, null=True, blank=True, help_text="Campo legacy - usar tasa_reproduccion")
    
    def __str__(self):
        return self.nombre
    
    def get_vitaminas_list(self):
        """Retorna lista de vitaminas como strings"""
        if self.informacion_nutricional:
            return [f"{v.nombre}: {v.cantidad}" for v in self.informacion_nutricional.vitaminas.all()]
        return []
    
    def get_minerales_list(self):
        """Retorna lista de minerales como strings"""
        if self.informacion_nutricional:
            return [f"{m.nombre}: {m.cantidad}" for m in self.informacion_nutricional.minerales.all()]
        return []
    
    def get_temperatura_rango(self):
        """Retorna el rango de temperatura como string"""
        if self.temperatura_optima_min and self.temperatura_optima_max:
            return f"{self.temperatura_optima_min}°C - {self.temperatura_optima_max}°C"
        return None
    
    def get_ph_rango(self):
        """Retorna el rango de pH como string"""
        if self.ph_optimo_min and self.ph_optimo_max:
            return f"{self.ph_optimo_min} - {self.ph_optimo_max}"
        return None
    
    class Meta:
        db_table = 'Especie'
        verbose_name = "Especie"
        verbose_name_plural = "Especies"

class Inventario(models.Model):
    idInventario = models.AutoField(primary_key=True)
    idEspecie = models.ForeignKey(Especie, on_delete=models.CASCADE, db_column='idEspecie')
    idFinca = models.ForeignKey(Finca, on_delete=models.CASCADE, db_column='idFinca', help_text="Finca donde está el inventario")
    cantidad = models.IntegerField(default=0, help_text="Cantidad actual de peces de esta especie en la finca")
    fechaActualizacion = models.DateTimeField(auto_now=True, help_text="Última actualización del inventario")
    
    def agregar_cantidad(self, cantidad_agregar):
        """Método para agregar peces al inventario"""
        self.cantidad += cantidad_agregar
        self.save()
    
    def reducir_cantidad(self, cantidad_reducir):
        """Método para reducir peces del inventario"""
        if self.cantidad >= cantidad_reducir:
            self.cantidad -= cantidad_reducir
            self.save()
        else:
            raise ValueError(f"No hay suficientes peces en inventario. Disponible: {self.cantidad}, Solicitado: {cantidad_reducir}")
    
    def __str__(self):
        return f"Inventario {self.idInventario} - {self.idEspecie.nombre} - Finca: {self.idFinca.nombre} - Cant: {self.cantidad}"
    
    class Meta:
        db_table = 'Inventario'
        verbose_name = "Inventario"
        verbose_name_plural = "Inventarios"
        unique_together = ('idEspecie', 'idFinca')  # Un solo registro por especie por finca

class Siembra(models.Model):
    idSiembra = models.AutoField(primary_key=True)
    idEspecie = models.ForeignKey(Especie, on_delete=models.CASCADE, db_column='idEspecie')
    idEstanque = models.ForeignKey(Estanque, on_delete=models.CASCADE, db_column='idEstanque')
    cantidad = models.IntegerField()
    fecha = models.DateTimeField()
    inversion = models.FloatField()
    
    def __str__(self):
        return f"Siembra {self.idSiembra} - {self.idEspecie.nombre} en {self.idEstanque}"
    
    class Meta:
        db_table = 'Siembra'
        verbose_name = "Siembra"
        verbose_name_plural = "Siembras"

class HistorialSiembra(models.Model):
    idHistorialSiembra = models.AutoField(primary_key=True)
    idSiembra = models.ForeignKey(Siembra, on_delete=models.CASCADE, db_column='idSiembra')
    fechaComercializacion = models.DateTimeField(null=True, blank=True, help_text="Fecha de comercialización - se completa al vender")
    kilosVendidos = models.FloatField(default=0, help_text="Total de kilos vendidos")
    precioVenta = models.FloatField(default=0, help_text="Precio de venta por kilo")
    kiloPorPez = models.FloatField(null=True, blank=True, help_text="Peso promedio por pez al momento de la venta (en kg)")
    totalKilos = models.FloatField(null=True, blank=True, help_text="Total de kilos de la cosecha")
    pecesComercializados = models.IntegerField(null=True, blank=True, help_text="Número de peces al momento de comercialización (calculado)")
    tasaMortandad = models.FloatField(null=True, blank=True, help_text="Tasa de mortandad calculada automáticamente (%)")
    fechaCreacion = models.DateTimeField(auto_now_add=True, help_text="Fecha de creación del registro")
    fechaActualizacion = models.DateTimeField(auto_now=True, help_text="Última actualización del registro")
    estado = models.CharField(
        max_length=20, 
        default='PENDIENTE',
        choices=[
            ('PENDIENTE', 'Pendiente de Comercialización'),
            ('COMERCIALIZADO', 'Comercializado'),
            ('CANCELADO', 'Cancelado')
        ],
        help_text="Estado del historial de siembra"
    )
    
    def save(self, *args, **kwargs):
        # Calcular peces comercializados si tenemos los datos necesarios
        if self.totalKilos and self.kiloPorPez and self.kiloPorPez > 0:
            self.pecesComercializados = int(self.totalKilos / self.kiloPorPez)
        
        # Calcular tasa de mortandad si tenemos los datos necesarios
        if self.pecesComercializados and self.idSiembra and self.idSiembra.cantidad:
            peces_iniciales = self.idSiembra.cantidad
            peces_finales = self.pecesComercializados
            peces_muertos = peces_iniciales - peces_finales
            self.tasaMortandad = (peces_muertos / peces_iniciales) * 100 if peces_iniciales > 0 else 0
        
        # Actualizar estado basado en si tiene fecha de comercialización
        if self.fechaComercializacion and self.estado == 'PENDIENTE':
            self.estado = 'COMERCIALIZADO'
        
        super().save(*args, **kwargs)
    
    def calcular_ingresos_totales(self):
        """Calcula los ingresos totales de la venta"""
        return self.kilosVendidos * self.precioVenta if self.kilosVendidos and self.precioVenta else 0
    
    def calcular_rentabilidad(self):
        """Calcula la rentabilidad comparando ingresos vs inversión inicial"""
        if self.idSiembra and self.idSiembra.inversion:
            ingresos = self.calcular_ingresos_totales()
            inversion = self.idSiembra.inversion
            return ((ingresos - inversion) / inversion) * 100 if inversion > 0 else 0
        return None
    
    def get_supervivencia_porcentaje(self):
        """Retorna el porcentaje de supervivencia"""
        return 100 - self.tasaMortandad if self.tasaMortandad is not None else None
    
    def get_tiempo_cultivo_dias(self):
        """Calcula los días transcurridos desde la siembra hasta la comercialización"""
        if self.fechaComercializacion and self.idSiembra and self.idSiembra.fecha:
            delta = self.fechaComercializacion - self.idSiembra.fecha
            return delta.days
        return None
    
    def __str__(self):
        return f"Historial Siembra {self.idHistorialSiembra} - {self.idSiembra} - {self.estado}"
    
    class Meta:
        db_table = 'HistorialSiembra'
        verbose_name = "Historial de Siembra"
        verbose_name_plural = "Historiales de Siembra"

class Desdoble(models.Model):
    idDesdoble = models.AutoField(primary_key=True)
    idEstanqueOrigen = models.ForeignKey(Estanque, on_delete=models.CASCADE, related_name='desdobles_origen', db_column='idEstanqueOrigen')
    idEstanqueDestino = models.ForeignKey(Estanque, on_delete=models.CASCADE, related_name='desdobles_destino', db_column='idEstanqueDestino')
    idSiembra = models.ForeignKey(Siembra, on_delete=models.CASCADE, db_column='idSiembra')
    fecha = models.DateTimeField()
    
    def __str__(self):
        return f"Desdoble {self.idDesdoble} - {self.idEstanqueOrigen} a {self.idEstanqueDestino}"
    
    class Meta:
        db_table = 'Desdoble'
        verbose_name = "Desdoble"
        verbose_name_plural = "Desdobles"

class BitacoraDesdoble(models.Model):
    idBitacoraDesdoble = models.AutoField(primary_key=True)
    idDesdoble = models.ForeignKey(Desdoble, on_delete=models.CASCADE, db_column='idDesdoble', help_text="Desdoble relacionado")
    fechaCreacion = models.DateTimeField(auto_now_add=True, help_text="Fecha automática cuando se crea el desdoble")
    cambioRealizado = models.TextField(null=True, blank=True, help_text="Descripción opcional del cambio realizado")
    
    def __str__(self):
        return f"Bitácora Desdoble {self.idBitacoraDesdoble} - Desdoble: {self.idDesdoble.idDesdoble}"
    
    class Meta:
        db_table = 'BitacoraDesdoble'
        verbose_name = "Bitácora de Desdoble"
        verbose_name_plural = "Bitácoras de Desdoble"

class HistorialEstanques(models.Model):
    idHistorialEstanques = models.AutoField(primary_key=True)
    idEstanque = models.ForeignKey(Estanque, on_delete=models.CASCADE, db_column='idEstanque')
    fecha = models.DateTimeField()
    cambioRealizado = models.TextField()
    
    def __str__(self):
        return f"Historial Estanque {self.idHistorialEstanques} - {self.idEstanque}"
    
    class Meta:
        db_table = 'HistorialEstanques'
        verbose_name = "Historial de Estanque"
        verbose_name_plural = "Historiales de Estanque"

class Sensor(models.Model):
    idSensor = models.AutoField(primary_key=True)
    nombreSensor = models.CharField(max_length=45)
    unidadMedida = models.CharField(max_length=45)
    descripcion = models.CharField(max_length=45)
    
    def __str__(self):
        return self.nombreSensor
    
    class Meta:
        db_table = 'Sensor'
        verbose_name = "Sensor"
        verbose_name_plural = "Sensores"

class Monitoreo(models.Model):
    idMonitoreo = models.AutoField(primary_key=True)
    idEstanque = models.ForeignKey(Estanque, on_delete=models.CASCADE, db_column='idEstanque')
    idSensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, db_column='idSensor')
    valor = models.FloatField()
    fecha = models.DateTimeField()
    
    def __str__(self):
        return f"Monitoreo {self.idMonitoreo} - {self.idEstanque} - {self.idSensor.nombreSensor}"
    
    class Meta:
        db_table = 'Monitoreo'
        verbose_name = "Monitoreo"
        verbose_name_plural = "Monitoreos"

class Alerta(models.Model):
    TIPOS_ALERTA = [
        ('TEMPERATURA', 'Temperatura Anómala'),
        ('PH', 'pH Anómalo'),
        ('OXIGENO', 'Oxígeno Anómalo'),
        ('OTRO', 'Otro Tipo de Alerta'),
    ]
    
    ESTADOS_ALERTA = [
        ('ACTIVA', 'Alerta Activa'),
        ('RESUELTA', 'Alerta Resuelta'),
        ('IGNORADA', 'Alerta Ignorada'),
    ]
    
    idAlerta = models.AutoField(primary_key=True)
    idMonitoreo = models.ForeignKey(Monitoreo, on_delete=models.CASCADE, db_column='idMonitoreo')
    idEspecie = models.ForeignKey(Especie, on_delete=models.CASCADE, db_column='idEspecie', null=True, blank=True, help_text="Especie que causó la alerta")
    tipoAlerta = models.CharField(max_length=20, choices=TIPOS_ALERTA, default='OTRO', help_text="Tipo de alerta generada")
    mensaje = models.TextField(help_text="Mensaje descriptivo de la alerta")
    valorMedido = models.FloatField(help_text="Valor que causó la alerta")
    valorLimite = models.FloatField(help_text="Valor límite que se excedió")
    estado = models.CharField(max_length=20, choices=ESTADOS_ALERTA, default='ACTIVA')
    fechaCreacion = models.DateTimeField(auto_now_add=True, help_text="Fecha de creación de la alerta")
    fechaResolucion = models.DateTimeField(null=True, blank=True, help_text="Fecha de resolución de la alerta")
    
    def marcar_como_resuelta(self):
        """Marca la alerta como resuelta"""
        from django.utils import timezone
        self.estado = 'RESUELTA'
        self.fechaResolucion = timezone.now()
        self.save()
    
    def marcar_como_ignorada(self):
        """Marca la alerta como ignorada"""
        from django.utils import timezone
        self.estado = 'IGNORADA'
        self.fechaResolucion = timezone.now()
        self.save()
    
    def __str__(self):
        return f"Alerta {self.idAlerta} - {self.tipoAlerta} - {self.estado}"
    
    class Meta:
        db_table = 'Alerta'
        verbose_name = "Alerta"
        verbose_name_plural = "Alertas"

# Signals - Disparadores automáticos
@receiver(post_save, sender=Siembra)
def crear_historial_siembra(sender, instance, created, **kwargs):
    """
    Signal que se ejecuta automáticamente cuando se crea una nueva siembra.
    Crea un registro en HistorialSiembra con el estado PENDIENTE.
    """
    if created:  # Solo cuando se crea una nueva siembra, no en actualizaciones
        HistorialSiembra.objects.create(
            idSiembra=instance,
            estado='PENDIENTE'
        )

@receiver(post_save, sender=Siembra)
def actualizar_inventario_siembra(sender, instance, created, **kwargs):
    """
    Signal que actualiza el inventario cuando se crea una siembra.
    Suma la cantidad sembrada al inventario de la especie en la finca.
    """
    if created:  # Solo cuando se crea una nueva siembra
        finca = instance.idEstanque.idFinca
        especie = instance.idEspecie
        cantidad = instance.cantidad
        
        # Buscar o crear el inventario para esta especie en esta finca
        inventario, created_inv = Inventario.objects.get_or_create(
            idEspecie=especie,
            idFinca=finca,
            defaults={'cantidad': 0}
        )
        
        # Agregar la cantidad sembrada al inventario
        inventario.agregar_cantidad(cantidad)

@receiver(post_save, sender=HistorialSiembra)
def actualizar_inventario_comercializacion(sender, instance, created, **kwargs):
    """
    Signal que actualiza el inventario cuando se comercializa una siembra.
    Resta los peces comercializados del inventario.
    """
    if not created and instance.estado == 'COMERCIALIZADO' and instance.pecesComercializados:
        # Solo ejecutar si el historial se actualizó (no se creó) y está comercializado
        finca = instance.idSiembra.idEstanque.idFinca
        especie = instance.idSiembra.idEspecie
        cantidad_comercializada = instance.pecesComercializados
        
        try:
            inventario = Inventario.objects.get(idEspecie=especie, idFinca=finca)
            inventario.reducir_cantidad(cantidad_comercializada)
        except Inventario.DoesNotExist:
            # Si no existe inventario, crear uno con cantidad 0
            Inventario.objects.create(
                idEspecie=especie,
                idFinca=finca,
                cantidad=0
            )

@receiver(post_save, sender=Desdoble)
def crear_bitacora_desdoble(sender, instance, created, **kwargs):
    """
    Signal que crea automáticamente una bitácora cuando se registra un desdoble.
    """
    if created:  # Solo cuando se crea un nuevo desdoble
        BitacoraDesdoble.objects.create(
            idDesdoble=instance,
            cambioRealizado=f"Desdoble automático desde estanque {instance.idEstanqueOrigen} hacia estanque {instance.idEstanqueDestino}"
        )

@receiver(post_save, sender=Monitoreo)
def verificar_alertas_monitoreo(sender, instance, created, **kwargs):
    """
    Signal que verifica si los valores de monitoreo están fuera de los rangos
    normales para las especies en el estanque y crea alertas automáticas.
    """
    if created:  # Solo para nuevos monitoreos
        estanque = instance.idEstanque
        sensor = instance.idSensor
        valor_medido = instance.valor
        fecha_monitoreo = instance.fecha
        
        # Obtener todas las siembras activas en este estanque
        siembras_activas = Siembra.objects.filter(
            idEstanque=estanque,
            historialsiembra__estado='PENDIENTE'
        ).distinct()
        
        for siembra in siembras_activas:
            especie = siembra.idEspecie
            alertas_creadas = []
            
            # Verificar temperatura
            if sensor.nombreSensor.lower() in ['temperatura', 'temp'] and sensor.unidadMedida.lower() in ['°c', 'celsius', 'c']:
                if especie.temperatura_optima_min is not None and valor_medido < especie.temperatura_optima_min:
                    mensaje = f"Temperatura BAJA detectada: {valor_medido}°C. Mínimo recomendado para {especie.nombre}: {especie.temperatura_optima_min}°C"
                    Alerta.objects.create(
                        idMonitoreo=instance,
                        idEspecie=especie,
                        tipoAlerta='TEMPERATURA',
                        mensaje=mensaje,
                        valorMedido=valor_medido,
                        valorLimite=especie.temperatura_optima_min
                    )
                elif especie.temperatura_optima_max is not None and valor_medido > especie.temperatura_optima_max:
                    mensaje = f"Temperatura ALTA detectada: {valor_medido}°C. Máximo recomendado para {especie.nombre}: {especie.temperatura_optima_max}°C"
                    Alerta.objects.create(
                        idMonitoreo=instance,
                        idEspecie=especie,
                        tipoAlerta='TEMPERATURA',
                        mensaje=mensaje,
                        valorMedido=valor_medido,
                        valorLimite=especie.temperatura_optima_max
                    )
            
            # Verificar pH
            elif sensor.nombreSensor.lower() == 'ph':
                if especie.ph_optimo_min is not None and valor_medido < especie.ph_optimo_min:
                    mensaje = f"pH BAJO detectado: {valor_medido}. Mínimo recomendado para {especie.nombre}: {especie.ph_optimo_min}"
                    Alerta.objects.create(
                        idMonitoreo=instance,
                        idEspecie=especie,
                        tipoAlerta='PH',
                        mensaje=mensaje,
                        valorMedido=valor_medido,
                        valorLimite=especie.ph_optimo_min
                    )
                elif especie.ph_optimo_max is not None and valor_medido > especie.ph_optimo_max:
                    mensaje = f"pH ALTO detectado: {valor_medido}. Máximo recomendado para {especie.nombre}: {especie.ph_optimo_max}"
                    Alerta.objects.create(
                        idMonitoreo=instance,
                        idEspecie=especie,
                        tipoAlerta='PH',
                        mensaje=mensaje,
                        valorMedido=valor_medido,
                        valorLimite=especie.ph_optimo_max
                    )
            
            # Verificar oxígeno disuelto
            elif sensor.nombreSensor.lower() in ['oxigeno', 'oxígeno', 'o2'] and sensor.unidadMedida.lower() in ['mg/l', 'ppm']:
                if especie.oxigeno_minimo is not None and valor_medido < especie.oxigeno_minimo:
                    mensaje = f"Oxígeno BAJO detectado: {valor_medido} mg/L. Mínimo recomendado para {especie.nombre}: {especie.oxigeno_minimo} mg/L"
                    Alerta.objects.create(
                        idMonitoreo=instance,
                        idEspecie=especie,
                        tipoAlerta='OXIGENO',
                        mensaje=mensaje,
                        valorMedido=valor_medido,
                        valorLimite=especie.oxigeno_minimo
                    )