from django.contrib import admin
from administration.models import *
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.apps import UnfoldAdminSite
from django.contrib.contenttypes.admin import GenericTabularInline
from django.template.response import TemplateResponse
from django.urls import path
from django.shortcuts import redirect
from tools.views import createTranslationsForAllTitles
from django.contrib import messages

class TenantAdminSite(UnfoldAdminSite):
    site_header = "ChameleonMap Admin"
    site_title = "ChameleonMap Portal"
    index_title = "Welcome to ChameleonMap Admin Portal"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "generate-translations/",
                self.admin_view(self.generate_translations_view),
                name="generate_translations",
            ),
        ]
        return custom_urls + urls

    def generate_translations_view(self, request):
        if request.method == "POST":
            targetLanguage = request.POST.get("targetLanguage")
            try:
                createTranslationsForAllTitles(targetLanguage)
                messages.success(request, f"Translations generated successfully for: {LanguageCode(targetLanguage).label}")
            except Exception as e:
                messages.error(request, f"Error generating translations: {str(e)}")
            return redirect("tenant_admin:generate_translations")

        context = dict(self.each_context(request))
        return TemplateResponse(request, "admin/generate_translations.html", context)
    
tenant_admin_site = TenantAdminSite(name='tenant_admin')

class TitleTranslationInline(GenericTabularInline):
    model = TitleTranslation
    extra = 0
    fields = ['language_code', 'name']
    collapsible = True
    class Media:
        js = ('admin/js/autofill-translation.js',)

    def get_formset(self, request, obj=None, **kwargs):
        formset_class = super().get_formset(request, obj, **kwargs)

        if obj is not None:
            existing_langs = set(
                TitleTranslation.objects.filter(
                    content_type=ContentType.objects.get_for_model(obj),
                    object_id=obj.pk
                ).values_list('language_code', flat=True)
            )
            
            default_language = Map_configuration.objects.first().default_content_language
            all_choices = list(LanguageCode.choices)
            available_choices = [
                (code, label)
                for code, label in all_choices
                if code not in existing_langs and code != default_language
            ]

            OriginalForm = formset_class.form

            class PatchedForm(OriginalForm):
                def __init__(self_form, *args, **kwargs):
                    super().__init__(*args, **kwargs)
                    if not self_form.instance.pk:
                        self_form.fields['language_code'].choices = [('', '---------')] + available_choices
                        self_form.fields['language_code'].initial = ''
            formset_class.form = PatchedForm

        return formset_class            
    
@admin.register(MenuGroup, site=tenant_admin_site)    
class MenuGroupAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name",)
    compressed_fields = True
   
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)        
      
@admin.register(Menu, site=tenant_admin_site)
class MenuAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name", "group", "hierarchy_level", "active")
    list_filter = ("hierarchy_level",)
    search_fields = ['name']
    
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)

@admin.register(Location, site=tenant_admin_site)          
class LocationAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name", "latitude", "longitude", "active")
    search_fields = ['name']
    
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)

class Tag_relationshipInline(admin.TabularInline):
    model = Tag_relationship
    fk_name = "child_tag"
    search_fields = ['name']

@admin.register(Tag, site=tenant_admin_site)
class TagAdmin(ModelAdmin):
    inlines = [
        Tag_relationshipInline,
        TitleTranslationInline
    ]
    list_display = ("name", "parent_menu", "active")
    filter_horizontal = ('related_locations',)
    list_filter = ("parent_menu",)
    search_fields = ['name']
    
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)

@admin.register(Link, site=tenant_admin_site)
class LinkAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("display_name", "location_1", "location_2", "links_group")
    list_filter = ("links_group",)
    search_fields = ['display_name']
    
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)

@admin.register(Links_group, site=tenant_admin_site)
class Links_groupAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name",)
    list_filter = ("name",)
    search_fields = ['name']
    
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)

@admin.register(Kml_shape, site=tenant_admin_site)
class Kml_shapeAdmin(ModelAdmin):
    inlines = [TitleTranslationInline]
    list_display = ("name",)
    list_filter = ("name",)
    search_fields = ['name']
    
    class Media:
        js = ('admin/js/conditional_translation_inlines.js',)

@admin.register(Map_configuration, site=tenant_admin_site)
class Map_configurationAdmin(ModelAdmin):
    model = Map_configuration
    filter_horizontal = ('automatic_translation_languages',)
    compressed_fields = True
    def edit(self, obj):
        return format_html("<script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script><a class='fas fa-edit' href='/admin/administration/map_configuration/{}/change/'></a>", obj.id)

    list_display = ('__str__', 'edit')

    def has_delete_permission(self, request, obj=None): 
        return False
    def has_add_permission(self, request, obj=None): 
        return False
