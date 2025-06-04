from django.contrib.auth import views as auth_views
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from administration.views import *
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'Map Administration'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)