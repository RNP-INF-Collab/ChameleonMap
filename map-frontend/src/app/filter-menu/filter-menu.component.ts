import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { EventEmitterService } from '../event-emitter.service';
import { TagSidebarComponent } from './tag-sidebar/tag-sidebar.component';

enum TagsMenuButtonBehavior{
  CloseAllEyes,
  OpenAllEyes
}

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.css']
})
export class FilterMenuComponent {
  @ViewChild(TagSidebarComponent) tagSidebar: TagSidebarComponent;

  private _menus: Array<Menu>;
  private _tags: Array<Tag>;
  public _locations: Array<Location>;
  public _selectedTagsMenuId: number;
  public headerStyle: 'background:red';
  public isCollapsed = false;
  public _currentMenusPallete = 1;
  public _linksActive: boolean;
  public currentBehaviorOfMultipleTagsVisibilityButton: TagsMenuButtonBehavior = TagsMenuButtonBehavior.CloseAllEyes;
  tagsMenuButtonBehavior = TagsMenuButtonBehavior;

  @Input()
  get menus() {
    return this._menus;
  }
  set menus(value) {
    this._menus = value;
  }

  @Input()
  get tags() {
    return this._tags;
  }
  set tags(value) {
    this._tags = value;
  }

  @Input()
  get locations() {
    return this._locations;
  }
  set locations(value) {
    this._locations = value;
  }

  @Input()
  get selectedTagsMenuId() {
    return this._selectedTagsMenuId;
  }
  set selectedTagsMenuId(value) {
    this._selectedTagsMenuId = value;
  }

  @Input()
  get currentMenu() {
    return this._currentMenusPallete;
  }
  set currentMenu(value) {
    this._currentMenusPallete = value;
  }

  @Input()
  get linksActive() {
    return this._linksActive;
  }
  set linksActive(value) {
    this._linksActive = value;
  }

  @Input()
  insertMarkersByMenu: any;

  @Output()
  menuCliked = new EventEmitter();

  @Output()
  tagRemoval = new EventEmitter();

  @Output()
  tagReactivated = new EventEmitter();

  constructor(private eventEmitterService: EventEmitterService) {}

  ngOnInit() {
    if (this.eventEmitterService.subsVar == undefined) {
      this.eventEmitterService.subsVar =
        this.eventEmitterService.invokeFirstComponentFunction.subscribe(
          (name: string) => {
            this.menuCollapse();
          }
        );
    }
  }

  menuClick(menu: Menu) {
    if (this.selectedTagsMenuId !== menu.id) {
      this.selectedTagsMenuId = menu.id;
      this.currentBehaviorOfMultipleTagsVisibilityButton = TagsMenuButtonBehavior.CloseAllEyes;
      this.menuCliked.emit({ selectedTagsMenuId: this.selectedTagsMenuId });
      this.checkActiveMenuTagsVisibilityStatus()
    }
  }

  closeAllEyes(menu: Menu, item: any, event: any) {
    for(let i = 0 ; i < this._tags.length ; i++){
      if(this._tags[i].parent_menu == menu.id){
        if(this._tags[i].visibility == true){
          this.visibilityClick(this._tags[i], event)
        }
      }
    }
    
    this.currentBehaviorOfMultipleTagsVisibilityButton = TagsMenuButtonBehavior.OpenAllEyes;
  }

  openAllEyes(menu: Menu, item: any, event: any) {
    for(let i = 0 ; i < this._tags.length ; i++){
      if(this._tags[i].parent_menu == menu.id){
        if(this._tags[i].visibility == false){
          this.visibilityClick(this._tags[i], event)
        }
      }
    }

    this.currentBehaviorOfMultipleTagsVisibilityButton = TagsMenuButtonBehavior.CloseAllEyes;
  }

  menuSwitch(menu: Menu, item: any, event: any) {
    menu.expanded = !menu.expanded;
    event.stopPropagation();
    const thisCell = item.closest('.mat-expansion-panel-body');
    if (menu.expanded === false) {
      thisCell.style = 'padding: 0 24px 0;';
    } else {
      thisCell.style = 'padding: 0 24px 16px;';
    }
  }

  menuCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const menufilter = document.querySelectorAll<HTMLElement>('.scrollbar-box');
    for (let i = 0, len = menufilter.length; i < len; i++) {
      if (this.isCollapsed) {
        menufilter[i].setAttribute('style', 'left: -312px;');
      } else {
        menufilter[i].setAttribute('style', 'left: 15px;');
      }
    }
  }

  visibilityClick(tag: any, event: any) {
    // Added in need for the sidebar button not to open
    event.stopPropagation();

    if (tag.parent_menu !== this.selectedTagsMenuId) {
      const beforeState = this.selectedTagsMenuId;
      this.selectedTagsMenuId = tag.parent_menu;
      this.menuCliked.emit({ selectedTagsMenuId: this.selectedTagsMenuId });
      this.switchVisibility(tag);
      this.selectedTagsMenuId = beforeState;
      this.menuCliked.emit({ selectedTagsMenuId: this.selectedTagsMenuId });
    } else this.switchVisibility(tag);

    if(tag.parent_menu === this.selectedTagsMenuId)
      this.checkActiveMenuTagsVisibilityStatus()
  }

  pinClick(tag: any, event: any) {
    // Added in need for the sidebar button not to open
    event.stopPropagation();

    if (tag.currentColor === tag.color) {
      tag.currentColor = '#AFBAC4';
    } else {
      tag.currentColor = tag.color;
    }
    this.menuCliked.emit({ selectedTagsMenuId: this.selectedTagsMenuId });
  }

  getLocationById(location_id: number) {
    for (const location of this._locations) {
      if (location.id === location_id) {
        return location;
      }
    }
    return null;
  }

  invokeTagSidebar(tag: Tag) {
    const _selectedLocations = Array<Location>();
    tag.related_locations.forEach((location_id: number) => {
      const location: any = this.getLocationById(location_id);
      _selectedLocations.push(location);
    });
    this.tagSidebar.selectTag(tag, _selectedLocations);
  }

  checkActiveMenuTagsVisibilityStatus(){
    let allTagsAreClosed: Boolean = true;
    let allTagsAreOpened: Boolean = true;
    
    this.tags.forEach(tag => {
      if( tag.parent_menu === this._selectedTagsMenuId){
        if(tag.visibility)
          allTagsAreClosed = false;
        else
          allTagsAreOpened = false;
      }
    })

    if(allTagsAreClosed)
      this.currentBehaviorOfMultipleTagsVisibilityButton = TagsMenuButtonBehavior.OpenAllEyes;
    else if(allTagsAreOpened)
      this.currentBehaviorOfMultipleTagsVisibilityButton = TagsMenuButtonBehavior.CloseAllEyes;
  }

  switchVisibility(tag: any) {
    if (tag.dependenciesActive) {
      if (tag.visibility) {
        tag.visibility = false;        
        this.removeMarkersByTag(tag);
      } else {
        if (tag.parent_menu === this.selectedTagsMenuId) {
          tag.visibility = true;
          this.insertMarkersByTag(tag);
        }
      }
    }
  }

  removeMarkersByTag(tag: Tag) {
    this.tagRemoval.emit({ selectedTag: tag });
  }

  insertMarkersByTag(tag: any) {
    this.tagReactivated.emit({ tag: tag });
  }

  checkMenuActivated(menu: Menu) {
    return menu.active;
  }

  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
