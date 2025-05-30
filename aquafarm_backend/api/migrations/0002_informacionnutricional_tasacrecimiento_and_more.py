# Generated by Django 5.2.1 on 2025-05-22 17:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InformacionNutricional',
            fields=[
                ('idInformacionNutricional', models.AutoField(primary_key=True, serialize=False)),
                ('proteinas', models.CharField(help_text="Contenido de proteínas (ej: '18-20g por 100g')", max_length=50)),
                ('grasas', models.CharField(help_text="Contenido de grasas (ej: '5-8g por 100g')", max_length=50)),
                ('calorias', models.CharField(help_text="Contenido calórico (ej: '120-150 kcal por 100g')", max_length=50)),
                ('carbohidratos', models.CharField(blank=True, help_text='Contenido de carbohidratos', max_length=50, null=True)),
                ('fibra', models.CharField(blank=True, help_text='Contenido de fibra', max_length=50, null=True)),
                ('sodio', models.CharField(blank=True, help_text='Contenido de sodio', max_length=50, null=True)),
            ],
            options={
                'verbose_name': 'Información Nutricional',
                'verbose_name_plural': 'Informaciones Nutricionales',
                'db_table': 'InformacionNutricional',
            },
        ),
        migrations.CreateModel(
            name='TasaCrecimiento',
            fields=[
                ('idTasaCrecimiento', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.TextField(help_text='Descripción general del crecimiento')),
                ('crecimiento_mensual_promedio', models.CharField(help_text="Crecimiento promedio mensual (ej: '50-80g por mes')", max_length=100)),
                ('tiempo_para_peso_maximo', models.CharField(blank=True, help_text='Tiempo para alcanzar peso máximo', max_length=100, null=True)),
                ('peso_maximo', models.CharField(blank=True, help_text="Peso máximo alcanzable (ej: '2-3 kg')", max_length=50, null=True)),
            ],
            options={
                'verbose_name': 'Tasa de Crecimiento',
                'verbose_name_plural': 'Tasas de Crecimiento',
                'db_table': 'TasaCrecimiento',
            },
        ),
        migrations.CreateModel(
            name='TasaReproduccion',
            fields=[
                ('idTasaReproduccion', models.AutoField(primary_key=True, serialize=False)),
                ('frecuencia', models.CharField(help_text="Frecuencia de reproducción (ej: 'Cada 2-3 meses')", max_length=100)),
                ('numero_huevos_por_puesta', models.CharField(help_text='Número de huevos por puesta', max_length=100)),
                ('periodo_incubacion', models.CharField(help_text='Tiempo de incubación', max_length=100)),
                ('edad_madurez_sexual', models.CharField(blank=True, help_text='Edad de madurez sexual', max_length=100, null=True)),
                ('metodo_reproduccion', models.CharField(blank=True, help_text='Método de reproducción', max_length=200, null=True)),
            ],
            options={
                'verbose_name': 'Tasa de Reproducción',
                'verbose_name_plural': 'Tasas de Reproducción',
                'db_table': 'TasaReproduccion',
            },
        ),
        migrations.AddField(
            model_name='especie',
            name='comportamiento',
            field=models.TextField(blank=True, help_text='Descripción del comportamiento', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='densidad_siembra_recomendada',
            field=models.CharField(blank=True, help_text='Densidad de siembra recomendada', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='dieta',
            field=models.TextField(blank=True, help_text='Descripción de la dieta', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='habitat',
            field=models.TextField(blank=True, help_text='Descripción del hábitat natural', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='nombre_cientifico',
            field=models.CharField(blank=True, help_text='Nombre científico', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='oxigeno_minimo',
            field=models.FloatField(blank=True, help_text='Oxígeno disuelto mínimo (mg/L)', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='ph_optimo_max',
            field=models.FloatField(blank=True, help_text='pH máximo óptimo', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='ph_optimo_min',
            field=models.FloatField(blank=True, help_text='pH mínimo óptimo', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='temperatura_optima_max',
            field=models.FloatField(blank=True, help_text='Temperatura máxima óptima (°C)', null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='temperatura_optima_min',
            field=models.FloatField(blank=True, help_text='Temperatura mínima óptima (°C)', null=True),
        ),
        migrations.AlterField(
            model_name='especie',
            name='informacionNutricional',
            field=models.CharField(blank=True, help_text='Campo legacy - usar informacion_nutricional', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='especie',
            name='nombre',
            field=models.CharField(help_text='Nombre común de la especie', max_length=100),
        ),
        migrations.AlterField(
            model_name='especie',
            name='tasaCrecimiento',
            field=models.CharField(blank=True, help_text='Campo legacy - usar tasa_crecimiento', max_length=45, null=True),
        ),
        migrations.AlterField(
            model_name='especie',
            name='tasaReproduccion',
            field=models.CharField(blank=True, help_text='Campo legacy - usar tasa_reproduccion', max_length=45, null=True),
        ),
        migrations.AddField(
            model_name='especie',
            name='informacion_nutricional',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='especie', to='api.informacionnutricional'),
        ),
        migrations.CreateModel(
            name='Mineral',
            fields=[
                ('idMineral', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(help_text="Nombre del mineral (ej: 'Calcio', 'Fósforo')", max_length=50)),
                ('cantidad', models.CharField(help_text="Cantidad presente (ej: '200mg por 100g')", max_length=50)),
                ('informacion_nutricional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='minerales', to='api.informacionnutricional')),
            ],
            options={
                'verbose_name': 'Mineral',
                'verbose_name_plural': 'Minerales',
                'db_table': 'Mineral',
            },
        ),
        migrations.AddField(
            model_name='especie',
            name='tasa_crecimiento',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='especie', to='api.tasacrecimiento'),
        ),
        migrations.AddField(
            model_name='especie',
            name='tasa_reproduccion',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='especie', to='api.tasareproduccion'),
        ),
        migrations.CreateModel(
            name='Vitamina',
            fields=[
                ('idVitamina', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(help_text="Nombre de la vitamina (ej: 'Vitamina A', 'B12')", max_length=50)),
                ('cantidad', models.CharField(help_text="Cantidad presente (ej: '100 UI por 100g')", max_length=50)),
                ('informacion_nutricional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vitaminas', to='api.informacionnutricional')),
            ],
            options={
                'verbose_name': 'Vitamina',
                'verbose_name_plural': 'Vitaminas',
                'db_table': 'Vitamina',
            },
        ),
    ]
