import { AtlasNode } from "../../atlas-structures/AtlasNode";
import { AtlasLink } from "../../atlas-structures/AtlasLink";
import { AtlasSlice } from "../../atlas-structures/AtlasSlice";
import { AtlasLinkClass } from "../../atlas-structures/AtlasLinkClass";
import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { 
  AtlasInstruction,
  AtlasInstructionParameter,
  AtlasInstructionAvailableFlag,
  InstructionCallingPack,
} from "../atlas-instructions";
import { CreateLinkClassInstruction } from "./create-link-class";
import { PushLinkPopupInstruction } from "./push-link-popup";

export class AddSmartLinkInstruction implements AtlasInstruction{
  readonly defaultColor = 'black';
  readonly defaultWeight = 2;
  readonly defaultOpacity = 1;
  readonly defaultDashLength = 1;
  readonly defaultGapLength = 0;

  /** Implementation of Atlas instruction:  ADD_SMART_LINK
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by ADD_SMART_LINK instruction
   */
  // public implementation(tokens: Array<string>, atlasDrawer: AtlasDrawerComponent): boolean{
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){    
    let link: AtlasLink = {} as AtlasLink;
    link.nodeSrcName = dataPassed.providedArguments[0].formatedValue;
    link.nodeTgtName = dataPassed.providedArguments[1].formatedValue;
    link.subTopologyname = ''
    link.externalSrcLinkType = false
    link.externalTgtLinkType = false
    
    if(dataPassed.providedArguments.length >= 3){
      const linkClass = atlasDrawer.getLinkClassByName(dataPassed.providedArguments[2].formatedValue);

      if(linkClass != null){
        link = this.adjustLinkForClass(link, linkClass)
      }else{
        return false;
      }
    }else{      
      link.class = '';
      link.info = '';            
      link.color = this.defaultColor;
      link.weight = this.defaultWeight;
      link.opacity = this.defaultOpacity;
      link.dashLength = this.defaultDashLength;
      link.gapLength = this.defaultGapLength;           
      link = CreateLinkClassInstruction.designFlagsAnalyser(link, dataPassed.providedFlags);
    }
        
    // Best anchors analysis
    link.srcAnchor = '';
    link.tgtAnchor = '';
    atlasDrawer.tryToDeduceLinkAnchors(link);
    
    // Analise Flags
    dataPassed.providedFlags.forEach( (flag, index) => {
      switch(flag.flagName){
        case '--externalSource':
          link.nodeSrcName = `<${flag.formatedValue}>${link.nodeSrcName}`;
          link.subTopologyname = flag.formatedValue
          link.externalSrcLinkType = true
          break;
        case '--externalTarget':
          link.nodeTgtName = `<${flag.formatedValue}>${link.nodeSrcName}`;
          link.subTopologyname = flag.formatedValue
          link.externalTgtLinkType = true   
          break;
        case '--srcAnchor':
          link.srcAnchor = flag.formatedValue;
          break;
        case '--tgtAnchor':
          link.tgtAnchor = flag.formatedValue;
          break;
        }
    });

    atlasDrawer.addLink(link)
    PushLinkPopupInstruction.pushLinkPopup(link, link.info)
    
    return true;
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name:'srcNodeName',
      expectedType: 'string',
      expectedValues: [],
      mandatory: true,
    },
    {
      name:'dstNodeName',
      expectedType: 'string',
      expectedValues: [],
      mandatory: true,
    },
    {
      name:'linkClass',
      expectedType: 'string',
      expectedValues: [],
      mandatory: false,
    },

  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    {
      name:'--externalSource',
      expectedType:'string',
      expectedValues:[],
      alias:'-es',
    },
    {
      name:'--externalTarget',
      expectedType:'string',
      expectedValues:[],
      alias:'-et',
    },
    {
      name:'--color',
      expectedType:'string',
      expectedValues:[],
      alias:'-c',
    },
    {
      name:'--weight',
      expectedType:'number',
      expectedValues:[],
      alias:'-w',
    },
    {
      name:'--opacity',
      expectedType:'number',
      expectedValues:[],
      alias:'-o',
    },
    {
      name:'--srcAnchor',
      expectedType:'char',
      expectedValues:['W','E','N','S','C'],
      alias:'-sa',
    },
    {
      name:'--tgtAnchor',
      expectedType:'char',
      expectedValues:['W','E','N','S','C'],
      alias:'-ta',
    },
    {
      name:'--dotted-line',
      expectedType:'none',
      expectedValues:[],
      alias:'',
    },
    {
      name:'--dashed-line',
      expectedType:'none',
      expectedValues:[],
      alias:'',
    },
    {
      name:'--dashed-line2', 
      expectedType:'none', 
      expectedValues:[],
      alias:'',
    },
  ];


  private adjustLinkForClass(link: AtlasLink, linkClass: AtlasLinkClass): AtlasLink{
    link.class = linkClass.name
    link.color = linkClass.color
    link.dashLength = linkClass.dashLength
    link.gapLength = linkClass.gapLength
    link.opacity = linkClass.opacity
    link.weight = linkClass.weight
    link.info = linkClass.info
  
    return link
  }
}

