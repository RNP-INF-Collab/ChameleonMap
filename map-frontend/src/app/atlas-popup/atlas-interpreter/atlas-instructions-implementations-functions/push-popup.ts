import { AtlasNode } from "../../atlas-structures/AtlasNode";
import { AtlasLink } from "../../atlas-structures/AtlasLink";
import { AtlasSlice } from "../../atlas-structures/AtlasSlice";
import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { 
  AtlasInstruction,
  AtlasInstructionParameter,
  AtlasInstructionAvailableFlag,
  InstructionCallingPack,
} from "../atlas-instructions";
import { AtlasAlertEmitter } from "../atlas-alert-emitter/atlas-alert-emitter";
import { AtlasTopology } from "../../atlas-structures/AtlasTopology";

export class PushPopupInstruction implements AtlasInstruction{
  /** Implementation of Atlas instruction:  PUSH_POPUP
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by PUSH_POPUP instruction
   */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){      
      
      // Element Type Detection
      let elementType = 'node'
      dataPassed.providedFlags.forEach(flag => {
        switch(flag.flagName){
          case '--node':
            elementType = 'node'
            break
          case '--linkClass':
            elementType = 'linkClass'
            break
            case '--subTopology':
              elementType = 'subTopology'
            break
        }
      })
      
      // Analise flags
      let overwriteMode = false;
      dataPassed.providedFlags.forEach(flag => {
        switch(flag.flagName){
          case '--overwrite':
            overwriteMode = true;
            break;
        }
      })
      
      const info = dataPassed.providedArguments[1].formatedValue;

      // Popup information pushing    
      const scriptLine = dataPassed.codeLine;
      switch(elementType){
        case 'node':
          const nodeName = dataPassed.providedArguments[0].formatedValue;
          const node = atlasDrawer.getNodeByName(nodeName);
          if(overwriteMode)
            PushPopupInstruction.setNodePopup(node, info, scriptLine)
          else
            PushPopupInstruction.pushNodePopup(node, info, scriptLine)
          break
        case 'linkClass':
          break
        case 'subTopology':
          const subTopologyName = dataPassed.providedArguments[0].formatedValue;
          const subTopology = atlasDrawer.getSubtopologyByName(subTopologyName);
          if(overwriteMode)
            PushPopupInstruction.setSubTopologyPopup(subTopology, info, scriptLine)
          else
            PushPopupInstruction.pushSubTopologyPopup(subTopology, info, scriptLine)
          break
      }            
    }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'nodeName',
      mandatory: true,
      expectedType: 'string',
      expectedValues: []
    },
    {
      name:'content',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    }

  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    {
      name:"--overwrite",
      expectedType:"none",
      expectedValues:[],
      alias:"-o"
    },
    {
      name:"--linkClass",
      expectedType:"none",
      expectedValues:[],
      alias:"-lclass"
    },
    {
      name:"--subTopology",
      expectedType:"none",
      expectedValues:[],
      alias:"-s"
    },
    {
      name:"--node",
      expectedType:"none",
      expectedValues:[],
      alias:"-n"
    },
  ];
  
  private static pushNodePopup(node: AtlasNode | null, info: string, row: number = -1, collum: number = -1){    
    if(node !== null && node !== undefined){      
      const currentPopup = node.node.getPopup()
      if(currentPopup !== undefined){
        const currentPopupContent = currentPopup.getContent()
        PushPopupInstruction.setNodePopup(node, currentPopupContent + info, row, collum)
      }else{
        PushPopupInstruction.setNodePopup(node, info, row, collum);
      }
    }else{
      AtlasAlertEmitter.invalidNodeAlert(node!.name)
    }
  }

  public static setNodePopup(node: AtlasNode | null, info: string, row: number = -1, collum: number = -1){    
    if(node !== null && node !== undefined){      
        node.node.bindPopup(info);
    }else{
      AtlasAlertEmitter.invalidNodeAlert(node!.name, row, collum)
    }
  }

  public static setSubTopologyPopup(subTopology: AtlasTopology | null, info: string, row: number = -1, collum: number = -1){    
    if(subTopology !== null && subTopology !== undefined){      
      subTopology.marker.bindPopup(info);
    }else{
      // AtlasAlertEmitter.invalidNodeAlert(node!.name, row, collum)
    }
  }

  private static pushSubTopologyPopup(subTopology: AtlasTopology | null, info: string, row: number = -1, collum: number = -1){    
    if(subTopology !== null && subTopology !== undefined){      
      const currentPopup = subTopology.marker.getPopup()
      if(currentPopup !== undefined){
        const currentPopupContent = currentPopup.getContent()
        PushPopupInstruction.setSubTopologyPopup(subTopology, currentPopupContent + info, row, collum)
      }else{
        PushPopupInstruction.setSubTopologyPopup(subTopology, info, row, collum);
      }
    }else{
      // AtlasAlertEmitter.invalidNodeAlert(node!.name)
    }
  }
  
}
