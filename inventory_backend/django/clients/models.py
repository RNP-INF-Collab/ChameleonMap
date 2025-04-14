from django_tenants.models import TenantMixin, DomainMixin
from django.db import models
from tenant_users.tenants.models import TenantBase
from tenant_users.tenants.models import UserProfile

class Client(TenantBase):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)
    tenancytype = models.CharField(max_length=100, choices=[
        ('public', 'Public'),
        ('scoped', 'Scoped'),
        ('root', 'Root'),
    ], default='scoped')

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass
    # O DomainMixin já possui os campos:
    #   domain : (ex: 'meusite.com')
    #   tenant : relação com Client
    #   is_primary : bool

class TenantUser(UserProfile):
    name = models.CharField(max_length=100)