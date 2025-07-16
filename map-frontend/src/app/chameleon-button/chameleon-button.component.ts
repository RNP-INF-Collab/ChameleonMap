import { 
  Component,
  EventEmitter,
  Output
 } from '@angular/core';
import { AtlasKeeper } from '../atlas-popup/atlas-structures/AtlasKeeper';

@Component({
  selector: 'app-chameleon-button',
  templateUrl: './chameleon-button.component.html',
  styleUrls: ['./chameleon-button.component.css']
})
export class ChameleonButtonComponent {
  @Output() clicked = new EventEmitter<AtlasKeeper>();

  onClick() {
    let atlasKeeper: AtlasKeeper = this.getPopupContent();
    this.clicked.emit(atlasKeeper);
  }

  public getPopupContent(){
let popupContent: string = `
  <div style="width: 98%; height: 100%; display: flex; justify-content: center; align-items: center; margin: 0 auto; padding-top: 20px;">
    <div style="
      position: relative;
      font-family: Arial, sans-serif;
      padding: 40px 20px 20px 20px;
      max-width: 90%;
      border: 4px solid transparent;
      border-radius: 15px;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #00f9ff, #00ff94, #fff200, #ff005d, #a100ff) border-box;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    ">

      <!-- Logo in the top-left corner of the frame -->
      <img src="/assets/chameleonLogo.png" alt="ChameleonMap Logo"
          style="position: absolute; top: -30px; left: -30px; height: 70px; z-index: 1; background: white; border-radius: 50%; padding: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">

      <!-- Main content -->
      <p style="text-align: center;">
        <strong>ChameleonMap ®</strong> is a pioneering open-source system born from the collaboration between the Informatics Institute of the Federal University of Rio Grande do Sul (INF-UFRGS) and the Brazilian National Research and Education Network (RNP). 
        Designed to represent complex and dynamic topologies, it adapts and evolves like its namesake, the chameleon, offering an interactive mapping solution driven by geolocated data.
      </p>

      <p style="text-align: center;">
        With its remarkable adaptability, ChameleonMap is suited for a wide range of applications — from visualizing computer networks to analyzing socio-economic infrastructures. Its modular design makes it a powerful and customizable tool across diverse domains. This collaborative development effort has resulted in a system that balances technical sophistication with ease of use. ChameleonMap is both intuitive for end-users and robust enough for administrators, making it an accessible and efficient solution for dynamic topology visualization.
      </p>

      <!-- Authors and Logos using Table -->
      <table style="width: 100%; margin-top: 15px; vertical-align: middle;">
        <tr>
          <!-- Logos -->
          <td style="width: 50%; border: 1px solid #ccc; vertical-align: middle">
            <img src="/assets/inf-logo.png" alt="Logo INF-UFRGS" style="width: 25%; margin: 5px; vertical-align: middle;">
            <img src="/assets/rnp-logo.png" alt="Logo RNP" style="width: 25%; margin: 5px; vertical-align: middle;"><br>
          </td>
          
          <!-- Authors -->
          <td style="width: 50%; padding: 10px; border: 1px solid #ccc; text-align: center; vertical-align: middle;">
            <p><strong>Authors:</strong><br>
              Eduardo Peretto<br>
              Gabriel Vassoler<br>
              Gustavo Hermínio de Araújo<br>
              Leonardo Lauryel Batista dos Santos<br>
              Manoel Narciso Reis Soares Filho
              Prof. Lisandro Zambenedetti Granville<br>
              Prof. Luciano Paschoal Gaspary<br>
            </p>
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <hr style="margin: 30px auto; width: 60%;">
      <footer style="text-align: center; font-size: 0.9em;">
        <p>
          <strong><a href="https://github.com/seu-usuario/seu-repositorio" target="_blank">ChameleonMap</a> ®</strong><br>
          Powered by <a href="https://leafletjs.com/" target="_blank">Leaflet</a> and <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>
        </p>
      </footer>
    </div>
  </div>
`;


    let atlasKeeper: AtlasKeeper = {} as AtlasKeeper;
    atlasKeeper.overlayed_popup_content = popupContent;
    atlasKeeper.id = 0;
    atlasKeeper.name = atlasKeeper.title = "About Us";
    
    return atlasKeeper
  }
}
