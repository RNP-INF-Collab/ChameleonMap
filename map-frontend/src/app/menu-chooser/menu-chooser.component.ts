import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-menu-chooser',
  templateUrl: './menu-chooser.component.html',
  styleUrls: ['./menu-chooser.component.css']
})
export class MenuChooserComponent {
  public _currentMenu: string;
  public tabs: Array<string> = [];
  public _linksFeatureOn: boolean;

  private _menugroups: Array<MenuGroup>;

  constructor(private cdr: ChangeDetectorRef) { }

  @Input()
  get linksFeatureOn(): boolean {
    return this._linksFeatureOn;
  }
  set linksFeatureOn(value: boolean) {
    this._linksFeatureOn = value;
    if (this._linksFeatureOn) {
      if (this._menugroups.length == 0) {
        this.tabs = this.tabs.concat('Tags')
        this.onTabClick('Tags') 
      }
      this.tabs = this.tabs.concat('Links')
    }
  }

  @Input()
  get menugroups(): Array<MenuGroup> {
    return this._menugroups;
  }

  set menugroups(value: Array<MenuGroup>) {
    if (!value) { return }
    const newTabs = value.reduce((acc: Array<string>, menu) => {
      if (!acc.includes(menu.name)) {
        acc.push(menu.name);
      }
      return acc;
    }, []);
    this._menugroups = value;
    if (newTabs.length > 0) {
      this.tabs = this.tabs.concat(newTabs);
      this.onTabClick(newTabs[0]);
    }
    this.cdr.detectChanges();
  }

  @Output()
  buttonClicked = new EventEmitter();

  onTabClick(tab: string) {
    this.buttonClicked.emit({ clickedMenu: tab });
    this._currentMenu = tab;
  }
}
