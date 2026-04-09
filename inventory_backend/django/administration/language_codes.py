from django.db import models

class LanguageCode(models.TextChoices):
    PORTUGUESE_BR = 'pt-BR', '🇧🇷 Portuguese'
    ENGLISH = 'en-US', '🇺🇸 English'
    SPANISH = 'es', '🇪🇸 Español'
    GERMAN = 'de', '🇩🇪 Deutsch'
    KOREAN = 'ko', '🇰🇷 한국어'

