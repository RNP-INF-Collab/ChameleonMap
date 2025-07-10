import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { 
    AtlasInstruction,
    AtlasInstructionParameter,
    AtlasInstructionAvailableFlag,
    InstructionCallingPack
} from "../atlas-instructions";

export class CreateLayerInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  CREATE_LAYER
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by CREATE_LAYER instruction
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        atlasDrawer.topologyData.layersNames[atlasDrawer.topologyData.layersCount++] = dataPassed.providedArguments[0].formatedValue;
    }
    
    // Expected parameters and available flags
    public readonly parameters: AtlasInstructionParameter[] = [
        {
            name:'name',
            expectedType:'string',
            mandatory: true,
            expectedValues:['any']
        },
    ]
    
    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    ]
}
