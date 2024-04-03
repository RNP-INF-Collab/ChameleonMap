from rest_framework import serializers
from .models import *


class MenuSerializer(serializers.ModelSerializer):

    class Meta:
        model = Menu
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'color', 'active', 'parent_menu', 'related_locations', 'sidebar_content', 'overlayed_popup_content']

class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = '__all__'

class Tag_relationshipSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag_relationship
        fields = '__all__'

class LinkSerializer(serializers.ModelSerializer):

    class Meta:
        model = Link
        fields = '__all__'

class Links_groupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Links_group
        fields = '__all__'

class Map_configurationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Map_configuration
        fields = '__all__'