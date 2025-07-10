import { 
    Component, 
    Input 
} from "@angular/core";
import { AtlasNode } from "../atlas-structures/AtlasNode";
import { AtlasTopology } from "../atlas-structures/AtlasTopology";
import { AtlasExternalDataManager } from "../atlas-external-references-manager";

@Component({
    selector: 'app-atlas-icon-builder',
    templateUrl: './atlas-icon-builder.component.html',
    styleUrls: ['./atlas-icon-builder.component.css']
})  
export class AtlasIconBuilder{
    // Parent methods
    @Input() externalDataManager: AtlasExternalDataManager;
    // @Input() getLocationByName: (locationName:string) => Location;

    // AtlasIconBuilder Methods
    public getNodeIconFromTag(node: AtlasNode): string{
      const tag: Tag = this.externalDataManager.getTagByName(node.tagName);
      const style: string = AtlasIconBuilder.getDefaultIconContainerStyle(tag.color); 
      const styleBorder = AtlasIconBuilder.getDefaultIconContainerBorderStyle();
      const nodeClass = 'class="atlas-node-icon-active"';
      
      return `<div ${nodeClass} style="${styleBorder}"><div style="${style}">${AtlasIconBuilder.getNodeTitleStyleConfig(tag.name)}</div></div>`
    }

    public static getSubTopologyIconFromLocation(subTopology: AtlasTopology): string{
      const nodeClass = 'class="atlas-sub-topology-icon-active"';
      const conteinerStyle = AtlasIconBuilder.getDefaultSubTopologyIconStyle();
      const titleStyle = AtlasIconBuilder.getSubTopologyTitleStyle();

      return `<div ${nodeClass} style = "${conteinerStyle}">${AtlasIconBuilder.getSubTopologyIconSVG(subTopology.color)} <p style="${titleStyle}">${subTopology.locationName}</p></div>`
    }

    public static getDefaultNodeIcon(node: AtlasNode, color: string): string{
      const style = AtlasIconBuilder.getDefaultIconContainerStyle(color);
      const styleBorder = AtlasIconBuilder.getDefaultIconContainerBorderStyle();
      const nodeClass = 'class="atlas-node-icon-active"';

      return `<div ${nodeClass} style="${styleBorder}><div style="${style}">${AtlasIconBuilder.getNodeTitleStyleConfig(node.name)}</div></div>`
    }

    public static getDefaultSubTopologyIcon(subTopology: AtlasTopology, color: string = 'cyan'): string{
      const nodeClass = 'class="atlas-sub-topology-icon-active"';
      const conteinerStyle = AtlasIconBuilder.getDefaultSubTopologyIconStyle();
      const titleStyle = AtlasIconBuilder.getSubTopologyTitleStyle();

      return `<div ${nodeClass} style = "${conteinerStyle}">${AtlasIconBuilder.getSubTopologyIconSVG(color)} <p style="${titleStyle}">${subTopology.name}</p></div>`
    }

    private static getNodeTitleStyleConfig(nodeTitle: string): string{
        const style = `
        display: flex;
        flex-direction: row;
        font-weight: bold;
        align-items: center;
        overflow: hidden;
        max-width: 100%;
        max-height: 100%;
        `;    

        return `<div style="${style}">${nodeTitle}</div>`
    }

    private static getDefaultIconContainerStyle(color: string): string{
        return `       
        background-color: ${color}; 
        width: 96%; 
        height: 95%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
      `;
    }

    private static getDefaultIconContainerBorderStyle(): string{
      return `       
      background-color: gray; 
      width: 100%; 
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      `;
    }
    
    private static getDefaultSubTopologyIconStyle(): string{
      return `
      width: 100%;
      height: 100%;
      `;
    }
    
    private static getSubTopologyTitleStyle(): string{
      return `
      display: flex;
      font-size: 100%vp; 
      font-weight: bold; 
      margin-top: -8%; 
      overflow:hidden;
      text-wrap: nowrap;
      align-items: center;      
      white-space: nowrap;
      justify-content: center;
      `;
    }
    
    private static getSubTopologyIconSVG(color: string): string{
        return `
        <svg height = "100%" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 280.107 280.107" xml:space="preserve">
        <g>
          <path fill= "${color}" d="M140.049,0C79.677,0,30.725,47.412,30.725,105.903c0,1.138,0.543,28.353,9.941,47.762
            c26.926,60.162,99.287,126.782,99.383,126.441c0.123,0.228,72.177-66.025,99.235-126.082c8.033-14.238,10.098-45.802,10.098-48.13
            C249.391,47.412,200.43,0,140.049,0z M140.067,140.049c-16.933,0-30.628-13.704-30.628-30.619
            c0-16.924,13.695-30.637,30.628-30.637c16.924,0,30.628,13.713,30.628,30.637C170.695,126.345,156.991,140.049,140.067,140.049z"/>
          <path style="fill:#2B7D6E;" d="M140.067,61.3c-26.576,0-48.13,21.545-48.13,48.13c0,26.576,21.553,48.121,48.13,48.121
            s48.13-21.545,48.13-48.121C188.197,82.844,166.643,61.3,140.067,61.3z M140.067,140.049c-16.933,0-30.628-13.704-30.628-30.619
            c0-16.924,13.695-30.637,30.628-30.637c16.924,0,30.628,13.713,30.628,30.637C170.695,126.345,156.991,140.049,140.067,140.049z"/>
        </g>
        </svg>
        `;
    }

}