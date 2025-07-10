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
  
export class InvalidInstructionAlert implements AtlasInstruction{
    /** Implementation of Atlas instruction:  INVALID_INSTRUCTION
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by INVALID_INSTRUCTION instruction
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        // const wrongInstructionName = tokens[0]
        // console.log(`Atlas warning: Invalid instruction "${wrongInstructionName}"`)
        // console.log(`Atlas warning: Invalid instruction "${dataPassed.instructionNameAliasUsed}"`)
        AtlasAlertEmitter.unknownAtlasInstruction(dataPassed);
    }

    public readonly parameters: AtlasInstructionParameter[] = [

    ];

    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

    ];
}
