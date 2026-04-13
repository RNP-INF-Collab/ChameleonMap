from django.urls import path
from . import views

urlpatterns = [
    path("translate/", views.translateText2, name="translate")
]
