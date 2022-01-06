import proj4 from 'proj4';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../../services/env.service';
import { Component, OnInit, Input, OnDestroy, HostBinding, ElementRef } from '@angular/core';

import OlMap from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { MapBrowserEvent } from 'ol';
import { Cluster } from 'ol/source';
import { FitOptions } from 'ol/View';
import Stroke from 'ol/style/Stroke';
import { MultiPoint } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import Control from 'ol/control/Control';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import LayerSwitcher from 'ol-layerswitcher';

import { Category } from '../../model/sensorTypes';
import { extend, Extent, getCenter } from 'ol/extent';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import { Circle as CircleStyle, Style, Fill, Icon, Text } from 'ol/style';

import { SearchPDOK } from './searchPDOK';
import { MapService } from './map.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  @HostBinding('style.--searchBarHeight') @Input() searchBarHeight;
  @Input() clearLocationHighLight = true;

  constructor(
    private router: Router,
    private env: EnvService,
    private elementRef: ElementRef,
    private mapService: MapService,
    private httpClient: HttpClient,
    private modalService: ModalService,
  ) {}

  public clusterMaxZoom = 15;

  public map: OlMap;
  public subscriptions = [];

  public highlightLayer: VectorLayer;
  public highlightSource: VectorSource<Geometry>;
  public vectorSource: VectorSource<any>;
  public clusterSource: Cluster;
  public clusterLayer: AnimatedCluster;
  public selectCluster: SelectCluster;

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 ' +
    '+y_0=463000 +ellps=bessel +units=m +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  public locateMeString = $localize`Locate me`;
  public geoLocationNotSupportedString = $localize`Geolocation is not supported by this browser.`;

  public getStyleCache() {
    const styleCache = {};
    for (const item of Object.keys(Category)) {
      const styleActive = [new Style({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({
            color: `rgba(19, 65, 115, 0.9)`,
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 1.5
          })
        })
      }), new Style({
        image: new Icon({
          scale: 0.25,
          src: `assets/icons/${item}_op.png`
        })
      })];

      for (const style of Object.values(styleActive)) {
        style.getImage().load();
      }

      styleCache[item] = styleActive;
    }

    return styleCache;
  }

  public initMap() {
    this.map = this.mapService.getMap();
    const mapElement = this.elementRef.nativeElement.querySelector('#map');
    this.map.setTarget(mapElement);

    const sizeObserver = new ResizeObserver(_ => this.map.updateSize());
    sizeObserver.observe(mapElement);

    this.addMapEvents();
  }

  public initFeatures() {
    const styleCache = this.getStyleCache();
    const styleCluster = (feature) => {
      let style: Style[];

      const FEATURES_ = feature.get('features');
      const numberOfFeatures = FEATURES_.length;
      if (numberOfFeatures === 1) {
        const category = feature.get('features')[0].values_.category;

        style = styleCache[category];
      } else {
        style = styleCache[numberOfFeatures];
      }

      if (!style) {
        style = [new Style({
          image: new CircleStyle({
            radius: 15,
            fill: new Fill({
              color: 'rgba(19, 65, 115, 0.9)',
            }),
          }),
          text: new Text({
            text: numberOfFeatures.toString(),
            font: 'bold 11px "Helvetica Neue", Helvetica,Arial, sans-serif',
            fill: new Fill({
              color: '#ffffff',
            }),
            textAlign: 'center',
          }),
        })];

        styleCache[numberOfFeatures] = style;
      }

      return style;
    };

    const styleSelectedCluster = (feature) => {
      const zoomLevel = this.map.getView().getZoom();
      if (feature.values_.hasOwnProperty('selectclusterfeature') && zoomLevel > this.clusterMaxZoom) {
        const category = feature.get('features')[0].values_.category;
        return styleCache[category];
      }
    };

    this.vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: (extent) => {
        return (
          `${this.env.geoserverUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=devices&` +
          `outputFormat=application/json&srsname=EPSG:28992&bbox=${extent.join(',')},EPSG:28992`
        );
      },
      strategy: bboxStrategy,
    });

    this.clusterSource = new Cluster({
      distance: 40,
      source: this.vectorSource
    });

    this.clusterLayer = new AnimatedCluster({
      name: 'Cluster',
      source: this.clusterSource,
      style: styleCluster,
      zIndex: 1,
    });
    this.map.addLayer(this.clusterLayer);

    this.selectCluster = new SelectCluster({
      pointRadius: 40,
      style: styleCluster,
      featureStyle: styleSelectedCluster,
    });
    this.map.addInteraction(this.selectCluster);

    this.selectCluster.getFeatures().on('add', async event => {
      this.removeHighlight();

      const activeFeatures = event.element.get('features');
      if (activeFeatures.length === 1) {
        const feature = activeFeatures[0];
        const geometry = new Feature({
          geometry: feature.values_.geometry,
        });
        this.highlightFeature(geometry);

        try {
          await this.modalService.showDevices([feature.values_], this.modalService.btnCancelText, 'lg');
          this.removeHighlight();
        } catch {
          this.removeHighlight();
        }
      }
    });
  }

  private onSingleClick(event: MapBrowserEvent) {
    this.removeHighlight();

    event.map.forEachFeatureAtPixel(event.pixel, (data) => {
      const features = data.getProperties().features;

      // check if feature is a cluster with multiple features
      if (features.length < 2) {
        return;
      }

      // determine extent for new view
      const extent: Extent = features[0].getGeometry().getExtent().slice(0) as Extent;
      features.forEach((f: Feature<Geometry>) => { extend(extent, f.getGeometry().getExtent()); });

      // if we're already zoomed in, zoom in no more. Setting maxZoom in fit() also does this to some extent, however,
      // in that case the camera is also centered. Returning early here also prevents the unnecessary panning.
      if (event.map.getView().getZoom() > this.clusterMaxZoom) {
        return;
      }

      const size = this.map.getSize();  // [width, height]
      const fitOptions: FitOptions = {
        duration: 1000,
        maxZoom: this.clusterMaxZoom + 1,
        padding: [size[1] * 0.2, size[0] * 0.2, size[1] * 0.2, size[0] * 0.2],  // up, right, down, left
        size,
      };
      this.map.getView().fit(extent, fitOptions);
    });
  }

  public addMapEvents() {
    this.map.on('singleclick', this.onSingleClick.bind(this));
  }

  public highlightFeature(feature: Feature) {
    this.map.removeLayer(this.highlightLayer);
    this.highlightSource = new VectorSource({
      features: [feature],
    });
    this.highlightLayer = new VectorLayer({
      source: this.highlightSource,
      style: [new Style({
        image: new CircleStyle({
          radius: 20,
          stroke: new Stroke({
            color: '#FF0000',
            width: 2,
          }),
        }),
      })],
      opacity: 0.7,
      zIndex: 2,
    });

    this.map.addLayer(this.highlightLayer);
  }

  public removeHighlight() {
    this.map.removeLayer(this.highlightLayer);
  }

  private zoomToPoint(point: Point) {
    const view = this.map.getView();
    view.fit(point, {
      duration: 250,
      maxZoom: 14,
    });
  }

  private zoomToExtent(extent: Extent) {
    const view = this.map.getView();
    const resolution = view.getResolutionForExtent(extent, this.map.getSize());
    const zoom = view.getZoomForResolution(resolution);
    const center = getCenter(extent);

    setTimeout(() => {
      view.animate({
        center,
        zoom: Math.min(zoom, 16)
      });
    }, 250);
  }

  private zoomToPosition(position: GeolocationPosition) {
    const coords = [position.coords.longitude, position.coords.latitude];
    const coordsRD = proj4(this.epsgWGS84, this.epsgRD, coords);
    const point = new Point(coordsRD);
    this.zoomToPoint(point);
  }

  private findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        this.zoomToPosition(position);
      });
    } else {
      alert(this.geoLocationNotSupportedString);
    }
  }

  private addFindMeButton() {
    if (window.location.protocol !== 'https:') {
      console.warn('Geolocation only allowed over secure connections');
      return;
    }

    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = `<button title="${this.locateMeString}">◎</button>`;
    locate.addEventListener('click', () => {
      this.findMe();
    });

    this.map.addControl(new Control({
      element: locate,
    }));
  }

  private addLayerSwitcher(): void {
    const layerSwitcher = new LayerSwitcher({
      reverse: true,
      groupSelectStyle: 'children'
    });

    this.map.addControl(layerSwitcher);
  }

  /**
   * Adds a search button on the map which can be used to search for a location
   * Makes use of the 'Locatieserver' of PDOK (Dutch address lookup) https://github.com/PDOK/locatieserver/wiki
   */
  private addSearchButton(): void {
    const search = new SearchPDOK({
      minLength: 1,
      maxHistory: -1,
      collapsed: false,
      className: 'search-bar',
      placeholder: $localize`Enter location`,
    }) as any;
    search.clearHistory();

    search.on('select', (event) => {
      let feature: Feature;
      if (event.search instanceof Feature) {
        feature = event.search;
      } else {
        const values = event.search.values_;
        const geometry = new MultiPoint(values.geometry.flatCoordinates, values.geometry.layout);

        feature = new Feature({
          geometry,
          name: values.name,
          type: values.type,
        });
      }

      this.zoomToGeometry(feature.getGeometry());
    });

    this.map.addControl(search);
  }

  private zoomToGeometry(geometry: Geometry): void {
    if (geometry instanceof Point) {
      this.zoomToPoint(geometry);
    } else {
      this.zoomToExtent(geometry.getExtent());
    }
  }

  ngOnInit(): void {
    this.initMap();
    this.initFeatures();

    this.addFindMeButton();
    this.addSearchButton();
    this.addLayerSwitcher();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.mapService.deleteMap();
  }
}
