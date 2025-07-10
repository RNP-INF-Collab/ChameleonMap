import { AtlasNode } from "./AtlasNode";
import { AtlasLink } from "./AtlasLink";

export interface AtlasSlice{
    name: string;
    nodes: Array<AtlasNode>;
    links: Array<AtlasLink>;
    highlighted: boolean;
}
