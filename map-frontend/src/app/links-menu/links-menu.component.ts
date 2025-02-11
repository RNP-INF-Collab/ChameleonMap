import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-links-menu',
  templateUrl: './links-menu.component.html',
  styleUrls: ['./links-menu.component.css']
})
export class LinksMenuComponent {
  private _linkGroups: Array<LinksGroup>;
  public _currentMenu: string;

  @Input()
  get linkGroups() {
    return this._linkGroups;
  }
  set linkGroups(value) {
    this._linkGroups = value;
  }

  @Input()
  get currentMenu() {
    return this._currentMenu;
  }
  set currentMenu(value) {
    this._currentMenu = value;
  }

  @Output()
  linkRemoval = new EventEmitter();

  @Output()
  linkReactivated = new EventEmitter();

  constructor() {}

  visibilityClick(lg: any, event: any) {
    if (lg.visibility) {
      lg.visibility = false;
      this.removeLinesByLinkGroup(lg);
    } else {
      lg.visibility = true;
      this.insertLinesByLinkGroup(lg);
    }
  }

  removeLinesByLinkGroup(lg: LinksGroup) {
    this.linkRemoval.emit({ selectedLG: lg });
  }

  insertLinesByLinkGroup(lg: LinksGroup) {
    this.linkReactivated.emit({ selectedLG: lg });
  }
}
