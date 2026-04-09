from rest_framework import serializers
from .models import *

class TitleTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TitleTranslation
        fields = ['language_code', 'name']
        
class MenuGroupSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()
    
    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
        return TitleTranslationSerializer(querrySet, many=True).data
    
    class Meta:
        model = MenuGroup
        fields = ['id', 'name', 'simultaneous_context', 'translations']
        
class MenuSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()
    
    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
        return TitleTranslationSerializer(querrySet, many=True).data
    
    class Meta:
        model = Menu
        fields = ['id', 'name', 'group', 'hierarchy_level', 'active', 'translations']

class TagSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()

    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
        return TitleTranslationSerializer(querrySet, many=True).data
    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'color', 'active', 'parent_menu', 'related_locations', 'sidebar_content', 'overlayed_popup_content', 'translations']

class LocationSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()

    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
    class Meta:
        model = Location
        fields = '__all__'

class Tag_relationshipSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag_relationship
        fields = '__all__'

class LinkSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()

    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
    class Meta:
        model = Link
        fields = '__all__'

class Links_groupSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()

    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
    class Meta:
        model = Links_group
        fields = '__all__'

class Kml_shapeSerializer(serializers.ModelSerializer):
    translations = serializers.SerializerMethodField()

    def get_translations(self, obj):
        content_type = ContentType.objects.get_for_model(obj)
        querrySet = TitleTranslation.objects.filter(
            content_type = content_type,
            object_id = obj.id
        )
        
    class Meta:
        model = Kml_shape
        fields = '__all__'

class Map_configurationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Map_configuration
        fields = '__all__'