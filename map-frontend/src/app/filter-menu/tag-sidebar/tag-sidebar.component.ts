import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { MatOptgroup } from '@angular/material/core';
import { EventEmitterService } from '../../event-emitter.service';

@Component({
  selector: 'app-tag-sidebar',
  templateUrl: './tag-sidebar.component.html',
  styleUrls: ['./tag-sidebar.component.css']
})
export class TagSidebarComponent {
  public _tags: Array<Tag>;
  public _locations: Array<Location>;
  public _selectedLocations: Array<Location>;
  public _selectedTagId: number;
  public _selectedTag: Tag;
  public _sbContent: string;
  public _hasSbContent: boolean;
  public _collapsed = true;
  public _locationsCollapsed = true;
  public _pinnedMenusCollapsed = false;
  public _pinnedMenus: Array<Menu>;

  constructor() {
    this._pinnedMenus = [];
  }

  @Input() capitalizeFirstLetter: (str: string) => string;
  @Output() unpinMenuEmitter = new EventEmitter<Menu>(); 
  @Output() selectMenuEmitter = new EventEmitter<Menu>(); 

  pinnedMenusHeaderClicked() {
    if (this._pinnedMenusCollapsed) this.showPinnedMenus();
    else this.collapsePinnedMenus();
  }

  showPinnedMenus() {
    this._pinnedMenusCollapsed = false;
  }

  collapsePinnedMenus() {
    this._pinnedMenusCollapsed = true;
  }

  menuSwitch() {
    if (this._collapsed) this.show();
    else this.collapse();
  }

  locationsSwitch() {
    if (this._locationsCollapsed) this.locationsShow();
    else this.locationsCollapse();
  }

  locationsShow() {
    this._locationsCollapsed = false;
  }

  locationsCollapse() {
    this._locationsCollapsed = true;
  }

  collapse() {
    this._collapsed = true;

    const sidebar =
      document.querySelectorAll<HTMLElement>(
        '.right-sidebar'
      );

    sidebar[0]?.setAttribute(
      'style',
      'right: -320px;'
    );

    const outer =
      document.querySelectorAll<HTMLElement>(
        '.right-sidebar-container'
      );

    outer[0]?.classList.add('collapsed');
  }

  show() {
    this._collapsed = false;

    const sidebar =
      document.querySelectorAll<HTMLElement>(
        '.right-sidebar'
      );

    sidebar[0]?.setAttribute(
      'style',
      'right: 0px;'
    );

    const outer =
      document.querySelectorAll<HTMLElement>(
        '.right-sidebar-container'
      );

    outer[0]?.classList.remove('collapsed');
  }

  public addPinnedMenu(menu: Menu){
    this._pinnedMenus.push(menu)
  }

  public removePinnedMenu(menu: Menu){
    const index = this._pinnedMenus.indexOf(menu)
    this._pinnedMenus.splice(index, 1)
  }

  public unpinClickedMenu(menu: Menu) {
    this.removePinnedMenu(menu)
    this.unpinMenuEmitter.emit(menu)
  }


  unpinAllPinnedMenus() {
    this._pinnedMenus.forEach( menu =>
      this.unpinClickedMenu(menu)
    )
    this._pinnedMenus = [];
  }

  public openPinnedMenu(menu: Menu) {
    alert('unpin this menu: ' + menu.name);
  }

  get isLink(): boolean {
    return (this._selectedTag as any)?.isLink === true;
  }

  getNetworks(): string[] {
    const networks = (this._selectedTag as any)?.networks;

    if (!networks) return [];

    return Array.isArray(networks)
      ? networks
      : networks.split(';').map((n: string) => n.trim());
  }

  public selectTag(tag: Tag, related_locations: Array<Location>) {
    if (tag != this._selectedTag || this._selectedTag == undefined) {
      this._selectedTag = tag;
      this._selectedLocations = related_locations;
      /*Indicating whether the tag has sidebar content to show*/
      this._hasSbContent = !(
        this._selectedTag.sidebar_content == null ||
        this._selectedTag.sidebar_content == '' ||
        this._selectedTag.sidebar_content == 'null' ||
        this._selectedTag.sidebar_content == '<p>null</p>' ||
        this._selectedTag.sidebar_content == '<p></p>'
      );
      this.locationsCollapse();
      this.collapsePinnedMenus();
      this.show();
    } else if (this._collapsed) {
      /* Collapsing the menu whenever it receives the same tag or its collapsed */
      this.show();
    } else {
      this.collapse();
    }
  }

  hasMultipleNetworks(): boolean {
    const networks = (this._selectedTag as any)?.networks;

    if (!networks) return false;

    const list = Array.isArray(networks)
      ? networks
      : networks.split(';').map((n: string) => n.trim());

    return list.length > 1;
  }

  getPrimaryNetwork(): string {
    const networks = (this._selectedTag as any)?.networks;

    if (!networks) return '';

    const list = Array.isArray(networks)
      ? networks
      : networks.split(';').map((n: string) => n.trim());

    return list[0] || '';
  }
}
