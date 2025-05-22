from django.contrib import admin
from .models import (
    TipoUsuario, MetodoAcuicola, Finca, Usuario, TipoEstanque, 
    Estanque, Especie, Inventario, Siembra, HistorialSiembra,
    Desdoble, BitacoraDesdoble, HistorialEstanques, Sensor,
    Monitoreo, Alerta
)

admin.site.register(TipoUsuario)
admin.site.register(MetodoAcuicola)
admin.site.register(Finca)
admin.site.register(Usuario)
admin.site.register(TipoEstanque)
admin.site.register(Estanque)
admin.site.register(Especie)
admin.site.register(Inventario)
admin.site.register(Siembra)
admin.site.register(HistorialSiembra)
admin.site.register(Desdoble)
admin.site.register(BitacoraDesdoble)
admin.site.register(HistorialEstanques)
admin.site.register(Sensor)
admin.site.register(Monitoreo)
admin.site.register(Alerta)
