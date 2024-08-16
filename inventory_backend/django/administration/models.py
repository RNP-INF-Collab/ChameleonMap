from django.db import models
from django.db.models.deletion import SET_NULL
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.fields import BooleanField, IntegerField, PositiveIntegerField
from django.db.models.fields.related import ManyToManyField, OneToOneField
from colorfield.fields import ColorField
from tinymce.models import HTMLField
# from django import forms

class Menu(models.Model):
    name = models.CharField(max_length=50)
    hierarchy_level = models.IntegerField(default=0, help_text="Menus with the same number are considered siblings. Menus with lower numbers are considered parents of the ones with higher numbers. For example, a menu with the number 0 is considered parent of menus with the number 1.")
    active = models.BooleanField(default=True)

    class Meta:
        db_table = 'menu'
        ordering = ['hierarchy_level']
        verbose_name_plural = "    Menus" 

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50)
    related_tags = models.ManyToManyField('Tag', blank=True, through='Tag_relationship')
    related_locations = models.ManyToManyField('Location', blank=True)
    parent_menu = models.ForeignKey('Menu', null=True, on_delete=models.SET_NULL)
    color = ColorField(default='#FF0000')
    description = HTMLField(null=True, blank=SET_NULL, verbose_name="Popup content")
    sidebar_content = HTMLField(help_text="<b style='font-size: 0.85rem'>* Leave blank to use default template</b>", null=True, blank=SET_NULL)
    overlayed_popup_content = HTMLField(help_text="<b style='font-size: 0.85rem'>* This text will be displayed on 'show more info' popup</b>", null=True, blank=SET_NULL)
    active = models.BooleanField(default=True)

    class Meta:
        db_table = 'tag'
        ordering = ['name']
        verbose_name_plural = "  Tags" 

    def __str__(self):
        return self.name

class Tag_relationship(models.Model):
    child_tag = models.ForeignKey('Tag', null=True, on_delete=models.CASCADE, related_name="child_tag")
    parent_tag = models.ForeignKey('Tag', null=True, on_delete=models.CASCADE, related_name="parent_tag")
    cluster_id = IntegerField(null=True, blank=SET_NULL, default=1, 
        help_text="Tag clusters are group of parent tags from the tag. To a cluster id be active, all tags in that id must be active. The child tag will be active if at least one of the cluster ids is active.")

    class Meta:
        verbose_name = "Tag to tag relation"
        verbose_name_plural = "Tag to tag relationships"
        db_table = 'tag_relationship'
        ordering = ['child_tag']

    def __str__(self):
        return self.child_tag.name + '_' + self.parent_tag.name + '_relation'

class Location(models.Model):
    name = models.CharField(max_length=50)
    description = HTMLField(null=True, blank=SET_NULL)
    latitude = models.DecimalField(max_digits=24, decimal_places=20, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.DecimalField(max_digits=24, decimal_places=20, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    overlayed_popup_content = HTMLField(help_text="<b style='font-size: 0.85rem'>* This text will be displayed on 'show more info' popup</b>", null=True, blank=SET_NULL)
    # overlayed_popup_content = HTMLField(help_text="<b style='font-size: 0.85rem'>* This text will be displayed on 'show more info' popup</b>", null=True, blank=SET_NULL, widget=forms.Textarea(attrs={'rows':5, 'cols':50}))
    active = models.BooleanField(default=True)
    class Meta:
        db_table = 'location'
        ordering = ['name']
        verbose_name_plural = "   Locations" 

    def __str__(self):
        return self.name

class Links_group(models.Model):
    name = models.CharField(max_length=25)
    links_color = ColorField(default='#FF0000')
    opacity = models.DecimalField(default=0.6, max_digits=4, decimal_places=3, validators=[MinValueValidator(0), MaxValueValidator(1)],    help_text="Opacity of the link. Min(0)-Max(1)")
    sidebar_content = HTMLField(null=True, blank=SET_NULL)
    class Meta:
        ordering = ['name']
        verbose_name = "Links group"
        verbose_name_plural = "Links groups"
        db_table = 'links_group'

    def __str__(self):
        return self.name

class Link(models.Model):
    display_name = models.CharField(max_length=25)
    popup_description = HTMLField(null=True, blank=SET_NULL)
    curvature = models.DecimalField(default=2.0, max_digits=4, decimal_places=3, validators=[MinValueValidator(1), MaxValueValidator(4)],
    help_text="This field controls how curved the link will appear in the front-end. The higher the number, the less the link will be curved. Min(1)-Max(4). Accept decimal values.")
    location_1 = models.ForeignKey('Location', null=True, on_delete=models.CASCADE, related_name="location_1")
    location_2 = models.ForeignKey('Location', null=True, on_delete=models.CASCADE, related_name="location_2")
    links_group = models.ForeignKey('Links_group', null=True, on_delete=models.SET_NULL)
    invert_link = models.BooleanField(default=False, help_text="This field, when active, will invert the curvature of the link.")
    dashed = models.BooleanField(default=False, help_text="This field, when active, will make the link stroke dashed.")
    class Meta:
        db_table = 'link'

class Map_configuration(models.Model):
    map_name = models.CharField(max_length=25)
    map_style = models.CharField(
        max_length=15,
        choices = [("d","Default (gray colored)"), ("b","Blue colored")],
        default="Default (gray colored)",
    )
    inherit_children_tag_locations = BooleanField(
        default=False, 
        help_text="When this field is enabled, a tag that is parent from another tags will inherit all locations from the children that was not previously declared on the parent. If instead you want to manually declare the locations for all tags, we suggest to keep this field disabled.",
    )
    cluster_close_tags = BooleanField(
        default=True, 
        help_text="When this field is enabled, tags located very close to each other will be grouped in clusters.",
    )
    initial_zoom_level = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(13)], help_text="Please insert a value from 0 to 13 (max zoom).")
    initial_latitude = models.DecimalField(max_digits=24, decimal_places=20, default=0.000, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    initial_longitude = models.DecimalField(max_digits=24, decimal_places=20, default=0.000, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    link_feature = BooleanField(
        default=False, 
        help_text="When this field is enabled, the link feature will be displayed on the front-end.",
    )
    
    class Meta:
        verbose_name = "Map Settings"
        verbose_name_plural = "Map Settings"
        db_table = 'map_config'

    def __str__(self):
            return "'"+self.map_name + "' Map Settings"
