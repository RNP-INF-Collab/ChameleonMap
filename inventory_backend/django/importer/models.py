# Create your models here.
import json
        
class MapData:
    def __init__(self):
        self. tagRelatedTags =  []
        self.tagRelatedLocations = []
        self.locations = []
        self.tags = []
        self.menus = []
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class EditedDataDiff:
    def __init__(self, old, new):
        self.old = old
        self.new = new
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class MapDataDiff:
    def __init__(self):
        self.added = []
        self.edited = []
        self.removed = []
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class StoredDataType:
    def __init__(self):
        self.tags = []
        self.menus = []
        self.locations = []
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class MenusType:
    def __init__(self, id, name, hierarchy_level, active):
        self.id = id
        self.name = name
        self.hierarchy_level = hierarchy_level
        self.active = active
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class LocationsType:
    def __init__(self, id, name, description, latitude, longitude, active):
        self.id = id
        self.name = name
        self.description = description
        self.latitude = latitude
        self.longitude = longitude
        self.active = active
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class TagsType:
    def __init__(self, id, name, parent_menu, color, description, sidebar_content, related_locations, active):
        self.id = id
        self.name = name
        self.parent_menu = parent_menu
        self.color = color if color[0] == '#' else '#' + color
        self.description = description
        self.sidebar_content = sidebar_content
        self.related_locations = related_locations
        self.active = active
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class EditedMenusType:
    def __init__(self, old, new):
        self.id = old.id
        self.name = old.name
        self.hierarchy_level = EditedDataDiff(old.hierarchy_level, new.hierarchy_level)
        self.active = EditedDataDiff(old.active, new.active)
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class EditedLocationsType:
    def __init__(self, old, new):
        self.id = old.id
        self.name = old.name
        self.description = EditedDataDiff(old.description, new.description)
        self.latitude = EditedDataDiff(old.latitude, new.latitude)
        self.longitude = EditedDataDiff(old.longitude, new.longitude)
        self.active = EditedDataDiff(old.active, new.active)
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

class EditedTagsType:
    def __init__(self, old, new):
        self.id = old.id
        self.name = old.name
        self.parent_menu = EditedDataDiff(old.parent_menu, new.parent_menu)
        self.color = EditedDataDiff(old.color if old.color[0] == '#' else '#' + old.color, new.color if new.color[0] == '#' else '#' + new.color)
        self.description = EditedDataDiff(old.description, new.description)
        self.sidebar_content = EditedDataDiff(old.sidebar_content, new.sidebar_content)
        self.related_locations = EditedDataDiff(old.related_locations, new.related_locations)
        self.active = EditedDataDiff(old.active, new.active)
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)