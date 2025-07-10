import { AtlasInstruction, AtlasInstructionParameter, InstructionCallingPack, ProvidedArgument, ProvidedFlag, getInstructionNameByInstruction } from "../atlas-instructions";
import { AtlasSyntaxAnalyser } from "../atlas-syntax-analyser/atlas-syntax-analyser";


export class AtlasAlertEmitter{
    public static readonly boldFont:string = "font-weight: bold";
    public static readonly normalFont:string = "font-weight: normal";
    public static readonly warningFont:string = "background-color: yellow;";
    public static readonly errorFont:string = "background-color: red;";

    private static warningMessageHeader(row: number = -1, collum: number = -1){
        if(row === -1  &&  collum === -1){
            return `%cAtlas warning%c`
        }else if(collum === -1){
            return `%cAtlas warning l${row}%c`
        }else{
            return `%cAtlas warning l${row},c${collum}%c`
        }
    }

    private static errorMessageHeader(row: number, collum: number = -1){
        if(collum === -1)
            return `%cAtlas error l${row}%c`
        else
            return `%cAtlas error l${row},c${collum}%c`
    }

    public static warningMessage(message:string, row:number = -1, collum: number = -1){
        const messageHeader = AtlasAlertEmitter.warningMessageHeader(row, collum)

        console.log(`${messageHeader} ${message}`, AtlasAlertEmitter.warningFont, AtlasAlertEmitter.normalFont)
    }

    public static errorMessage(row:number, collum: number, message:string){

    }

    public static wrongArgumentTypeMessage(providedArg: ProvidedArgument, expectedParam: AtlasInstructionParameter, instruction: AtlasInstruction){
        const instructionName = getInstructionNameByInstruction(instruction)
        const providedType = AtlasSyntaxAnalyser.getTypeFromValue(providedArg.value)
        const messageHeader = AtlasAlertEmitter.errorMessageHeader(providedArg.line, providedArg.collumn)


        // console.log(`%cAtlas error%c: Parameter %c${expectedParam.name}%c of instruction %c${instructionName}%c 
        console.log(`${messageHeader}: Parameter %c${expectedParam.name}%c of instruction %c${instructionName}%c 
        expected a %c${expectedParam.expectedType}%c value but received a %c${providedType}%c value`
        , AtlasAlertEmitter.errorFont, AtlasAlertEmitter.normalFont
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont)
    }

    public static wrongCountOfProvidedArguments(inctructionPack: InstructionCallingPack){
        const instructionName = inctructionPack.instructionNameAliasUsed
        const lastArgumentProvided = inctructionPack.providedArguments[inctructionPack.providedArguments.length - 1]
        const messageHeader = AtlasAlertEmitter.errorMessageHeader(lastArgumentProvided.collumn, 0);
        
        const minArgCount = AtlasSyntaxAnalyser.getCountOfMandatoryArguments(inctructionPack.atlasInstruction);
        const maxArgCount = AtlasSyntaxAnalyser.getCountOfArguments(inctructionPack.atlasInstruction);

        const providedCount = inctructionPack.providedArguments.length;

        if(minArgCount === maxArgCount){
            const rightArgumentCount = minArgCount
            console.log(
                `${messageHeader}: ${instructionName} expected %c${rightArgumentCount}%c, but got %c${providedCount}%c`
                , AtlasAlertEmitter.errorFont, AtlasAlertEmitter.normalFont
                , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
                , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
            )
        }else{
            console.log(
                `${messageHeader}: ${instructionName} expected between %c${minArgCount}%c and %c${maxArgCount}%c arguments, but got %c${providedCount}%c`
                , AtlasAlertEmitter.errorFont, AtlasAlertEmitter.normalFont
                , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
                , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
                , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont
            )
        }

        // Correct Usage
        AtlasAlertEmitter.correctInstructionUsage(inctructionPack.atlasInstruction)
    }   

    public static correctInstructionUsage(instruction: AtlasInstruction){
        console.log(`\t\tUsage: ${AtlasAlertEmitter.getInstructionUsageString(instruction)} `)
    }

    public static getInstructionUsageString(instruction: AtlasInstruction): string{
        let parameters: string = getInstructionNameByInstruction(instruction);
        
        instruction.parameters.forEach(parameter =>{
            parameters += ' '
            if(parameter.mandatory){
                parameters += parameter.name
            }else{
                parameters += '[' + parameter.name + ']'
            }
        })

        return parameters
    }

    public static unknownAtlasInstruction(dataPassed:InstructionCallingPack){
        console.log(`${AtlasAlertEmitter.errorMessageHeader(dataPassed.codeLine)}: Instruction %c${dataPassed.instructionNameAliasUsed}%c does not exist.`
        , AtlasAlertEmitter.errorFont, AtlasAlertEmitter.normalFont        
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont        
        )        
    }

    public static unknownFlag(providedFlag:ProvidedFlag, instruction: AtlasInstruction){
        const instructionName = getInstructionNameByInstruction(instruction);
        // console.log(`${AtlasAlertEmitter.warningMessageHeader}: Flag ${providedFlag.flagName} does not exist in ${instructionName}. Did you mean ${'blabla'}`
        console.log(`${AtlasAlertEmitter.warningMessageHeader(providedFlag.line,providedFlag.collumn)}: Flag %c${providedFlag.flagName}%c does not exist in %c${instructionName}%c.`
        , AtlasAlertEmitter.warningFont, AtlasAlertEmitter.normalFont        
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont        
        , AtlasAlertEmitter.boldFont, AtlasAlertEmitter.normalFont        
        )        
    }

    public static invalidNodeAlert(invalidNodeName: string, row: number = -1, collum: number = -1){
        const msg  = `Node ${invalidNodeName} not found in topology`;
        AtlasAlertEmitter.warningMessage(msg, row, collum)
    }
    
    public static flagDidnotExpectProvidedArgument(providedFlag:ProvidedFlag){
        const msg  = `Flag ${providedFlag.flagName} did not expect an argument (argument provided will be ignored)`;
        AtlasAlertEmitter.warningMessage(msg, providedFlag.line, providedFlag.collumn)
    }
    
}