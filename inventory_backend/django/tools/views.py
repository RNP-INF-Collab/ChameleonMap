from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import requests
from administration.models import *

def translateText2(request):
    createTranslationsForAllTitles('de', 'pt')
    return HttpResponse("<html><body> <h3>Funcionou perfeitamente :)</h3> </body></html>")
    
def createTranslationsForAllTitles(targetLanguage, sourceLanguage="auto"):
    translatableTitleModels = [Menu, MenuGroup, Tag, Links_group, Link, Location, Kml_shape]
    for model in translatableTitleModels:
        elements = model.objects.all()
        for element in elements:        
            if hasattr(element, 'name'):
                elementTitle = element.name
            elif hasattr(element, 'display_name'):
                elementTitle = element.display_name
                
            print(elementTitle + "  ->  " + translateText(elementTitle, targetLanguage, sourceLanguage))
        

def translateText(text, target, source="auto"):
    url = 'http://translator:5000/translate'
    translationRequest = {
        "q":text,
        "source":source,
        "target": target
    }
    
    response = requests.post(url, json=translationRequest)
    
    return response.json()['translatedText']

def createTranslation(element, targetLanguageCode):
    if element:
        contentType = ContentType.objects.get_for_model(element)
        
        if hasattr(element, 'name'):
            originalTitle = element.name
        elif hasattr(element, 'display_name'):
            originalTitle = element.display_name

        if(contentType and originalTitle):
            translatedTitle = translateText(originalTitle, targetLanguageCode)
            newTranslation = TitleTranslation(name=translatedTitle, language_code = targetLanguageCode, object_id = element.id, content_type=contentType)
            newTranslation.save()
            return True
    return False
    
        
# def translateAllLinks():
#     x = m.Link.objects
    
#     return JsonResponse(x)
    