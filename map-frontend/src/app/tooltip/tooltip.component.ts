import { Component, Input } from '@angular/core';
import * as L from 'leaflet';
import { last } from 'rxjs';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})

export class TooltipComponent {
  // Onboarding steps
  private hasShownTabsTooltip = false;
  private hasShownMenusTooltip = false;
  private hasShownTagsTooltip = false;
  private hasShownLocationTooltip = false;
  private hasShownPopupTooltip = false;
  private hasShownOverlayedPopupTooltip = false;

  private selectedLocation: HTMLElement;
  private expandPopup: HTMLElement;

  public continueText = "Next";

  public centeredTooltipText = "";

  public centeredTooltipEnabled = false;
  public currentStepTooltipEnabled = false;

  public isLastTooltip = false;
  public quoteCentered = true;

  @Input() map: L.Map;
  @Input() menus: Array<Menu>;

  public showOnboardingIfNeeded(mapName: String) {
    // Check if the user has visited before using localStorage
    if (localStorage.getItem('firstVisit') == null && window.innerWidth > 500) {
      this.askToStartOnboarding(mapName);
      //localStorage.setItem('firstVisit', 'no');
    }
  }

  askToStartOnboarding(mapName: String) {
    this.centeredTooltipText = `Welcome to ${mapName}. To start the tutorial, click next!.`
    this.centeredTooltipEnabled = true;
  }

  onContinueClick() {
    this.centeredTooltipEnabled = false;
    this.currentStepTooltipEnabled = false;
    this.continueOnboarding();
    if (!this.currentStepTooltipEnabled && !this.centeredTooltipEnabled) {
      this.map.dragging.enable();
    }
  }

  onSkipClick() {
    this.centeredTooltipEnabled = false;
    this.currentStepTooltipEnabled = false;
    this.map.dragging.enable();
  }

  continueOnboarding() {
    this.map.dragging.disable();
    /* Menu tabs */
    if (!this.hasShownTabsTooltip) {
      console.log(2);
      let tabs = document.getElementById('menu-groups-tabs') as HTMLDivElement;
      if (tabs != null) {
        this.quoteCentered = false;
        this.addTooltipNextTo(
          tabs,
          'At the top right, you will find <b>Menu Groups</b>. They are tabs that contain different visualization contexts. <br>Select a tab, and different menus will be shown below.</br>',
          0
        );
        this.hasShownTabsTooltip = true;
        return;
      }
      this.hasShownTabsTooltip = true;
      this.continueOnboarding();
      return;
    }
    /* Menus */
    if (!this.hasShownMenusTooltip) {
      let menus = document.getElementById('menu-button-expand') as HTMLDivElement;
      this.quoteCentered = false;
      this.addTooltipNextTo(
        menus,
        'Each rectangular panel is a <b>Menu</b>. They group related items (tags). <br>Menus can be selected, enabling the visualization of the items that are related to that menu.</br>'
      );
      this.hasShownMenusTooltip = true;
      return;
    }
    /* Tags */
    if (!this.hasShownTagsTooltip) {
      this.quoteCentered = false;
      let tags = document.getElementById('eye') as HTMLDivElement;
      this.addTooltipNextTo(
        tags,
        'Each menu contains geolocated items, known as <b>Tags</b>, each identified by name and color.<br> Each tag is related to one or more tags in the map. You can identify them in the map by their color. You can also hide a tag clicking on the eye icon on their left. </br>'
      );
      this.hasShownTagsTooltip = true;
      return;
    }
    /* Location */
    if (!this.hasShownLocationTooltip) {
      let location = this.getLocationOnMap();
      if (location) {
        this.selectedLocation = location;
        this.addTooltipNextTo(
          location,
          'In the map, there are geolocated points, known as <b>Locations</b>.<br>Through their colors you will be able to see which <i>tags</i> they relate to.<br> Clicking a location opens up a <b>popup</b> with further details.<br> That is it! Thanks for your visit!</b>'
        );
        this.isLastTooltip = true;
        this.continueText = "End tutorial";
        this.hasShownLocationTooltip = true;
      }
      return;
    }
    // /* Popup */
    // if (!this.hasShownPopupTooltip) {
    //   let pos = this.selectedLocation.getBoundingClientRect();
    //   this.click(pos.x, pos.y);
    //   let popup = this.getOpenOverlayedPopupIcon();
    //   if (!popup) {
    //     this.onSkipClick();
    //     return;
    //   }
    //   this.expandPopup = popup;
    //   this.addTooltipNextTo(
    //     popup,
    //     'Through the <b>Popup</b>, you will be able to obtain further information of that location and tag.  <br>That is it! Thank you for your visit! </br>'
    //   );
    //   this.hasShownPopupTooltip = true;
    //   return;
    // }
    // /* Overlayed Popup */
    // if (!this.hasShownOverlayedPopupTooltip) {
    //   let pos = this.expandPopup.getBoundingClientRect();
    //   this.click(pos.x, pos.y);
    //   let popup = document.getElementsByClassName('overlayed-popup-title')[0] as HTMLDivElement;
    //   this.isLastTooltip = true;
    //   this.continueText = "Finalizar tutorial";
    //   this.addTooltipNextTo(
    //     popup,
    //     'Por fim, este é o <b>Popup Estendido</b>, onde podemos visualizar de forma ampla e detalhada informações sobre a localização desejada.<br>Obrigado por utilizar nosso sistema!',
    //     null,
    //     false
    //   );
    //   this.hasShownOverlayedPopupTooltip = true;
    //   this.map.dragging.enable();
    // }
  }

  click(x: number, y: number) {
      const ev = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true,
          'screenX': x,
          'screenY': y
      });

      const el = document.elementFromPoint(x, y);
      if (!el) { return }
      el.dispatchEvent(ev);
  }


  addTooltipNextTo(div: HTMLDivElement|null, text: string, top: number|null = null, onRight = true) {
    if (!div) { return }

    const aproxHeight = 75 + Math.ceil(text.length/38)*19;

    const stepTooltip = document.getElementsByClassName('step-tooltip')[0] as HTMLDivElement;
    const textDiv = stepTooltip.getElementsByClassName('tooltip-text')[0];
    if (!textDiv) { return }
    textDiv.innerHTML = text;

    let left = div.getBoundingClientRect().left + 15;
    if (onRight) {
      left += div.offsetWidth;
    }  else {
      left += div.offsetWidth/2;
    }
    stepTooltip.style.left = `${left}px`;
    if (top == null) {
      const quoteTop = this.quoteCentered ? aproxHeight/2 : aproxHeight/8;
      top = div.getBoundingClientRect().top + div.offsetHeight/2 - quoteTop;
    }
    stepTooltip.style.top = `${top}px`;
    this.currentStepTooltipEnabled = true;
  }

  private getLocationOnMap(): HTMLDivElement|undefined {
    const locations = document.getElementsByClassName('custom-pin');
    for (let i = 0; i < locations.length; i++) {
      const pos = locations[i].getBoundingClientRect();
      if (pos.top > 50 && pos.left > 50) {
        return locations[i] as HTMLDivElement;
      }
    }
    return;
  }

  private getOpenOverlayedPopupIcon(): HTMLDivElement|undefined {
    let popupIcon = document.getElementsByClassName('opp-expand-icon opp-open-button !hidden');
    if (!popupIcon || !popupIcon.length) { 
      return; 
    }
    return popupIcon[0] as HTMLDivElement;;
  }
}
