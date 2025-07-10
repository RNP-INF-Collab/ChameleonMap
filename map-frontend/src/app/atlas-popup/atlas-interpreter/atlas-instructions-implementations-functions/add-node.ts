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

export class AddNodeInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  ADD_NODE
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by ADD_NODE instruction
     */
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        let node: AtlasNode = {} as AtlasNode;
        node.highlighted = false
        node.faded = false

        node.name = dataPassed.providedArguments[0].formatedValue;
        node.xPos = dataPassed.providedArguments[1].formatedValue;
        node.yPos = dataPassed.providedArguments[2].formatedValue; 
        node.tagName = '';
        node.group = '';
        node.layer = 0;
        
        // Optional parameters
        let parametersCount = dataPassed.providedArguments.length
        if(parametersCount >= 4)
            node.tagName = dataPassed.providedArguments[3].formatedValue;

        // Flags
        dataPassed.providedFlags.forEach( flag => {
            switch(flag.flagName){
                case '--group':
                    node.group = flag.formatedValue;
                    break;
                case '--layer':
                    node.layer = flag.formatedValue;
                    break;
            }
        })

        atlasDrawer.addNode(node)

        // Push node info
        let info = node.tagName
        if(info === '')
            info = node.name
        info = `<p><em><span style="font-size: 14pt;"><strong>${info}</strong></span></em></p>`
        PushPopupInstruction.setNodePopup(node, info);
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
            name:'tagName',
            expectedType:'strig', /**!!!!!!!!!!!!!!!!!!!! string */
            mandatory: false,
            expectedValues:['any'],
        },
    ]
    
    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
        {
            name:'--group', 
            expectedType:'string', 
            expectedValues:[],
            alias:'-g',
        },
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
            name:'--layer', 
            expectedType:'int', 
            expectedValues:['any'],
            alias:'-l',
        },
    ]
}
