import json
import random

class AtlasConverter:
    def __init__(self):
        return self
    
    # def openRANKongDataToATLAS(self, openRANKongData):
    def openRANKongDataToATLAS(openRANKongData):
        devices = AtlasConverter.decodeOnosDevicesData(openRANKongData)
        links = AtlasConverter.decodeOnosLinkData(openRANKongData)
        atlasNodes = []
        atlasLinks = []

        for device in devices:
            xPos, yPos = AtlasConverter.calculateAtlasPosition(device)
            atlasNode = {
                "name": device["name"],
                # "xPos": random.randint(1,9),
                "xPos": xPos,
                # "yPos": random.randint(1,9),
                "yPos": yPos,
                "tagName": device["type"]
            }
            atlasNodes.append(atlasNode)

        for link in links:            
            linkInfo = {
                "srcNode": link["srcNode"],                
                "dstNode": link["dstNode"],
            }
            atlasLinks.append(linkInfo)
        
        script = "ATLAS v1.0;\n"
        script = AtlasConverter.buildAddNodeInstructions(atlasNodes)
        script += AtlasConverter.buildAddLinkInstructions(atlasLinks)
        # script += AtlasConverter.buildCreateSliceInstructions(atlasNodes)
        return script

    
    def buildAddNodeInstructions(atlasNodes):
        script = ""
        for node in atlasNodes:
            script += "ADD_NODE "
            script += f''''{node["name"]}' '''
            script += f''''{str(node["xPos"])}' '''
            script += f''''{str(node["yPos"])}' '''
            script += f''''{node["tagName"]}';\n'''    
        return script
    
    def buildAddLinkInstructions(atlasLinks):
        script = ""
        for link in atlasLinks:
            script += "SMART_LINK "
            script += f''''{link["srcNode"]}' '''
            script += f''''{link["dstNode"]}';\n'''    
        return script

    def decodeOnosDevicesData(onosData):
        try:
            rawDevices = onosData.get("devices", [])
            devices = []

            for device in rawDevices:
                device_info = {
                    "id": device.get("id", ""),
                    "type": device.get("type", ""),
                    "available": device.get("available", False),
                    "role": device.get("role", ""),
                    "manufacturer": device.get("mfr", ""),
                    "hardware": device.get("hw", ""),
                    "software": device.get("sw", ""),
                    "serial": device.get("serial", ""),
                    "driver": device.get("driver", ""),
                    "chassisID": device.get("chassisId", ""),
                    "lastUpdate": device.get("lastUpdate", ""),
                    "readableLastUpdate": device.get("humanReadableLastUpdate", ""),
                    # "ipAddress": device["annotations"]["ipaddress"],
                    # "port": device["annotations"]["port"],
                    "latitude": device["annotations"]["latitude"],
                    "longitude": device["annotations"]["longitude"],
                    "name": device["annotations"]["name"],
                    "protocol": device["annotations"]["protocol"],
                }                
                device_info = AtlasConverter.adjustDeviceType(device_info)

                devices.append(device_info)
            
            return devices
        except json.JSONDecodeError:
            return None;      
    
    def decodeOnosLinkData(onosData):
        try:
            rawLinks = onosData.get("links", [])
            links = []

            for link in rawLinks:
                link_info = {
                    "srcNode": link["src"]["device"],
                    "dstNode": link["dst"]["device"]
                    # "src_port": link["src"]["port"],
                    # "src_device": link["src"]["device"],
                    # "dst_port": link["dst"]["port"],
                    # "dst_device": link["dst"]["device"],
                    # "type": link["type"],
                    # "state": link["state"],
                }                                
                links.append(link_info)
            
            return links
        except json.JSONDecodeError:
            return None

    def adjustDeviceType(device):
        if device["type"] == "TERMINAL_DEVICE":
            if(device["hardware"].lower() == "cassini"):
                device["type"] = "Switch Cassini"
        
        device["type"] = device["type"].title()

        return device
    
    def calculateAtlasPosition(device):        
        xGeo = float(device["longitude"])
        yGeo = float(device["latitude"])

        deslocatedXGeo = xGeo + 180
        deslocatedYGeo = yGeo + 90
        initialXAtlas = 1
        finalXAtlas = 10
        initialYAtlas = 0
        finalYAtlas = 9
        xAtlas = 1 + deslocatedXGeo * 9 /(360)
        yAtlas = 1 + deslocatedYGeo * 9 / (180)

        return xAtlas, yAtlas


    def getSubstrings(completeString):
        if isinstance(completeString, str):
            substrings = completeString.split(';')
            return substrings
        else:
            return []
        