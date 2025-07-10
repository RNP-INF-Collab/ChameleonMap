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
import { AtlasCustomButton } from "../../atlas-structures/AtlasCustomButton";

export class AddButtonInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  ADD_BUTTON
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by ADD_BUTTON instruction
     */
    // public implementation(tokens: Array<string>, atlasDrawer: AtlasDrawerComponent){
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        let button: AtlasCustomButton = {} as AtlasCustomButton
        button.checked = false;
        button.name = dataPassed.providedArguments[0].formatedValue
        button.checkAction = dataPassed.providedArguments[1].formatedValue
        button.uncheckAction = ''
            
        if(dataPassed.providedArguments.length >= 3){
            button.uncheckAction = dataPassed.providedArguments[2].formatedValue
        }

        button.labelName = button.name
        button.paletteName = 'default'
        dataPassed.providedFlags.forEach( flag => {
            switch(flag.flagName){
                case '--label':
                    button.labelName = flag.formatedValue
                    break;
                case '--palette':
                    button.paletteName = flag.formatedValue
                    break;
            }
        })

        atlasDrawer.addButton(button)
    }

    public readonly parameters: AtlasInstructionParameter[] = [
        {
            name: 'name',
            expectedType: 'string',
            expectedValues: [],
            mandatory: true,
        },
        {
            name: 'checkAction',
            expectedType: 'string',
            expectedValues: [],
            mandatory: true,
        },
        {
            name: 'uncheckAction',
            expectedType: 'string',
            expectedValues: [],
            mandatory: false,
        }

    ];

    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
        {
            name:'--label',
            expectedType:'string',
            expectedValues:['any'],
            alias:'-l'
        },
        {
            name:'--palette',
            expectedType:'string',
            expectedValues:['any'],
            alias:'-p'
        },
    ];
}
