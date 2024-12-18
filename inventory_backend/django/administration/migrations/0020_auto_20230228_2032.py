# Generated by Django 3.2.18 on 2023-02-28 20:32

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0019_auto_20221007_1355'),
    ]

    operations = [
        migrations.AddField(
            model_name='link',
            name='curvature',
            field=models.DecimalField(decimal_places=3, default=2.0, help_text='This field controls how curved the link will appear in the front-end. The higher the number, the less the link will be curved. Min(1)-Max(4). Accept decimal values.', max_digits=10, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(4)]),
        ),
        migrations.AddField(
            model_name='link',
            name='invert_link',
            field=models.BooleanField(default=False, help_text='This field, when active, will invert the curvature of the link.'),
        ),
        migrations.AddField(
            model_name='links_group',
            name='opacity',
            field=models.DecimalField(decimal_places=3, default=0.6, help_text='Opacity of the link. Min(0)-Max(1)', max_digits=10, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(1)]),
        ),
        migrations.AddField(
            model_name='location',
            name='overlayed_popup_content',
            field=tinymce.models.HTMLField(blank=django.db.models.deletion.SET_NULL, help_text="<b style='font-size: 0.85rem'>* This text will be displayed on 'show more info' popup</b>", null=True),
        ),
        migrations.AddField(
            model_name='map_configuration',
            name='link_feature',
            field=models.BooleanField(default=False, help_text='When this field is enabled, the link feature will be displayed on the front-end.'),
        ),
        migrations.AddField(
            model_name='tag',
            name='overlayed_popup_content',
            field=tinymce.models.HTMLField(blank=django.db.models.deletion.SET_NULL, help_text="<b style='font-size: 0.85rem'>* This text will be displayed on 'show more info' popup</b>", null=True),
        ),
    ]
