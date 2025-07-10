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
import { AtlasNodeGroup as AtlasNodeGroup } from "../../atlas-structures/AtlasNodeGroup";
import { AtlasCluster } from "../../atlas-structures/AtlasCluster";

export class CreateClusterInstruction implements AtlasInstruction{  
  /** Implementation of Atlas instruction:  CREATE_CLUSTER
   * Version: 2.0
   * @param tokens The tokens of Atlas script line
   * @param atlasDrawer Instance of AtlasDrawer that will be operated by CREATE_CLUSTER instruction
   */
  public implementation(dataPassed:InstructionCallingPack, atlasDrawer: AtlasDrawerComponent){
    // alert(`added cluster ${atlasCluster.representation.name}`)
    // Arguments
    let atlasCluster: AtlasCluster = {} as AtlasCluster;
    atlasCluster.representation = {} as AtlasNode;
    atlasCluster.nodes = [];
    atlasCluster.representation.name = dataPassed.providedArguments[0].formatedValue;
    atlasCluster.representation.layer = dataPassed.providedArguments[1].formatedValue;
    atlasCluster.representation.xPos = dataPassed.providedArguments[2].formatedValue;
    atlasCluster.representation.yPos = dataPassed.providedArguments[3].formatedValue;
    
    for(let i = 4 ; i < dataPassed.providedArguments.length ; i++){
      let node = atlasDrawer.getNodeByName(dataPassed.providedArguments[i].formatedValue);
      if(node !== null){
        atlasCluster.nodes.push(node!);
        console.log(node.name)
      }
    }
    
    // Flags
    dataPassed.providedFlags.forEach( (flag, index) => {
      switch(flag.flagName){
        case '--color':
          // cluster.representation. = flag.formatedValue;
          break;
      }
    });

    atlasDrawer.addCluster(atlasCluster)
  }

  public readonly parameters: AtlasInstructionParameter[] = [
    {
      name: 'name',
      mandatory: true,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'level',
      mandatory: true,
      expectedType: 'int',
      expectedValues: [],
    },
    {
      name: 'xPos',
      mandatory: true,
      expectedType: 'int',
      expectedValues: [],
    },
    {
      name: 'yPos',
      mandatory: true,
      expectedType: 'int',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    {
      name: 'nodex',
      mandatory: false,
      expectedType: 'string',
      expectedValues: [],
    },
    // {
    //   name: 'nodesList',
    //   mandatory: true,
    //   expectedType: 'string[]',
    //   expectedValues: [],
    // }
  ];

  public readonly availableFlags: AtlasInstructionAvailableFlag[] = [
    {
      name:'--color',
      expectedType:'string',
      expectedValues:[],
      alias:'-c',
    },
  ];
}
