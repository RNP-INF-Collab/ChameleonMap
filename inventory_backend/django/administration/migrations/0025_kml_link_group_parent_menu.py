# Generated by Django 3.2.25 on 2024-10-01 16:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0024_kml_link_group'),
    ]

    operations = [
        migrations.AddField(
            model_name='kml_link_group',
            name='parent_menu',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='administration.menu'),
        ),
    ]