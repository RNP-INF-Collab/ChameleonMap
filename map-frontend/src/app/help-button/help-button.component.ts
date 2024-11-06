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
  private _locations: Location[];  
  @Input()
  public get locations(): Location[] {
    return this._locations;
  }
  public set locations(value: Location[]) {
    this._locations = value;
    this.baseLocationId = this.getHowToHelpLocationId();
  }
  @Output() howToHelpClickEvent = new EventEmitter<number>();
  @ViewChild('helpButton', { static: true }) helpButton: ElementRef;

  public text = "Como posso ajudar?"
  public get shouldShowButton(): boolean {
    return this.baseLocationId != undefined;
  }
  private baseLocationId: number | undefined = undefined

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
    if (this.baseLocationId)
      this.howToHelpClickEvent.emit(this.baseLocationId);
  }

  private getHowToHelpLocationId(): number | undefined {
    let id;
    this.locations.forEach(location => {
      if (location.name === "Sobre este mapa" || location.name === "About this map") {
        id = location.id;
        console.warn("Found!")
      }
      console.warn("does not math", location.name);
    });
    return id;
  }
}
