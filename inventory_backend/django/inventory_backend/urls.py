from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from administration.views import *
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Map Administration'

urlpatterns = [
    path('admin/', admin.site.urls),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)