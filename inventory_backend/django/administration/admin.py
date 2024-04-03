from django.contrib import admin
from .models import *
from django.utils.html import format_html

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ("name", "hierarchy_level", "active")
    list_filter = ("hierarchy_level",)
    search_fields = ['name']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "latitude", "longitude", "active")
    search_fields = ['name']

class Tag_relationshipInline(admin.TabularInline):
    model = Tag_relationship
    fk_name = "child_tag"
    search_fields = ['name']

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    inlines = [
        Tag_relationshipInline,
    ]
    list_display = ("name", "parent_menu", "active")
    filter_horizontal = ('related_locations',)
    list_filter = ("parent_menu",)
    search_fields = ['name']

@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ("display_name", "location_1", "location_2", "links_group")
    list_filter = ("links_group",)
    search_fields = ['display_name']

@admin.register(Links_group)
class Links_groupAdmin(admin.ModelAdmin):
    list_display = ("name",)
    list_filter = ("name",)
    search_fields = ['name']

@admin.register(Map_configuration)
class Map_configurationAdmin(admin.ModelAdmin):
    model = Map_configuration

    def edit(self, obj):
        return format_html("<script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script><a class='fas fa-edit' href='/admin/administration/map_configuration/{}/change/'></a>", obj.id)

    list_display = ('__str__', 'edit')

    def has_delete_permission(self, request, obj=None): 
        return False
    def has_add_permission(self, request, obj=None): 
        return False