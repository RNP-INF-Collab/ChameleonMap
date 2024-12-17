import { Component, Input } from '@angular/core';
import * as L from 'leaflet';

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

  public continueText = "Continuar";

  public centeredTooltipText = "";

  public centeredTooltipEnabled = false;
  public currentStepTooltipEnabled = false;

  public isLastTooltip = false;
  public quoteCentered = true;

  @Input() map: L.Map;

  public showOnboardingIfNeeded(mapName: String) {
    // Check if the user has visited before using localStorage
    if (localStorage.getItem('firstVisit') == null && window.innerWidth > 500) {
      this.askToStartOnboarding(mapName);
      localStorage.setItem('firstVisit', 'no');
    }
  }

  askToStartOnboarding(mapName: String) {
    this.centeredTooltipText = `Bem-vindo ao ${mapName}. Para iniciar o tutorial, clique em Continuar.`
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
      let tabs = document.getElementById('menu-groups-tabs') as HTMLDivElement;
      if (tabs != null) {
        this.quoteCentered = false;
        this.addTooltipNextTo(
          tabs,
          'No topo esquerdo, encontram-se os <b>Grupos de Menus</b>. Tratam-se de abas contendo diferentes contextos de visualização. <br>Selecione uma aba, e note que diferentes menus serão exibidos abaixo.',
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
        'Cada painel retangular à esquerda constitui um <b>Menu</b>. Trata-se de um agrupamento de itens (tags) relacionados. <br>Os menus podem ser selecionados, habilitando a visualização dos itens relacionados àquele Menu no mapa. <br>O Menu selecionado possuirá uma cor mais escura que os demais.<br>Para ocultar a visibilidade de todos os elementos em menu, pode-se clicar no ícone de olho.'
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
        'Cada Menu contém elementos geolocalizados, conhecidos como <b>Tags</b>, que são identificados por sua cor.<br>Cada tag está relacionada com uma ou mais localizações no mapa. Podemos identificar a distribuição das tags no mapa por sua cor.<br>Pode-se também ocultar a visibilidade de uma tag específica ao clicar no ícone de olho ao lado da mesma.'
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
          'No mapa estarão distribuídos pontos geolocalizados, chamados <b>Localizações</b>.<br>Através das cores, pode-se compreender a distribuição das <i>tags</i> no mapa.<br>Ao clicar em uma localização, será aberto um <b>popup</b> com mais detalhes.'
        );
        this.hasShownLocationTooltip = true;
      }
      return;
    }
    /* Popup */
    if (!this.hasShownPopupTooltip) {
      let pos = this.selectedLocation.getBoundingClientRect();
      this.click(pos.x, pos.y);
      let popup = this.getOpenOverlayedPopupIcon();
      if (!popup) {
        this.onSkipClick();
        return;
      }
      this.expandPopup = popup;
      this.addTooltipNextTo(
        popup,
        'Através do <b>Popup</b>, podemos identificar uma descrição mais detalhada da localização e das respectivas tags representadas neste ponto.<br>Para uma descrição ainda mais detalhada e interativa, em uma maior escala, pode-se clicar no ícone <img src="assets/expand-icon.png" class="opp-open-button opp-open-button-for-location opp-expand-icon">'
      );
      this.hasShownPopupTooltip = true;
      return;
    }
    /* Overlayed Popup */
    if (!this.hasShownOverlayedPopupTooltip) {
      let pos = this.expandPopup.getBoundingClientRect();
      this.click(pos.x, pos.y);
      let popup = document.getElementsByClassName('overlayed-popup-title')[0] as HTMLDivElement;
      this.isLastTooltip = true;
      this.continueText = "Finalizar tutorial";
      this.addTooltipNextTo(
        popup,
        'Por fim, este é o <b>Popup Estendido</b>, onde podemos visualizar de forma ampla e detalhada informações sobre a localização desejada.<br>Obrigado por utilizar nosso sistema!',
        null,
        false
      );
      this.hasShownOverlayedPopupTooltip = true;
      this.map.dragging.enable();
    }
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
