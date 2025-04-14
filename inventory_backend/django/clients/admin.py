from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from tenant_users.tenants.tasks import provision_tenant
from clients.models import Client, Domain, TenantUser
from django.conf import settings

from django.contrib import admin
    
@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name','owner',)
    def save_model(self, request, obj, form, change):
        # raise Exception(obj)
        # if (not change): return
        tenant, domain = provision_tenant(obj.name, obj.slug, obj.owner, is_staff=True, schema_name = obj.schema_name, tenant_type=obj.tenancytype)
        return

@admin.register(Domain)
class DomainAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('domain','tenant',)

@admin.register(TenantUser)
class DomainAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('email','name',)
    exclude = ('password',)