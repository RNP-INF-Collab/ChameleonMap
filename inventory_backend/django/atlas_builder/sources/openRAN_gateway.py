import json
import requests
from .atlasmock import *
import os

GATEWAY_BASE_URL = os.environ.get('GATEWAY_BASE_URL')

def getDataFromGateway():
    devices = getDevices()
    links = json.loads(onosLinksMock)

    data = {**devices, **links}
    return data

def getAuthHeader():
    credentials = os.environ.get('GATEWAY_AUTH_KEY')
    header =  {
        'Authorization': 'Basic ' + credentials,
        'Accept': 'application/json; indent=4',
    }

    return header

def getDevices():
    url = GATEWAY_BASE_URL + 'devices'
    response = requests.get(url, headers=getAuthHeader(), verify=False).json()
    return response

def getLinks():
    url = GATEWAY_BASE_URL + 'links'
    response = requests.get(url, headers=getAuthHeader(), verify=False).json()
    return response

def getIntents():
    url = GATEWAY_BASE_URL + 'intents'
    response = requests.get(url, headers=getAuthHeader(), verify=False).json()
    return response

def getInstallables():
    url = GATEWAY_BASE_URL + 'installables/org.onosproject.optical-rest/0x0'
    response = requests.get(url, headers=getAuthHeader(), verify=False).json()
    return response