export interface AtlasLink{
    link: L.Polyline;
    nodeSrcName: string;
    nodeTgtName: string;
    color: string;
    class: string;
    
    srcAnchor: string;  
    tgtAnchor:string;
    weight: number;
    opacity: number;
    dashLength: number;
    gapLength: number;

    info: string;
    externalSrcLinkType: boolean;
    externalTgtLinkType: boolean;
    subTopologyname: string;
  
    layer: number;
    layerExclusive: boolean;
  }
    