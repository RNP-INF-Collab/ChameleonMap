from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from tenant_users.tenants.tasks import provision_tenant
from clients.models import Client, Domain, TenantUser
from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist
from django_tenants.utils import tenant_context
from tenant_users.permissions.models import UserTenantPermissions

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
class TenantUserAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('email','name',)
    exclude = ('password',)
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        grant_privileges(obj)

# Tenant-users only allow logins in the admin from staff users
# This function add this permission by default to all related tenants
def grant_privileges(user_obj):
    tenants = list(user_obj.tenants.all())
    user_obj.tenants.clear()
    for tenant in tenants:
            with tenant_context(tenant):
                UserTenantPermissions.objects.create(
                    profile=user_obj,
                    is_staff=True,
                    is_superuser=True,
                )
                user_obj.tenants.add(tenant)
                user_obj.save()

@admin.register(UserTenantPermissions)
class UserTenantPermissionsAdmin(TenantAdminMixin, admin.ModelAdmin):
    pass