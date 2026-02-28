import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { countries } from 'country-flag-icons'

export interface LanguageOption {
  code: string;
  flag: string;
  name: string;
}


@Component({
  selector: 'app-language-chooser',
  templateUrl: './language-chooser.component.html',
  styleUrls: ['./language-chooser.component.css']
})

export class LanguageChooserComponent {
  protected languageList: LanguageOption[] = [
    {code:"pt-br", flag:"🇧🇷", name:"Português"},
    {code:"us", flag:"🇺🇸", name:"English"},
    {code:"es", flag:"🇪🇦", name:"Español"},
    {code:"de", flag:"🇩🇪", name:"Deutsch"},
    {code:"kr", flag:"🇰🇷", name:"한글"}
  ];
  protected currentLanguage: LanguageOption = {code:"pt-br", flag:"🇧🇷", name:"Português"};
  protected isHovering = false;

  onMouseEntering(){
    this.isHovering = true;
  }
  
  onMouseLeaving(){
    this.isHovering = false;
  }

  getBrowserLanguage(){
  }

  setLanguage(language: LanguageOption){
    this.currentLanguage = language
  }

}