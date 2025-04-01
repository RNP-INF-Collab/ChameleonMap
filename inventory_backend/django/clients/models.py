from django_tenants.models import TenantMixin, DomainMixin
from django.db import models

class Client(TenantMixin):
    name = models.CharField(max_length=100)
    paid_until = models.DateField()
    on_trial = models.BooleanField(default=True)
    created_on = models.DateField(auto_now_add=True)

    # Possivel adicionar campos extras necessários
    # no TenantMixin (ex: endereço, plano, etc.)

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass
    # O DomainMixin já possui os campos:
    #   domain : (ex: 'meusite.com')
    #   tenant : relação com Client
    #   is_primary : bool
    #
    # Possivel adicionar mais campos caso precise
