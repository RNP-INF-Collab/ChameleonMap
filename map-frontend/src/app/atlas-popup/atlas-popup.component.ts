import { identifierModuleUrl } from '@angular/compiler';
import { 
  Component, 
  Inject, 
  OnInit, 
  ViewChild,
  ElementRef,
  Type,
  Input,
  AfterViewChecked,
  OnChanges
} from '@angular/core';
import { SubMapComponent } from './sub-map/sub-map.component';
import { AtlasButtonBuilder } from './atlas-button-builder/atlas-button-builder';
import { AtlasIconBuilder } from './atlas-icon-builder/atlas-icon-builder.component';
import { AtlasExternalDataManager as AtlasExternalDataManager } from './atlas-external-references-manager';

@Component({
  selector: 'app-atlas-popup',
  templateUrl: './atlas-popup.component.html',
  styleUrls: ['./atlas-popup.component.css']
})
export class AtlasPopupComponent implements OnInit {
  // Child components
  @ViewChild(SubMapComponent) subMap: SubMapComponent;
  @ViewChild(AtlasIconBuilder) atlasIconBuilder: AtlasIconBuilder;
  
  // Child elements
  @ViewChild('overlayed_popup_conteiner') overlayedPopupContainer: ElementRef;
  @ViewChild('newtab_button') newtabButton: ElementRef;
  @ViewChild('opp_title') overlayedPopupTitle: ElementRef;

  // Data
  private _currentKeeper: Location | Tag;
  private _currentKeeperType: string;  
  public externalDataManager: AtlasExternalDataManager = new AtlasExternalDataManager();

  // Control
  private _isActive: boolean;
  
  // Parent Methods
  @Input() locations: Array<Location>;
  @Input() tags: Array<Tag>;

  constructor(){
    this._isActive = false;
  }
  
  public get isActive(){
    return this._isActive;
  }
  
  ngOnInit(): void{
    this.loadExternalElementsReferences()
  }
  
  ngOnChanges(){
    this.loadExternalElementsReferences()
  }
  
  private loadExternalElementsReferences(){
    this.externalDataManager.locations = this.locations;
    this.externalDataManager.tags = this.tags;
  }
  
  public activate(buttonClickedEvent: any){    
    const buttonId: string = buttonClickedEvent.id;
    
    this.setCurrentKeeperByButtonId(buttonId);
    this.setNewTabButtonLink();
    
    this.overlayedPopupContainer.nativeElement.classList.remove('hidden');
    this._isActive = true;
  }
  
  public desactivate(){
    this.overlayedPopupContainer.nativeElement.classList.add('hidden');
    this._isActive = false;
  }
  
  private setCurrentKeeperByButtonId(buttonId: string){
    if(buttonId.includes('location')){
      this._currentKeeperType = 'location';
      this._currentKeeper = this.externalDataManager.getLocationById(AtlasButtonBuilder.getLocationIdByButtonHtmlId(buttonId));
    }else if(buttonId.includes('tag')){
      this._currentKeeperType = 'tag';
      this._currentKeeper = this.externalDataManager.getTagById(AtlasButtonBuilder.getTagIdByButtonHtmlId(buttonId));
    }

    // Set title
    this.overlayedPopupTitle.nativeElement.innerHTML = ''
    switch(this._currentKeeperType){
      case 'location':
        this.pushLocationTitle(this._currentKeeper as Location)
        break;
      default:
        this.overlayedPopupTitle.nativeElement.innerHTML = `<div>${this._currentKeeper.name}</div>`;
        break;
    }

    // Set Content
    this.subMap.keeper = this._currentKeeper;
  }
  
  private setNewTabButtonLink(type: string = this._currentKeeperType, id: number = this._currentKeeper.id) {
    this.newtabButton.nativeElement.setAttribute('routerLink', `${type}/detail/${id}`)
    this.newtabButton.nativeElement.setAttribute('href', `${type}/detail/${id}`)
  }

  public refactorHTMLStringWithQuotes(HTMLstring: string) {
    HTMLstring = HTMLstring.toString();
    HTMLstring = HTMLstring.replace(/\"/g, '&quot');
    HTMLstring = HTMLstring.replace(/&quot/g, '&quot ');
    HTMLstring = HTMLstring.replace(/\n|\r/g, '');

    return HTMLstring;
  }

  public pushLocationTitle(location:Location){        
    if(this.overlayedPopupTitle.nativeElement.innerHTML !== '')
      this.overlayedPopupTitle.nativeElement.innerHTML += `  +  `;
    
    let idText = AtlasButtonBuilder.locationButtonLabel      
    idText += location.id;
        
    this.overlayedPopupTitle.nativeElement.innerHTML += `<button class="atlas-title-button" id="${idText}">${location.name}</button>`;    
  }

  public receiveTitleForPushing(location:Location){        
    this.pushLocationTitle(location)
  }
}
