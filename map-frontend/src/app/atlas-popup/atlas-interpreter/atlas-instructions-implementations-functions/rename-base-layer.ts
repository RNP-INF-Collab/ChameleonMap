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

export class RenameBaseLayerInstruction implements AtlasInstruction{  
  /** Implementation of Atlas instruction:  RENAME_BASE_LAYER
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by RENAME_BASE_LAYER instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    // Arguments
    const cluster: AtlasNodeGroup = {} as AtlasNodeGroup;
    atlasDrawer.topologyData.layersNames[0] = dataPassed.providedArguments[0].formatedValue;
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'name',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    }
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
  ];
}
