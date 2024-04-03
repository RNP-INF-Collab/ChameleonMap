import requests
from importer.sources.InfraDPDI.models import *
import os

baseUrl = os.environ.get('INFRADPDI_BASEURL')

#Here is the code to insert the credentials in the variable
def getCredentials():
    credentials = os.environ.get('INFRADPDI_TOKEN')
    data_number = '1000' # Amount of data returned in a request
    headers =  {
        'Authorization': 'Token ' + credentials,
        'Accept': 'application/json; indent=4',
    }

    return credentials, data_number, headers

def getSites(data_number, headers):
    sites = []

    nextURL = True

    url = baseUrl + 'dcim/sites/?limit=' + data_number
    sites = requests.get(url, headers=headers, verify=False).json()
    nextURL = sites['next']

    while type(nextURL) == str:
        url = nextURL
        currentSites = requests.get(url, headers=headers, verify=False).json()
        sites['results'] += currentSites['results']
        nextURL = currentSites['next']

    return sites

def getDevices(data_number, headers):
    devices = []

    nextURL = True

    url = baseUrl + 'dcim/devices/?limit=' + data_number
    devices = requests.get(url, headers=headers, verify=False).json()
    nextURL = devices['next']

    while type(nextURL) == str:
        url = nextURL
        currentDevices = requests.get(url, headers=headers, verify=False).json()
        devices['results'] += currentDevices['results']
        nextURL = currentDevices['next']

    return devices

def getTags(data_number, headers):
    tags = []

    nextURL = True

    url = baseUrl + 'extras/tags/?limit=' + data_number
    tags = requests.get(url, headers=headers, verify=False).json()
    nextURL = tags['next']

    while type(nextURL) == str:
        url = nextURL
        currentTags = requests.get(url, headers=headers, verify=False).json()
        tags['results'] += currentTags['results']
        nextURL = currentTags['next']

    return tags

def get():
    credentials, data_number, headers = getCredentials()
    tags = getTags(data_number, headers)
    sites = getSites(data_number, headers)
    devices = getDevices(data_number, headers)

    response = NetboxResponse(tags, sites, devices)

    return response

