import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-menu-chooser',
  templateUrl: './menu-chooser.component.html',
  styleUrls: ['./menu-chooser.component.css']
})
export class MenuChooserComponent implements OnInit {
  public _currentMenu = 1;
  constructor() {}

  ngOnInit(): void {}

  @Output()
  buttonClicked = new EventEmitter();

  menu1() {
    this.buttonClicked.emit({ clickedMenu: 1 });
    this._currentMenu = 1;
  }
  menu2() {
    this.buttonClicked.emit({ clickedMenu: 2 });
    this._currentMenu = 2;
  }
}
