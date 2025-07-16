import { Component } from '@angular/core';

@Component({
  selector: 'app-about-buttons',
  templateUrl: './about-buttons.component.html',
  styleUrls: ['./about-buttons.component.css']
})
export class AboutButtonsComponent {
  onButtonClick(buttonName: string): void {
    console.log(`${buttonName} button clicked`);

    if (buttonName === 'logo-inf') {
      window.open('https://inf.ufrgs.br', '_blank');
    } else if (buttonName === 'logo-rnp') {
      window.open('https://www.rnp.br', '_blank');
    }
  }
}