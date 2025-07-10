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

export class PushLinkPopupInstruction implements AtlasInstruction{
  /** Implementation of Atlas instruction:  PUSH_LINK_POPUP
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by PUSH_LINK_POPUP instruction
   */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){      
      // Flags Analysys
      dataPassed.providedFlags.forEach(flag => {
        switch(flag.flagName){
          case '--class':
            break
          }
      })

      // Obtain link      
      const srcNodeName: string = dataPassed.providedArguments[0].formatedValue
      const dstNodeName: string = dataPassed.providedArguments[1].formatedValue
      const link = atlasDrawer.getLinkByNodes(srcNodeName, dstNodeName)
      
      if(link === null){
        return false
      }      
      
      const info: string = dataPassed.providedArguments[2].formatedValue
      PushLinkPopupInstruction.pushLinkPopup(link, info)
      
      return true
    }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'srcNode',
      mandatory: true,
      expectedType: 'string',
      expectedValues: []
    },
    {
      name: 'dstNode',
      mandatory: true,
      expectedType: 'string',
      expectedValues: []
    },
    {
      name:'content',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    },

  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    {
      name:'--class',
      expectedType:'string',
      expectedValues:[],
      alias:'-c'
    },
  ];
  
  private static invalidNodeAlert(invalidNodeName: string){
    const bold = "font-weight: bold";
    const normal = "font-weight: normal";
    const warning = "background-color: yellow;";

    console.log(`%cAtlas warning%c: Invalid node name %c${invalidNodeName}%c`, warning, normal, bold, normal)
  }

  public static pushLinkPopup(link: AtlasLink | null, info: string){    
    if(link !== null){   
      if(link.link !== undefined){
        if(info !== ''){
          const currentPopup = link.link.getPopup()
          if(currentPopup !== undefined){
            const currentPopupContent = currentPopup.getContent()
            link.link.bindPopup(currentPopupContent + info)
          }else{
            link.link.bindPopup(info);
          }
        }   
      }
    }
  }  
}
