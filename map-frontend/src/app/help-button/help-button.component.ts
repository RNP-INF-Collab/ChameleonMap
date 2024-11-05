import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-help-button',
  templateUrl: './help-button.component.html',
  styleUrls: ['./help-button.component.css']
})
export class HelpButtonComponent implements OnInit {
  @Input() locations: Location[];  
  @Output() howToHelpClickEvent = new EventEmitter<number>();
  @ViewChild('helpButton', { static: true }) helpButton: ElementRef;

  public text = "Como posso ajudar?"

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.adjustUIBasedOnWidth();
  }

  private adjustUIBasedOnWidth(): void {
    if (window.innerWidth < 500) {
      this.text = "?";
      this.addClassToButton('wrapped');
    }
  }

  private addClassToButton(className: string): void {
    this.renderer.addClass(this.helpButton.nativeElement, className);
  }

  public sendHowToHelpId(): void {
    this.howToHelpClickEvent.emit(this.getHowToHelpLocationId());
  }

  private getHowToHelpLocationId(): number {
    let id = -1;
    this.locations.forEach(location => {
      if (location.name === "Sobre este mapa" || location.name === "About this map") {
        id = location.id;
      }
    });
    return id;
  }
}
