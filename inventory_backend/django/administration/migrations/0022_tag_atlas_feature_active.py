# Generated by Django 3.2.25 on 2024-08-06 11:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0021_auto_20240806_1126'),
    ]

    operations = [
        migrations.AddField(
            model_name='tag',
            name='atlas_feature_active',
            field=models.BooleanField(default=True),
        ),
    ]