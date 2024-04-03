import { Component, OnInit } from '@angular/core';
import { EventEmitterService } from '../event-emitter.service';

@Component({
  selector: 'app-collapser',
  templateUrl: './collapser.component.html',
  styleUrls: ['./collapser.component.css']
})
export class CollapserComponent implements OnInit {
  public collapsed = false;
  public arrowIcon = 'arrow_left';

  constructor(private eventEmitterService: EventEmitterService) {}

  ngOnInit(): void {}

  collapseToggle(item: any, event: any) {
    this.collapsed = !this.collapsed;
    this.eventEmitterService.onFirstComponentButtonClick();
    const thisCell = item.closest('.collapser');
    if (this.collapsed) {
      thisCell.style = 'left: 0;';
      this.arrowIcon = 'arrow_right';
    } else {
      thisCell.style = 'left: 325px;';
      this.arrowIcon = 'arrow_left';
    }
    /*var menufilter = document.getElementsByClassName('.scrollbar-box');
    if(this.collapsed){
      for (var i = 0; i < menufilter.length; i++) {
        menufilter[i].style = 'red';
      }
      menufilter[0].style = 'left: -312;';
    }else{
      menufilter[0].style = 'left: 312;'
    }    */
  }
}
