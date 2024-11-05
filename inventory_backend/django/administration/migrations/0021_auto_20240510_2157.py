# Generated by Django 3.2.25 on 2024-05-10 21:57

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0020_auto_20230228_2032'),
    ]

    operations = [
        migrations.CreateModel(
            name='MenuGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=25)),
            ],
            options={
                'verbose_name_plural': '    Menu Groups',
                'db_table': 'menugroup',
            },
        ),
        migrations.AlterField(
            model_name='link',
            name='curvature',
            field=models.DecimalField(decimal_places=3, default=2.0, help_text='This field controls how curved the link will appear in the front-end. The higher the number, the less the link will be curved. Min(1)-Max(4). Accept decimal values.', max_digits=4, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(4)]),
        ),
        migrations.AlterField(
            model_name='links_group',
            name='opacity',
            field=models.DecimalField(decimal_places=3, default=0.6, help_text='Opacity of the link. Min(0)-Max(1)', max_digits=4, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(1)]),
        ),
        migrations.AddField(
            model_name='menu',
            name='group',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='administration.menugroup'),
        ),
    ]
