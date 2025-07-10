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
import { AtlasLexicalAnalyser } from "../atlas-lexical-analyser/atlas-lexical-analyser";

export class CreateSliceInstruction implements AtlasInstruction{
  /** Implementation of Atlas instruction:  CREATE_SLICE
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by CREATE_SLICE instruction
   */
  // public implementation(tokens: Array<string>, atlasDrawer: AtlasDrawerComponent){
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    const slice: AtlasSlice = {} as AtlasSlice;
    
        slice.name = dataPassed.providedArguments[0].formatedValue;
        slice.highlighted = false;
        slice.nodes = [];
        slice.links = [];
        
        const nodesNames: string[] = dataPassed.providedArguments[1].formatedValue
        let node;
        if(nodesNames !== null && nodesNames !== undefined){
          nodesNames.forEach( nodeName => {
            node = atlasDrawer.getNodeByName(nodeName);
            if(node !== null)
              slice.nodes.push(node);
          })
        }
        atlasDrawer.addSlice(slice)          
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'name',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodes',
      mandatory: true,
      expectedType: 'string[]',
      expectedValues: [],
    }
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

  ];
}
