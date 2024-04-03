from administration.models import *
from importer.models import *
from importer.sources.InfraDPDI.models import *

def getMenuByName(name, mapData):
    for menu in mapData.menus:   #Verificar se tem um filter nativo
        if menu.name == name:
            return menu
    # Conferir pq translatedTagId nao e usado
def getTranslatedLocationId(id, translator):    
    for pair in translator['locations']: 
        if(id == pair[0]):
            return pair[1]
    return -1

def queryMenuIdByNameAndUpdateCounting(name, menusAddedCounter):     
    if(Menu.objects.filter(name = name).exists()):
        queriedMenu = Menu.objects.filter(name = name).first()
        return queriedMenu.id, menusAddedCounter
    else: # Nome não existe no banco
        try:
            queriedMenuID = Menu.objects.latest('pk').pk
        except:
            queriedMenuID = -1
        menusAddedCounter += 1
        return queriedMenuID + menusAddedCounter, menusAddedCounter

def queryLocationIdByNameAndUpdateCounting(name, locationIDCounter):     
    if(Location.objects.filter(name = name).exists()):
        queriedLocation = Location.objects.filter(name = name).first()
        return queriedLocation.id, locationIDCounter
    else: # Nome não existe no banco
        try:
            queriedLocationID = Location.objects.latest('pk').pk
        except:
            queriedLocationID = -1
        locationIDCounter += 1
        return queriedLocationID + locationIDCounter, locationIDCounter
    
def queryTagIdByNameAndUpdateCounting(name, tagIDCounter):       
    if(Tag.objects.filter(name = name).exists()):
        queriedTag = Tag.objects.filter(name = name).first()
        return queriedTag.id, tagIDCounter
    else: # Nome não existe no banco
        try:
            queriedTagID = Tag.objects.latest('pk').pk
        except:
            queriedTagID = -1
        tagIDCounter += 1
        return queriedTagID + tagIDCounter, tagIDCounter

def generateLocations(netboxResponse, mapData, translator, locationIDCounter):  # Trocar primeira letra por minuscula
    sites = netboxResponse.sites
    for site in sites:

        if (site.latitude == None or site.longitude == None):
            continue
        
        queriedId, locationIDCounter = queryLocationIdByNameAndUpdateCounting(site.name, locationIDCounter)

        translator['locations'].append([site.id, queriedId])  # TranslatatedIDs

        new_location = LocationsType(queriedId, site.name, site.description, float(site.latitude), float(site.longitude), True)

        mapData.locations.append(new_location)   # Trocar para o model

    return mapData, translator 

def generateTags(netboxResponse, mapData, translator, tagIDCounter):
    NetboxTags = netboxResponse.tags
    
    for tag in NetboxTags: 
        
        menu = []
        
        if ":" in tag.name:
            name = tag.name.split(":")[1]
            menu = getMenuByName(tag.name.split(":")[0], mapData)
        else:
            menu = getMenuByName("Other", mapData)
            name = tag.name

        queriedId, tagIDCounter = queryTagIdByNameAndUpdateCounting(name, tagIDCounter)

        translator['tags'].append([tag.id, queriedId])
        relatedLocations = generateTagRelatedLocation(netboxResponse, tag.id, translator)

        new_tag = TagsType(queriedId, name, menu.id, tag.color, tag.description, "", relatedLocations, True)
        
        mapData.tags.append(new_tag)

    return mapData, translator


def generateMenus(netboxResponse, mapData, translator, menuIDCounter):
    netboxTags = netboxResponse.tags   # Trocar nomes para netboxTags
    menus_list = []

    for tag in netboxTags:
        if ":" in tag.name:
            name = tag.name.split(":")[0]
            if name not in menus_list:
                menus_list.append(name)
        else:
            if "Other" not in menus_list:
                menus_list.append("Other")

    menuIndex = 0
    for menuName in menus_list:

        queriedId, menuIDCounter = queryMenuIdByNameAndUpdateCounting(menuName, menuIDCounter)

        new_menu = MenusType(queriedId, menuName, menuIndex, True)

        mapData.menus.append(new_menu)
        menuIndex += 1

    return mapData, translator

def generateTagRelatedLocation(netboxResponse, importedTagID, translator):
    devices = netboxResponse.devices # Devices from Netbox connects locations with tags
    relatedLocations = []

    for device in devices:
        locationId = device['site']['id']

        for tag in device['tags']:
            if(tag['id'] == importedTagID):
                translatedLocationID = getTranslatedLocationId(locationId, translator)
                if translatedLocationID not in relatedLocations:
                    relatedLocations.append(translatedLocationID)

    return relatedLocations

def run(netboxResponse):

    mapData = MapData()
    translator = {'locations':[], 'tags':[]}
    locationIDCounter = 0
    tagIDCounter = 0
    menuIDCounter = 0
    
    mapData, translator = generateLocations(netboxResponse, mapData, translator, locationIDCounter)
    mapData, translator = generateMenus(netboxResponse, mapData, translator, menuIDCounter)
    mapData, translator = generateTags(netboxResponse, mapData, translator, tagIDCounter)

    return mapData
