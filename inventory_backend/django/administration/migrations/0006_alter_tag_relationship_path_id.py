# Generated by Django 3.2.5 on 2021-07-16 14:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0005_auto_20210716_1408'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag_relationship',
            name='path_id',
            field=models.IntegerField(blank=django.db.models.deletion.SET_NULL, null=True),
        ),
    ]
