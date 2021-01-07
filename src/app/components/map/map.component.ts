import proj4 from 'proj4';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';

import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import Control from 'ol/control/Control';
import OverlayPositioning from 'ol/OverlayPositioning';

import { SearchComponentEvent } from 'generieke-geo-componenten-search';
import { Dataset, DatasetTreeEvent, Theme } from 'generieke-geo-componenten-dataset-tree';
import { MapComponentEvent, MapService, MapComponentEventTypes } from 'generieke-geo-componenten-map';

import { ISensor } from '../../model/bodies/sensor-body';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Input() searchBarHeight;
  @Input() clearLocationHighLight = true;

  constructor(
    private router: Router,
    private mapService: MapService,
    private httpClient: HttpClient,
  ) {}

  public mapName = 'srn';
  public subscriptions = [];

  public popupOverlay: Overlay;
  public overlayVisible = false;
  public selectedSensor: ISensor;

  public activeWmsDatasets: Dataset[] = [];
  public activeWmtsDatasets: Dataset[] = [];
  public currentMapResolution: number = undefined;

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 ' +
    '+y_0=463000 +ellps=bessel +units=m +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  public myLayers: Theme[];
  public hideTreeDataset = false;

  public iconCollapsed = 'fas fa-chevron-right';
  public iconExpanded = 'fas fa-chevron-left';
  public iconUnchecked = 'far fa-square';
  public iconChecked = 'far fa-check-square';
  public iconInfoUrl = 'fas fa-info-circle';

  public locateMeString = `Locate me`;
  public geoLocationNotSupportedString = `Geolocation is not supported by this browser.`;

  public showOverlay(coordinates) {
    this.overlayVisible = true;
    this.popupOverlay.setPosition(coordinates);
    this.popupOverlay.getElement().classList.remove('hidden');
  }

  public hideOverlay() {
    this.overlayVisible = false;
    this.popupOverlay.getElement().classList.add('hidden');
  }

  public handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResult(event, this.mapName);
  }

  public handleMapEvents(mapEvent: MapComponentEvent) {
    if (mapEvent.type === MapComponentEventTypes.SINGLECLICK) {
      this.hideOverlay();
    }
  }

  public handleWmsEvents(event: MapComponentEvent, layerName: string) {
    if (event.type === MapComponentEventTypes.WMSFEATUREINFO) {
      if (event.value.length) {
        this.selectedSensor = event.value[0].values_;
        this.showOverlay(event.value[0].values_.geometry.flatCoordinates);
      }
    }
  }

  public handleDatasetTreeEvents(event: DatasetTreeEvent) {
    if (event.type === 'layerActivated') {
      const deactivatedService = event.value.services[0];
      if (deactivatedService.type === 'wms') {
        this.activeWmsDatasets.push(event.value);
      } else if (deactivatedService.type === 'wmts') {
        this.activeWmtsDatasets.push(event.value);
      }
    } else if (event.type === 'layerDeactivated') {
      const deactivatedService = event.value.services[0];
      if (deactivatedService.type === 'wms') {
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== deactivatedService.layers[0].technicalName);
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) => dataset.services.length > 0);
      } else if (deactivatedService.type === 'wmts') {
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== deactivatedService.layers[0].technicalName);
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) => dataset.services.length > 0);
      }
    }
  }

  private zoomToPoint(point: Point) {
    const view = this.mapService.getMap(this.mapName).getView();
    view.fit(point, {
      maxZoom: 10,
    });
  }

  private zoomToPosition(position: Position) {
    const coords = [position.coords.longitude, position.coords.latitude];
    const coordsRD = proj4(this.epsgWGS84, this.epsgRD, coords);
    const point = new Point(coordsRD);
    this.zoomToPoint(point);
  }

  private findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        this.zoomToPosition(position);
      });
    } else {
      alert(this.geoLocationNotSupportedString);
    }
  }

  private addFindMeButton() {
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = `<button title="${this.locateMeString}">◎</button>`;
    locate.addEventListener('click', () => {
      this.findMe();
    });

    this.mapService.getMap(this.mapName).addControl(new Control({
      element: locate,
    }));
  }

  public async ngOnInit(): Promise<void> {
    this.subscriptions.push(this.httpClient.get('/assets/layers.json').subscribe((data) => {
      this.myLayers = data as Theme[];
    }, () => {}));

    this.popupOverlay = new Overlay({
      autoPan: false,
      positioning: OverlayPositioning.BOTTOM_CENTER,
      element: document.getElementById('popup')
    });
    this.mapService.getMap(this.mapName).addOverlay(this.popupOverlay);

    if (window.location.protocol === 'https') {
      this.addFindMeButton();
    }
  }
}
