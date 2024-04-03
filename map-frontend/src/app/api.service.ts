import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiService {
  constructor(private http: HttpClient) {}

  getMenus() {
    return this.http.get('/menu/');
  }

  getTags() {
    return this.http.get('/tag/');
  }

  getLocations() {
    return this.http.get('/location/');
  }

  getTagRelationships() {
    return this.http.get('/tagrelationship/');
  }

  getSettings() {
    return this.http.get('/settings/');
  }

  getLinks() {
    return this.http.get('/link/');
  }

  getLinkGroups() {
    return this.http.get('/linksgroup/');
  }

  getTag(id: number) {
    return this.http.get(`/tag/${id}/`);
  }

  getLocation(id: number) {
    return this.http.get(`/location/${id}/`);
  }
}
