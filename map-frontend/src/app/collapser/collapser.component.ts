import { Component, OnInit, Input } from '@angular/core';
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

  @Input()
  public hasTabs: boolean

  collapseToggle(item: any, event: any) {
    this.collapsed = !this.collapsed;
    this.eventEmitterService.onFirstComponentButtonClick();
    const thisCell = item.closest('.collapser');
    if (this.collapsed) {
      thisCell.style = 'left: 0;';
      this.arrowIcon = 'arrow_right';
    } else {
      if (window.innerWidth < 500) {
        thisCell.style = 'left: 300px;';
      } else {
        thisCell.style = 'left: 325px;';
      }
      this.arrowIcon = 'arrow_left';
    }
  }
}
