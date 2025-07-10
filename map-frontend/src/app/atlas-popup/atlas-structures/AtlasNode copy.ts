export interface AtlasNode{
  node: L.Marker;
  name: string;
  group: string;
  tagName: string;
  xPos: number;
  yPos: number;
  highlighted: boolean;
  faded: boolean;

  layer: number;
  layerExclusive: boolean;
}
