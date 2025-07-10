import { AtlasNode } from "../../atlas-structures/AtlasNode";
import { AtlasLink } from "../../atlas-structures/AtlasLink";
import { AtlasSlice } from "../../atlas-structures/AtlasSlice";
import { AtlasDrawerComponent } from "../../atlas-drawer/atlas-drawer.component";
import { AtlasSyntaxAnalyser } from "../atlas-syntax-analyser/atlas-syntax-analyser";

/** Implementation of Atlas instruction:  IMPORT_FROM
 * Version: 2.0
 * @param tokens The tokens of Atlas script line
 * @param atlasDrawer Instance of AtlasDrawer that will be operated by IMPORT_FROM instruction
 */
export function importFromInstruction(tokens: Array<string>, atlasDrawer: AtlasDrawerComponent){  
    let flags: Array<string> = [];
    
    [tokens, flags] = AtlasSyntaxAnalyser.extractStringSingleFlags(tokens);

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
    atlasDrawer.getDataFormHttpServer(importationSource).subscribe(
        (data) => {
        importedData = data.atlas;
        if( importedData !== undefined ){
            const script: string = importedData;
            atlasDrawer.interpreteAtlasScript(script);
        }
        },
        (error) => {
        console.log("Can't import data from " + importationSource);
        }      
    );
}
