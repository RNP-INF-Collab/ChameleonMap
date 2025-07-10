
export class AtlasExternalDataManager{
    private _locations: Array<Location> = [];
    private _tags: Array<Tag> = [];

    set locations(_location: Array<Location>){
        this._locations = _location
    }

    set tags(_tags: Array<Tag>){
      this._tags = _tags        
    }

    public getTagByName(tagName: string): Tag{
        let tag: Tag = {} as Tag;
        
        for(let i = 0 ; i < this._tags.length ; i++){
          if(this._tags[i].name === tagName){
            tag = this._tags[i];
            break;
          }
        }
        
        return tag;
    }

    public getLocationByName(locationName: string): Location{
        let location: Location = {} as Location;
        
        for(let i = 0 ; i < this._locations.length ; i++){
          if(this._locations[i].name === locationName){
            location = this._locations[i];
            break;
          }
        }
        
        return location;
    }
    

    public getTagById(tagId: number): Tag{
        let tag: Tag = {} as Tag;
        
        for(let i = 0 ; i < this._tags.length ; i++){
          if(this._tags[i].id === tagId){
            tag = this._tags[i];
            break;
          }
        }
        
        return tag;
    }

    public getLocationById(locationId: number): Location{
        let location: Location = {} as Location;
        
        for(let i = 0 ; i < this._locations.length ; i++){
          if(this._locations[i].id === locationId){
            location = this._locations[i];
            break;
          }
        }
        
        return location;
    }
    
  }