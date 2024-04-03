import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.css']
})
export class TagDetailComponent implements OnInit, OnDestroy {
  private idSubscriber: any;
  private error: any;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.idSubscriber = this.route.params.subscribe((params) => {
      const tagId = +params['id']; // (+) converts string 'id' to a number
      this.fetchData(tagId);
    });
  }

  ngOnDestroy() {
    this.idSubscriber.unsubscribe();
  }

  private fetchData(id: number) {
    this.api.getTag(id).subscribe(
      (tag: any) => this.updateData(tag),
      (error: any) => (this.error = error)
    );
  }

  private updateData(tag: Tag) {
    const title = document.getElementById('title');
    if (title) {
      title.innerHTML = tag.name;
    }
    const description = document.getElementById('description');
    if (description) {
      description.innerHTML = tag.overlayed_popup_content;
    }
  }
}
