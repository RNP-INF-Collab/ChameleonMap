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
  
export class RemovePopupInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  REMOVE_POPUP
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by REMOVE_POPUP instruction
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){

    }

    public readonly parameters: AtlasInstructionParameter[] = [

    ];
  
    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
  
    ];
  }
