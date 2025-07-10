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

export class MoveElementInstruction implements AtlasInstruction{
  /** Implementation of Atlas instruction:  MOVE_ELEMENT
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by MOVE_ELEMENT instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    // if(tokens.length > 4)
    //     return
      
    //   const elementName: string = tokens[1];
    //   const xOffset: number = parseFloat(tokens[2]);
    //   const yOffset: number = parseFloat(tokens[3]);    
    //   const element = atlasDrawer.getNodeByName(elementName);

    //   atlasDrawer.moveElement(element!, xOffset, yOffset);
  }

  public readonly parameters: AtlasInstructionParameter[] = [

  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

  ];
}
