import { 
  ProvidedArgument,
  ProvidedFlag,
  AtlasInstruction,
  InstructionCallingPack,
  ATLAS_INSTRUCTIONS_LABELS,
} from "../atlas-instructions";
import { AtlasLexicalAnalyser } from "../atlas-lexical-analyser/atlas-lexical-analyser";
import { AtlasInstructionAvailableFlag as AtlasAvailableFlag } from "../atlas-instructions";
import { AtlasUtils } from "../../atlas-utils/utils";
import { AtlasAlertEmitter } from "../atlas-alert-emitter/atlas-alert-emitter";
import { tokenName } from "@angular/compiler";
import { AtlasInitInstruction } from "../atlas-instructions-implementations-functions/atlas-init";

export class AtlasSyntaxAnalyser{

  /** Check sintax of Atlas instruciton calling. It checks passed arguments count and passed arguments values types
   * 
   * @param instructionCallingInstance 
   * @returns True if instruction line can execute and False if it can't. Wrong flags doesn't 
   * block instruction execution
   */
  public static checkCalledInstructionSyntax(instructionCallingInstance: InstructionCallingPack): boolean{
    const expectedMandatoryArgumentsCount = AtlasSyntaxAnalyser.getCountOfMandatoryArguments(instructionCallingInstance.atlasInstruction)
    const expectedArgumentsCount = AtlasSyntaxAnalyser.getCountOfArguments(instructionCallingInstance.atlasInstruction)
    const providedArgumentsCount = instructionCallingInstance.providedArguments.length
    
    let instructionRunability = true
    if(providedArgumentsCount < expectedMandatoryArgumentsCount
    || providedArgumentsCount > expectedArgumentsCount){
      instructionRunability = false
      AtlasAlertEmitter.wrongCountOfProvidedArguments(instructionCallingInstance)
    }else{
      instructionCallingInstance.providedArguments.forEach( providedArgument => {
        if(!providedArgument.valueFormatIsValid){
          instructionRunability = false
          const argumentIndex = providedArgument.callingPosition
          AtlasAlertEmitter.wrongArgumentTypeMessage(providedArgument, instructionCallingInstance.atlasInstruction.parameters[argumentIndex],instructionCallingInstance.atlasInstruction)
        }
      })
    }

    if(instructionRunability){
      instructionCallingInstance.providedFlags.forEach( providedFlag => {
        if(!providedFlag.flagNameIsValid){
          AtlasAlertEmitter.unknownFlag(providedFlag, instructionCallingInstance.atlasInstruction)
        }else{
          if(!providedFlag.valueFormatIsValid){
            /**@todo invalid type alert */
          }
        }
      })
    }

    return instructionRunability
  }
  
  /** Get set of tokens in some line and group them inside InstructionCallingPack structure
   * 
   * @param tokens The tokens passed in some line, where token[0] should be, naturally, the Atlas instruction name
   * @param instruction 
   * @returns The instruction calling grouped in a data structure
   */
  public static getInstructionCallingPack(tokens: Array<string>, instruction: AtlasInstruction): InstructionCallingPack{
    let instructionFlags: Array<ProvidedFlag> = AtlasSyntaxAnalyser.extractFlags({tokens:tokens, instruction:instruction});
    let instructionArguments: Array<ProvidedArgument> = AtlasSyntaxAnalyser.decipherArguments(tokens, instruction);

    let instructionCallingPack: InstructionCallingPack = {
      atlasInstruction: instruction,
      providedArguments: instructionArguments,
      providedFlags: instructionFlags,
      instructionNameAliasUsed: tokens[0],
      codeLine: -1,
    }

    if(instructionCallingPack.atlasInstruction === ATLAS_INSTRUCTIONS_LABELS.INVALID_INSTRUCTION.atlasInstruction){
      instructionCallingPack.providedArguments = [];
      instructionCallingPack.providedFlags = [];
    }

    return instructionCallingPack
  }
  
  /**
   * 
   * @param argumentsTokens 
   * @param atlasInstruction 
   * @returns 
   */
  private static decipherArguments(argumentsTokens: string[], atlasInstruction: AtlasInstruction): Array<ProvidedArgument>{
    let instructionArguments: Array<ProvidedArgument> = [];

    let openedArray = false;    
    let arrayInitIndex = -1;    
    let newArray: Array<string> = []
    for(let i = 0 ; i < argumentsTokens.length ; i++){
      if(argumentsTokens[i] === '['){
        if(openedArray === false){
          openedArray = true
          arrayInitIndex = i
        }else{/** @todo Create array recursion */}
      }else{
        if(openedArray === true){
          newArray.push(argumentsTokens[i])
          if(argumentsTokens[i] === ']'){
            openedArray = false;
            argumentsTokens[arrayInitIndex] = AtlasLexicalAnalyser.encodeAtlasArray(newArray);
          }
        }      
      }
    }

    argumentsTokens.forEach((argumentToken,index) => {
      if(index !== 0 ){
        let providedArgument: ProvidedArgument = {
          collumn:0,
          line:0,
          callingPosition: index,
          value: argumentToken,
          valueFormatIsValid: false,
          formatedValue: '',
        }
        AtlasSyntaxAnalyser.checkProvidedArgumentSintaxAtendance({providedArgument: providedArgument, instruction: atlasInstruction})
        instructionArguments.push(providedArgument)
      }
    })
    
    return instructionArguments;
  }

  /** Get a array of tokens that are the tokens passed for a Atlas instruction calling, then
   * each token that are a flag or a flag parameter is removed. The flags removed are so converted
   * to an apropiate data structure(ProvidedFlag), grouped in a array and returned in the method end.
   * 
   * @param model 
   * @returns The ProvidedFlag's array
   */
  public static extractFlags(model:{tokens: Array<string>, instruction: AtlasInstruction}): Array<ProvidedFlag> {
    let instructionFlags: Array<ProvidedFlag> = [];
    let index: number = 0;
    
    while(index < model.tokens.length){
      let currentToken = model.tokens[index]
      if(AtlasSyntaxAnalyser.hasFlagTokenFormat(currentToken)){        
        model.tokens.splice(index,1)
        let flagNameWithoutArgument = AtlasSyntaxAnalyser.getFlagNameWithoutArgument(currentToken);
        let flagProperties = AtlasSyntaxAnalyser.getAvailableFlagByName(flagNameWithoutArgument, model.instruction)
        let providedFlag: ProvidedFlag = {
          flagName: AtlasSyntaxAnalyser.getFlagNameFromAlias(flagNameWithoutArgument, model.instruction),
          flagNameIsValid: false,
          value: '',
          valueFormatIsValid: false,
          formatedValue: '',
          line: 0,
          collumn: 0,
        }
        
        if(flagProperties !== null){
          // Get provided value(if expected) and check syntax
          let providedValue: string = '';
          if(AtlasSyntaxAnalyser.hasEmbeddedArgumentFlagFormat(currentToken)){
            if(AtlasSyntaxAnalyser.areFlagExpectingArgument(flagProperties)){
              providedValue = AtlasSyntaxAnalyser.getFlagEmbeddedArgument(currentToken)
            }else{
              AtlasAlertEmitter.flagDidnotExpectProvidedArgument(providedFlag)
            }
          }
          providedFlag.value = providedValue;
          AtlasSyntaxAnalyser.checkProvidedFlagSintaxAtendance({providedFlag: providedFlag, flagProperties: flagProperties})
        }

        instructionFlags.push(providedFlag)
      }else{
        index++;
      }
    }

    return instructionFlags;
  }

  /** Identify if token is a flag token with embeded argument format
   * 
   * @param providedToken 
   * @returns 
   */
  private static hasEmbeddedArgumentFlagFormat(providedToken:string): boolean{
    if(providedToken.indexOf('=') === -1){
      return false
    }else{
      return true;
    }
  }

  private static getFlagNameWithoutArgument(providedFlag:string): string{
    const equalSignIndex = providedFlag.indexOf('=');
    if(equalSignIndex === -1){
      return providedFlag;  
    }else if(equalSignIndex > 0){
      return providedFlag.substring(0, equalSignIndex);    
    }else{
      return ''
    }
  }

  private static getFlagEmbeddedArgument(providedFlag:string): string{
    const argumentBeginIndex = providedFlag.search('=') + 1;
    if(argumentBeginIndex > 0){
      return providedFlag.substring(argumentBeginIndex);    
    }

    return ''
  }

  private static areFlagExpectingArgument(flag:AtlasAvailableFlag): boolean{
    if(flag.expectedType === 'none'){
      return false
    }else{
      return true;
    }
  }

  private static checkProvidedFlagSintaxAtendance(model: {providedFlag:ProvidedFlag, flagProperties: AtlasAvailableFlag}): ProvidedFlag{
    model.providedFlag.flagNameIsValid = false;
    model.providedFlag.valueFormatIsValid = false;

    if(model.flagProperties === null){
      return model.providedFlag
    }else{
      if(model.flagProperties.name === model.providedFlag.flagName
      || model.flagProperties.alias === model.providedFlag.flagName){
        model.providedFlag.flagNameIsValid = true
        if(AtlasSyntaxAnalyser.checkTypeValidation(model.flagProperties.expectedType, model.providedFlag.value)){
          model.providedFlag.valueFormatIsValid = true
          model.providedFlag.formatedValue = AtlasSyntaxAnalyser.convertToType(model.providedFlag.value, model.flagProperties.expectedType)
        }
      }
    }

    return model.providedFlag
  }

  private static checkProvidedArgumentSintaxAtendance(model: {providedArgument:ProvidedArgument, instruction: AtlasInstruction}): ProvidedArgument{
    model.providedArgument.valueFormatIsValid = false;
        
    if(model.instruction === null){
      return model.providedArgument
    }else{
      model.instruction.parameters.forEach( parameter => {
        if(AtlasSyntaxAnalyser.checkTypeValidation(parameter.expectedType, model.providedArgument.value)){
          model.providedArgument.valueFormatIsValid = true
          model.providedArgument.formatedValue = AtlasSyntaxAnalyser.convertToType(model.providedArgument.value, parameter.expectedType)
        }
      })
    }

    return model.providedArgument
  }

  private static checkTypeValidation(typeExpected: string, receivedValue: string): boolean{
    switch(typeExpected){
      case 'none':
        if(receivedValue === '') 
          return true      
        break;      
      case 'string':        
        return true      
      case 'number[]':        
      case 'float[]':        
      case 'int[]':        
      case 'string[]':        
        return AtlasUtils.isStringArray(receivedValue)      
      case 'char':
        return AtlasUtils.isChar(receivedValue)                
      case 'number':        
        return AtlasUtils.isNumber(receivedValue)
      case 'int':        
        return AtlasUtils.isInt(receivedValue)
      case 'float':        
        return AtlasUtils.isFloat(receivedValue) || AtlasUtils.isInt(receivedValue)
    } 
    return false
  }

  private static convertToType(value: string, type: string): any{
    switch(type){
      case 'none':
      case '':
        return null
      case 'string[]':        
        return AtlasLexicalAnalyser.decodeAtlasArray(value)      
      case 'string':        
        return value      
      case 'char':                
        return value[0]      
      case 'number':        
        return Number(value)
      case 'int':        
        return parseInt(value)
      case 'float':        
        return parseFloat(value)     
    } 
    return null
  }

  public static getTypeFromValue(value: string): string{
    if(value === '')
      return 'none'
    else if(AtlasUtils.isFloat(value))
      return 'float'
    else if(AtlasUtils.isInt(value))
      return 'int'        
    else if(value.length === 1)
      return 'char'          
    else if(AtlasUtils.isStringArray(value))
      return 'string[]'          
    else
      return 'string'
  }


  /** Identify if provided token has flag format
   * 
   * @param token 
   * @returns True if token has flag format and false if it has not
   */
  private static hasFlagTokenFormat(token: string): boolean{
    if(token[0] == '-'){
      if(isNaN(Number(token)))
        return true
    }
    
    return false
  }

  /**
   * 
   * @param passedFlagName 
   * @param instruction 
   * @returns 
   */
  private static getFlagNameFromAlias(passedFlagName:string, instruction: AtlasInstruction): string{
    const foundFlag = instruction.availableFlags.find( availableFlag => 
      availableFlag.name === passedFlagName || (availableFlag.alias === passedFlagName && availableFlag.alias !== '')
    )
    
    if(foundFlag !== undefined)
      return foundFlag.name
    else
      return passedFlagName
  }

  /**
   * 
   * @param flagName 
   * @param instruction 
   * @returns 
   */
  private static getAvailableFlagByName(flagName:string, instruction: AtlasInstruction): AtlasAvailableFlag | null{
    const foundFlag = instruction.availableFlags.find( availableFlag => 
      availableFlag.name === flagName || (availableFlag.alias === flagName && availableFlag.alias !== '')
    )

    return foundFlag || null
  }

  private static doesFlagExpectValue(flagName:string){

  }
  
  public static extractStringSingleFlags(tokens: Array<string>){
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

  /** From an specified AtlasInstruction, calculate the arguments count
   * 
   * @param atlasInstruction 
   * @returns Instruction arguments count
   */
  public static getCountOfArguments(atlasInstruction: AtlasInstruction): number{
    let argumentsCount = 0

    atlasInstruction.parameters.forEach( (parameter) => {
      argumentsCount++;
    });

    return argumentsCount
  }
  
  /** From an specified AtlasInstruction, calculate the mandatory-arguments count
   * 
   * @param atlasInstruction 
   * @returns Instruction mandatory-arguments count
   */
  public static getCountOfMandatoryArguments(atlasInstruction: AtlasInstruction): number{
    let mandatoryArgumentsCount = 0

    atlasInstruction.parameters.forEach( (parameter) => {
      if(parameter.mandatory)
        mandatoryArgumentsCount++;
    });

    return mandatoryArgumentsCount
  }

  public static isATLASscript(scriptCandidate: string){
    const firstToken = AtlasLexicalAnalyser.tokenize(AtlasLexicalAnalyser.extractLines(scriptCandidate)[0])[0];
    if(firstToken === 'ATLAS'){
      return true;
    }else{
      return false;
    } 
  }
}
