import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { countries } from 'country-flag-icons'

@Component({
  selector: 'app-language-chooser',
  templateUrl: './language-chooser.component.html',
  styleUrls: ['./language-chooser.component.css']
})

export class LanguageChooserComponent {
  protected languageList: LanguageOption[] = [
    {code:"pt-BR", flag:"🇧🇷", name:"Português"},
    {code:"en-US", flag:"🇺🇸", name:"English"},
    {code:"es", flag:"🇪🇦", name:"Español"},
    {code:"de", flag:"🇩🇪", name:"Deutsch"},
    {code:"kr", flag:"🇰🇷", name:"한국어"}
  ];
  
  protected readonly defaultLanguage: LanguageOption = this.languageList[0];
  protected currentLanguage: LanguageOption;
  protected isHovering = false;

  @Output() languageChanged: EventEmitter<LanguageOption> = new EventEmitter<LanguageOption>();
  @Input() languageOptionsList: Array<string>

  ngOnInit(){
    console.log(this.languageOptionsList)
    this.currentLanguage = this.defaultLanguage
  }
  
  onMouseEntering(){
    console.log(this.languageOptionsList)
    this.isHovering = true;
  }
  
  onMouseLeaving(){
    this.isHovering = false;
  }

  getBrowserLanguage(){
  }

  setLanguage(language: LanguageOption){
    this.currentLanguage = language
    this.languageChanged.emit(language)
  }

  isCurrentLanguage(language:LanguageOption){
    if(language.code == this.currentLanguage.code)
      return true
    else
      return false
  }
}