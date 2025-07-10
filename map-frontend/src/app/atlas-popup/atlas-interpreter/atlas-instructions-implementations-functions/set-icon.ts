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

export class SetIconInstruction implements AtlasInstruction{
  /** Implementation of Atlas instruction:  SET_ICON
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by SET_ICON instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    // if( tokens.length < 2 || tokens.length > 3)
    //   return

    // const nodeName:string = tokens[1];
    // const iconName: string = tokens[2];
    // let node: AtlasNode = {} as AtlasNode;
    
    // if(atlasDrawer.getNodeByName(nodeName) == null)
    //   return
    
    // node = atlasDrawer.getNodeByName(nodeName)!;

    // if( tokens.length == 2){
    //   if( tokens[1] === 'tag'){
    //     atlasDrawer.changeNodeIcon(node)
    //   }
    // }else if(tokens.length == 3){
    //   switch(tokens[1]){
    //     case 'image':
    //       break;
    //     case 'default':
    //     case 'color':
    //       atlasDrawer.changeNodeIcon(node, 'color', tokens[2])
    //       break;
    //     default:
    //       break;
    //   }
    // }    
  }

  public readonly parameters: AtlasInstructionParameter[] = [

  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

  ];
}
