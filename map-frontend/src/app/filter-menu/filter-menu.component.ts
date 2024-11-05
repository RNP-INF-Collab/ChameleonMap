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

enum TagsMenuButtonBehavior {
  CloseAllEyes,
  OpenAllEyes
}

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.css']
})
export class FilterMenuComponent implements OnInit {
  @ViewChild(TagSidebarComponent) tagSidebar: TagSidebarComponent;

  @Input() set menugroups(value: Array<MenuGroup>) {
    this._menugroups = value;
    if (this._menus?.length) {
      this.activeMenus = this.getActiveMenus();
    }
  }
  @Input() set menus(value: Array<Menu>) {
    this._menus = value ?? [];
    this.activeMenus = this.getActiveMenus();
  }
  @Input() set tags(value: Array<Tag>) {
    this._tags = value;
  }
  @Input() set linkGroups(value: Array<LinksGroup>) {
    this._linkGroups = value;
  }
  @Input() set kmlShapes(value: Array<KmlShape>) {
    this._kmlShapes = value;
  }
  @Input() set locations(value: Array<Location>) {
    this._locations = value;
  }
  @Input() set selectedTagsMenuId(value: number) {
    this._selectedTagsMenuId = value;
  }
  @Input() set currentMenu(value: string) {
    this._currentMenusPallete = value ?? '';
    if (this._menus?.length) {
      this.activeMenus = this.getActiveMenus();
    }
  }
  @Input() set linksActive(value: boolean) {
    this._linksActive = value;
  }
  @Input() insertMarkersByMenu: any;

  @Output() linkRemoval = new EventEmitter();
  @Output() linkReactivated = new EventEmitter();
  @Output() menuClicked = new EventEmitter();
  @Output() tagRemoval = new EventEmitter();
  @Output() tagReactivated = new EventEmitter();
  @Output() shapeRemoval = new EventEmitter();
  @Output() shapeReactivated = new EventEmitter();

  private _menugroups: Array<MenuGroup> = [];
  private _menus: Array<Menu> = [];
  private _tags: Array<Tag> = [];
  private _kmlShapes: Array<KmlShape> = [];
  private _linkGroups: Array<LinksGroup> = [];
  private _locations: Array<Location> = [];
  private _selectedTagsMenuId: number;
  private _currentMenusPallete: string;
  private _linksActive: boolean;

  public isCollapsed = false;
  public activeMenus: Array<Menu> = [];
  public currentBehaviorOfMultipleTagsVisibilityButton: TagsMenuButtonBehavior = TagsMenuButtonBehavior.CloseAllEyes;

  constructor(private eventEmitterService: EventEmitterService) {}

  ngOnInit() {
    if (!this.eventEmitterService.subsVar) {
      this.eventEmitterService.subsVar = this.eventEmitterService.invokeFirstComponentFunction.subscribe(() => {
        this.toggleMenuCollapse();
      });
    }
  }

  handleMenuClick(menu: Menu) {
    if (this._selectedTagsMenuId !== menu.id) {
      this.updateSelectedMenu(menu);
      this.menuClicked.emit({ selectedTagsMenuId: this._selectedTagsMenuId });
      this.updateVisibilityStatus();
    }
  }

  toggleVisibilityForAll(menu: Menu, close: boolean) {
    this._tags
      .filter(tag => tag.parent_menu === menu.id && tag.visibility === !close)
      .forEach(tag => this.toggleTagVisibility(tag));
    
    this._kmlShapes
      .filter(shape => shape.parent_menu === menu.id && shape.visibility === !close)
      .forEach(shape => this.toggleKmlVisibility(shape));

    this.currentBehaviorOfMultipleTagsVisibilityButton = close ? TagsMenuButtonBehavior.OpenAllEyes : TagsMenuButtonBehavior.CloseAllEyes;
  }

  handleVisibilityToggle(tag: Tag, event: Event) {
    event.stopPropagation();
    if (tag.parent_menu !== this._selectedTagsMenuId) {
      const prevMenuId = this._selectedTagsMenuId;
      this.updateSelectedMenuId(tag.parent_menu);
      this.toggleTagVisibility(tag);
      this.updateSelectedMenuId(prevMenuId);
    } else {
      this.toggleTagVisibility(tag);
    }
    this.updateVisibilityStatus();
  }

  handleKmlVisibilityToggle(kmlShape: KmlShape, event: Event) {
    event.stopPropagation();
    this.toggleKmlVisibility(kmlShape);
    this.updateVisibilityStatus();
  }

  handlePinClick(tag: Tag, event: Event) {
    event.stopPropagation();
    tag.currentColor = tag.currentColor === tag.color ? '#AFBAC4' : tag.color;
    this.menuClicked.emit({ selectedTagsMenuId: this._selectedTagsMenuId });
  }

  private toggleTagVisibility(tag: Tag) {
    tag.visibility = !tag.visibility;
    tag.visibility ? this.insertMarkersByTag(tag) : this.removeMarkersByTag(tag);
  }

  private toggleKmlVisibility(kmlShape: KmlShape) {
    kmlShape.visibility = !kmlShape.visibility;
    kmlShape.visibility ? this.shapeReactivated.emit({ shape: kmlShape }) : this.shapeRemoval.emit({ shape: kmlShape });
  }

  private updateSelectedMenu(menu: Menu) {
    const previousMenu = this.getMenuById(this._selectedTagsMenuId);
    if (previousMenu) previousMenu.expanded = false;
    menu.expanded = true;
    this._selectedTagsMenuId = menu.id;
  }

  private updateSelectedMenuId(menuId: number) {
    this._selectedTagsMenuId = menuId;
    this.menuClicked.emit({ selectedTagsMenuId: this._selectedTagsMenuId });
  }

  private updateVisibilityStatus() {
    const isAllClosed = this.checkVisibilityStatus(false);
    const isAllOpened = this.checkVisibilityStatus(true);
    this.currentBehaviorOfMultipleTagsVisibilityButton = isAllClosed
      ? TagsMenuButtonBehavior.OpenAllEyes
      : isAllOpened
      ? TagsMenuButtonBehavior.CloseAllEyes
      : this.currentBehaviorOfMultipleTagsVisibilityButton;
  }

  private checkVisibilityStatus(expectedStatus: boolean) {
    return [...this._tags, ...this._kmlShapes].every(item =>
      item.parent_menu === this._selectedTagsMenuId ? item.visibility === expectedStatus : true
    );
  }

  private getMenuById(id: number): Menu | null {
    return this._menus.find(menu => menu.id === id) || null;
  }

  private getLocationById(id: number): Location | null {
    return this._locations.find(location => location.id === id) || null;
  }

  private getActiveMenus(): Array<Menu> {
    if (this._currentMenusPallete === 'Links') return [];
    const activeMenus = this._menus.filter(menu => menu.active && menu.group === this.getGroupNameId(this._currentMenusPallete));
    if (activeMenus.length) this.handleMenuClick(activeMenus[0]);
    return activeMenus;
  }

  private getGroupNameId(name: string): number | null {
    return this._menugroups.find(group => group.name === name)?.id ?? null;
  }

  private removeMarkersByTag(tag: Tag) {
    this.tagRemoval.emit({ selectedTag: tag });
  }

  private insertMarkersByTag(tag: Tag) {
    this.tagReactivated.emit({ tag });
  }

  toggleMenuCollapse() {
    this.isCollapsed = !this.isCollapsed;
    document.querySelectorAll<HTMLElement>('.scrollbar-box').forEach(el => {
      el.style.left = this.isCollapsed ? '-312px' : '15px';
    });
  }
}
