import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { LocationDetailComponent } from './location-detail/location-detail.component';
import { TagDetailComponent } from './tag-detail/tag-detail.component';

const routes: Routes = [
  { path: '', component: MapComponent, pathMatch: 'full' },
  { path: 'location/detail/:id', component: LocationDetailComponent },
  { path: 'tag/detail/:id', component: TagDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
