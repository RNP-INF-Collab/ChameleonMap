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
import { AtlasButtonPalette } from "../../atlas-structures/AtlasButtonPalette";

export class AddButtonPaletteInstruction implements AtlasInstruction{
    /** Implementation of Atlas instruction:  ADD_BUTTON_PALETTE
     * Version: 2.0
     * @param tokens The tokens of Atlas script line
     * @param atlasDrawer Instance of AtlasDrawer that will be operated by ADD_BUTTON_PALETTE instruction
     */
    // public implementation(tokens: Array<string>, atlasDrawer: AtlasDrawerComponent){
    public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
        let palette: AtlasButtonPalette = {} as AtlasButtonPalette;
        palette.active = true
        palette.buttons = []
        palette.name = dataPassed.providedArguments[0].formatedValue
        palette.checkingBehavior = dataPassed.providedArguments[1].formatedValue
        
        palette.labelName = palette.name
        if(dataPassed.providedArguments.length >= 3)
            palette.labelName = dataPassed.providedArguments[2].formatedValue
        
        atlasDrawer.addButtonsPalette(palette)
    }

    public readonly parameters: AtlasInstructionParameter[] = [
        {
            name: 'name',
            expectedType: 'string',
            expectedValues: [],
            mandatory: true,
        },
        {
            name: 'type',
            expectedType: 'string',
            expectedValues: [],
            mandatory: true,
        },
        {
            name: 'label',
            expectedType: 'string',
            expectedValues: [],
            mandatory: false,
        },
    ];

    public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    ];
}
