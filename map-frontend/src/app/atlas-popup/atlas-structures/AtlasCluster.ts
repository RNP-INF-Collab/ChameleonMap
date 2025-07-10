import { AtlasNode } from "./AtlasNode";

export interface AtlasCluster{
  representation: AtlasNode;
  nodes: Array<AtlasNode>; 
}
    