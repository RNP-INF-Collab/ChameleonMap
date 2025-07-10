import { AtlasNode } from "../../atlas-structures/AtlasNode";
import { AtlasLink } from "../../atlas-structures/AtlasLink";
import { AtlasSlice } from "../../atlas-structures/AtlasSlice";
import { AtlasLinkClass } from "../../atlas-structures/AtlasLinkClass";
import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { ProvidedFlag } from "../atlas-instructions";
import { 
  AtlasInstruction,
  AtlasInstructionParameter,
  AtlasInstructionAvailableFlag,
  InstructionCallingPack,
} from "../atlas-instructions";
import { AtlasLexicalAnalyser } from "../atlas-lexical-analyser/atlas-lexical-analyser";

export class CreateLinkClassInstruction implements AtlasInstruction{
  readonly defaultColor = 'black';
  readonly defaultWeight = 2;
  readonly defaultOpacity = 1;
  readonly defaultDashLength = 1;
  readonly defaultGapLength = 0;
  
  /** Implementation of Atlas instruction:  CREATE_LINK_CLASS
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by CREATE_LINK_CLASS instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    const linkClass: AtlasLinkClass = {} as AtlasLinkClass;
    linkClass.color = this.defaultColor;
    linkClass.weight = this.defaultWeight;
    linkClass.opacity = this.defaultOpacity;
    linkClass.dashLength = this.defaultDashLength;
    linkClass.gapLength = this.defaultGapLength;

    // Arguments
    linkClass.name = dataPassed.providedArguments[0].formatedValue;
    if(dataPassed.providedArguments.length >= 2 ){
      linkClass.info = dataPassed.providedArguments[1].formatedValue;
    }

    // Flags
    dataPassed.providedFlags.forEach( (flag, index) => {
      switch(flag.flagName){
        case '--color':
          linkClass.color = flag.formatedValue;          
          break; 
        case '--weight':
          linkClass.weight = flag.formatedValue;          
          break;      
        case '--opacity':
          linkClass.opacity = flag.formatedValue;          
          break;      
        case '--dashed-line':
          linkClass.dashLength = 5;
          linkClass.gapLength = 5;
          break;      
        case '--dashed-line2':
          linkClass.dashLength = 5;
          linkClass.gapLength = 10;
          break;              
        case '--dotted-line':
          linkClass.dashLength = 0.5;
          linkClass.gapLength = 5;
          break;
      }
    });

    atlasDrawer.addLinkClass(linkClass)
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'name',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'info',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    }
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
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

  public static designFlagsAnalyser(link: AtlasLink,providedFlags: ProvidedFlag[]){
    providedFlags.forEach( (flag, index) => {
      switch(flag.flagName){
        case '--color':
          link.color = flag.formatedValue;          
          break; 
        case '--weight':
          link.weight = flag.formatedValue;          
          break;      
        case '--opacity':
          link.opacity = flag.formatedValue;          
          break;      
        case '--dashed-line':
          link.dashLength = 5;
          link.gapLength = 5;
          break;      
        case '--dashed-line2':
          link.dashLength = 5;
          link.gapLength = 10;
          break;              
        case '--dotted-line':
          link.dashLength = 0.5;
          link.gapLength = 5;
          break;
      }
    });
    
    return link
  }
}
