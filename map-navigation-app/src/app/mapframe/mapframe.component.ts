import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Sources } from 'sources';

@Component({
  selector: 'app-mapframe',
  templateUrl: './mapframe.component.html',
  styleUrls: ['./mapframe.component.css']
})

export class MapframeComponent implements OnInit, OnDestroy {
  private mapsURLS = Sources

  private loaderTimeOut: number = 2000

  private idSubscriber: any;

  public mapSource: SafeResourceUrl;

  public isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute, 
    private sanitizer: DomSanitizer,
    private zone: NgZone
  ) {
      const rawUrl = '/'; 
      this.mapSource = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  ngOnInit() {
    this.setupLoading();
    this.idSubscriber = this.route.params.subscribe((params) => {
      const mapId = +params['id'] - 1; // (+) converts string 'id' to a number
      this.updateMapSource(mapId);
    });
  }

  ngOnDestroy() {
    this.idSubscriber.unsubscribe();
  }

  private setupLoading() {
    const boundStopLoading = this.stopLoading.bind(this);
    window.addEventListener('load', boundStopLoading);
    setTimeout(boundStopLoading, this.loaderTimeOut);
  }
  
  private stopLoading() {
    this.zone.run(() => {
      this.isLoading = false
    })
  }

  private updateMapSource(id: number) {
    this.mapSource = this.sanitizer.bypassSecurityTrustResourceUrl(this.mapsURLS[id]);
  }
}
