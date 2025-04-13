# Generated by Django 5.1.7 on 2025-04-10 09:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sportscenters', '0002_alter_appointment_created_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trainer',
            name='experience_years',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='trainer',
            name='specialization',
            field=models.CharField(choices=[('gym', 'Gym'), ('yoga', 'Yoga'), ('swimming', 'Swimming'), ('dance', 'Dance')], max_length=20, null=True),
        ),
    ]
