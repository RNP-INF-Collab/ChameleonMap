from unfold.admin import ModelAdmin
from administration.admin_inlines import TitleTranslationInline

class TranslatableModelAdmin(ModelAdmin):
    inlines = []

    def get_inlines(self, request, obj=None):
        return self.inlines + [TitleTranslationInline]
    
    class Media():
        js = ('admin/js/conditional_translation_inlines.js',) 
    