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
  
export class HighlightInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  HIGHLIGHT
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by HIGHLIGHT instruction
     * 
     *  ## Target search type priority:
     * In target object search, if are finded two or more objects with same name, the chosed object will
     * be that whit greater priority, acordingly with the following list:
     *      - 1: Slice
     *      - 2: Location
     *      - 3: Node
     *      - 4: Link
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){        
        let targetType = 'slice';

        // Flags aplications
        // if(dataPassed.providedFlags.find(flag => flag.flagName === '--slice') !== undefined){
        //     targetType = 'slice';        
        // }else if(dataPassed.providedFlags.find(flag => flag.flagName === '--location') !== undefined){
        //     targetType = 'location';        
        // }else if(dataPassed.providedFlags.find(flag => flag.flagName === '--node') !== undefined){
        //     targetType = 'node';        
        // }else if(dataPassed.providedFlags.find(flag => flag.flagName === '--link') !== undefined){
        //     targetType = 'link';
        // }

        // Type detection
        
        // Highlighting
        switch(targetType){
            case 'slice':
                HighlightInstruction.highlightSlice(dataPassed, atlasDrawer)
                break;
        }
    }

    public readonly parameters: AtlasInstructionParameter[] = [
        {
            name:'target',
            mandatory:true,
            expectedType:'string',
            expectedValues:[],
        },
    ];
  
    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
        {
            name:'--slice',
            alias:'-s',
            expectedType:'none',
            expectedValues:[]
        },
        {
            name:'--location',
            alias:'-l',
            expectedType:'none',
            expectedValues:[]
        },
        {
            name:'--node',
            alias:'-n',
            expectedType:'none',
            expectedValues:[]
        },
        {
            name:'--link',
            alias:'-n',
            expectedType:'none',
            expectedValues:[]
        },
    ];

    public static highlightSlice(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        let sliceName = dataPassed.providedArguments[0].formatedValue
        let slice = atlasDrawer.getSliceByName(sliceName)
        if(slice === null){
            AtlasAlertEmitter.errorMessage(0,0,`Slice ${sliceName} not found`);
        }else{
            if(slice.highlighted === false){
                atlasDrawer.highlightSlice(slice)
                slice.highlighted = true
            }
        }
    }
}
