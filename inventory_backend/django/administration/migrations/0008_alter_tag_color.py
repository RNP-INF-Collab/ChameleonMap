# Generated by Django 3.2.5 on 2021-07-16 14:56

import colorfield.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0007_auto_20210716_1428'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag',
            name='color',
            field=colorfield.fields.ColorField(default='#FF0000', max_length=18),
        ),
    ]