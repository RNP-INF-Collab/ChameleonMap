import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AtlasButtonPalette } from "../../atlas-structures/AtlasButtonPalette";
import { AtlasCustomButton } from "../../atlas-structures/AtlasCustomButton";

@Component({
  selector: 'app-atlas-button-palettes-drawer',
  templateUrl: './atlas-button-palettes-drawer.component.html',
  styleUrls: ['./atlas-button-palettes-drawer.component.css']
})
export class AtlasButtonPalettesDrawerComponent{
  @Input() buttonPalettes: AtlasButtonPalette[];
  @Input() layersNames: Array<string>;
  @Input() currentLayer: number;
  @Output() currentLayerChange = new EventEmitter<number>();
  @Output() scriptEmitter = new EventEmitter<string>();
  layersPaletteExpanded = true;
  
  public printT(msg: string){
    console.log(msg)
  }

  public triggerButtonCallback(palette: AtlasButtonPalette, button: AtlasCustomButton){
    switch(palette.checkingBehavior){
      case 'trigger':
        this.sendScriptToInterpreter(button.checkAction)
        break
        case 'at-most-1':
          if(!button.checked){
            this.sendScriptToInterpreter(button.checkAction)
            button.checked = true            
          }else{
            this.sendScriptToInterpreter(button.uncheckAction)
            button.checked = false
          }
        break;
    }
  }

  private sendScriptToInterpreter(script: string){
    this.scriptEmitter.emit(script)
  }

  private announceLayerChanging(layer: number){
    this.currentLayerChange.emit(layer)
  }

  layersPaletteExpansionToggle(item: any, event: any){
    this.layersPaletteExpanded = !this.layersPaletteExpanded

    event.stopPropagation();
    const thisCell = item.closest('.mat-expansion-panel-body');
    if(this.layersPaletteExpanded === false){
      thisCell.style = 'padding: 0 24px 0;';
    } else {
      thisCell.style = 'padding: 0 24px 16px;';
    }
  }

  changeCurrentLayer(layerName: string){
    let index = this.layersNames.findIndex(name => name === layerName)

    if(index !== -1){
      this.currentLayer = index
      this.announceLayerChanging(index)
    }
  }

  getCurrentLayerName(): string{
    return this.layersNames[this.currentLayer];
  }
}
