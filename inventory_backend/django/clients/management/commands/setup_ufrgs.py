from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime

from clients.models import Client, Domain
from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Cria tenant e superusuário para UFRGS."

    def handle(self, *args, **options):
        # 1. Cria o tenant 'ufrgs' se ele ainda não existir
        if not Client.objects.filter(schema_name='ufrgs').exists():
            tenant = Client(
                schema_name='ufrgs',  # Nome do schema no PostgreSQL
                name='UFRGS',
                paid_until=timezone.now() + datetime.timedelta(days=30),
                on_trial=True
            )
            tenant.save()  # Isso automaticamente cria o schema 'ufrgs'

            domain = Domain()
            domain.domain = 'ufrgs.chameleon-map.com.br'
            domain.tenant = tenant
            domain.is_primary = False  # ou True, se preferir
            domain.save()

            self.stdout.write(self.style.SUCCESS("Tenant 'ufrgs' criado com sucesso!"))
        else:
            self.stdout.write(self.style.WARNING("Tenant 'ufrgs' já existe."))

        # 2. Cria usuário 'ufrgs' dentro do tenant 'ufrgs', se ainda não existir
        with schema_context('ufrgs'):
            UserModel = get_user_model()
            if not UserModel.objects.filter(username='ufrgs').exists():
                # Criando como superusuário
                UserModel.objects.create_superuser(username='ufrgs', email='', password='ufrgs')
                self.stdout.write(self.style.SUCCESS("Usuário 'ufrgs' criado no tenant 'ufrgs'"))
            else:
                self.stdout.write(self.style.WARNING("Usuário 'ufrgs' já existe no tenant 'ufrgs'"))
