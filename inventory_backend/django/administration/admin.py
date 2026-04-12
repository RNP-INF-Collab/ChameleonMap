from django.contrib import admin
from administration.models import *
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.apps import UnfoldAdminSite
from django.contrib.contenttypes.admin import GenericTabularInline

class TenantAdminSite(UnfoldAdminSite):
    site_header = "ChameleonMap Admin"
    site_title = "ChameleonMap Portal"
    index_title = "Welcome to ChameleonMap Admin Portal"
tenant_admin_site = TenantAdminSite(name='tenant_admin')

class TitleTranslationInline(GenericTabularInline):
    model = TitleTranslation
    extra = 0
    fields = ['language_code', 'name']            
    
class MenuGroupAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name",)
tenant_admin_site.register(MenuGroup, admin_class=MenuGroupAdmin)
        

class MenuAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name", "group", "hierarchy_level", "active")
    list_filter = ("hierarchy_level",)
    search_fields = ['name']
tenant_admin_site.register(Menu, admin_class=MenuAdmin)

class LocationAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name", "latitude", "longitude", "active")
    search_fields = ['name']
tenant_admin_site.register(Location, admin_class=LocationAdmin)

class Tag_relationshipInline(admin.TabularInline):
    model = Tag_relationship
    fk_name = "child_tag"
    search_fields = ['name']

class TagAdmin(ModelAdmin):
    inlines = [
        Tag_relationshipInline,
        TitleTranslationInline
    ]
    list_display = ("name", "parent_menu", "active")
    filter_horizontal = ('related_locations',)
    list_filter = ("parent_menu",)
    search_fields = ['name']
tenant_admin_site.register(Tag, admin_class=TagAdmin)


class LinkAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("display_name", "location_1", "location_2", "links_group")
    list_filter = ("links_group",)
    search_fields = ['display_name']
tenant_admin_site.register(Link, admin_class=LinkAdmin)

class Links_groupAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name",)
    list_filter = ("name",)
    search_fields = ['name']
tenant_admin_site.register(Links_group, admin_class=Links_groupAdmin)

class Kml_shapeAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name",)
    list_filter = ("name",)
    search_fields = ['name']
tenant_admin_site.register(Kml_shape, admin_class=Kml_shapeAdmin)

class Map_configurationAdmin(ModelAdmin):
    model = Map_configuration

    def edit(self, obj):
        return format_html("<script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script><a class='fas fa-edit' href='/admin/administration/map_configuration/{}/change/'></a>", obj.id)

    list_display = ('__str__', 'edit')

    def has_delete_permission(self, request, obj=None): 
        return False
    def has_add_permission(self, request, obj=None): 
        return False
tenant_admin_site.register(Map_configuration, admin_class=ModelAdmin)
