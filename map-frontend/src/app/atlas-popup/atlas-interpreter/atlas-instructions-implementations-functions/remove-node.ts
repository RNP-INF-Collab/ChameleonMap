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

export class RemoveNodeInstruction implements AtlasInstruction{/** Implementation of Atlas instruction:  REMOVE_NODE
  * Version: 2.0
  * @param tokens The tokens of Atlas script line
  * @param atlasDrawer Instance of AtlasDrawer that will be operated by REMOVE_NODE instruction
  */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    // if(tokens.length != 2)
    //     return
    //     atlasDrawer.rmNode(tokens[1]); 
  }

  public readonly parameters: AtlasInstructionParameter[] = [

  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

  ];
}
