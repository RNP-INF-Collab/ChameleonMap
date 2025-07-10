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

export class PanViewInstruction implements AtlasInstruction{
  /** Implementation of Atlas instruction:  PAN_VIEW
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by PAN_VIEW instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){      
    const xOffset: number = dataPassed.providedArguments[0].formatedValue;
    const yOffset: number = dataPassed.providedArguments[1].formatedValue;

    atlasDrawer.setScreenViewCenterOffset(-xOffset, -yOffset)
    atlasDrawer.restoreCustomizedScreenView()
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name:'xPan',
      expectedType:'number',
      expectedValues:[],
      mandatory:true,
    },
    {
      name:'yPan',
      expectedType:'number',
      expectedValues:[],
      mandatory:true,
    }
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [

  ];
}
