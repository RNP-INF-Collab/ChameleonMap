import { AtlasNode } from "./AtlasNode";
import { AtlasLink } from "./AtlasLink";
import { AtlasSlice } from "./AtlasSlice";
import { AtlasLinkClass } from "./AtlasLinkClass";
import { AtlasNodeGroup } from "./AtlasNodeGroup";

export interface AtlasCustomButton{
  name: string;
  paletteName: string;    
  action: string;
  
  checkAction: string;
  uncheckAction: string;
  checked: boolean;
  
  labelName: string;    
  color: string;
}
  