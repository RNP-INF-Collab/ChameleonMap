from administration.admin import tenant_admin_site
from django.urls import include, path
from rest_framework import routers
from administration.views import *
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

router = routers.DefaultRouter()
router.register(
    'menugroup', MenuGroupViewSet
)

router.register(
    'menu', MenuViewSet
)
router.register(
    'tag', TagViewSet
)
router.register(
    'location', LocationViewSet
)
router.register(
    'link', LinkViewSet
)
router.register(
    'linksgroup', Links_groupViewSet
)
router.register(
    'kmlshape', Kml_shapeViewSet
)
router.register(
    'tagrelationship', Tag_relationshipViewSet
)
router.register(
    'settings', Map_configurationViewSet
)


urlpatterns = [
    path('admin/', tenant_admin_site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('', include(router.urls)),
    path('import/', include("importer.urls")),
    path('atlas/', include("atlas_builder.urls")),
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)