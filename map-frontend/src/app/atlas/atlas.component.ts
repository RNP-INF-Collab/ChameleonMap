/**            ==== ATLAS  v0.1
  *    Automated Topology LAnguage with Slicing
  * 
  * 
  **/ 

import { 
  Component, 
  OnInit,
  Input,
  ViewChild,
  HostListener
} from '@angular/core';
import * as L from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopologyNode{
  node: L.Marker;
  name: string;
  tagName: string;
  xPos: number;
  yPos: number;
}

export interface TopologyLink{
  link: L.Polyline;
  nodeSrcName: string;
  nodeTgtName: string;
  group: string;
  
  color: string;
  weight: string;
  opacity: string;
  
  dashLength: string;
  gapLength: string;
  rectlinearFlag: boolean;
  srcAnchor: string;  
  tgtAnchor:string;
}

export interface TopologySlice{
  name: string;
  nodes: Array<TopologyNode>;
  links: Array<TopologyLink>;
}


@Component({
  selector: 'app-atlas',
  templateUrl: './atlas.component.html',
  styleUrls: ['./atlas.component.css']
})

export class ATLASComponent implements OnInit {
  // Map reference
  topologyMap: L.Map;
  _locations: Array<Location>;
  _tags: Array<Tag>;
  
  //
  nodes: Array<TopologyNode> = [];
  links: Array<TopologyLink> = [];
  slices: Array<TopologySlice> = [];
  highlights: Array<L.Rectangle> = [];
  
  // Topology nodes size control
  readonly horizontalDivisions: number = 11;
  readonly verticalDivisions: number = 10;
  readonly cellIconRatio: number = .8;
  virtualCoordToScreenCoordRatio: L.Point;
  virtualCoordToGeoCoordRatio: L.Point;
  cellScreenSize: L.Point;
  cellGeoSize: L.Point;
  nodeScreenSize: L.Point;
  nodeGeoSize: L.Point;
  
  // Coordinates System Control
  coordinatesSystemBoundsReference:  L.LatLngBounds;
  
  // View Control
  virtualViewOffset: L.Point;
  @Input() defaultSubMapCenterCoordinates: any;
  // @Input() restoreDefaultScreenView: Function;

  @Input() locations: any;
  @Input() tags: any;
  @Input() getLocationById: any;
  @Input() getTagById: Function;

  
  constructor(private http: HttpClient) { 
  }

  ngOnInit(): void {
    this._locations = this.locations;
    this._tags = this.tags;
  }

  ngOnChanges(){
    this._locations = this.locations;
    this._tags = this.tags;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.recalculeSizeReferences();
  }

  public run(script: string, topologyMap: L.Map){
    this.resetTopologyMap();
    this.topologyMap = topologyMap;
    this.restoreDefaultScreenView();
    this.recalculeSizeReferences();
    this.interpreteAtlasScript(script);
  }

  private interpreteAtlasScript(script: string){
    const lines: Array<string> = this.extractLines(script);
    let tokens: Array<string>;

    // alert(script)
    lines.forEach(line => {
      tokens = this.tokenize(line);
      if(tokens[0][0] !== '#'){
        switch(tokens[0].toUpperCase()){
          case 'ADD_NODE':
          case 'ADDNODE':
          case 'NODE':
            this.addNodeInstruction(tokens);
            break;          
          case 'CREATE_SLICE':
          case 'CREATESLICE':
          case 'SLICE':
            this.createSliceInstruction(tokens);
            break;          
          case 'RM_NODE':
          case 'RMNODE':
            this.rmNodeInstruction(tokens);
            break;
          case 'SET_ICON':
          case 'SETICON':
            this.setIconInstruction(tokens);
            break;
          case 'RM_POPUP':
          case 'RMPOPUP':
            
            break;
          case 'ADD_BUTTON':
          case 'ADDBUTTON':            
            break;
          case 'HIGHLIGHT':  
            this.highlightInstruction(tokens);
            break;
          case 'FADE':            
            break;
          case 'LINK':
          case 'SMART_LINK':
          case 'SMARTLINK':
            this.addLinkInstruction(tokens)
            break;          
          case 'PUSH_POPUP':
          case 'PUSHPOPUP':
            this.pushPopupInstruction(tokens)
            break;
          case 'PAN_VIEW':
          case 'PANVIEW':
          case 'PAN':
            this.panViewInstruction(tokens)
            break;
          case 'MOVE_ELEMENT':
          case 'MOVEELEMENT':            
          case 'MOVE':            
            this.moveElementInstruction(tokens)
            break;
          case 'FIT_VIEW':
          case 'FITVIEW':
          case 'FIT':
            this.fitViewInstruction(tokens)
            break;          
          case 'IMPORT_FROM':
          case 'IMPORT':
            this.importInstruction(tokens)
            break;
        }
      }      
    });
  }

  public isATLASscript(scriptCandidate: string){
    const firstToken = this.tokenize(this.extractLines(scriptCandidate)[0])[0];

    if(firstToken === 'ATLAS'){
      return true;
    }else{
      return false;
    } 
  }

  public resetTopologyMap(){
    this.clearData();
    // this.restoreDefaultScreenView();
  }

  public clearData(){
    // Clear lists of topology elements
    if( this.links.length > 0)
      this.links.forEach(link => this.rmLink(link.nodeSrcName, link.nodeTgtName));
    if( this.nodes.length > 0)
      this.nodes.forEach(node => this.rmNode(node.name));
    // this.slices.forEach(slice => this.rmSlice(slice.name));

    this.links = [];

    // Clear map view pans
    // this.viewOffset.x = 0;
    // this.viewOffset.y = 0;
  }

  private addNodeInstruction(tokens: Array<string>){
    const node: TopologyNode = {} as TopologyNode;

    switch(tokens.length){
      case 5:
        node.name = tokens[1];
        node.xPos = parseInt(tokens[2]);
        node.yPos = parseInt(tokens[3]); 
        node.tagName = tokens[4];
        break;
      case 4:
        node.name = tokens[1];
        node.xPos = parseInt(tokens[2]);
        node.yPos = parseInt(tokens[3]); 
        node.tagName = '';
        break;
      default:
        return
    }

    node.node = new L.Marker(
      [this.getGeoLatFromVirtualY(node.yPos), this.getGeoLngFromVirtualX(node.xPos)],
      {
        draggable: false,
      }
    );
    
    const selfATLAS = this;
    node.node.on('popupclose', () => this.restoreDefaultScreenView());
    
    
    node.node.addTo(this.topologyMap);

    if(node.tagName != '')
      this.changeIcon(node);
    else
      this.changeIcon(node,'default');

    this.nodes.push(node);
  }

  public restoreDefaultScreenView(){
    this.topologyMap.setView(this.defaultSubMapCenterCoordinates);
    this.coordinatesSystemBoundsReference = this.topologyMap.getBounds();
  }

  private rmNodeInstruction(tokens: Array<string>){
    if(tokens.length != 2)
      return
    this.rmNode(tokens[1]);
  }

  private addLinkInstruction(tokens: Array<string>){
    if(tokens.length < 3)
      return;
  
    const link: TopologyLink = {} as TopologyLink;
    const flags: Array<string> = [];
    
    
    link.nodeSrcName = tokens[1];
    link.nodeTgtName = tokens[2];
    link.group = '';
    link.color = `black`;
    link.weight = `2`;
    link.opacity = `1`;
    link.dashLength = '1';
    link.gapLength = '0';
    link.rectlinearFlag = false;
    link.srcAnchor = '';
    link.tgtAnchor = '';
    
    let firstFlagIndex = 3;
    if(tokens.length >= 4){
      if(tokens[3][0] != '-'){
        link.group = tokens[3];
        firstFlagIndex++;
      }
    }

    for(let i = firstFlagIndex; i < tokens.length; i++)
      flags.push(tokens[i]);

    if(tokens[0].toUpperCase() === 'SMART_LINK'
    || tokens[0].toUpperCase() === 'SMARTLINK')
      this.tryToDeduceLinkAnchors(link);

    flags.forEach( (flag, index) => {
      switch(flag){
        case '--color':
        case '-c':
          link.color = flags[index + 1];          
          break; 
        case '--weight':
        case '-w':
          link.weight = flags[index + 1];          
          break;      
        case '--opacity':
        case '-o':
          link.opacity = flags[index + 1];          
          break;      
        case '--dashed-line':
          link.dashLength = '5';
          link.gapLength = '5';
          break;      
        case '--dashed-line2':
          link.dashLength = '5';
          link.gapLength = '10';
          break;              
        case '--dotted-line':
          link.dashLength = '.5';
          link.gapLength = '5';
          break;
        case '--rectlinear':
          link.rectlinearFlag = true;
          break;
        case '--srcAnchor':
        case '-sa':
          link.srcAnchor = flags[index+1];
          break;
        case '--tgtAnchor':
        case '-ta':
          link.tgtAnchor = flags[index+1];
          break;
        default:  
          break;
      }
    });

    this.addLink(link);
  }

  private setIconInstruction(tokens: Array<string>){
    if( tokens.length < 2 || tokens.length > 3)
      return

    const nodeName:string = tokens[1];
    const iconName: string = tokens[2];
    let node: TopologyNode = {} as TopologyNode;
    
    if(this.getNodeByName(nodeName) == null)
      return
    
    node = this.getNodeByName(nodeName)!;

    if( tokens.length == 2){
      if( tokens[1] === 'tag'){
        this.changeIcon(node)
      }
    }else if(tokens.length == 3){
      switch(tokens[1]){
        case 'image':
          break;
        case 'default':
        case 'color':
          this.changeIcon(node, 'color', tokens[2])
          break;
        default:
          break;
      }
    }    
  }

  private pushPopupInstruction(tokens: Array<string>){
    if(tokens.length < 3 && tokens.length > 3)
      return;
    
    const nodeName = tokens[1];
    const popupContentAdition = tokens[2];
    const node = this.getNodeByName(nodeName);
    const currentPopupContent = node?.node.getPopup()?.getContent(); 

    // if(typeof node?.node.getPopup()?.getContent() !== 'undefined')
      // node?.node.bindPopup(currentPopupContent + '<br>' + popupContentAdition);
    // else
      // node?.node.bindPopup('<br>' + popupContentAdition);    
    node?.node.bindPopup(popupContentAdition);
    // console.log(node?.node.getPopup())
  }

  private addLink(link: TopologyLink){
    const node1: TopologyNode = this.getNodeByName(link.nodeSrcName)! as TopologyNode;
    const node2: TopologyNode = this.getNodeByName(link.nodeTgtName)! as TopologyNode;
    
    if(node1 == null || node2 == null)
      return;

    link.link = L.polyline([this.getLinkAnchorGeoPoint(node1.xPos, node1.yPos, link.srcAnchor), this.getLinkAnchorGeoPoint(node2.xPos, node2.yPos, link.tgtAnchor)], {
      color: link.color,
      weight: parseFloat(link.weight),
      opacity: parseFloat(link.opacity),
      dashArray: `${link.dashLength},${link.gapLength}`,
    }).addTo(this.topologyMap); 
    
    this.links.push(link);
  }

  private createSliceInstruction(tokens: Array<string>){
    const slice: TopologySlice = {} as TopologySlice;

    slice.name = tokens[1];
    slice.nodes = [];

    let node;
    
    for(let i = 2 ; i < tokens.length ; i++){
      node = this.getNodeByName(tokens[i]);
      if(node != null)
        slice.nodes.push(node);
    }

    if( slice !== null){
      this.slices!.push(slice);
    }
  }

  private highlightInstruction(tokens: Array<string>){
    const slice = this.getSliceByName(tokens[1]);

    if(slice !== null){

      slice!.nodes.forEach( (node, index) => {
        const highlight: L.Rectangle = new L.Rectangle([ 
          [this.getGeoLatFromVirtualY(node.yPos) - .65*this.nodeGeoSize.y,this.getGeoLngFromVirtualX(node.xPos) - .65*this.nodeGeoSize.x],
          [this.getGeoLatFromVirtualY(node.yPos) + .65*this.nodeGeoSize.y,this.getGeoLngFromVirtualX(node.xPos) + .65*this.nodeGeoSize.x],          
        ],{
          color: 'yellow',
          fillColor: 'yellow',
          fillOpacity: 0.5
        }).addTo(this.topologyMap)

        let linkToHighligth:TopologyLink | null;
        for( let i = index+1; i < slice!.nodes.length ; i++ ){
          if( (linkToHighligth = this.getLinkByNodes(slice!.nodes[index].name,slice!.nodes[i].name)) !== null){
            linkToHighligth.link.setStyle({
              color: 'yellow',
              weight: 4
            })
          }
        }
      });
    }
  }

  private panViewInstruction(tokens: Array<string>){
    if(tokens.length > 3)
      return;
    
    const xOffset: number = parseFloat(tokens[1]);
    const yOffset: number = parseFloat(tokens[2]);

    this.virtualViewOffset = new L.Point(
      xOffset,
      yOffset
    );
    
    this.restoreCustomizedScreenView();
  }

  private fitViewInstruction(tokens: Array<string>){
    
  }

  private importInstruction(tokens: Array<string>){
    
    let flags: Array<string> = [];
    
    [tokens, flags] = this.extractFlags(tokens);

    if(tokens.length != 2)
      return;

    // const importationSource = tokens[1];
    const importationSource = tokens[1];
    let importationAPI = 'kong';
    let importedElementsType = 'topology';

    flags.forEach( flag => {
      switch(flag){
        case '--kong':
          importationAPI = 'kong';
          break;
        case '--nodes':
          importedElementsType = 'nodes';
          break;
        case '--links':
          importedElementsType = 'links';
          break;
        case '--popup':
          importedElementsType = 'popup';
          break;
        case '--topology':
          importedElementsType = 'topology';
          break;
      }
    });
    
    let importedData = "";
    this.getDataFormHttpServer(importationSource).subscribe(
      (data) => {
        importedData = data.atlas;
        if( importedData !== undefined ){
          const script: string = importedData;
          this.interpreteAtlasScript(script);
        }
      },
      (error) => {
        console.log("Can't import data from " + importationSource);
      }      
    );
    


  }

  private moveElementInstruction(tokens: Array<string>){
    if(tokens.length > 4)
      return
    
    const elementName: string = tokens[1];
    const xOffset: number = parseFloat(tokens[2]);
    const yOffset: number = parseFloat(tokens[3]);
    
    const element = this.getNodeByName(elementName);

    this.moveElement(element!, xOffset, yOffset);
  }

  private moveElement(element: TopologyNode, xOffset: number, yOffset: number ){
    const currentGeoPos = element.node.getLatLng();    

    element.node.setLatLng(
      [
        currentGeoPos.lat + this.getGeoLatFromVirtualY(yOffset),
        currentGeoPos.lng + this.getGeoLngFromVirtualX(xOffset)
      ]
    )

  }

  private tryToDeduceLinkAnchors(link: TopologyLink){
    const nodeSrc = this.getNodeByName(link.nodeSrcName);
    const nodeTgt = this.getNodeByName(link.nodeTgtName);
    if( nodeSrc == null || nodeTgt == null)
      return;
    
    if(nodeSrc.xPos === nodeTgt.xPos){
      if(nodeSrc.yPos == nodeTgt.yPos){
        link.srcAnchor = 'C';
        link.tgtAnchor = 'C';
      }else if(nodeSrc.yPos > nodeTgt.yPos){
        link.srcAnchor = 'S';
        link.tgtAnchor = 'N';
      }else{
        link.srcAnchor = 'N';
        link.tgtAnchor = 'S';
      }
    }else if(nodeSrc.xPos < nodeTgt.xPos){
      link.srcAnchor = 'E';
      if(Math.abs(nodeSrc.yPos - nodeTgt.yPos) < 3){
        link.tgtAnchor = 'W';
      }else{
        if(nodeSrc.yPos > nodeTgt.yPos){
          link.tgtAnchor = 'S';
        }else{
          link.tgtAnchor = 'N';
        }
      }
    }else{
      link.tgtAnchor = 'E';
      if(Math.abs(nodeSrc.yPos - nodeTgt.yPos) < 3){
        link.srcAnchor = 'W';
      }else{
        link.srcAnchor = 'N';        
      }
    }    
  }

  private changeIcon(node: TopologyNode, iconSource = 'tag', color = 'blue'){
    switch(iconSource){
      case 'default':
      case 'color':
        node.node.setIcon(L.divIcon({
          html: this.getDefaultNodeIcon(node, color),
          iconSize: [this.nodeScreenSize.x, this.nodeScreenSize.y],
        }));
        break;
      case 'tag':
        const tag = this.getTagByName(node.tagName);
        if(1){
          node.node.setIcon(L.divIcon({
            html: this.getNodeIconFromTag(node),
            iconSize: [this.nodeScreenSize.x, this.nodeScreenSize.y],
          }));
        }else{

        }
        break;
      default:
          break;
    }
  }

  private extractLines(script: string, quoteChar = "'"): Array<string> {
    const lines: Array<string> = [];
    let currentLine = '';
    let inQuotes = false;

    script = this.removeBlankLines(script);
    script = this.removeNbsp(script);
    script = this.removeParagraphs(script);
    script = this.removeNewlineCharacters(script);
    script = this.replaceAngleBrackets(script);
    script = this.replaceExternalAngleBrackets(script);

    for (let i = 0; i < script.length; i++) {
      const char = script[i];
      if (char === quoteChar) {
        currentLine += char;
        inQuotes = !inQuotes;
      } else if ((char === ';') && !inQuotes) {
        if (currentLine.length > 0) {
          // currentLine = this.replaceDoubleQuotes(currentLine);
          lines.push(currentLine);
          currentLine = '';
        }
      } else if(char !== quoteChar){
        currentLine += char;
      }
    }
  
    if (currentLine.length > 0) {
      // currentLine = this.replaceDoubleQuotes(currentLine);
      lines.push(currentLine);
    }

    return lines;
  }

  private removeParagraphs(script: string): string {
    script = this.replaceSubstringsNotQuotateds(script, '<p>', '');
    script = this.replaceSubstringsNotQuotateds(script, '</p>', '');
    return script;
  }

  private removeBlankLines(script: string): string{
    script = this.replaceSubstringsNotQuotateds(script, '<p>&nbsp;</p>', ';');
    return script;
  }

  private removeNbsp(script: string): string {
    script = this.replaceSubstringsNotQuotateds(script, '&nbsp;', '');
    return script;
  }

  private removeNewlineCharacters(script: string): string {
    script = this.replaceSubstringsNotQuotateds(script, '\n', '');
    script = this.replaceSubstringsNotQuotateds(script, '\r', '');
    script = this.replaceSubstringsNotQuotateds(script, '<br />', '');
    return script;
  }

  private replaceAngleBrackets(script: string): string {
    script = this.replaceSubstringsNotQuotateds(script, '&lt;', '<', true);
    script = this.replaceSubstringsNotQuotateds(script, '&gt;', '>', true);
    return script;
  }

  private replaceExternalAngleBrackets(script: string): string {
    script = this.replaceSubstringsNotQuotateds(script, '&lt;', '<');
    script = this.replaceSubstringsNotQuotateds(script, '&gt;', '>');
    return script;
  }

  private replaceDoubleQuotes(script: string): string {
    script = this.replaceSubstringsNotQuotateds(script, '"', "'", true);
    return script;
  }

  private replaceSubstringsNotQuotateds(string: string, oldSubStr: string, newSubStr:string, invertQuotesBehavior = false): string{
    let newString = '';
    let inQuotes = false;
    for (let i = 0; i < string.length; i++) {
      if (string[i] === '"') {
        inQuotes = !inQuotes;
      }
      if (string.substring(i, i+oldSubStr.length) === oldSubStr && this.xor(!inQuotes,invertQuotesBehavior)) {
          newString += newSubStr;
          i += oldSubStr.length - 1;
          continue;
      }
      newString += string[i];
    }
    return newString;
  }

  private tokenize(line_command: string, quoteChar = "'"): Array<string>{
    const tokens: Array<string> = [];
    let currentWord = '';
    let inQuotes = false;

    for (let i = 0; i < line_command.length; i++) {
      const char = line_command[i];
      if (char === quoteChar) {
        inQuotes = !inQuotes;
      } else if ((char === ' ' || char === '\t') && !inQuotes) {
        if (currentWord.length > 0) {
          tokens.push(currentWord);
          currentWord = '';
        }
      } else if(char !== quoteChar){
        currentWord += char;
      }
    }
  
    if (currentWord.length > 0) {
      tokens.push(currentWord);
    }
  
    return tokens;
  }

  private getTagByName(tagName: string): Tag {
    let tag: Tag = {} as Tag;

    for(let i = 0 ; i < this._tags.length ; i++){
      if(this._tags[i].name === tagName){
        tag = this._tags[i];
        break;
      }
    }

    return tag;
  }

  private getNodeByName(nodeName: string): TopologyNode | null{
    for( let i = 0 ; i < this.nodes.length ; i++ )
      if(this.nodes[i].name === nodeName)
        return this.nodes[i];    
    
    return null;
  }

  private getSliceByName(sliceName: string): TopologySlice | null{
    for( let i = 0 ; i < this.slices.length ; i++ )
      if(this.slices[i].name === sliceName)
        return this.slices[i];    
    
    return null;
  }

  private getLinkByNodes(nodeSrcName: string, nodeTgtName: string): TopologyLink | null{
    for( let i = 0 ; i < this.links.length ; i++ )
      if(this.links[i].nodeSrcName === nodeSrcName)
       if(this.links[i].nodeTgtName === nodeTgtName)
        return this.links[i];    
    
    return null;
  }

  private rmNode(nodeName: string){
      const node = this.getNodeByName(nodeName);

      if(node != null){
        node.node.removeFrom(this.topologyMap);
        this.rmNodeFromListByName(node.name);
      }
  }

  private rmNodeFromListByName(nodeName: string){
    for( let i = 0 ; i < this.nodes.length ; i++ )
      if(this.nodes[i].name === nodeName)
        this.nodes.slice(i,1);    
  }

  private rmLink(nodeSrcName: string, nodeTgtName: string){
      const link = this.getLinkByNodes(nodeSrcName, nodeTgtName);

      if(link != null){
        link.link.removeFrom(this.topologyMap);
        this.rmLinkFromListByNodes(nodeSrcName, nodeTgtName);
      }
  }

  private rmLinkFromListByNodes(nodeSrcName: string, nodeTgtName: string){
    for( let i = 0 ; i < this.links.length ; i++ )
      if(this.links[i].nodeSrcName === nodeSrcName)
        if(this.links[i].nodeTgtName === nodeTgtName)
          this.links.slice(i,1);    
  }

  private getGeoLngFromVirtualX( virtualX: number ): number{
    return this.coordinatesSystemBoundsReference.getWest() + (virtualX + 0.5) * this.virtualCoordToGeoCoordRatio.x;
  }
  
  private getGeoLatFromVirtualY( virtualY: number ): number{
    return this.coordinatesSystemBoundsReference.getNorth() - (virtualY + 0.5) * this.virtualCoordToGeoCoordRatio.y;
  }

  private getVirtualXFromGeoX( geoX: number ): number{
    return geoX / this.virtualCoordToGeoCoordRatio.x;
  }
  
  private getVirtualYFromGeoY( geoY: number ): number{
    return geoY / this.virtualCoordToGeoCoordRatio.y;
  }

  private getScreenXFromVirtualX( virtualX: number ): number{
    return virtualX * this.virtualCoordToScreenCoordRatio.x;
  }
  
  private getScreenYFromVirtualY( virtualY: number ): number{
    return virtualY * this.virtualCoordToScreenCoordRatio.y;
  }

  private getNodeIconFromTag(node: TopologyNode): string{
    const tag: Tag = this.getTagByName(node.tagName);
    const style: string = this.getDefaultIconContainerStyle(tag.color); 
    const styleBorder = this.getDefaultIconContainerBorderStyle();


    return `<div style="${styleBorder}"><div style="${style}">${this.getNodeTitleStyleConfig(tag.name)}</div></div>`
  }

  private getDefaultNodeIcon(node: TopologyNode, color: string): string{
    const style = this.getDefaultIconContainerStyle(color);
    const styleBorder = this.getDefaultIconContainerBorderStyle();

    return `<div><div style="${style}">${this.getNodeTitleStyleConfig(node.name)}</div></div>`
  }

  private getNodeTitleStyleConfig(nodeTitle: string): string{
    const style = `
      font-size:calc(.9vw);
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    `;    

    return `<div style="${style}">${nodeTitle}</div>`
  }

  private getDefaultIconContainerStyle(color: string): string{
    return `       
      background-color: ${color}; 
      width: 96%; 
      height: 95%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
  }

  private getDefaultIconContainerBorderStyle(): string{
    return `       
      background-color: gray; 
      width: 100%; 
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
  }

  private xor(a: boolean, b: boolean):boolean{
    return (a && !b) || (!a && b);
  }

  private getLinkAnchorGeoPoint(xPos: number, yPos: number, anchorPosition = ''): L.LatLng{
    xPos = this.getGeoLngFromVirtualX(xPos);
    yPos = this.getGeoLatFromVirtualY(yPos);

    switch(anchorPosition.toUpperCase()){
      case '':
      case 'C':
        break;
      case 'N':
        yPos += this.nodeGeoSize.y / 2;
        break;
      case 'S':
        yPos -= this.nodeGeoSize.y / 2;
        break;
      case 'E':
        xPos += this.nodeGeoSize.x / 2;
        break;
      case 'W':
        xPos -= this.nodeGeoSize.x / 2;
        break;
    }

    return L.latLng(yPos, xPos);
  }

  private recalculeSizeReferences(){
    this.recalculeScreenSizeReferences();
    this.recalculeGeoSizeReferences();
  }

  private recalculeScreenSizeReferences(){
    // Screen coordinates [Pixels, Pixels]
    // Ratio between virtual to screen sizes
    if (!this.topologyMap) { return; }

    this.virtualCoordToScreenCoordRatio = new L.Point(
      this.topologyMap.getSize().x / this.horizontalDivisions,
      this.topologyMap.getSize().y / this.verticalDivisions
    )

    // Node screen size
    this.nodeScreenSize = new L.Point(
      this.cellIconRatio * this.virtualCoordToScreenCoordRatio.x,
      this.cellIconRatio * this.virtualCoordToScreenCoordRatio.y
    )
  }

  private recalculeGeoSizeReferences(){
        // Geo coordinates [lat, lng]
        // Topology map Geo size
    if (!this.topologyMap) { return; }
    
    const mapGeoSize: L.Point = new L.Point(
      this.topologyMap.getBounds().getEast() - this.topologyMap.getBounds().getWest(),
      this.topologyMap.getBounds().getNorth() - this.topologyMap.getBounds().getSouth()
    )
    
    // Ratio between virtual to geo sizes
    this.virtualCoordToGeoCoordRatio = new L.Point(
      mapGeoSize.x / this.horizontalDivisions,
      mapGeoSize.y / this.verticalDivisions
    );
      
    // Node geo sizes
    this.nodeGeoSize = new L.Point(
      this.cellIconRatio * this.virtualCoordToGeoCoordRatio.x,
      this.cellIconRatio * this.virtualCoordToGeoCoordRatio.y,
    )
  }




  public isAllPopupsClosed(): boolean{
    let isAllPopupsClosed = true;
    
    this.nodes.forEach( node => {
      if(node.node.isPopupOpen())
        isAllPopupsClosed = false;
    });

    return isAllPopupsClosed;
  }

  public restoreCustomizedScreenView(){
    this.restoreDefaultScreenView();
    this.topologyMap.panBy(
      [
        this.getScreenXFromVirtualX(this.virtualViewOffset.x), 
        this.getScreenYFromVirtualY(this.virtualViewOffset.y)
      ]
    );
  }

  private extractFlags(tokens: Array<string>){
    const flags: Array<string> = [];
    let token: string;
    for(let index = 0; index < tokens.length; index++){
      token = tokens[index];
      if(token[0] ==='-'){
        flags.push(token);
        tokens.splice(index,1);
        index--;
      }
    }

    return [tokens, flags];
  }

  private getDataFormHttpServer(url:string): Observable<any>{
    return this.http.get<any>(url);
  }
}
