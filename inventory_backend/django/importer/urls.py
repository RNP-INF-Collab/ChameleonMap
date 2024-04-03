from django.urls import path
from .views import index, netbox, replace

urlpatterns = [
    path('', index),
    path('netbox/', netbox),
    path('replace/', replace)
]
