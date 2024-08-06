from administration.models import *
from django.db import connection

saveLogs = {
    'success': [],
    'warnings': [],
    'errors': []
}

def clearLogs():
    saveLogs['success'] = []
    saveLogs['warnings'] = []
    saveLogs['errors'] = []

def createLog(logType, operation, elementName, elementId, modelText, error=None):
    if logType == 'success':
        saveLogs['success'].append("%s: %s record with name '%s' (id %d)." % (operation.capitalize(), modelText[:-1], elementName, elementId))
    elif logType == 'warnings':
        saveLogs['warnings'].append("The %s record with name '%s' (id %d) not applied." % (modelText[:-1], elementName, elementId))
    elif logType == 'errors':
        saveLogs['errors'].append("Unable to %s %s record with name '%s' (id %d). Error detail: %s" % (operation, modelText[:-1], elementName, elementId, str(error)))


def createStatusMessage():
    lenSuccess = len(saveLogs['success'])
    lenErros = len(saveLogs['errors'])
    lenWarnings = len(saveLogs['warnings'])

    if(lenErros == 0 and lenWarnings == 0):
        statusMsg = "%s Modifications done successfully!" % str(lenSuccess)
    else:
        statusMsg = "Modifications partially done. "
        if(lenErros != 0):
            statusMsg +=  str(lenErros) + " errors occurred. "
        if(lenWarnings != 0):
            statusMsg +=  str(lenWarnings) + " warnings occurred. "

    return statusMsg

def createRelationshipLog(logType, elementName, elementRelationid):
    if logType == 'warnings':
        errorMsg = "Unable to add the relationship of tag '%s' with location of id '%s' because location of id '%s' could not be found." % (elementName, str(elementRelationid), str(elementRelationid))
        saveLogs['warnings'].append(errorMsg)
    elif logType == 'errors':
        errorMsg = "Unable to add the relationship of tag '%s' with menu of id '%s' because menu of id '%s' could not be found." % (elementName, str(elementRelationid), str(elementRelationid))
        saveLogs['errors'].append(errorMsg)


def isChangedRelatedLocation(oldRelatedLocation, newRelatedLocation):
    return set(oldRelatedLocation) != set(newRelatedLocation)

def createRelatedLocationsRecord(relatedLocationsId, tagName):
    relatedLocationsRecord = []

    for relatedLocationId in relatedLocationsId:
        try:
            relatedLocationsRecord.append(Location.objects.get(pk=relatedLocationId))
        except:
            createRelationshipLog('warnings', tagName, relatedLocationId)

    return relatedLocationsRecord

def addElement(element, modelText):
    try:
        if(modelText == 'Menus'):
            newElement = Menu(**element)
        elif(modelText == 'Locations'):
            newElement = Location(**element)
        elif(modelText == 'Tags'):
            newElement = Tag(
                id=element['id'],
                name=element['name'],
                color=element['color'],
                description=element['description'],
                sidebar_content=element['sidebar_content'],
                active=element['active']
            )
            try:
                newElement.parent_menu = Menu.objects.get(pk=element['parent_menu'])
            except Exception as error:
                createRelationshipLog('errors', element['name'], element['parent_menu'])
                raise Exception("error_displayed")

            newElement.save()
            newElement.related_locations.set(
                createRelatedLocationsRecord(element['related_locations'], element['name'])
            )
        newElement.save()
    except Exception as error:
        if(str(error) != "error_displayed"):
            createLog('errors', 'add', element['name'], element['id'], modelText, error)
    else:
        createLog('success', 'added', element['name'], element['id'], modelText)


def removeElement(element, modelText):  # Testar remover menu e locations que tags referenciam
    try:
        if(modelText == 'Menus'):
            recordElement = Menu.objects.get(pk=element['id'])
        elif(modelText == 'Locations'):
            recordElement = Location.objects.get(pk=element['id'])
        elif(modelText == 'Tags'):
            recordElement = Tag.objects.get(pk=element['id'])
        
        recordElement.delete()
    except Exception as error:
        createLog('errors', 'remove', element['name'], element['id'], modelText, error)
    else:
        createLog('success', 'removed', element['name'], element['id'], modelText)

def editElement(element, modelText):
    try:
        if(modelText == 'Menus'):   # Investigar fazer função buildEditedItem
            menuRecord = Menu.objects.get(pk=element['id'])
            menuRecord.hierarchy_level = element['hierarchy_level']['new']
            menuRecord.active = element['active']['new']
            menuRecord.save()

        elif(modelText == 'Locations'):
            locationRecord = Location.objects.get(pk=element['id'])
            locationRecord.description = element['description']['new']
            locationRecord.latitude = element['latitude']['new']
            locationRecord.longitude = element['longitude']['new']
            locationRecord.active = element['active']['new']
            locationRecord.atlas_feature_active = element['atlas_feature_active']['new']
            locationRecord.save()

        elif(modelText == 'Tags'):
            tagRecord = Tag.objects.get(pk=element['id'])
            tagRecord.color = element['color']['new']
            tagRecord.description = element['description']['new']
            tagRecord.sidebar_content = element['sidebar_content']['new']
            tagRecord.active = element['active']['new']

            if(element['parent_menu']['old'] != element['parent_menu']['new']):
                tagRecord.parent_menu = Menu.objects.get(pk=element['parent_menu']['new'])

            if(isChangedRelatedLocation(element['related_locations']['old'], element['related_locations']['new'])):
                tagRecord.related_locations.set(
                    createRelatedLocationsRecord(element['related_locations']['new'], element['name'])
                )

            tagRecord.save() 
    except Exception as error:
        createLog('errors', 'edit', element['name'], element['id'], modelText, error)
    else:
        createLog('success', 'edited', element['name'], element['id'], modelText)


def updateDBSeqId():
    cursor = connection.cursor()
    
    menuSeqId = Menu.objects.latest('pk').pk
    tagSeqId = Tag.objects.latest('pk').pk
    locationSeqId = Location.objects.latest('pk').pk
    
    cursor.execute("alter sequence administration_menu_id_seq restart with %i" % (menuSeqId + 1))
    cursor.execute("alter sequence administration_tag_id_seq restart with %i" % (tagSeqId + 1))
    cursor.execute("alter sequence administration_location_id_seq restart with %i" % (locationSeqId + 1))


def execute(request):
    clearLogs()
    dataApplies = request.POST.items()
    mapData = request.session.get('importedData')
    selectedChanges = {}

    for key, value in dataApplies:
        if(value=="on"):
            selectedChanges[key] = True

    modelsList = ['Locations', 'Menus', 'Tags']
    operationList = ['added', 'edited', 'removed']

    for model in modelsList:
        for operation in operationList:
            for element in mapData[model][operation]:
                selectedChangeKey = model + "-" + str(element['id'])
                try:
                    if(selectedChanges[selectedChangeKey]):
                        if(operation == 'added'):
                            addElement(element, model)

                        elif(operation == 'edited'):
                            editElement(element, model)

                        elif(operation == 'removed'):
                            removeElement(element, model)

                        else:
                            saveLogs['errors'].append("Unknown operation. Operation in " + model + " must be: 'added', 'edited' or 'removed'.")
                except Exception as warning:
                    createLog('warnings', None, element['name'], element['id'], model, warning)

    statusMsg = createStatusMessage()
    saveLogs['success'].sort()

    updateDBSeqId()

    return {'status': statusMsg, 'logs': saveLogs}
