import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  isVisible = true;

  constructor() { }

  @Input() footerUrl: string;

  ngOnInit(): void {
  }

  closeFooter() {
    this.isVisible = false;
  }

}
