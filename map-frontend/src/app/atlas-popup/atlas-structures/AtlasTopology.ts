import { AtlasNode } from "./AtlasNode";
import { AtlasLink } from "./AtlasLink";
import { AtlasSlice } from "./AtlasSlice";
import { AtlasLinkClass } from "./AtlasLinkClass";
import { AtlasNodeGroup } from "./AtlasNodeGroup";
import { AtlasCluster } from "./AtlasCluster";

export interface AtlasTopology{
  marker: L.Marker;
  name: string;    
  locationName: string;
  xPos: number;
  yPos: number;  
  nodes: Array<AtlasNode>;
  links: Array<AtlasLink>;
  clusters: Array<AtlasCluster>;
  slices: Array<AtlasSlice>;
  linkClasses: Array<AtlasLinkClass>;
  nodeGroups: Array<AtlasNodeGroup>;
  subTopologies: Array<AtlasTopology>;
  
  color: string;
  expanded: boolean;

  positionOffSet: {x: number, y:number};

  layersCount: number;
  currentLayer: number;
  layersNames: Array<string>;
}
  