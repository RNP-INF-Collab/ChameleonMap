import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sources } from 'sources';

@Component({
  selector: 'app-mapframe',
  templateUrl: './mapframe.component.html',
  styleUrls: ['./mapframe.component.css']
})

export class MapframeComponent implements OnInit, OnDestroy {
  /* Change the Maps URL here */
  private mapsURLS = Sources

  /* Loader timeout in miliseconds */
  private loaderTimeOut: number = 3500

  private idSubscriber: any;

  public isLoading: boolean = false;

  constructor(private route: ActivatedRoute) {}

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
    console.log("setup loader")
    this.hideMapFrame();
    window.addEventListener('load', this.stopLoading);
    setTimeout(this.stopLoading, this.loaderTimeOut)
  }
  
  private stopLoading() {
    console.log("called")

    // Hide loader
    let loader = document.getElementById("loader")
    if (loader) {
      console.log("Hiding loader")
      loader.hidden = true
    } else {
      console.log("Loader not found")
    }

    // Show map
    let mapFrame = document.getElementById("mapframe")
    if (mapFrame) {
      console.log("Showing map frame")
      mapFrame.hidden = false
    }
  }

  private hideMapFrame() {
    let mapFrame = document.getElementById("mapframe")
    if (mapFrame) {
      console.log("Hiding map frame")
      mapFrame.hidden = true
    }
  }

  private updateMapSource(id: number) {
    let mapFrame = document.getElementById("mapframe")
    if (this.mapsURLS[id] && mapFrame) {
      mapFrame.setAttribute("src", this.mapsURLS[id])
    } else {
      console.log("iFrame not found")
    }
  }
}
