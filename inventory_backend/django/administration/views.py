from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from .serializers import *

class MenuViewSet(viewsets.ModelViewSet):
    serializer_class = MenuSerializer
    queryset = Menu.objects.all()

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    queryset = Tag.objects.all()

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    queryset = Location.objects.all()

class LinkViewSet(viewsets.ModelViewSet):
    serializer_class = LinkSerializer
    queryset = Link.objects.all()

class Links_groupViewSet(viewsets.ModelViewSet):

    serializer_class = Links_groupSerializer
    queryset = Links_group.objects.all()

class Tag_relationshipViewSet(viewsets.ModelViewSet):
    serializer_class = Tag_relationshipSerializer
    queryset = Tag_relationship.objects.all()

class Map_configurationViewSet(viewsets.ModelViewSet):
    serializer_class = Map_configurationSerializer
    queryset = Map_configuration.objects.all()
