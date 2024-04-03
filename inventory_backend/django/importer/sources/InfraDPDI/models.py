class NetboxResponse:
    def __init__(self, tags, sites, devices):
        self.tags = []
        for tag in tags['results']:
            self.tags.append(NBtag(tag['id'], tag['name'], tag['color'], tag['description']))
        self.sites = []
        for site in sites['results']:
            self.sites.append(NBsite(site['id'], site['name'], site['physical_address'], site['latitude'], site['longitude']))
        self.devices = devices['results']

class NBtag:
    def __init__(self, id, name, color, description):
        self.id = id
        self.name = name
        self.color = color
        self.description = description

class NBsite:
    def __init__(self, id, name, description, latitude, longitude):
        self.id = id
        self.name = name
        self.description = description
        self.latitude = latitude
        self.longitude = longitude