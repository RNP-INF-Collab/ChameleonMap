# Generated by Django 3.2.25 on 2024-11-05 16:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0028_auto_20241016_1752'),
    ]

    operations = [
        migrations.AddField(
            model_name='menugroup',
            name='simultaneous_context',
            field=models.BooleanField(default=False, help_text='When checked, this menu group context will remain active even when other menu groups are seleceted.'),
        ),
    ]
