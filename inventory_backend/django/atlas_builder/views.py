from django.shortcuts import render
from .sources.openRAN_gateway import getDataFromGateway
from .converters.atlas_converter import AtlasConverter
from django.http import JsonResponse

def getAtlasFromOpenRANGateway(request):
    openRANData = getDataFromGateway()
    atlas = AtlasConverter.openRANKongDataToATLAS(openRANData)
    return JsonResponse({'atlas': atlas}, safe=False) 
