
export class AtlasButtonBuilder{
    static readonly locationButtonLabel: string = 'opp-location-'
    static readonly tagButtonlabel: string = 'opp-tag-'

    /** Get an HTML configured button for be used to open the Atlas popup for some specific location
     * 
     * @param location 
     * @returns 
     */
    public static  getOverlayedPopupButtonForLocation(location: Location): string {
        return `<button class='opp-open-button opp-open-button-for-location' id='${AtlasButtonBuilder.locationButtonLabel}${location.id}'>Expandir</button>`;
    }

    /** Get an HTML configured button for be used to open the Atlas popup for some specific tag
     * 
     * @param tag 
     * @returns 
     */
    public static getOverlayedPopupButtonForTag(tag: Tag): string {
        const bg_color = tag.color;
        const opp_btn_style = `style='border-color: ${bg_color.toString()}'`;
        
        return `<button ${opp_btn_style} class='opp-open-button opp-open-button-for-tag' id='opp-tag-${tag.id}'>+</button>`;
    }
    
    /** Decode AtlasBuilder button ID to identify the number of the source location 
     * 
     * @param buttonId 
     * @returns The source location ID
     */
    public static  getLocationIdByButtonHtmlId(buttonId: string): number{
        return parseInt( buttonId.replace(AtlasButtonBuilder.locationButtonLabel, '') );
    }
    
    /** Decode AtlasBuilder button ID to identify the number of the source tag 
     * 
     * @param buttonId 
     * @returns The source tag ID
     */
    public static  getTagIdByButtonHtmlId(buttonId: string): number{
        return parseInt( buttonId.replace('opp-tag-', '') );
    }
}