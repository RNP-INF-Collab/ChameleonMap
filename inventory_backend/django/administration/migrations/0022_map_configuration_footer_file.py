# Generated by Django 3.2.20 on 2024-07-22 16:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0021_auto_20240510_2157'),
    ]

    operations = [
        migrations.AddField(
            model_name='map_configuration',
            name='footer_file',
            field=models.FileField(blank=True, help_text='Upload a custom footer file.', upload_to='uploads/'),
        ),
    ]
