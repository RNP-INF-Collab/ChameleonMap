import { TagContentType } from '@angular/compiler';
import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  AfterViewChecked,
  EventEmitter,
  ViewChild,
  HostListener
} from '@angular/core';

import * as L from 'leaflet';
import 'leaflet-responsive-popup';
import '@elfalem/leaflet-curve';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';
import { ApiService } from '../api.service';
import { OverlayedPopupComponent } from '../overlayed-popup/overlayed-popup.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewChecked, OnInit {
  @ViewChild(OverlayedPopupComponent) overlayedPopup: OverlayedPopupComponent;

  private _locations: Array<Location>;
  private _menus: Array<Menu>;
  private _tags: Array<Tag>;
  private _tagRelationships: Array<TagRelationship>;
  private _mapSettings: any;
  private _links: Array<Link>;
  private _linksGroup: Array<LinksGroup>;
  public mapSetting: any;
  private map: L.Map;
  private locationHeaderSize = 0;
  private mapLoaded = false;
  private mapInitialized = false;
  private markerClusterGroup: L.MarkerClusterGroup;
  public currentMenu = 1;
  private error: any;
  public selectedTagMenu: number;
  public defaultMenuId: number;

  @HostListener('document:click', ['$event']) 
  clickout(event:any){ 
    if(event.target.classList.contains("opp-open-button")){
      this.overlayedPopup.activate(event.target);
    }
  }

  get locations() {
    return this._locations;
  }
  set locations(value) {
    this._locations = value;
  }

  get menus() {
    return this._menus;
  }
  set menus(value) {
    this._menus = value;
  }

  get tags() {
    return this._tags;
  }
  set tags(value) {
    this._tags = value;
  }

  get tagRelationships() {
    return this._tagRelationships;
  }
  set tagRelationships(value) {
    this._tagRelationships = value;
  }

  get mapSettings() {
    return this._mapSettings;
  }
  set mapSettings(value) {
    this._mapSettings = value;
    if (value !== undefined) {
      this.mapSetting = this._mapSettings[0];
    }
  }

  get links() {
    return this._links;
  }
  set links(value) {
    this._links = value;
  }

  get linksGroup() {
    return this._linksGroup;
  }
  set linksGroup(value) {
    this._linksGroup = value;
  }

  constructor(private api: ApiService) {}
  
  ngOnInit() {
    this.api.getMenus().subscribe(
      (menus: any) => {
        this.menus = menus;
        this.menus.forEach(menu => {
          menu.expanded = true;
        })
      },
      (error: any) => (this.error = error)
    );
    this.api.getLocations().subscribe(
      (locations: any) => (this.locations = locations),
      (error: any) => (this.error = error)
    );
    this.api.getTags().subscribe(
      (tags: any) => (this.tags = tags),
      (error: any) => (this.error = error)
    );

    this.api.getTagRelationships().subscribe(
      (tagRelationships: any) => (this.tagRelationships = tagRelationships),
      (error: any) => (this.error = error)
    );
    this.api.getSettings().subscribe(
      (mapSettings: any) => (this.mapSettings = mapSettings),
      (error: any) => (this.error = error)
    );
    this.api.getLinks().subscribe(
      (links: any) => (this.links = links),
      (error: any) => (this.error = error)
    );
    this.api.getLinkGroups().subscribe(
      (linksGroup: any) => (this.linksGroup = linksGroup),
      (error: any) => (this.error = error)
    );

  }
  
  ngAfterViewChecked(): void {
    if (!this.mapInitialized && this.mapSetting) this.initializeMapOptions();
    if (!this.mapLoaded && this.mapInitialized) {
      this.initLocations();
      this.insertTagRelations();
      this.markerPreConfigure();
      if (this.mapSetting.link_feature) this.insertLinks();
    }
  }

  private initLocations() {
    if (this._locations) {
      this._locations.forEach((location: Location) => {
        location.onMap = false;
        location.activeColors = [];
        location.locationMarker = {};
        location.popup =
          "<div style='max-height:calc(100vh - 500px); min-height: 180px; overflow:scroll; overflow-x:hidden; margin-top: 20px; margin-right:0px; margin-left: 10px; text-align: justify;'>";
        this.locationHeaderSize = location.popup.length;
      });
    }
  }

  private getOriginAndDestiny(
    location1: Location,
    location2: Location,
    shouldInvertLink: boolean
  ) {
    if (!shouldInvertLink) {
      return [
        new L.LatLng(location1.latitude, location1.longitude),
        new L.LatLng(location2.latitude, location2.longitude)
      ];
    } else {
      return [
        new L.LatLng(location2.latitude, location2.longitude),
        new L.LatLng(location1.latitude, location1.longitude)
      ];
    }
  }

  private insertLinks() {
    this.resetlinks();
    if (this._linksGroup && this._links) {
      this._links.forEach((link: Link) => {
        const loc1 = this.getLocationById(link.location_1);
        const loc2 = this.getLocationById(link.location_2);
        const linkgroup = this.getLinksGroupById(link.links_group);
        if (loc1 && loc2 && linkgroup) {
          linkgroup.visibility = true;
          let pointA;
          let pointB;
          let values;
          values = this.getOriginAndDestiny(loc1, loc2, link.invert_link);
          pointA = values[0];
          pointB = values[1];

          const pointList = [pointA, pointB];
          if (loc1.onMap && loc2.onMap) {
            const latlngs = [];

            const latlng1 = [pointA.lat, pointA.lng],
              latlng2 = [pointB.lat, pointB.lng];

            const offsetX = latlng2[1] - latlng1[1],
              offsetY = latlng2[0] - latlng1[0];

            const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
              theta = Math.atan2(offsetY, offsetX);

            const thetaOffset = 3.14 / 10;

            const r2 = r / 2 / Math.cos(thetaOffset),
              theta2 = theta + thetaOffset;

            const midpointX = (r2 * Math.cos(theta2)) / 1.5 + latlng1[1],
              midpointY = (r2 * Math.sin(theta2)) / 1.5 + latlng1[0];

            const midpointLatLng = [midpointY, midpointX];

            latlngs.push(latlng1, midpointLatLng, latlng2);

            const pathOptions = {
              color: linkgroup.links_color,
              weight: 3, //link.weight;
              opacity: linkgroup.opacity, //link.opacity;
              smoothFactor: 1,
              stroke: true
            };

            link.line = L.curve(
              [
                'M',
                [latlng1[0], latlng1[1]],
                'S',
                [midpointLatLng[0], midpointLatLng[1]],
                [latlng2[0], latlng2[1]]
              ],
              pathOptions
            );
            link.line.bindTooltip(linkgroup.name);
            link.line.addTo(this.map);
          }
        }
      });
    }
  }

  private initializeMapOptions() {
    this.map = L.map('map', {
      center: [
        this.mapSetting.initial_latitude,
        this.mapSetting.initial_longitude
        // -15,
        // -59
      ],
      zoom: this.mapSetting.initial_zoom_level + 3,
      // zoom: this.mapSetting.initial_zoom_level + 5,
      zoomControl: false
    });

    this.map.on('zoom', () => {
      this.markerClusterGroup.refreshClusters();
    });

    this.map.setMaxBounds([
      [-90, -340],
      [90, 310]
    ]);

    L.control
      .zoom({
        position: 'bottomright'
      })
      .addTo(this.map);

    // --- Use in the future for the user to customize a map ---
    let tiles;
    this.mapInitialized = true;

    let maxRadius = 15;
    if (this.mapSetting.cluster_close_tags === false) {
      maxRadius = 0;
    }

    switch (this.mapSetting.map_style) {
      case 'b':
        tiles = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
            minZoom: 3,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        );
        tiles.addTo(this.map);
        break;

      case 'd':
        tiles = L.tileLayer(
          'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
            minZoom: 3,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        );
        tiles.addTo(this.map);
        break;

      default:
        this.mapInitialized = false;
        break;
    }

    this.markerClusterGroup = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        let colors: Array<any> = [];

        cluster.getAllChildMarkers().forEach((marker: any) => {
          colors.push(
            ...[...new Set(marker.options.icon.options.html.match(/#....../g))]
          );
          colors = [...new Set(colors)];
          colors.splice(colors.indexOf('#5c5c5c'), 1);
        });
        const clusterLength = cluster.getChildCount();
        cluster.bindTooltip(clusterLength.toString() + ' locations grouped', {
          offset: L.point(0, 0),
          direction: 'left'
        });
        return getMarkerIcon(colors, clusterLength);
      },
      maxClusterRadius: maxRadius,
      disableClusteringAtZoom: 12,
      showCoverageOnHover: false
    });
    this.addHoverFunction(this.markerClusterGroup);
  }

  private getFirstMenuId() {
    if (!isNaN(this._menus[0].id)) {
      this.defaultMenuId = this._menus[0].id;
    } else {
      this.defaultMenuId = 0;
    }
    this.selectedTagMenu = this.defaultMenuId;
  }

  private markerPreConfigure() {
    if (this._tags) {
      this._tags.forEach((tag: Tag) => {
        if (tag.active) {
          tag.currentColor = tag.color;
          tag.onMap = true;
          tag.dependenciesActive = true;
          tag.visibility = true;
          if (this.mapSetting.inherit_children_tag_locations) {
            this.insertChildrenLocations(tag, tag);
          }
          tag.related_locations.forEach((location_id: number) => {
            const location: Location | null = this.getLocationById(location_id);

            if (location) {
              if (location.active) {
                if (location.popup.length === this.locationHeaderSize) {
                  let overlayedPopupButton = '';

                  if (
                    location.overlayed_popup_content &&
                    location.overlayed_popup_content !== null
                  ) {
                    overlayedPopupButton =
                      this.overlayedPopup.getOverlayedPopupButtonForLocation(
                        location
                      );
                  }

                  location.popup +=
                    '<div style="margin-right: 10px;"><h1 class="popup-title">' +
                    location.name +
                    ' ' +
                    overlayedPopupButton +
                    '</h1><hr>';
                  if (location.description && location.description !== 'nan') {
                    location.popup +=
                      '<div style = "border-top: 1px; margin-top: -5px; margin-bottom: 15px"> <p>' +
                      location.description +
                      '</p> </div> ';
                  }
                }

                this.insertTagOnPopup(tag, location);
              }
            }
          });
        }
      });
      this.getFirstMenuId();
      this.insertMarkersByMenu(this.defaultMenuId);
      if (typeof this.mapSetting.map_name === 'string')
        document.title = this.mapSetting.map_name;
      if (this.menus && this.locations && this.mapSettings)
        this.mapLoaded = true;
    }
    this.markerClusterGroup.refreshClusters();
  }

  private insertChildrenLocations(tag: Tag, iterationTag: Tag) {
    if (iterationTag.child_tags) {
      iterationTag.child_tags.forEach((childRelated: any) => {
        const child = this.getTagById(childRelated.child_tag);
        if (child) {
          if (!this.isIndirectChild(tag, child)) {
            child?.related_locations.forEach((locationId: any) => {
              tag.related_locations.push(locationId);
            });
          } else {
            let cluster_ids: any[] = [];
            const relatedMenus: any[] = [];

            child?.parent_tags.forEach((relation: any) => {
              cluster_ids.push(relation.cluster_id);
              relatedMenus.push(
                this.getTagById(relation.parent_tag)?.parent_menu
              );
            });
            cluster_ids = [...new Set(cluster_ids)];

            if (
              cluster_ids.length === 1 ||
              !relatedMenus.includes(tag.parent_menu)
            ) {
              child?.related_locations.forEach((locationId: any) => {
                tag.related_locations.push(locationId);
              });
            }
          }
        }

        // Using recursion to insert indirect children locations
        child?.child_tags.forEach((childRelated: any) => {
          const itTag = this.getTagById(childRelated.parent_tag);
          if (itTag) {
            this.insertChildrenLocations(tag, itTag);
          }
        });
      });

      tag.related_locations = [...new Set(tag.related_locations)];
    }
  }

  private isIndirectChild(tag: Tag, childTag: Tag) {
    let directFlag = false;
    tag.child_tags.forEach((relation: any) => {
      if (relation.child_tag === childTag.id) {
        directFlag = true;
      }
    });
    if (directFlag) {
      return false;
    }
    const tagMenu = this.getMenuById(tag.parent_menu)?.hierarchy_level;
    const childTagMenu = this.getMenuById(
      childTag.parent_menu
    )?.hierarchy_level;

    if (tagMenu && childTagMenu) {
      if (childTagMenu > tagMenu + 1) {
        return true;
      }
    }

    return false;
  }

  private insertMarkersByMenu(selectedTagsMenuId: number) {
    this.resetMarkers();

    this.selectedTagMenu = selectedTagsMenuId;
    const menuHierarchy = this.getMenuById(selectedTagsMenuId)?.hierarchy_level;
    const otherMenuTags = this._tags.filter((currentTag: Tag) => {
      const currentTagHierarchy = this.getMenuById(
        currentTag.parent_menu
      )?.hierarchy_level;
      if (currentTagHierarchy && menuHierarchy) {
        return currentTagHierarchy == menuHierarchy;
      } else return false;
    });
    const allOtherMenuLocations: any[] = [];
    otherMenuTags.forEach((tag: Tag) => {
      tag.related_locations.forEach((locationId: number) => {
        if (!this.isTagInactive(tag)) {
          if (!allOtherMenuLocations.includes(locationId)) {
            allOtherMenuLocations.push(locationId);
          }
        }
      });
    });

    this._tags.forEach((tag: Tag) => {
      if (
        tag.active &&
        tag.dependenciesActive &&
        tag.visibility &&
        tag.parent_menu === selectedTagsMenuId
      ) {
        tag.related_locations.forEach((location_id: number) => {
          const location: any = this.getLocationById(location_id);

          if (location) {
            if (location.active) {
              const tagMenu = this.getMenuById(tag.parent_menu);
              if (tagMenu) {
                if (tagMenu.hierarchy_level > 1) {
                  if (allOtherMenuLocations.includes(location.id)) {
                    this.insertLocationOnMap(location, tag.currentColor);
                  }
                } else {
                  this.insertLocationOnMap(location, tag.currentColor);
                }
              }
            }
          }
        });
      }
    });
    if (this.mapSetting.link_feature) this.insertLinks();
  }

  private isTagInactive(tag: Tag) {
    return !tag?.active || !tag?.visibility || !tag?.dependenciesActive;
  }

  private checkLinksOnMap(location: Location) {
    for (const link of this._links) {
      if (this.getLinksGroupById(link.links_group)?.visibility) {
        if (link.location_1 == location.id || link.location_2 == location.id) {
          const loc1 = this.getLocationById(link.location_1);
          const loc2 = this.getLocationById(link.location_2);
          if (loc1?.onMap && loc2?.onMap) {
            link.line.addTo(this.map);
          }
        }
      }
    }
  }

  private insertMarkersByTag(tag: Tag) {
    if (tag) {
      if (tag.active) {
        this.onDependenceChange(tag);

        tag.related_locations.forEach((location_id: number) => {
          const location: Location | null = this.getLocationById(location_id);

          if (location) {
            if (location.active) {
              this.insertLocationOnMap(location, tag.currentColor);
              this.checkLinksOnMap(location);
            }
          }
        });
        this.markerClusterGroup.refreshClusters();
      }
    }
  }

  private resetMarkers() {
    this._locations.forEach((location: Location) => {
      if (location.onMap) {
        this.markerClusterGroup.removeLayer(location.locationMarker);
        location.locationMarker = {};
        location.onMap = false;
        location.activeColors = [];
      }
    });
  }

  private insertLocationOnMap(location: Location, color = '') {
    if (!location.onMap) {
      location.onMap = true;
      if (color != '') location.activeColors = [color];

      const pop = L.responsivePopup({ offset: L.point(-3, -11), hasTip: false, closeButton: false }).setContent(location.popup);
      
      location.locationMarker = L.marker(
        [location.latitude, location.longitude],
        { icon: this.generatePinIcon(location.activeColors) }
      )
        .bindPopup(pop)
        .bindTooltip(location.name, {
          offset: L.point(-3, -18),
          direction: 'top'
        });

      this.markerClusterGroup.addLayer(location.locationMarker);
      this.map.addLayer(this.markerClusterGroup); 
    } else {
      location.popup += '</div>';
      location.locationMarker._popup.setContent(location.popup);
      if (color != '') location.activeColors.push(color);
      location.locationMarker.setIcon(
        this.generatePinIcon(location.activeColors)
      );
    }
    this.addHoverFunction(location.locationMarker);
  }

  private addHoverFunction(marker: any) {
    marker.on('mouseover', function (ev: any) {
      ev.target.openTooltip();
      if (ev.target._icon)
        ev.target._icon.lastChild.classList.add('hover-icon');
    });
    marker.on('mouseout', function (ev: any) {
      if (ev.target._icon)
        ev.target._icon.lastChild.classList.remove('hover-icon');
    });
  }

  private insertTagRelations() {
    if (this._tagRelationships) {
      this._tagRelationships.forEach((relation: TagRelationship) => {
        this._tags.forEach((tag: Tag) => {
          if (!tag.child_tags) {
            tag.child_tags = [];
          }
          if (!tag.parent_tags) {
            tag.parent_tags = [];
          }
          if (relation.parent_tag === tag.id) {
            tag.child_tags.push(relation);
          } else if (relation.child_tag === tag.id) {
            tag.parent_tags.push(relation);
          }
        });
      });
    }
  }

  private insertTagOnPopup(tag: Tag, location: Location) {
    let opp_btn = '';
    if (tag.description) {
      if (tag.overlayed_popup_content && tag.overlayed_popup_content != null) {
        opp_btn = this.overlayedPopup.getOverlayedPopupButtonForTag(tag);
      }
      
      location.popup +=
      `
      <div class="tag-popup-${tag.id}">
        <h3 class="popup-subtitle">
          ${tag.name} ${opp_btn}
        </h3>
        <p>${tag.description}</p> 
      </div>
      `;
    }
  }

  private generatePinIcon(colors: any) {
    const size = '24px';
    const border = '0.1px solid #5c5c5c';

    if (colors.length === 1) {
      var markerHtmlStyles = `
      background-color: ${colors[0]};
      width: ${size};
      height: ${size};
      display: block;
      left: -11px;
      top: -21px;
      position: relative;
      border-radius: ${size} ${size} 0;
      transform: rotate(45deg);
      border: ${border};`;
    } else {
      let increaseBorders = 0;
      if (colors.length > 2) {
        increaseBorders = 3 + colors.length; // Used to offset the visibility of the edge colors which was affected by the rotation (CSS pin)
      }
      let currentPercentage = 0;
      if (increaseBorders > 9) {
        increaseBorders = 9;
      } // The more colors a pin has, the more the edges are affected
      const basePercentage = Math.round(100.0 / colors.length);
      let gradient = '50grad';
      colors.forEach((color: string, index: number) => {
        currentPercentage = Math.floor(basePercentage * (index + 1));
        gradient +=
          ', ' +
          color +
          ' ' +
          (currentPercentage - basePercentage) +
          '%, ' +
          color +
          ' ' +
          currentPercentage +
          '%';
      });
      gradient = gradient
        .split(' ' + basePercentage.toString() + '%')
        .join(' ' + (basePercentage + increaseBorders).toString() + '%');
      gradient = gradient
        .split(
          ' ' +
            (basePercentage * colors.length - basePercentage).toString() +
            '%'
        )
        .join(' ' + (100 - basePercentage - increaseBorders).toString() + '%');

      var markerHtmlStyles = `
      background-image: linear-gradient(${gradient});
      width: ${size};
      height: ${size};
      display: block;
      left: -11px;
      top: -21px;
      position: relative;
      border-radius: 100% 100% 0;
      transform: rotate(45deg);
      border: 0.1px solid #5c5c5c`;
    }

    const icon = L.divIcon({
      className: 'custom-pin',
      html: `<span style="${markerHtmlStyles}"><span style="height: 11px; width: 11px; background-color: white; border-radius: 50%; display: flex; margin-left: 20%; margin-top: 20%;"></span></span>`
    });

    return icon;
  }

  private getMaxLocationId() {
    let maxLocationId = 0;

    for (const location of this._locations) {
      if (location.id > maxLocationId) {
        maxLocationId = location.id;
      }
    }
    
    return maxLocationId;
  }

  public getLocationById(location_id: number) {
    for (const location of this._locations) {
      if (location.id === location_id) {
        return location;
      }
    }
    return null;
  }

  private getLinksGroupById(linksGroupid: number) {
    for (const linkgroup of this._linksGroup) {
      if (linkgroup.id === linksGroupid) {
        return linkgroup;
      }
    }
    return null;
  }

  private getMaxTagId() {
    let maxTagId = 0;

    for (const tag of this._tags)
      if (tag.id > maxTagId)
        maxTagId = tag.id;

    return maxTagId;
  }

  public getTagById(tagId: number) {
    for (const tag of this._tags) {
      if (tag.id === tagId) {
        return tag;
      }
    }
    return null;
  }

  private getMenuById(menuId: number) {
    for (const menu of this._menus) {
      if (menu.id === menuId) {
        return menu;
      }
    }
    return null;
  }

  private hideLinksByLinkGroup(lg: LinksGroup) {
    if (lg) {
      lg.visibility = false;
      for (const link of this._links) {
        if (link.links_group == lg.id && link.line != null) {
          link.line.remove(this.map);
        }
      }
    }
  }

  private resetlinks() {
    for (const link of this._links) {
      if (link.line != null) {
        link.line.remove(this.map);
      }
    }
  }

  private insertLinkByLinkGroup(lg: LinksGroup) {
    if (lg) {
      lg.visibility = true;
      for (const link of this._links) {
        if (link.links_group == lg.id) {
          const loc1 = this.getLocationById(link.location_1);
          const loc2 = this.getLocationById(link.location_2);
          if (loc1 && loc2 && loc1.onMap && loc2.onMap) {
            link.line.addTo(this.map);
          }
        }
      }
    }
  }

  private removeMarkerByTag(tag: Tag) {
    if (tag) {
      tag.visibility = false;
      tag.related_locations.forEach((relatedLocationId: number) => {
        const location = this.getLocationById(relatedLocationId);
        if (location) {
          if (
            tag.parent_menu == this.selectedTagMenu &&
            this.locationIsShowingTag(location, tag)
          ) {
            this.removeColorFromLocationMarker(location, tag.color);
          }
        }
      });
      this.onDependenceChange(tag);
      this.markerClusterGroup.refreshClusters();
    }
  }

  private locationIsShowingTag(location: Location, tag: Tag) {
    return location.activeColors.includes(tag.currentColor);
  }

  private removeColorFromLocationMarker(location: Location, color: string) {
    if (location.activeColors.length === 1) {
      this.removeLocationFromMap(location);
    } else {
      location.activeColors.splice(location.activeColors.indexOf(color), 1);
      location.locationMarker.setIcon(
        this.generatePinIcon(location.activeColors)
      );
    }
  }

  private removeLocationFromMap(location: Location) {
    this.markerClusterGroup.removeLayer(location.locationMarker);
    location.onMap = false;
    location.locationMarker = {};

    for (const link of this._links) {
      if (link.location_1 == location.id || link.location_2 == location.id) {
        link.line.remove(this.map);
      }
    }
  }

  private removeTagFromPopups(tag: Tag) {
    tag.related_locations.forEach((location_id: number) => {
      const location = this.getLocationById(location_id);
      if (location && location.locationMarker._popup) {
        location.popup = this.removeTagFromDiv(tag.id, location.popup);
        location.locationMarker.bindPopup(location.popup);
      }
    });
  }

  private removeTagFromDiv(tag_id: number, popup: string) {
    return popup.replace(
      `<div class="tag-popup-${tag_id}">`,
      `<div class="tag-popup-${tag_id}" style="display: none !important;">`
    );
  }

  private putTagBackOnPopup(tag: Tag) {
    tag.related_locations.forEach((location_id: number) => {
      const location = this.getLocationById(location_id);
      if (location && location.locationMarker._popup) {
        location.popup = this.makeTagVisibleOnDiv(tag.id, location.popup);
        location.locationMarker.bindPopup(location.popup);
      }
    });
  }

  private makeTagVisibleOnDiv(tag_id: number, popup: string) {
    return popup.replace(
      `<div class="tag-popup-${tag_id}" style="display: none !important;">`,
      `<div class="tag-popup-${tag_id}">`
    );
  }

  private onDependenceChange(parentTag: Tag) {
    if (parentTag.child_tags) {
      parentTag.child_tags.forEach((tagRelation: any) => {
        const childTag = this.getTagById(tagRelation.child_tag);
        if (childTag) {
          this.checkDependenciesAndPopups(childTag);
        }
      });
    }
  }

  private checkDependenciesAndPopups(tag: Tag) {
    if (this.anyClusterIsActive(tag)) {
      tag.dependenciesActive = true;
      if (tag.visibility) {
        // if the tag has the visibility off, popup must not be changed
        this.putTagBackOnPopup(tag);
      }
    } else {
      tag.dependenciesActive = false;
      this.removeTagFromPopups(tag);
    }
    // triggers function to check on the tag childs recursively
    this.onDependenceChange(tag);
  }

  private anyClusterIsActive(childTag: Tag) {
    let cluster_ids: any[] = [];
    let isAnyClusterActive = true;

    childTag.parent_tags.forEach((relation: any) => {
      cluster_ids.push(relation.cluster_id);
    }); // get all cluster ids in this tag

    cluster_ids = [...new Set(cluster_ids)]; // remove duplicates

    cluster_ids.forEach((cluster: number) => {
      const parentsInThisCluster = childTag.parent_tags.filter(
        (relation: any) => relation.cluster_id === cluster
      );

      // A cluster is considered inactive if *at least one* tag that composes it is inactive.
      // if ANY cluster present on the tag is active, the tag dependencies will be active.
      if (this.parentsInactive(parentsInThisCluster)) {
        isAnyClusterActive = false;
      }
    });

    return isAnyClusterActive;
  }

  private parentsInactive(relations: any) {
    return relations.every((relation: any) => {
      return (
        this.getTagById(relation.parent_tag)?.visibility === false ||
        this.getTagById(relation.parent_tag)?.dependenciesActive === false
      );
    });
  }

  public onMenuCliked(event: any) {
    this.insertMarkersByMenu(event.selectedTagsMenuId);
  }

  public onTagRemoval(event: any) {
    this.removeTagFromPopups(event.selectedTag);
    this.removeMarkerByTag(event.selectedTag);
  }

  public onTagReactivated(event: any) {
    this.insertMarkersByTag(event.tag);
    this.putTagBackOnPopup(event.tag);
  }


  public onLinkRemoval(event: any) {
    this.hideLinksByLinkGroup(event.selectedLG);
  }

  public onLinkReactivated(event: any) {
    this.insertLinkByLinkGroup(event.selectedLG);
  }

  public onButtonClicked(event: any) {
    this.currentMenu = event.clickedMenu;
  }
}

function getMarkerIcon(
  colors: any[],
  locationCount: number
): L.DivIcon | L.Icon<L.IconOptions> {
  let style;
  switch (colors.length) {
    case 1:
      style = `"border-right-color: ${colors[0]}; border-top-color: ${colors[0]}; border-bottom-color: ${colors[0]}; border-left-color: ${colors[0]};"`;
      return L.divIcon({
        html:
          `<span class="clustercolored-icon" style=${style}><b>` +
          locationCount +
          '</b></span>'
      });
    case 2:
      style = `"border-right-color: ${colors[0]}; border-top-color: ${colors[0]}; border-bottom-color: ${colors[1]}; border-left-color: ${colors[1]};"`;
      return L.divIcon({
        html:
          `<span class="clustercolored-icon" style=${style}><b>` +
          locationCount +
          '</b></span>'
      });
    case 3:
      style = `"border-right-color: ${colors[0]}; border-top-color: ${colors[0]}; border-bottom-color: ${colors[1]}; border-left-color: ${colors[2]};"`;
      return L.divIcon({
        html:
          `<span class="clustercolored-icon" style=${style}><b>` +
          locationCount +
          '</b></span>'
      });
    case 4:
      style = `"border-right-color: ${colors[0]}; border-top-color: ${colors[1]}; border-bottom-color: ${colors[2]}; border-left-color: ${colors[3]};"`;
      return L.divIcon({
        html:
          `<span class="clustercolored-icon" style=${style}><b>` +
          locationCount +
          '</b></span>'
      });
    default:
      return L.divIcon({
        html: '<span class="cluster-icon"><b>' + locationCount + '</b></span>'
      });
  }
}