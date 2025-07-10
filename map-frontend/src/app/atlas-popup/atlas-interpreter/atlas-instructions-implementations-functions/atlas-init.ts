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
  
export class AtlasInitInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  INVALID_INSTRUCTION
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by INVALID_INSTRUCTION instruction
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        console.log(`ATLAS version 2.0`);
    }

    public readonly parameters: AtlasInstructionParameter[] = [
        {
            name:"version",
            mandatory: false,
            expectedType: 'string',
            expectedValues: [],    
        },
    ];

    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

    ];
}
