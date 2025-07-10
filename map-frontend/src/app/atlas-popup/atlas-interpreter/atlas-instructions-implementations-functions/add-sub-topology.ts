import { AtlasNode } from "../../atlas-structures/AtlasNode";
import { AtlasLink } from "../../atlas-structures/AtlasLink";
import { AtlasSlice } from "../../atlas-structures/AtlasSlice";
import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { 
    AtlasInstruction,
    AtlasInstructionParameter,
    AtlasInstructionAvailableFlag,
    InstructionCallingPack
} from "../atlas-instructions";
import { PushPopupInstruction } from "./push-popup";
import { AtlasTopology } from "../../atlas-structures/AtlasTopology";

export class AddSubTopology implements AtlasInstruction{
    /** Implementation of Atlas instruction:  ADD_SUB_TOPOLOGY
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by ADD_SUB_TOPOLOGY instruction
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        let subTopology: AtlasTopology = {} as AtlasTopology;
        
        subTopology.name = dataPassed.providedArguments[0].formatedValue;
        subTopology.xPos = dataPassed.providedArguments[1].formatedValue;
        subTopology.yPos = dataPassed.providedArguments[2].formatedValue; 
        subTopology.locationName = '';
        subTopology.color = '#51BBA8';
        subTopology.positionOffSet = {x:0, y: 0};
        
        // Optional parameters
        let parametersCount = dataPassed.providedArguments.length
        if(parametersCount >= 4){
            subTopology.locationName = dataPassed.providedArguments[3].formatedValue;
        }

        // Flags
        dataPassed.providedFlags.forEach( flag => {
            switch(flag.flagName){
                case "--color":
                    subTopology.color = flag.formatedValue;
                    break;
            }
        })

        atlasDrawer.addSubTopology(subTopology)

        // Push node info
        let info = subTopology.locationName
        if(info === '')
            info = subTopology.name
        info = `<p><em><span style="font-size: 14pt;"><strong>${info}</strong></span></em></p>`
        // PushPopupInstruction.setNodePopup(node, info);
    }
    
    // Expected parameters and available flags
    public readonly parameters: AtlasInstructionParameter[] = [
        {
            name:'name',
            expectedType:'string',
            mandatory: true,
            expectedValues:['any']},
        {
            name:'xPos',
            expectedType:'float',
            mandatory: true,
            expectedValues:['any'],
        },
        {
            name:'yPos',
            expectedType:'float',
            mandatory: true,
            expectedValues:['any'],
        },
        {
            name:'locationName',
            expectedType:'string',
            mandatory: false,
            expectedValues:['any'],
        },
    ]
    
    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
        {
            name:'--iconShape',
            expectedType:'string',
            expectedValues:['default', 'rectagle', 'circle', 'triangle', 'rounded-rectangle'],
            alias:'-is',
        },
        {
            name:'--floatingPosition',
            expectedType:'none',
            expectedValues:[],
            alias:'-fp',
        },
        {
            name:'--color', 
            expectedType:'string', 
            expectedValues:[],
            alias:'-c',
        },
        {
            name:'--expanded', 
            expectedType:'none', 
            expectedValues:[],
            alias:'-e',
        },
    ]

    public static getSubTopologyControlButtons(subTopology: AtlasTopology): string{
        return `
            <button class='opp-open-button opp-open-button-for-location' id='st-${subTopology.name}-expand'> e </button>
            <button class='opp-open-button opp-open-button-for-location' id='st-${subTopology.name}-view'> v </button>
        `;
    }
}
