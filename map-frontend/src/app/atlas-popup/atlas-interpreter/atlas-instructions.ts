import { AtlasDrawerComponent } from "../atlas-drawer/atlas-drawer.component";
import { AddButtonInstruction } from "./atlas-instructions-implementations-functions/add-button";
import { AddButtonPaletteInstruction } from "./atlas-instructions-implementations-functions/add-button-palette";
import { AddNodeInstruction } from "./atlas-instructions-implementations-functions/add-node";
import { AddSmartLinkInstruction } from "./atlas-instructions-implementations-functions/add-smart-link";
import { AddSubTopology } from "./atlas-instructions-implementations-functions/add-sub-topology";
import { AtlasInitInstruction } from "./atlas-instructions-implementations-functions/atlas-init";
import { CreateClusterInstruction } from "./atlas-instructions-implementations-functions/create-cluster";
import { CreateLayerInstruction } from "./atlas-instructions-implementations-functions/create-layer";
import { CreateLinkClassInstruction } from "./atlas-instructions-implementations-functions/create-link-class";
import { CreateSliceInstruction } from "./atlas-instructions-implementations-functions/create-slice";
import { FadeInstruction } from "./atlas-instructions-implementations-functions/fade";
import { FitViewInstruction } from "./atlas-instructions-implementations-functions/fit-view";
import { HighlightInstruction } from "./atlas-instructions-implementations-functions/highlight";
import { ImportFromInstruction } from "./atlas-instructions-implementations-functions/import-from";
import { InvalidInstructionAlert } from "./atlas-instructions-implementations-functions/invalid-instruction";
import { MoveElementInstruction } from "./atlas-instructions-implementations-functions/move-element";
import { PanViewInstruction } from "./atlas-instructions-implementations-functions/pan-view";
import { PushLinkPopupInstruction } from "./atlas-instructions-implementations-functions/push-link-popup";
import { PushPopupInstruction } from "./atlas-instructions-implementations-functions/push-popup";
import { RemoveNodeInstruction } from "./atlas-instructions-implementations-functions/remove-node";
import { RemovePopupInstruction } from "./atlas-instructions-implementations-functions/remove-popup";
import { RenameBaseLayerInstruction } from "./atlas-instructions-implementations-functions/rename-base-layer";
import { SetIconInstruction } from "./atlas-instructions-implementations-functions/set-icon";
import { SetSubTopologyOffset } from "./atlas-instructions-implementations-functions/set-sub-topology-offset";

/**
 * Map structure that contains data about the available Atlas instructions
 * TO CREATE NEW INSTRUCTIONS INSERT IT IN THIS LIST
 * __ATLAS_INSTRUCTIONS_LIST is copied to ATLAS_INSTRUCTION_LIST, which will be called outside this module
 *  @field aliases: The aliases available to be used by user to summon the same instruction
 *  @filed atlasInstruction: An object of the proper Atlas instruction, that will have the implemantation method,
 *  arguments list and available flags list
 */
const __ATLAS_INSTRUCTIONS_LABELS = {
    ADD_BUTTON:{
        aliases: ['ADDBUTTON', 'BUTTON'],
        atlasInstruction: (new AddButtonInstruction)},
    ADD_BUTTON_PALETTE:{
        aliases: ['ADDBUTTONPALETTE', 'BUTTON_PALETTE', 'BUTTONPALETTE'],
        atlasInstruction: (new AddButtonPaletteInstruction)},
    ADD_NODE:{
        aliases: ['ADDNODE', 'NODE'],
        atlasInstruction: (new AddNodeInstruction)},
    ADD_SMART_LINK:{
        aliases: ['SMART_LINK', 'SMARTLINK', 'LINK'],
        atlasInstruction: (new AddSmartLinkInstruction)},
    ADD_SUB_TOPOLOGY:{
        aliases: ['ADDSUBTOPOLOGY', 'SUB_TOPOLOGY', 'SUB_TOPOLOGY', 'ADD_TOPOLOGY', 'ADDTOPOLOGY'],
        atlasInstruction: (new AddSubTopology)},
    ATLAS_INIT:{
        aliases: ['ATLAS_INIT', 'ATLAS'],
        atlasInstruction: (new AtlasInitInstruction)},
    CREATE_CLUSTER:{
        aliases: ['CREATECLUSTER', 'CLUSTER'],
        atlasInstruction: (new CreateClusterInstruction)},
    CREATE_LAYER:{
        aliases: ['CREATELAYER', 'LAYER'],
        atlasInstruction: (new CreateLayerInstruction)},
    CREATE_LINK_CLASS:{
        aliases: ['LINK_CLASS', 'LINKCLASS'],
        atlasInstruction: (new CreateLinkClassInstruction)},
    CREATE_SLICE:{
        aliases: ['CREATESLICE', 'SLICE'],
        atlasInstruction: (new CreateSliceInstruction)},
    FADE:{
        aliases: [],
        atlasInstruction: (new FadeInstruction)},
    FIT_VIEW:{
        aliases: ['FITVIEW', 'FIT'],
        atlasInstruction: (new FitViewInstruction)},
    HIGHLIGHT:{
        aliases: ['HIGHLIGHT'],
        atlasInstruction: (new HighlightInstruction)},
    IMPORT_FROM:{
        aliases: ['IMPORTFROM', 'IMPORT'],
        atlasInstruction: (new ImportFromInstruction)},
    INVALID_INSTRUCTION:{
        aliases: [],
        atlasInstruction: (new InvalidInstructionAlert)},
    MOVE_ELEMENT:{
        aliases: ['MOVEELEMENT', 'MOVE', 'MV'],
        atlasInstruction: (new MoveElementInstruction)},
    PAN_VIEW:{
        aliases: ['PANVIEW', 'PAN'],
        atlasInstruction: (new PanViewInstruction)},
    PUSH_POPUP:{
        aliases: ['PUSHPOPUP', 'POPUP'],
        atlasInstruction: (new PushPopupInstruction)},
    PUSH_LINK_POPUP:{
        aliases: ['PUSHLINKPOPUP', 'LINK_POPUP', 'LINKPOPUP'],
        atlasInstruction: (new PushLinkPopupInstruction)},
    REMOVE_NODE:{
        aliases: ['REMOVENODE', 'RM_NODE', 'RMNODE'],
        atlasInstruction: (new RemoveNodeInstruction)},
    REMOVE_POPUP:{
        aliases: ['RM_POPUP', 'RMPOPUP'],
        atlasInstruction: (new RemovePopupInstruction)},
    RENAME_BASE_LAYER:{
        aliases: ['RENAMEBASELAYER', 'RENAME_BASE', 'RENAMEBASE'],
        atlasInstruction: (new RenameBaseLayerInstruction)},
    SET_ICON:{
        aliases: ['SETICON'],
        atlasInstruction: (new SetIconInstruction)},
    SET_SUB_TOPOLOGY_OFFSET:{
        aliases: ['SETSUBTOPOLOGYOFFSET', 'SUB_TOPOLOGY_OFFSET', 'SUBTOPOLOGY_OFFSET', 'SUBTOPOLOGYOFFSET'],
        atlasInstruction: (new SetSubTopologyOffset)},
} as const;

/**
 * ATLAS_INSTRUCTION_LIST key format
 */
export type AtlasInstructionKey = keyof typeof __ATLAS_INSTRUCTIONS_LABELS

/**
 * ATLAS_INSTRUCTION_LIST formated 
 * This guarantees that all instructions will have all AtlasInstructionLabel fields
 * Is this formated list that may be called
 */
export const ATLAS_INSTRUCTIONS_LABELS = __ATLAS_INSTRUCTIONS_LABELS as {[keys in AtlasInstructionKey]: AtlasInstructionLabel}

/**
 * ADT format of an Atlas instruction
 *  @field aliases: Strings array that represent all available aliases of instruction
 *  @field implementationFunction: Function which execute Atlas instruction
 */
export type AtlasInstructionLabel = {
    /**List of aliases can be used to call instruction */
    aliases: readonly string[];
    
    /** In instance of the proper AtlasInstruction, that will contain the instruction implementation */
    // atlasInstruction: (tokens: string[], drawerComponent: AtlasDrawerComponent) => void;
    atlasInstruction: AtlasInstruction;
}

/**
 *  Interface to implement Atlas instruction classes
 */
export interface AtlasInstruction {
    // implementation(tokens: string[], drawer: AtlasDrawerComponent): void;
    implementation(dataPassed: InstructionCallingPack, drawer: AtlasDrawerComponent): void;
    readonly parameters: AtlasInstructionParameter[];
    readonly availableFlags:AtlasInstructionAvailableFlag[];
}

export type AtlasInstructionParameter = {
    name: string;
    expectedType: string;
    mandatory: boolean;
    expectedValues: string[];
}

export type AtlasInstructionAvailableFlag = {
    name: string;
    expectedType: string;
    expectedValues: string[];
    alias: string;
}

// export const ATLAS_FLAG_NONE_PARAMETER_EXPECTED: string = 'none'
// export const ATLAS_PARAMETER_ANY_TYPE_EXPECTED: string = 'any'

// Arguments and flags
export type ProvidedArgument = {
    callingPosition: number;
    value: string;
    valueFormatIsValid: boolean;   
    formatedValue: any;
    line: number;
    collumn: number;
}

export type ProvidedFlag = {
    flagName: string;
    flagNameIsValid: boolean;
    value: string;   
    valueFormatIsValid: boolean;
    formatedValue: any
    line: number;
    collumn: number;
}

export type InstructionCallingPack = {
    atlasInstruction: AtlasInstruction;
    providedArguments: ProvidedArgument[];
    providedFlags: ProvidedFlag[];
    instructionNameAliasUsed: string;
    codeLine: number;
}

export function getInstructionNameByInstruction(instruction:AtlasInstruction): string{
    for(const stringInstructionKey in ATLAS_INSTRUCTIONS_LABELS){
        let instructionKey = stringInstructionKey as AtlasInstructionKey
        let instructionCandidate = ATLAS_INSTRUCTIONS_LABELS[instructionKey].atlasInstruction
        if(instructionCandidate === instruction)
            return instructionKey as string
    }

    return 'DONT_RECOGNIZED_INSTRUCTION'
}