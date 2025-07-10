import { AtlasNode } from "./AtlasNode";
import { AtlasLink } from "./AtlasLink";
import { AtlasSlice } from "./AtlasSlice";
import { AtlasLinkClass } from "./AtlasLinkClass";
import { AtlasNodeGroup } from "./AtlasNodeGroup";
import { AtlasCustomButton } from "./AtlasCustomButton";

export interface AtlasButtonPalette{
  name: string;    
  buttons: Array<AtlasCustomButton>;
  active: boolean;
  checkingBehavior: string;
  
  labelName: string;
}
  