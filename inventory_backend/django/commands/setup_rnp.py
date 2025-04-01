from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime

from clients.models import Client, Domain
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Cria tenant e usuário para RNP, caso ainda não existam."

    def handle(self, *args, **options):
        # 1. Cria o tenant (schema rnp) se não existir
        if not Client.objects.filter(schema_name='rnp').exists():
            tenant = Client(
                schema_name='rnp',
                name='RNP',
                paid_until=timezone.now() + datetime.timedelta(days=30),
                on_trial=True
            )
            tenant.save()  # Isso cria o schema "rnp" no banco

            domain = Domain()
            domain.domain = 'rnp.chameleon-map.com.br'
            domain.tenant = tenant
            domain.is_primary = True
            domain.save()

            self.stdout.write(self.style.SUCCESS("Tenant 'rnp' criado com sucesso!"))
        else:
            self.stdout.write(self.style.WARNING("Tenant 'rnp' já existe."))

        # 2. Criar usuário 'rnp' dentro do schema rnp, SE 'django.contrib.auth' estiver em TENANT_APPS
        with schema_context('rnp'):
            UserModel = get_user_model()
            if not UserModel.objects.filter(username='rnp').exists():
                # Cria como superusuário. Email vazio é só um placeholder
                UserModel.objects.create_superuser(username='rnp', email='', password='rnp')
                self.stdout.write(self.style.SUCCESS("Usuário 'rnp' criado no tenant 'rnp'"))
            else:
                self.stdout.write(self.style.WARNING("Usuário 'rnp' já existe no tenant 'rnp'"))
