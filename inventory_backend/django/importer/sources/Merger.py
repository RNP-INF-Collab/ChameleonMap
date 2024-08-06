from administration.models import *
from django.core import serializers
import json
from importer.models import *

# Serialize from query object to python object
def serial(input):
    string = serializers.serialize('json', [ input, ])
    obj = json.loads(string)
    obj[0]["fields"]["id"] = obj[0]["pk"]
    return obj[0]["fields"]

def requestAll(storedData):
    #Menu request
    auxiliar = []
    auxiliar.append(list(Menu.objects.all()))
    auxiliar = auxiliar[0]
    for storedMenu in auxiliar:
        menu = serial(storedMenu)
        storedData.menus.append(MenusType(menu['id'], menu['name'], menu['hierarchy_level'], menu['active']))
    #Location request
    auxiliar = []
    auxiliar.append(list(Location.objects.all()))
    auxiliar = auxiliar[0]
    for storedLocation in auxiliar:
        location = serial(storedLocation)
        storedData.locations.append(LocationsType(location['id'], location['name'], location['description'], location['latitude'], location['longitude'], location['active'], location['atlas_feature_active']))
    #Tag request
    auxiliar = []
    auxiliar.append(list(Tag.objects.all()))
    auxiliar = auxiliar[0]
    for storedTag in auxiliar:
        tag = serial(storedTag)
        storedData.tags.append(TagsType(tag['id'], tag['name'], tag['parent_menu'], tag['color'].lower(), tag['description'], tag['sidebar_content'], tag['related_locations'], tag['active']))

    return storedData

def isMenuEqual(menu1, menu2):
    return menu1.name == menu2.name and menu1.hierarchy_level == menu2.hierarchy_level and menu1.active == menu2.active

def filterMenus(importedData, storedData, menusDiff):
    #added/edited menus
    menusToBeRemoved = []
    for importedMenu in importedData.menus:
        found = False
        for storedMenu in storedData.menus:
            if (importedMenu.name == storedMenu.name):
                found = True
                if (not isMenuEqual(importedMenu, storedMenu)):
                    newEditedMenu = EditedMenusType(storedMenu, importedMenu)
                    menusDiff.edited.append(newEditedMenu)
                if(storedMenu not in menusToBeRemoved):
                    menusToBeRemoved.append(storedMenu)
        if(not found):
            menusDiff.added.append(importedMenu)
    
    for menu in menusToBeRemoved:
        storedData.menus.remove(menu)

    # menus which still lasted are removed menus
    for menu in storedData.menus:
        menusDiff.removed.append((menu))

    return storedData, menusDiff

def isLocationEqual(location1, location2):
    DELTA_MAX = 0.000001 # latitude/longitude values below delta are not considered 

    if(location1.name == location2.name):
        lat_delta = abs(float(location1.latitude) - float(location2.latitude))
        if(lat_delta <= DELTA_MAX):
            long_delta = abs(float(location1.longitude) - float(location2.longitude))
            if(long_delta <= DELTA_MAX):
                if(location1.description == location2.description):
                    return True
    return False

def filterLocations(importedData, storedData, locationsDiff):
    #added/edited locations
    locationsToBeRemoved = []
    for importedLocation in importedData.locations:
        found = False
        for storedLocation in storedData.locations:
            if (importedLocation.name == storedLocation.name):
                found = True
                if (not isLocationEqual(importedLocation, storedLocation)):
                    newEditedLocation = EditedLocationsType(storedLocation, importedLocation)
                    locationsDiff.edited.append(newEditedLocation)
                if(storedLocation not in locationsToBeRemoved):
                    locationsToBeRemoved.append(storedLocation)
        if(not found):
            locationsDiff.added.append(importedLocation)
    
    for location in locationsToBeRemoved:
        storedData.locations.remove(location)

    # locations which still lasted are removed locations
    for location in storedData.locations:
        locationsDiff.removed.append((location))

    return storedData, locationsDiff

def isTagEqual(tag1, tag2):
    #NOT CONSIDERING SIDEBARCONTENT
    if(tag1.name == tag2.name):
        if(set(tag1.related_locations) == set(tag2.related_locations)):
            if(tag1.parent_menu == tag2.parent_menu):
                if(tag1.color == tag2.color):
                    if(tag1.description == tag2.description): 
                        return True
    return False

def filterTags(importedData, storedData, tagsDiff):      # Padronizar com Menus
    #added/edited tags
    tagsToBeRemoved = []
    for importedTag in importedData.tags:
        found = False
        for storedTag in storedData.tags:
            if (importedTag.name == storedTag.name):
                found = True
                if (not isTagEqual(importedTag, storedTag)):
                    newEditedTag = EditedTagsType(storedTag, importedTag)
                    importedTag.related_locations.sort()
                    storedTag.related_locations.sort()
                    tagsDiff.edited.append(newEditedTag)
                if(storedTag not in tagsToBeRemoved):
                    tagsToBeRemoved.append(storedTag)
        if(not found):
            tagsDiff.added.append(importedTag)
    
    for tag in tagsToBeRemoved:
        storedData.tags.remove(tag)

    # tags which still lasted are removed tags
    for tag in storedData.tags:
        tagsDiff.removed.append((tag))

    return storedData, tagsDiff


def createMapDataDiff(menusDiff, tagsDiff, locationsDiff):
    menusDiffDict = json.loads(menusDiff.toJSON())
    tagsDiffDict = json.loads(tagsDiff.toJSON())
    locationsDiffDict = json.loads(locationsDiff.toJSON())

    mapData_diff = {'Menus': menusDiffDict, 'Tags': tagsDiffDict, 'Locations': locationsDiffDict}

    modelsList = ['Locations', 'Menus', 'Tags']
    operationList = ['added', 'edited', 'removed']

    numberChanges = len(modelsList)*len(operationList)

    for model in modelsList:
        for operation in operationList:
            if (len(mapData_diff[model][operation]) == 0):
                numberChanges = numberChanges - 1

    if(numberChanges == 0):
        mapData_diff = None

    return mapData_diff


def run(mapData):
    storedData = StoredDataType()
    menusDiff = MapDataDiff()   
    tagsDiff = MapDataDiff()
    locationsDiff = MapDataDiff()

    storedData = requestAll(storedData)
    storedData, tagsDiff = filterTags(mapData, storedData, tagsDiff)
    storedData, menusDiff = filterMenus(mapData, storedData, menusDiff)
    storedData, locationsDiff = filterLocations(mapData, storedData, locationsDiff)

    mapData_diff = createMapDataDiff(menusDiff, tagsDiff, locationsDiff)

    return mapData_diff
