import { AtlasNode } from "../../atlas-structures/AtlasNode";
import { AtlasLink } from "../../atlas-structures/AtlasLink";
import { AtlasSlice } from "../../atlas-structures/AtlasSlice";
import { AtlasLinkClass } from "../../atlas-structures/AtlasLinkClass";
import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { ProvidedFlag } from "../atlas-instructions";
import { 
  AtlasInstruction,
  AtlasInstructionParameter,
  AtlasInstructionAvailableFlag,
  InstructionCallingPack,
} from "../atlas-instructions";
import { AtlasLexicalAnalyser } from "../atlas-lexical-analyser/atlas-lexical-analyser";
import { AtlasNodeGroup as AtlasNodeGroup } from "../../atlas-structures/AtlasNodeGroup";

export class CreateNodeGroupInstruction implements AtlasInstruction{  
  /** Implementation of Atlas instruction:  CreateNodeGroupInstruction
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by CreateNodeGroupInstruction instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    // Arguments
    const nodeGroup: AtlasNodeGroup = {} as AtlasNodeGroup;
    nodeGroup.name = dataPassed.providedArguments[0].formatedValue;
    
    if(dataPassed.providedArguments.length >= 3 ){
      nodeGroup.info = dataPassed.providedArguments[2].formatedValue;
    }else if(dataPassed.providedArguments.length >= 2 ){
      nodeGroup.level = dataPassed.providedArguments[1].formatedValue;
    }

    // Flags
    dataPassed.providedFlags.forEach( (flag, index) => {
      switch(flag.flagName){
        case '--color':
          nodeGroup.highlightColor = flag.formatedValue;
          break;
      }
    });

    atlasDrawer.addNodeGroup(nodeGroup)
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'name',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'level',
      mandatory: false,
      expectedType: 'int',
      expectedValues: [],
    },
    {
      name: 'info',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    }
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    {
      name:'--color',
      expectedType:'string',
      expectedValues:[],
      alias:'-c',
    },
  ];
}
