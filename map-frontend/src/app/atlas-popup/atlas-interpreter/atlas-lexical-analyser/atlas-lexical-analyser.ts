
import { ArrayType } from "@angular/compiler";
import { ATLAS_INSTRUCTIONS_LABELS, AtlasInstructionKey, AtlasInstructionLabel } from "../atlas-instructions";
import { _isNumberValue } from "@angular/cdk/coercion";
import { AtlasUtils } from "../../atlas-utils/utils";

export class AtlasLexicalAnalyser{

    /** Receives the instruction's name passed by the user(which can be one of the aliases), analise and return
     * the Atlas instruction itself  
     * If the instructionAlias does not correpond to any command, INVALID_INSTRUCTION is returned
     * The method is not case-sensitivy
     */
    public static decodeInstruction(calledInstructionName: string): AtlasInstructionLabel{                
      calledInstructionName = calledInstructionName.toUpperCase()
          
      for(const stringInstructionKey in ATLAS_INSTRUCTIONS_LABELS){
          let instructionKey = stringInstructionKey as AtlasInstructionKey
          let instruction:AtlasInstructionLabel = ATLAS_INSTRUCTIONS_LABELS[instructionKey]  

          if(stringInstructionKey === calledInstructionName){
            return instruction
          }else{
            const aliasesList = ATLAS_INSTRUCTIONS_LABELS[instructionKey].aliases
            if(aliasesList.length > 0){ 
              if(aliasesList.includes(calledInstructionName as never))                                
                return instruction         
            }          
          } 
      }
              
      return ATLAS_INSTRUCTIONS_LABELS.INVALID_INSTRUCTION
    }

    public static extractLines(script: string, quoteChar = "'"): Array<string> {
        const lines: Array<string> = [];
        let currentLine = '';
        let inQuotes = false;
    
        script = AtlasLexicalAnalyser.removeRawBlankLines(script);
        script = AtlasLexicalAnalyser.removeNbsp(script);
        script = AtlasLexicalAnalyser.removeParagraphs(script);
        script = AtlasLexicalAnalyser.removeNewlineCharacters(script);
        script = AtlasLexicalAnalyser.replaceAngleBrackets(script);
        script = AtlasLexicalAnalyser.replaceExternalAngleBrackets(script);
    
        for (let i = 0; i < script.length; i++) {
          const char = script[i];
          if (char === quoteChar) {
            currentLine += char;
            inQuotes = !inQuotes;
          } else if ((char === ';') && !inQuotes) {
            if (currentLine.length > 0) {
              // currentLine = AtlasLexicalAnalyser.replaceDoubleQuotes(currentLine);
              lines.push(currentLine);
              currentLine = '';
            }
          } else if(char !== quoteChar){
            currentLine += char;
          }
        }
      
        if (currentLine.length > 0) {
          // currentLine = AtlasLexicalAnalyser.replaceDoubleQuotes(currentLine);
          lines.push(currentLine);
        }
    
        return lines;
      }    

    /** Receive a source code line and indetify the index of the comment section. Returns -1 if there is not comments
     * 
     * @param line: A line(string) of the raw source code 
     * @returns The index of the init of the commented part of the line. Return -1 if thre is no comment
     */
    private static findCommentInitIndex(line: string): number{    
        let isQuoted: boolean = false;
        for(let charIndex = 0; charIndex < line.length - 1 ; charIndex++){
            if(line[charIndex] === "'")
                isQuoted = !isQuoted

            if(!isQuoted){
                if(line[charIndex] === '#' && line[charIndex + 1] === '#'){
                    return charIndex;
                }            
            }
        }; 

        return -1;
    } 

    public static removeBlankLines(lines: Array<string>): Array<string>{      
        // lines.forEach( (line, index) => {
        //     if(line === '')
        //         lines.splice(index, 1)
        // })
        for( let i = 0 ; i < lines.length ; i++){
          if(lines[i] === ''){
            lines.splice(i, 1)
            i--;
          }
        }

        return lines
    }

    /** Receives an Atlas source code splited in lines, and revome all the comments section and blank lines
     * 
     * @param lines: Original Alas source code lines
     * @returns Source code lines without comment parts and without blank lines
     */
    public static clearComments(lines: Array<string>): Array<string>{        
        lines.forEach( (line, index) => {            
            let commentInitIndex = AtlasLexicalAnalyser.findCommentInitIndex(line);            
            if(commentInitIndex !== -1){
                lines[index] = lines[index].slice(0,commentInitIndex)
            }
        })

        lines = AtlasLexicalAnalyser.removeBlankLines(lines)

        return lines
    }

    /** 
     * 
     * @param line_command 
     * @param quoteChar 
     * @returns 
     */
    public static tokenize(line_command: string, quoteChar = "'"): Array<string>{
        const tokens: Array<string> = [];
        let currentWord = '';        
        let inQuotes = false;        
    
        for (let i = 0; i < line_command.length; i++) {
          const nextChar = line_command[i];
          if (nextChar === quoteChar) {
            inQuotes = !inQuotes;
          } else if ((nextChar === ' ' || nextChar === '\t') && !inQuotes) {
            if (currentWord.length > 0) {
              tokens.push(currentWord);
              currentWord = '';
            }
          } else if(nextChar !== quoteChar){
            currentWord += nextChar;
          }
        }
      
        if (currentWord.length > 0) {
          tokens.push(currentWord);
        }
      
        return tokens;
    }

    public static groupAtlasArrays(tokens: string[]): string[]{
      let processedTokens: string[] = []
      let atlasArray: string[] = []
      let insideArray: boolean = false

      tokens.forEach(token => {
        if(insideArray){
          if(token === ']'){
            insideArray = false
            processedTokens.push( AtlasLexicalAnalyser.encodeAtlasArray(atlasArray) )
            atlasArray = []
          }else{
            atlasArray.push(token)
          }
        }else{
          if(token === '['){
            insideArray = true
            atlasArray = []
          }else{
            processedTokens.push(token)
          }
        }
      })

      return processedTokens
    }
      
    private static removeParagraphs(script: string): string {
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '<p>', '');
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '</p>', '');
        return script;
    }

    private static removeRawBlankLines(script: string): string{
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '<p>&nbsp;</p>', ';');
        return script;
    }

    private static removeNbsp(script: string): string {
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '&nbsp;', '');
        return script;
    }

    private static removeNewlineCharacters(script: string): string {
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '\n', '');
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '\r', '');
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '<br />', '');
        return script;
    }

    private static replaceAngleBrackets(script: string): string {
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '&lt;', '<', true);
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '&gt;', '>', true);
        return script;
    }

    private static replaceExternalAngleBrackets(script: string): string {
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '&lt;', '<');
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '&gt;', '>');
        return script;
    }

    private static replaceDoubleQuotes(script: string): string {
        script = AtlasLexicalAnalyser.replaceSubstringsNotQuotateds(script, '"', "'", true);
        return script;
    }

    /** Receive a string and return it, removing all the instances of a substring by some string
     * 
     * @param string: The original string 
     * @param oldSubStr Substring wich instances will be replaced
     * @param newSubStr Substitute substring
     * @param invertQuotesBehavior True if only comments should be affected, false if the comments should not be affected
     * @returns 
     */
    private static replaceSubstringsNotQuotateds(string: string, oldSubStr: string, newSubStr:string, invertQuotesBehavior = false): string{
        let newString = '';
        let inQuotes = false;
        for (let i = 0; i < string.length; i++) {
        if (string[i] === '"') {
            inQuotes = !inQuotes;
        }
        if (string.substring(i, i+oldSubStr.length) === oldSubStr && AtlasUtils.xor(!inQuotes,invertQuotesBehavior)) {
            newString += newSubStr;
            i += oldSubStr.length - 1;
            continue;
        }
        newString += string[i];
        }
        return newString;
    }

    public static encodeAtlasArray(members:Array<string>): string{
      let encodedArray: string = ''

      members.forEach( member => {
        encodedArray += '#A#T#L#A#S#A#R#R#A#Y#' + member;
      })
      encodedArray += '#A#T#L#A#S#A#R#R#A#Y#';

      return encodedArray
    }

    public static decodeAtlasArray(atlasArray:string): Array<string>{
      let decodedArray = atlasArray.split('#A#T#L#A#S#A#R#R#A#Y#')
      let filteredArray = decodedArray.filter((element) => element.trim() !== "")
      // filteredArray.splice(filteredArray.length - 1)
      // filteredArray.splice(0, 1)
      
      return filteredArray
    }
}
