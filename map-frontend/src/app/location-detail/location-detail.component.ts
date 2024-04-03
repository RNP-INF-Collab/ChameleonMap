import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.css']
})
export class LocationDetailComponent implements OnInit, OnDestroy {
  private idSubscriber: any;

  private error: any;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.idSubscriber = this.route.params.subscribe((params) => {
      const locationId = +params['id']; // (+) converts string 'id' to a number
      this.fetchData(locationId);
    });
  }

  ngOnDestroy() {
    this.idSubscriber.unsubscribe();
  }

  private fetchData(id: number) {
    this.api.getLocation(id).subscribe(
      (location: any) => this.updateData(location),
      (error: any) => (this.error = error)
    );
  }

  private updateData(location: Location) {
    const title = document.getElementById('title');
    if (title) {
      title.innerHTML = location.name;
    }
    const description = document.getElementById('description');
    if (description) {
      description.innerHTML = location.overlayed_popup_content;
    }
  }
}
