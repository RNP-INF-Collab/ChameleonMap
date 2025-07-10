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

export class SetSubTopologyOffset implements AtlasInstruction{
  /** Implementation of Atlas instruction:  SET_SUB_TOPOLOGY_OFFSET
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by SET_SUB_TOPOLOGY_OFFSET instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    let subTopologyName = dataPassed.providedArguments[0].formatedValue
    let xOffSet = dataPassed.providedArguments[1].formatedValue
    let yOffSet = dataPassed.providedArguments[2].formatedValue

    let subTopology = atlasDrawer.getSubtopologyByName(subTopologyName)
    
    if(subTopology !== null){
      subTopology.positionOffSet.x = xOffSet
      subTopology.positionOffSet.y = yOffSet

    }
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name:'subTopologyName',
      expectedType:'string',
      expectedValues:[],
      mandatory: true,
    },
    {
      name:'x',
      expectedType:'number',
      expectedValues:[],
      mandatory: true,
    },
    {
      name:'y',
      expectedType:'number',
      expectedValues:[],
      mandatory: true,
    },
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

  ];
}
