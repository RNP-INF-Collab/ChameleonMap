from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from tenant_users.tenants.tasks import provision_tenant
from clients.models import Client, Domain, TenantUser
from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist
    
@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name','owner',)
    def save_model(self, request, obj, form, change):
        try: # Schema already exists, then edit
            existentClient = Client.objects.get(schema_name=obj.schema_name)
            existentClient.slug = obj.slug
            existentClient.owner = obj.owner
            existentClient.name = obj.name
            existentClient.tenancytype = obj.tenancytype
            existentClient.save()
        except ObjectDoesNotExist: # Else create schema
            tenant, domain = provision_tenant(obj.name, obj.slug, obj.owner, is_staff=True, schema_name = obj.schema_name, tenant_type=obj.tenancytype)

@admin.register(Domain)
class DomainAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('domain','tenant',)
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(TenantUser)
class DomainAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('email','name',)
    exclude = ('password',)