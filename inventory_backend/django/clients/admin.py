from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from tenant_users.tenants.tasks import provision_tenant
from clients.models import Client, Domain, TenantUser
from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django_tenants.utils import tenant_context
from tenant_users.permissions.models import UserTenantPermissions
from unfold.admin import ModelAdmin
from django import forms

class TenantUserForm(forms.ModelForm):
    class Meta:
        model = TenantUser
        fields = '__all__'
    
    def clean_tenants(self):
        tenants = self.cleaned_data.get('tenants')
        user = self.instance
        
        # Only validate if user already exists (editing, not creating)
        if user.pk:
            # Get tenants where this user is owner
            owned_tenants = Client.objects.filter(owner=user)
            
            # Check if any owned tenant is being removed
            if owned_tenants.exists():
                for owned_tenant in owned_tenants:
                    if owned_tenant not in tenants:
                        raise ValidationError(
                            f'Cannot remove tenant "{owned_tenant.name}" because this user is the owner. '
                            f'Please change the owner first before removing access.'
                        )
        
        return tenants

@admin.register(Client)
class ClientAdmin(TenantAdminMixin, ModelAdmin):
    list_display = ('name', 'owner',)
    fields = ['name', 'slug', 'schema_name', 'owner', 'tenancytype']
    def save_model(self, request, obj, form, change):
        try: # Schema already exists, then edit
            existentClient = Client.objects.get(schema_name=obj.schema_name)
            old_owner = existentClient.owner
            existentClient.slug = obj.slug
            existentClient.owner = obj.owner
            existentClient.name = obj.name
            existentClient.tenancytype = obj.tenancytype
            existentClient.save()
            
            # Sync the many-to-many relationship and permissions if owner changed
            if old_owner != obj.owner:
                # Remove tenant from old owner's tenants
                if old_owner:
                    old_owner.tenants.remove(existentClient)
                    # Remove old owner's permissions from tenant schema
                    with tenant_context(existentClient):
                        UserTenantPermissions.objects.filter(profile=old_owner).delete()
                
                # Add tenant to new owner's tenants
                if obj.owner:
                    obj.owner.tenants.add(existentClient)
                    # Create/update new owner's permissions in tenant schema
                    with tenant_context(existentClient):
                        UserTenantPermissions.objects.update_or_create(
                            profile=obj.owner,
                            defaults={
                                'is_staff': True,
                                'is_superuser': True,
                            }
                        )
        except ObjectDoesNotExist: # Else create schema
            tenant, domain = provision_tenant(obj.name, obj.slug, obj.owner, is_staff=True, schema_name = obj.schema_name, tenant_type=obj.tenancytype)

@admin.register(Domain)
class DomainAdmin(TenantAdminMixin, ModelAdmin):
    list_display = ('domain','tenant',)
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(TenantUser)
class TenantUserAdmin(TenantAdminMixin, ModelAdmin):
    form = TenantUserForm
    list_display = ('email','name',)
    exclude = ('password',)
    def save_model(self, request, obj, form, change):
        # Get tenants where this user is owner (must always be included)
        # Only check if user already exists
        if obj.pk:
            owned_tenants = Client.objects.filter(owner=obj)
        else:
            owned_tenants = []
        
        super().save_model(request, obj, form, change)
        
        # Ensure owned tenants are always in the user's tenants
        for tenant in owned_tenants:
            if tenant not in obj.tenants.all():
                obj.tenants.add(tenant)
        
        grant_privileges(obj)

# Tenant-users only allow logins in the admin from staff users
# This function add this permission by default to all related tenants
def grant_privileges(user_obj):
    tenants = list(user_obj.tenants.all())
    user_obj.tenants.clear()
    for tenant in tenants:
        with tenant_context(tenant):
            perm, created = UserTenantPermissions.objects.get_or_create(
                profile=user_obj,
                defaults={
                    'is_staff': True,
                    'is_superuser': True,
                }
            )
            if not created:
                perm.is_staff = True
                perm.is_superuser = True
                perm.save()
            user_obj.tenants.add(tenant)
            user_obj.save()

@admin.register(UserTenantPermissions)
class UserTenantPermissionsAdmin(TenantAdminMixin, ModelAdmin):
    pass