import { Component, OnInit, Input } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})

export class TooltipComponent implements OnInit {
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

  ngOnInit(): void {
    // Check if the user has visited before using localStorage
    if (localStorage.getItem('firstVisit') == null && window.innerWidth > 500) {
      this.askToStartOnboarding();
      localStorage.setItem('firstVisit', 'no');
    }
  }

  askToStartOnboarding() {
    this.centeredTooltipText = 'Bem-vindo ao mapa interativo de doações para o Rio Grande do Sul (RS). Esta iniciativa foi criada com o objetivo de facilitar o acesso a informações e otimizar a logística das entregas de doações, garantindo que a ajuda chegue de maneira mais eficiente a quem precisa. Para começar o tutorial, clique em Continuar.'
    this.centeredTooltipEnabled = true;
  }

  onContinueClick() {
    this.centeredTooltipEnabled = false;
    this.currentStepTooltipEnabled = false;
    this.continueOnboarding();
  }

  onSkipClick() {
    this.centeredTooltipEnabled = false;
    this.currentStepTooltipEnabled = false;
    this.map.dragging.enable();
  }

  continueOnboarding() {
    this.map.dragging.disable();
    if (!this.hasShownTabsTooltip) {
      // Tabs
      const tabs = document.getElementById('menu-groups-tabs') as HTMLDivElement;
      this.quoteCentered = false;
      this.addTooltipNextTo(
        tabs, 
        'No topo esquerdo, encontram-se as <b>Prioridades de Doação</b>. <br>Ao selecionar uma aba, é possível notar que diferentes items serão exibidos abaixo.',
        0
      );
      this.hasShownTabsTooltip = true;
    } else if (!this.hasShownMenusTooltip) {
      // Menus
      const menus = document.getElementById('menu-button-expand') as HTMLDivElement;
      this.addTooltipNextTo(
        menus, 
        'Cada painel retangular à esquerda representa uma <b>Categoria de Suprimentos</b>. Cada categoria pode conter diversos suprimentos.<br>Ao selecionar uma categoria, os suprimentos correspondentes serão exibidos.<br>A categoria ativa terá uma cor mais escura que as outras.<br>Para ocultar todos os suprimentos de uma categoria, clique no ícone de olho ao lado do nome da categoria.'
      );
      this.hasShownMenusTooltip = true;
    } else if (!this.hasShownTagsTooltip) {
      // Tags
      this.quoteCentered = true;
      const tags = document.getElementById('eye') as HTMLDivElement;
      this.addTooltipNextTo(
        tags, 
        'Aqui, você pode visualizar os <b>Suprimentos</b>, identificados por suas cores específicas. Cada suprimento está associado a um ou mais abrigos/Centros de Coletas no mapa.<br>No mapa, é possível verificar as cores distribuídas no mapa para identificar os suprimentos necessários.<br>Para ocultar um suprimento específico, clique no ícone de olho ao lado do nome do suprimento.'
      );
      this.hasShownTagsTooltip = true;
    } else if (!this.hasShownLocationTooltip) {
      // Location
      const location = this.getLocationOnMap();
      if (location) { this.selectedLocation = location }
      this.addTooltipNextTo(
        location, 
        'No mapa, encontram-se distribuídos os <b>Abrigos e Centros de Coletas</b>.<br>Através das cores, é possível identificar a necessidade de <i>Suprimentos</i> identificados por sua respectiva cor.<br>Ao clicar em um Abrigo/Centro de Coleta, um <b>Pop-up</b> será exibido com mais detalhes sobre as necessidades e informações adicionais.'
      );
      this.hasShownLocationTooltip = true;
    } else if (!this.hasShownPopupTooltip) {
      // Popup
      const pos = this.selectedLocation.getBoundingClientRect()
      this.click(pos.x, pos.y);
      const popup = document.getElementsByClassName('opp-expand-icon')[0] as HTMLDivElement;
      this.expandPopup = popup;
      this.addTooltipNextTo(
        popup, 
        'Através do <b>Pop-up</b>, podemos identificar uma descrição mais detalhada do Abrigo/Centro de Coleta e das prioridades e suprimentos necessários.<br>Para uma descrição ainda mais detalhada e interativa, pode-se clicar no ícone <img src="assets/expand-icon.png" class="opp-open-button opp-open-button-for-location opp-expand-icon">'
        );
      this.hasShownPopupTooltip = true;
    } else if (!this.hasShownOverlayedPopupTooltip) {
      // Overlayed Popup
      const pos = this.expandPopup.getBoundingClientRect()
      this.click(pos.x, pos.y);
      const popup = document.getElementsByClassName('overlayed-popup-title')[0] as HTMLDivElement;
      this.isLastTooltip = true;
      this.continueText = "Finalizar tutorial";
      this.addTooltipNextTo(
        popup, 
        'Por fim, apresentamos o <b>Pop-up Estendido</b>, que oferece uma visão ampla e detalhada das informações sobre o Abrigo/Centro de Coleta selecionado.<br><br>Obrigado por utilizar nosso sistema e vamos todos juntos ajudar o RS!', 
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

  private getLocationOnMap(): HTMLDivElement|null {
    const locations = document.getElementsByClassName('custom-pin');
    for (let i = 0; i < locations.length; i++) {
      const pos = locations[i].getBoundingClientRect();
      if (pos.top > 50 && pos.left > 50) {
        return locations[i] as HTMLDivElement;
      }
    }
    return null;
  }
}
