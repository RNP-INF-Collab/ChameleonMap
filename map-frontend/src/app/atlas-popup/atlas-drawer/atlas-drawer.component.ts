/**            ==== ATLAS  Drawer v2.0
  *    Automated Topology LAnguage with Slicing
  * 
  **/ 

import { 
  Component, 
  OnInit,
  Input,
  ViewChild,
  HostListener,
  Output,
  EventEmitter
} from '@angular/core';
import * as L from 'leaflet';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtlasLexicalAnalyser } from '../atlas-interpreter/atlas-lexical-analyser/atlas-lexical-analyser';
import { ATLAS_INSTRUCTIONS_LABELS, AtlasInstructionLabel, InstructionCallingPack, ProvidedArgument, getInstructionNameByInstruction } from '../atlas-interpreter/atlas-instructions';
import { AtlasSyntaxAnalyser } from '../atlas-interpreter/atlas-syntax-analyser/atlas-syntax-analyser';
import { AtlasNode } from '../atlas-structures/AtlasNode';
import { AtlasLink } from '../atlas-structures/AtlasLink';
import { AtlasSlice } from '../atlas-structures/AtlasSlice';
import { AtlasIconBuilder } from '../atlas-icon-builder/atlas-icon-builder.component';
import { AtlasLinkClass } from '../atlas-structures/AtlasLinkClass';
import { DrawerSettings } from './drawing-parameters';
import { AtlasNodeGroup as AtlasNodeGroup } from '../atlas-structures/AtlasNodeGroup';
import { AtlasTopology } from '../atlas-structures/AtlasTopology';
import { AtlasExternalDataManager } from '../atlas-external-references-manager';
import { AtlasButtonPalette } from '../atlas-structures/AtlasButtonPalette';
import { AtlasCustomButton } from '../atlas-structures/AtlasCustomButton';
import { AtlasCluster } from '../atlas-structures/AtlasCluster';

@Component({
  selector: 'app-atlas-drawer',
  templateUrl: './atlas-drawer.component.html',
  styleUrls: ['./atlas-drawer.component.css']
})
export class AtlasDrawerComponent{
  // External Data
  @Input() externalDataManager: AtlasExternalDataManager;
  @Input() pushLocationTitle: any;
  @Input() isActive: boolean;

  @Output() pushLocationTitleEvent = new EventEmitter<Location>()

  sendTitleForPushing(location: Location){
    this.pushLocationTitleEvent.emit(location)
  }

  // Topology Data
  atlasMap: L.Map;
  topologyData: AtlasTopology;
  public buttonPalettes: AtlasButtonPalette[];
    
  // Elements Screen Size Control
  readonly initialHorizontalDivisions: number = 11;
  readonly initialVerticalDivisions: number = 10;
  readonly cellIconRatio: number = .8;
  currentHorizontalDivisions: number;
  currentVerticalDivisions: number;
  virtualCoordToScreenCoordRatio: L.Point;
  virtualCoordToGeoCoordRatio: L.Point;
  cellScreenSize: L.Point;
  cellGeoSize: L.Point;
  nodeScreenSize: L.Point;
  nodeGeoSize: L.Point;
  
  // Coordinates Position System Control
  @Input() defaultSubMapCenterCoordinates: any;
  coordinatesSystemBoundsReference:  L.LatLngBounds;
  maxViewBounds:  L.LatLngBounds;
  virtualViewOffset: L.Point;  
  lastViewPoint: L.LatLngExpression;

  // Others
  @Input() atlasIconBuilder: AtlasIconBuilder;
  
  constructor(private http: HttpClient) { 
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.recalculeSizeReferences();
  }

  public run(script: string, topologyMap: L.Map){
    this.resetTopologyMap(topologyMap);
    this.recalculeSizeReferences();
    this.interpreteAtlasScript(script);
  }

  /** Receives an Atlas script, intrepete and then execute it. 
   * 
   * @param script The Atlas script to be parsed
   */
  public interpreteAtlasScript(script: string){
    const lines: Array<string> = AtlasLexicalAnalyser.extractLines(script);
    const cleanLines: Array<string> = AtlasLexicalAnalyser.clearComments(lines);

    cleanLines.forEach(line => {
      const rawTokens: Array<string> = AtlasLexicalAnalyser.tokenize(line);      
      const tokens: Array<string> = AtlasLexicalAnalyser.groupAtlasArrays(rawTokens)
      const atlasInstruction: AtlasInstructionLabel = AtlasLexicalAnalyser.decodeInstruction(tokens[0])
      let instructionPack = AtlasSyntaxAnalyser.getInstructionCallingPack(tokens, atlasInstruction.atlasInstruction)

      // Parser
      if(AtlasSyntaxAnalyser.checkCalledInstructionSyntax(instructionPack)){
        this.callApproptriateInstructionFunction(instructionPack)
      }
    });
  }


  /** 
   * 
   * @param script 
   */
  public getAtlasInstructionCallingPackages(script: string): InstructionCallingPack[]{
    let instructionCallingPacks: Array<InstructionCallingPack> = []
    const lines: Array<string> = AtlasLexicalAnalyser.extractLines(script);
    const cleanLines: Array<string> = AtlasLexicalAnalyser.clearComments(lines);

    cleanLines.forEach(line => {
      const rawTokens: Array<string> = AtlasLexicalAnalyser.tokenize(line);      
      const tokens: Array<string> = AtlasLexicalAnalyser.groupAtlasArrays(rawTokens)
      const atlasInstruction: AtlasInstructionLabel = AtlasLexicalAnalyser.decodeInstruction(tokens[0])
      let instructionPack = AtlasSyntaxAnalyser.getInstructionCallingPack(tokens, atlasInstruction.atlasInstruction)

      instructionCallingPacks.push(instructionPack)
    });

    return instructionCallingPacks
  }


  /** 
   * 
   * @param script 
   */
  public buildTopologyFromAtlasScript(script: string){
    const lines: Array<string> = AtlasLexicalAnalyser.extractLines(script);
    const cleanLines: Array<string> = AtlasLexicalAnalyser.clearComments(lines);

    cleanLines.forEach(line => {
      const rawTokens: Array<string> = AtlasLexicalAnalyser.tokenize(line);      
      const tokens: Array<string> = AtlasLexicalAnalyser.groupAtlasArrays(rawTokens)
      const atlasInstruction: AtlasInstructionLabel = AtlasLexicalAnalyser.decodeInstruction(tokens[0])
      let instructionPack = AtlasSyntaxAnalyser.getInstructionCallingPack(tokens, atlasInstruction.atlasInstruction)

      // Parser
      if(AtlasSyntaxAnalyser.checkCalledInstructionSyntax(instructionPack)){
        this.callApproptriateInstructionFunction(instructionPack)
      }
    });
  }

  /** Call the apropriate function to an Atlas instruction
   * 
   * @param atlasInstruction  The Atlas instruction
   * @param tokens The parameters that will be passed to Atlas function execution
   */
  private callApproptriateInstructionFunction(dataPassed: InstructionCallingPack){
    dataPassed.atlasInstruction.implementation(dataPassed, this)      
  }

  private fadeNode(node: AtlasNode){
    if(!node.faded){
      if(node.highlighted)
        this.unhighlightNode(node)

      node.node.setOpacity(DrawerSettings.FADING_OPACITY)
      node.faded = true
    }
  }

  private unfadeNode(node: AtlasNode){
    if(node.faded){      
      node.node.setOpacity(1)
      node.faded = false
    }
  }

  private fadeAllNode(){
    this.topologyData.nodes.forEach(node => {
      this.fadeNode(node)
    })
  }

  public highlightSlice(slice: AtlasSlice){
    // if(slice !== null){
    //   slice.nodes.forEach( node => {
    //     this.highlightNode(node.name)
    //   })
    // }
    this.fadeAllNode()
    slice.nodes.forEach(node => {
      this.unfadeNode(node);
    })
  }
  
  public highlightNode(nodeName: string){
    let node = this.getNodeByName(nodeName)

    if(node !== null){
      node.highlighted = true
    }
  }
  
  public unhighlightNode(node: AtlasNode){
    if(node !== null){
      if(node.node instanceof L.Marker){
        let icon = node.node.getIcon()
        let iconSize = icon.options.iconSize 

        if(iconSize !== undefined){
          node.node.setIcon(icon)
          node.highlighted = false
        }
      }
    }
  }
  
  public addSlice(slice: AtlasSlice){
    if( slice !== null){
      this.topologyData.slices!.push(slice);
    }
  }

  public setScreenViewCenterOffset(xOffset: number, yOffset: number){
    this.virtualViewOffset = new L.Point(
      xOffset,
      yOffset
    );    
  }
  public isATLASscript(scriptCandidate: string){
    return AtlasSyntaxAnalyser.isATLASscript(scriptCandidate)
  }

  public resetTopologyMap(topologyMap: L.Map){
    this.clearData();
    this.atlasMap = topologyMap;
    this.restoreDefaultScreenView();
  }

  public clearData(){
    // Erase data structures
    this.topologyData = {} as AtlasTopology;
    this.topologyData.nodes = [] as Array<AtlasNode>;
    this.topologyData.links = [];
    this.topologyData.clusters = [];
    this.topologyData.linkClasses = [];
    this.topologyData.slices = [];
    this.topologyData.subTopologies = [];
    this.buttonPalettes = []
    this.buttonPalettes.push(this.getDefaultPalette())

    this.topologyData.layersCount = 1
    this.topologyData.currentLayer = 0
    this.topologyData.layersNames = []
    this.topologyData.layersNames.push("Base Layer");
    
    // Clear map
    if(this.atlasMap !== undefined){
      this.atlasMap.eachLayer( (layer) => {
        this.atlasMap.removeLayer(layer)
      })
    }
  }

  public calculateMaxViewBounds(){
    let minX = 9999999
    let maxX = -9999999
    let minY = 9999999
    let maxY = -9999999

    this.topologyData.nodes.forEach(node => {
      if(node.xPos > maxX ) maxX = node.xPos;  
      if(node.xPos < minX ) minX = node.xPos;  
      if(node.yPos > maxY ) maxY = node.yPos;  
      if(node.yPos < minY ) minY = node.yPos;  
    });

    
  }

  public defineMaxViewBounds(bounds: L.LatLngBounds){
    let sw = bounds.getSouthWest()
    let ne = bounds.getNorthEast()
    
    sw.lng -= this.nodeGeoSize.x;
    sw.lat -= this.nodeGeoSize.y;
    ne.lng += this.nodeGeoSize.x;
    ne.lat += this.nodeGeoSize.y;

    this.maxViewBounds = new L.LatLngBounds(sw, ne)
    this.atlasMap.setMaxBounds(this.maxViewBounds)
  }

  public restoreDefaultScreenView(){
    this.atlasMap.setView(this.defaultSubMapCenterCoordinates);
    this.atlasMap.setZoom(DrawerSettings.INITIAL_ZOOM);
    this.coordinatesSystemBoundsReference = this.atlasMap.getBounds();
  }

  public addNode(node: AtlasNode){    
    node.node = new L.Marker(
      [this.getGeoLatFromVirtualY(node.yPos), this.getGeoLngFromVirtualX(node.xPos)],
      {
        draggable: false,
      }
    );
    
    const selfATLAS = this;
    node.node.on('popupopen', () => this.lastViewPoint = this.atlasMap.getCenter() );
    node.node.on('popupclose', () => this.atlasMap.setView(this.lastViewPoint));  
  
    node.node.addTo(this.atlasMap);

    if(node.tagName != '' && node.tagName != undefined)
      this.changeNodeIcon(node);
    else
      this.changeNodeIcon(node,'default');

    this.topologyData.nodes.push(node);
    
    this.atlasMap.on("zoomend", () => {      
      this.recalculeScreenSizeReferences()
      let icon = node.node.getIcon()      
      icon.options.iconSize = [this.nodeScreenSize.x, this.nodeScreenSize.y]            
      node.node.setIcon(icon)
    })
  }
  
  public addLink(link: AtlasLink){
    let locationColapsed: boolean = false;
    let subTopology: AtlasTopology | null;

    if(link.externalSrcLinkType || link.externalTgtLinkType){
      locationColapsed = true
      subTopology = this.getSubtopologyByName(link.subTopologyname)
      if(subTopology === null){
        return;
      }else if(subTopology.expanded){
        locationColapsed = false
      }
    }

    let srcX, srcY, tgtX, tgtY: number;
    if(!locationColapsed){
      const srcNode: AtlasNode = this.getNodeByName(link.nodeSrcName)! as AtlasNode;
      const tgtNode: AtlasNode = this.getNodeByName(link.nodeTgtName)! as AtlasNode;
      srcX = srcNode.xPos
      srcY = srcNode.yPos
      tgtX = tgtNode.xPos
      tgtY = tgtNode.yPos
     
      if(srcNode == null || tgtNode == null)
        return;
    }else{
      subTopology = this.getSubtopologyByName(link.subTopologyname)
      if(link.externalSrcLinkType){
        const node: AtlasNode = this.getNodeByName(link.nodeTgtName)! as AtlasNode;
        srcX = subTopology!.xPos
        srcY = subTopology!.yPos
        tgtX = node.xPos
        tgtY = node.yPos
      }else{
        const node: AtlasNode = this.getNodeByName(link.nodeSrcName)! as AtlasNode;
        srcX = node.xPos
        srcY = node.yPos
        tgtX = subTopology!.xPos
        tgtY = subTopology!.yPos
      }      
    }  
    
    link.link = L.polyline([this.getLinkAnchorGeoPoint(srcX, srcY, link.srcAnchor), this.getLinkAnchorGeoPoint(tgtX, tgtY, link.tgtAnchor)], {
      className: "atlas-link-icon-active",
      color: link.color,
      weight: link.weight,
      opacity: link.opacity,
      dashArray: `${link.dashLength},${link.gapLength}`,      
    }).addTo(this.atlasMap); 
    
    if(link.externalSrcLinkType || link.externalTgtLinkType){
      subTopology = this.getSubtopologyByName(link.subTopologyname)
      if(subTopology !== null){
        subTopology.marker.on('remove', () => {
          this.atlasMap.removeLayer(link.link)          
          // console.log(link.nodeSrcName + ', ' + link.nodeTgtName)
          // console.log(this.topologyData.nodes)
          this.addLink(link)
        })
      }
    }

    link.link.on('mouseover', () => {
      link.link.setStyle({weight: link.weight*1.15})
    })

    link.link.on('mouseout', () => {
      link.link.setStyle({weight: link.weight})
    })

    this.topologyData.links.push(link);

  }

  public addLinkClass(linkClass: AtlasLinkClass){
    this.topologyData.linkClasses.push(linkClass)
  }

  public addNodeGroup(nodeGroup: AtlasNodeGroup){
    this.topologyData.nodeGroups.push(nodeGroup)
  }

  public addSubTopology(subTopology: AtlasTopology){
    subTopology.marker = new L.Marker(
      [this.getGeoLatFromVirtualY(subTopology.yPos), this.getGeoLngFromVirtualX(subTopology.xPos)],
      {
        draggable: false,
      }
    );
    
    subTopology.marker.on('popupopen', () => this.lastViewPoint = this.atlasMap.getCenter() );
    subTopology.marker.on('popupclose', () => this.atlasMap.setView(this.lastViewPoint));  

    subTopology.marker.addTo(this.atlasMap);

    if(subTopology.locationName != '' && subTopology.locationName != undefined){
      this.changeSubTopologyIcon(subTopology);
      subTopology.marker.setPopupContent(`${subTopology.locationName}`);
    }else{
      this.changeSubTopologyIcon(subTopology,'default');
      subTopology.marker.setPopupContent(`${subTopology.name}`);
    }
    
    this.atlasMap.on("zoomend", () => {      
      this.recalculeScreenSizeReferences()
      let icon = subTopology.marker.getIcon()      
      icon.options.iconSize = [this.nodeScreenSize.x, DrawerSettings.SUB_LOCATION_ICON_INCREASING_SIZE_FACTOR * this.nodeScreenSize.y]            
      subTopology.marker.setIcon(icon)
    })

    this.topologyData.subTopologies.push(subTopology)

    subTopology.marker.on("click", () => {      
      this.expandSubTopology(subTopology)
    })

  }

  public moveElement(element: AtlasNode, xOffset: number, yOffset: number ){
    const currentGeoPos = element.node.getLatLng();    

    element.node.setLatLng(
      [
        currentGeoPos.lat + this.getGeoLatFromVirtualY(yOffset),
        currentGeoPos.lng + this.getGeoLngFromVirtualX(xOffset)
      ]
    )
  }
  
  public tryToDeduceLinkAnchors(link: AtlasLink){
    let nodeSrc = this.getNodeByName(link.nodeSrcName);
    let nodeTgt = this.getNodeByName(link.nodeTgtName);
    if( nodeSrc == null || nodeTgt == null)
      return;

    let xSrc = nodeSrc.xPos;
    let xTgt = nodeTgt.xPos;
    let ySrc = nodeSrc.yPos;
    let yTgt = nodeTgt.yPos;
    
    if(xSrc === xTgt){
      if(ySrc === yTgt){
        link.srcAnchor = 'C';
        link.tgtAnchor = 'C';
      }else if(ySrc < yTgt){
        link.srcAnchor = 'S';
        link.tgtAnchor = 'N';
      }else{
        link.srcAnchor = 'N';
        link.tgtAnchor = 'S';
      }
    }else if(Math.abs(ySrc - yTgt) > 2){
      if(ySrc < yTgt){
        link.srcAnchor = 'S';        
        link.tgtAnchor = 'N';
      }else{
        link.srcAnchor = 'N';        
        link.tgtAnchor = 'S';
      }
    }else{
      if(xSrc < xTgt){
        link.srcAnchor = 'E';
        link.tgtAnchor = 'W';
      }else{
        link.srcAnchor = 'W';
        link.tgtAnchor = 'E';
      }
    }    
  }

  public changeNodeIcon(node: AtlasNode, iconGenerationMode = 'analize', color = 'blue'){
    let iconSource: string = 'color'
    // if(color === 'random-color'){
    //   color = this.generateRandomColor();
    // }
    // Determine Icon Source
    switch(iconGenerationMode){
      case 'analize':
        if(node.tagName !== '' && node.tagName !== undefined && node.tagName !== null){          
          iconSource = 'tag'
        }
        break
      case 'default':
        iconSource = 'default'
        break
    }

    // Build and Apply Icon
    switch(iconSource){
      case 'default':
        node.node.setIcon(L.divIcon({
          html: AtlasIconBuilder.getDefaultNodeIcon(node, color),
          iconSize: [this.nodeScreenSize.x, this.nodeScreenSize.y],
        }));

        break;
      case 'tag':
        node.node.setIcon(L.divIcon({
          html: this.atlasIconBuilder.getNodeIconFromTag(node),
          iconSize: [this.nodeScreenSize.x, this.nodeScreenSize.y],
        }))

        break
    }
  }

  public changeSubTopologyIcon(subTopology: AtlasTopology, iconGenerationMode = 'analize', color = 'blue'){
    let iconSource: string = 'color'

    // Determine Icon Source
    switch(iconGenerationMode){
      case 'analize':
        if(subTopology.locationName !== '' && subTopology.locationName !== undefined && subTopology.locationName !== null){          
          iconSource = 'location'
        }
        break
    }

    // Build and Apply Icon
    switch(iconSource){
      case 'default':
        subTopology.marker.setIcon(L.divIcon({
          html: AtlasIconBuilder.getDefaultSubTopologyIcon(subTopology, color),
          iconSize: [
            this.nodeScreenSize.x,
            DrawerSettings.SUB_LOCATION_ICON_INCREASING_SIZE_FACTOR * this.nodeScreenSize.y
          ],
        }));

        break;
      case 'location':
        subTopology.marker.setIcon(L.divIcon({
          html: AtlasIconBuilder.getSubTopologyIconFromLocation(subTopology),
          iconSize: [
            this.nodeScreenSize.x,
            DrawerSettings.SUB_LOCATION_ICON_INCREASING_SIZE_FACTOR * this.nodeScreenSize.y
          ],
        }));
        break
    }
  }

  public getLinkClassByName(linkClassName: string): AtlasLinkClass | null{
    for( let i = 0 ; i < this.topologyData.linkClasses.length ; i++ )
      if(this.topologyData.linkClasses[i].name === linkClassName)
        return this.topologyData.linkClasses[i];    
    
    return null;
  }

  public getNodeByName(nodeName: string): AtlasNode | null{
    for( let i = 0 ; i < this.topologyData.nodes.length ; i++ )
      if(this.topologyData.nodes[i].name === nodeName)
        return this.topologyData.nodes[i];    
    
    return null;
  }

  public getSubtopologyByName(subTopologyName: string): AtlasTopology | null{
    for( let i = 0 ; i < this.topologyData.subTopologies.length ; i++ )
      if(this.topologyData.subTopologies[i].name === subTopologyName)
        return this.topologyData.subTopologies[i];    
    
    return null;
  }

  public getSliceByName(sliceName: string): AtlasSlice | null{
    for( let i = 0 ; i < this.topologyData.slices.length ; i++ )
      if(this.topologyData.slices[i].name === sliceName)
        return this.topologyData.slices[i];    
    
    return null;
  }

  public getLinkByNodes(nodeSrcName: string, nodeTgtName: string): AtlasLink | null{
    for( let i = 0 ; i < this.topologyData.links.length ; i++ )
      if(this.topologyData.links[i].nodeSrcName === nodeSrcName)
       if(this.topologyData.links[i].nodeTgtName === nodeTgtName)
        return this.topologyData.links[i];    
    
    return null;
  }

  public rmNode(nodeName: string){
      const node = this.getNodeByName(nodeName);

      if(node != null){
        node.node.removeFrom(this.atlasMap);
        this.rmNodeFromListByName(node.name);
      }
  }

  private rmNodeFromListByName(nodeName: string){
    for( let i = 0 ; i < this.topologyData.nodes.length ; i++ )
      if(this.topologyData.nodes[i].name === nodeName)
        this.topologyData.nodes.slice(i,1);    
  }

  private rmLink(nodeSrcName: string, nodeTgtName: string){
      const link = this.getLinkByNodes(nodeSrcName, nodeTgtName);

      if(link != null){
        link.link.removeFrom(this.atlasMap);
        this.rmLinkFromListByNodes(nodeSrcName, nodeTgtName);
      }
  }

  private rmLinkFromListByNodes(nodeSrcName: string, nodeTgtName: string){
    for( let i = 0 ; i < this.topologyData.links.length ; i++ )
      if(this.topologyData.links[i].nodeSrcName === nodeSrcName)
        if(this.topologyData.links[i].nodeTgtName === nodeTgtName)
          this.topologyData.links.slice(i,1);    
  }

  public getGeoLngFromVirtualX( virtualX: number ): number{
    return this.coordinatesSystemBoundsReference.getWest() + (virtualX) * this.virtualCoordToGeoCoordRatio.x;
  }
  
  public getGeoLatFromVirtualY( virtualY: number ): number{
    return this.coordinatesSystemBoundsReference.getNorth() - (virtualY) * this.virtualCoordToGeoCoordRatio.y;
  }

  private getVirtualXFromGeoLng( geoX: number ): number{
    return geoX / this.virtualCoordToGeoCoordRatio.x;
  }
  
  private getVirtualYFromGeoLat( geoY: number ): number{
    return geoY / this.virtualCoordToGeoCoordRatio.y;
  }

  private getScreenXFromVirtualX( virtualX: number ): number{
    return virtualX * this.virtualCoordToScreenCoordRatio.x;
  }
  
  private getScreenYFromVirtualY( virtualY: number ): number{
    return virtualY * this.virtualCoordToScreenCoordRatio.y;
  }

  private getVirtualXFromScreenX( screenX: number ): number{
    return screenX / this.virtualCoordToScreenCoordRatio.x;
  }
  
  private getVirtualYFromScreenY( screenY: number ): number{
    return screenY / this.virtualCoordToScreenCoordRatio.y;
  }

  private getGeoLngFromScreenX( screenX: number ): number{
    return this.getGeoLngFromVirtualX(this.getVirtualXFromScreenX(screenX));
  }
  
  private getGeoLatFromScreenY( screenY: number ): number{
    return this.getGeoLatFromVirtualY(this.getVirtualYFromScreenY(screenY));
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
    this.defineMaxViewBounds(this.coordinatesSystemBoundsReference)
  }

  private recalculeScreenSizeReferences(){
    // Screen coordinates [Pixels, Pixels]
    const currentBounds = this.atlasMap.getBounds()
    const currentHorizontalGeoSize = currentBounds.getEast() - currentBounds.getWest()
    const referenceHorizontalGeoSize = this.coordinatesSystemBoundsReference.getEast() - this.coordinatesSystemBoundsReference.getWest()
    const referenceHorizontalCellGeoSize = referenceHorizontalGeoSize / this.initialHorizontalDivisions
    this.currentHorizontalDivisions = (currentHorizontalGeoSize) / (referenceHorizontalCellGeoSize)
    
    const currentVerticalGeoSize = currentBounds.getNorth() - currentBounds.getSouth()
    const referenceVerticalGeoSize = this.coordinatesSystemBoundsReference.getNorth() - this.coordinatesSystemBoundsReference.getSouth()
    const referenceVerticalCellGeoSize = referenceVerticalGeoSize / this.initialVerticalDivisions
    this.currentVerticalDivisions = (currentVerticalGeoSize) / (referenceVerticalCellGeoSize)
    
    // Ratio between virtual to screen sizes    
    this.virtualCoordToScreenCoordRatio = new L.Point(
      (this.atlasMap.getSize().x / this.currentHorizontalDivisions),
      (this.atlasMap.getSize().y / this.currentVerticalDivisions)
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
        const mapGeoSize: L.Point = new L.Point(
          this.atlasMap.getBounds().getEast() - this.atlasMap.getBounds().getWest(),
          this.atlasMap.getBounds().getNorth() - this.atlasMap.getBounds().getSouth()
        )
        
        // Ratio between virtual to geo sizes
        this.virtualCoordToGeoCoordRatio = new L.Point(
          mapGeoSize.x / this.currentHorizontalDivisions,
          mapGeoSize.y / this.currentVerticalDivisions
        );
          
        // Node geo sizes
        this.nodeGeoSize = new L.Point(
          this.cellIconRatio * this.virtualCoordToGeoCoordRatio.x,
          this.cellIconRatio * this.virtualCoordToGeoCoordRatio.y,
        )
  }

  public isAllPopupsClosed(): boolean{
    let isAllPopupsClosed = true;
    
    this.topologyData.nodes.forEach( node => {
      if(node.node.isPopupOpen())
        isAllPopupsClosed = false;
    });

    return isAllPopupsClosed;
  }

  public restoreCustomizedScreenView(){
    this.restoreDefaultScreenView();
    this.atlasMap.panBy(
      [
        this.getScreenXFromVirtualX(this.virtualViewOffset.x), 
        this.getScreenYFromVirtualY(this.virtualViewOffset.y)
      ]
    );
  }

  public getDataFormHttpServer(url:string): Observable<any>{
    return this.http.get<any>(url);
  }

  private expandSubTopology(subTopology: AtlasTopology){
    let location = this.externalDataManager.getLocationByName(subTopology.locationName)
    let atlasScript = location.overlayed_popup_content
    if(this.isATLASscript(atlasScript)){
      // Change Script
      let instructionPacks = this.getAtlasInstructionCallingPackages(atlasScript)
      
      // Insert elements of subTopology      
      instructionPacks.forEach( pack =>{
        if(AtlasSyntaxAnalyser.checkCalledInstructionSyntax(pack)){
          switch(pack.atlasInstruction){
            case ATLAS_INSTRUCTIONS_LABELS.ADD_NODE.atlasInstruction:                    
                pack.providedArguments[0].formatedValue = `<${subTopology.name}>${pack.providedArguments[0].formatedValue}`
                pack.providedArguments[1].formatedValue = Number(subTopology.xPos) + parseFloat(pack.providedArguments[1].formatedValue) + subTopology.positionOffSet.x
                pack.providedArguments[2].formatedValue = Number(subTopology.yPos) + parseFloat(pack.providedArguments[2].formatedValue) + subTopology.positionOffSet.y
                this.callApproptriateInstructionFunction(pack)
                break
            case ATLAS_INSTRUCTIONS_LABELS.ADD_SMART_LINK.atlasInstruction:                    
                pack.providedArguments[0].formatedValue = `<${subTopology.name}>${pack.providedArguments[0].formatedValue}`
                pack.providedArguments[1].formatedValue = `<${subTopology.name}>${pack.providedArguments[1].formatedValue}`                                
                this.callApproptriateInstructionFunction(pack)
                break
            case ATLAS_INSTRUCTIONS_LABELS.CREATE_LINK_CLASS.atlasInstruction:                    
                this.callApproptriateInstructionFunction(pack)
                break
            }

        }
      });
      subTopology.expanded = true
      subTopology.marker.remove()

      this.sendTitleForPushing(location)    
    }
  }

  private getDefaultPalette(): AtlasButtonPalette{
    let defPalette: AtlasButtonPalette = {} as AtlasButtonPalette
    // defPalette.active = false;
    defPalette.active = false;
    defPalette.buttons = [];
    defPalette.name = 'default'
    defPalette.labelName = 'Buttons';
    defPalette.checkingBehavior = 'trigger';

    return defPalette
  }

  public addButtonsPalette(palette: AtlasButtonPalette){
    this.buttonPalettes.push(palette)
  }

  public addButton(button: AtlasCustomButton){
    let paletteId = this.getButtonPaletteIdFromName(button.paletteName)

    if(paletteId !== -1){
      this.buttonPalettes[paletteId].buttons.push(button)
    }
  }

  public getButtonPaletteIdFromName(palettename: string): number{        
    for(let i = 0 ; i < this.buttonPalettes.length ; i++){
      if(this.buttonPalettes[i].name === palettename){
        return i;
      }
    }
    
    return -1;
  }

  public changeLayer(newLayer: number){
    if(this.topologyData.currentLayer != newLayer){
      this.topologyData.clusters.forEach(atlasCluster => {
        if(atlasCluster.representation.layer == this.topologyData.currentLayer){
          atlasCluster.representation.node.setOpacity(0)
          atlasCluster.nodes.forEach(node => {
            node.node.setOpacity(1);
          })
        }
        
        if(atlasCluster.representation.layer == newLayer){
          atlasCluster.representation.node.setOpacity(1)
          atlasCluster.nodes.forEach(node => {
            node.node.setOpacity(0);
          })
        }
      })
      this.topologyData.currentLayer = newLayer;
    }
  }

  public addCluster(atlasCluster: AtlasCluster){
    this.topologyData.clusters.push(atlasCluster);
    atlasCluster.representation.node = new L.Marker(
      [this.getGeoLatFromVirtualY(atlasCluster.representation.yPos), this.getGeoLngFromVirtualX(atlasCluster.representation.xPos)],
      {
        draggable: false,
      }
    );
    
    const selfATLAS = this;
    atlasCluster.representation.node.on('popupopen', () => this.lastViewPoint = this.atlasMap.getCenter() );
    atlasCluster.representation.node.on('popupclose', () => this.atlasMap.setView(this.lastViewPoint));  
  
    atlasCluster.representation.node.addTo(this.atlasMap);

    this.changeNodeIcon(atlasCluster.representation,'default', 'blue');
    
    this.atlasMap.on("zoomend", () => {      
      this.recalculeScreenSizeReferences()
      let icon = atlasCluster.representation.node.getIcon()      
      icon.options.iconSize = [this.nodeScreenSize.x, this.nodeScreenSize.y]            
      atlasCluster.representation.node.setIcon(icon)
    })

    if(this.topologyData.currentLayer !== atlasCluster.representation.layer){
      atlasCluster.representation.node.setOpacity(0);
    }else{
      atlasCluster.nodes.forEach(node => {
        node.node.setOpacity(0);
      })
    }
  }

  // Function to generate a random color
  generateRandomColor(): string {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Convert RGB to hexadecimal color code
    const hexColor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hexColor;
  }
}
