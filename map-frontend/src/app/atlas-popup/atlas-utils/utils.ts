

export class AtlasUtils{
    public static xor(a: boolean, b: boolean):boolean{
        return (a && !b) || (!a && b);
    }       

    public static isNumber(value: string): boolean{
        if(isNaN(Number(value)) || value === '')
            return false
        else    
            return true
    }

    public static isFloat(value: string): boolean{
        if(this.isNumber(value))
            if(!isNaN(parseFloat(value)))
                return true
        
        return false
    }

    public static isInt(value: string): boolean{
        if(this.isNumber(value))
            if(!isNaN(parseInt(value)))
                return true
        
        return false
    }

    public static isChar(value: string): boolean{
        if(value.length === 1)
            return true        
        return false
    }

    public static isStringArray(value: string): boolean{
        if(value.search("#A#T#L#A#S#A#R#R#A#Y#") !== -1)    
            return true        
        return false
    }
}
