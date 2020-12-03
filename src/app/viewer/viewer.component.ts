import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import proj4 from 'proj4';
import { Observable } from 'rxjs';

import { Overlay } from 'ol';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { Cluster } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Icon, Style, Text } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import { extend } from 'ol/extent';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';

import { Dataset, DatasetTreeEvent, Theme } from 'generieke-geo-componenten-dataset-tree';
import { MapComponentEvent, MapComponentEventTypes, MapService } from 'generieke-geo-componenten-map';
import { SearchComponentEvent } from 'generieke-geo-componenten-search';

import { ISensor } from '../model/bodies/sensor-body';
import { EventType } from '../model/events/event-type';
import { DataService } from '../services/data.service';
import { SensorInfo } from './../model/bodies/sensorInfo';
import Geometry from 'ol/geom/Geometry';
import { environment } from '../../environments/environment';
import Control from 'ol/control/Control';
import { Extent } from 'ol/extent';
import { FitOptions } from 'ol/View';
import { Category } from '../model/bodies/sensorTypes';
import {SensorService} from "../services/sensor.service";

@Component({
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit {
  public title = 'SensRNet';
  public mapName = 'srn';

  public environment = environment;

  public currentMapResolution: number = undefined;
  public currentZoomlevel: number = undefined;
  public activeWmtsDatasets: Dataset[] = [];
  public activeWmsDatasets: Dataset[] = [];
  public activeFeatureInfo: SensorInfo;
  public highlightLayer: VectorLayer;
  public highlightSource: VectorSource;
  public selectLocationLayer: VectorLayer;
  public selectLocationSource: VectorSource;
  public clusterLayer: AnimatedCluster;
  public overlay: Overlay;
  public selectLocation = false;
  public locationFeature = Feature;

  public showInfo = false;

  private vectorSource: VectorSource;
  private clusterSource: Cluster;
  private selectCluster: SelectCluster;

  public selectedSensor: ISensor;

  private epsgRD = '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs';
  private epsgWGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  public myLayers: Theme[];
  public hideTreeDataset = false;

  public clusterMaxZoom = 15;

  public iconCollapsed = 'fas fa-chevron-right';
  public iconExpanded = 'fas fa-chevron-left';
  public iconUnchecked = 'far fa-square';
  public iconChecked = 'far fa-check-square';
  public iconInfoUrl = 'fas fa-info-circle';

  public iconDir = '/assets/icons/';

  COLOR_NODE_GEMEENTE_A = '0, 120, 54';
  COLOR_NODE_GEMEENTE_B = '227, 37, 39';

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    public mapService: MapService,
    private dataService: DataService,
    private sensorService: SensorService,
  ) {}

  public getStyleCache() {
    const styleCache = {};
    for (const item1 of Object.keys(Category).filter(String)) {
      for (const item2 of [true, false]) {
        switch (item2) {
          case true:
            const styleNameActive = item1 + '_active';
            const styleActive = [new Style({
              image: new CircleStyle({
                radius: 15,
                fill: new Fill({
                  color: this.getNodeColor(item1, 0.9),
                }),
                stroke: new Stroke({
                  color: '#fff',
                  width: 1.5
                })
              })
            }), new Style({
              image: new Icon({
                scale: 0.25,
                src: `/assets/icons/${item1}_op.png`
              })
            })
            ];

            for (const style of Object.values(styleActive)) {
              style.getImage().load();
            }
            styleCache[styleNameActive] = styleActive;
            break;

          case false:
            const styleNameInactive = item1 + '_inactive';
            const styleInActive = [new Style({
              image: new CircleStyle({
                radius: 15,
                fill: new Fill({
                  color: this.getNodeColor(item1, 0.25),
                }),
                stroke: new Stroke({
                  color: '#fff',
                  width: 1.5
                })
              })
            }), new Style({
              image: new Icon({
                scale: 0.25,
                src: `/assets/icons/${item1}_op.png`
              })
            })
            ];

            for (const style of Object.values(styleInActive)) {
              style.getImage().load();
            }
            styleCache[styleNameInactive] = styleInActive;

            break;
        }
      }
    }

    return styleCache;
  }

  public ngOnInit(): void {
    this.httpClient.get('/assets/layers.json').subscribe(
      (data) => {
        this.myLayers = data as Theme[];
      },
      () => {
      },
    );

    this.dataService.connect();
    this.sensorService.getAll().subscribe((sensors: Array<ISensor>) => {
      const featuresData: Array<object> = sensors.map((sensor) => this.sensorToFeature(sensor));
      const features: Array<Feature> = (new GeoJSON()).readFeatures({
        features: featuresData,
        type: 'FeatureCollection',
      });

      const styleCache = this.getStyleCache();
      const styleCluster = (feature) => {
        let style: Style[];

        const FEATURES_ = feature.get('features');
        let numberOfFeatures = FEATURES_.length;
        if (numberOfFeatures === 1) {
          const active = feature.get('features')[0].values_.active;
          const category = feature.get('features')[0].values_.category;

          if (!active) {
            numberOfFeatures = `${category}_inactive`;
            style = styleCache[numberOfFeatures];
          } else {
            numberOfFeatures = `${category}_active`;
            style = styleCache[numberOfFeatures];
          }
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
        let styleFeatures;
        const zoomLevel = this.mapService.getMap(this.mapName).getView().getZoom();

        if (feature.values_.hasOwnProperty('selectclusterfeature') && zoomLevel > this.clusterMaxZoom) {
          const active = feature.get('features')[0].values_.active;
          const category = feature.get('features')[0].values_.category;

          let style: Style[];

          if (!active) {
            styleFeatures = category + '_inactive';
            style = styleCache[styleFeatures];
          }
          if (active) {
            styleFeatures = category + '_active';
            style = styleCache[styleFeatures];
          }
          return style;
        }
      };

      this.vectorSource = new VectorSource({
        features,
      });

      this.clusterSource = new Cluster({
        distance: 40,
        source: this.vectorSource
      });

      this.clusterLayer = new AnimatedCluster({
        name: 'Cluster',
        source: this.clusterSource,
        style: styleCluster,
      });

      this.clusterLayer.setZIndex(10);
      this.mapService.getMap(this.mapName).addLayer(this.clusterLayer);

      this.selectCluster = new SelectCluster({
        pointRadius: 40,
        featureStyle: styleSelectedCluster,
        style: styleCluster
      });

      this.mapService.getMap(this.mapName).addInteraction(this.selectCluster);

      this.selectCluster.getFeatures().on(['add'], (event) => {
        this.removeHighlight();
        const activeFeatures = event.element.get('features');
        if (activeFeatures.length === 1) {
          const feature = activeFeatures[0];
          const geometry = new Feature({
            geometry: feature.values_.geometry,
          });
          const activeFeature = new SensorInfo(
            feature.get('name'),
            feature.get('typeName'),
            feature.get('category'),
            feature.get('active'),
            feature.get('aim'),
            feature.get('description'),
            feature.get('manufacturer'),
            feature.get('theme'),
          );
          this.activeFeatureInfo = activeFeature;
          this.selectedSensor = feature.values_.sensor;
          this.showInfo = true;
          this.highlightFeature(geometry);
        }
        if (activeFeatures.length > 1) {
          this.removeHighlight();
          this.showInfo = false;
          this.activeFeatureInfo = null;
        }
      });
    });

    // subscribe to sensor events
    const sensorRegistered$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorRegistered);
    sensorRegistered$.subscribe((newSensor: ISensor) => {
      const feature: object = this.sensorToFeature(newSensor);
      const newFeatures: Array<Feature> = (new GeoJSON()).readFeatures({
        features: [feature],
        type: 'FeatureCollection',
      });

      this.vectorSource.addFeatures(newFeatures);
    });

    // subscribe to sensor location events
    const sensorUpdated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorUpdated);
    sensorUpdated$.subscribe((newSensor: ISensor) => {
      this.updateSensor(newSensor);
    });

    // subscribe to sensor events
    const sensorActivated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorActivated);
    sensorActivated$.subscribe((newSensor: ISensor) => {
      this.updateSensor(newSensor);
    });

    // subscribe to sensor events
    const sensorDeactivated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorDeactivated);
    sensorDeactivated$.subscribe((newSensor: ISensor) => {
      this.updateSensor(newSensor);
    });

    // subscribe to sensor events
    const sensorLocationUpdated$: Observable<ISensor> = this.dataService.subscribeTo<ISensor>(EventType.SensorRelocated);
    sensorLocationUpdated$.subscribe((newSensor: ISensor) => {
      this.updateSensor(newSensor);
    });

    if (environment.apiUrl.startsWith('https')) {
      this.addFindMeButton();
    }
  }

  public getNodeColor(category: string, opacity: number) {
    if (category === 'Sensor') {
      return `rgb( 0, 120, 54, ${opacity})`;
    } else if (category === 'Camera') {
      return `rgb( 227, 37, 39, ${opacity})`;
    } else {
      return `rgb(19, 65, 115, ${opacity})`;
    }
  }

  public updateSensor(updatedSensor: ISensor) {
    const props = this.sensorToFeatureProperties(updatedSensor);

    // update map
    const sensor = this.vectorSource.getFeatureById(updatedSensor._id);
    sensor.setProperties(props);
    const geom: Geometry = new Point(proj4(this.epsgWGS84, this.epsgRD, [
      updatedSensor.location.coordinates[0], updatedSensor.location.coordinates[1]
    ]));
    sensor.setGeometry(geom);
    this.clearLocationLayer();

    // update feature info
    this.activeFeatureInfo = new SensorInfo(
      updatedSensor.name,
      updatedSensor.typeName,
      updatedSensor.category,
      updatedSensor.active,
      updatedSensor.aim,
      updatedSensor.description,
      updatedSensor.manufacturer,
      updatedSensor.theme,
    );

    // update sensor update pane
    this.selectedSensor = updatedSensor;
  }

  public handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResult(event, 'srn');
  }

  public handleMapEvents(mapEvent: MapComponentEvent) {
    const map = this.mapService.getMap(this.mapName);

    if (mapEvent.type === MapComponentEventTypes.ZOOMEND) {
      this.currentMapResolution = map.getView().getResolution();
      this.currentZoomlevel = this.mapService.getMap(this.mapName).getView().getZoom();
    }
    if (mapEvent.type === MapComponentEventTypes.SINGLECLICK) {
      const mapCoordinateRD = mapEvent.value.coordinate;
      const mapCoordinateWGS84 = proj4(this.epsgRD, this.epsgWGS84, mapCoordinateRD);

      this.removeHighlight();
      this.activeFeatureInfo = null;
      this.showInfo = false;

      map.forEachFeatureAtPixel(mapEvent.value.pixel, (data, layer) => {
        const features = data.getProperties().features;

        // check if feature is a cluster with multiple features
        if (features.length < 2) {
          return;
        }

        // determine extent for new view
        const extent: Extent = features[0].getGeometry().getExtent().slice(0) as Extent;
        features.forEach((f: Feature) => { extend(extent, f.getGeometry().getExtent()); });

        // if we're already zoomed in, zoom in no more. Setting maxZoom in fit() also does this to some extent, however,
        // in that case the camera is also centered. Returning early here also prevents the unnecessary panning.
        if (map.getView().getZoom() > this.clusterMaxZoom) {
          return;
        }

        const size = this.mapService.getMap(this.mapName).getSize();  // [width, height]
        const fitOptions: FitOptions = {
          duration: 1000,
          maxZoom: this.clusterMaxZoom + 1,
          padding: [size[1] * 0.2, size[0] * 0.2, size[1] * 0.2, size[0] * 0.2],  // up, right, down, left
          size,
        };
        this.mapService.getMap(this.mapName).getView().fit(extent, fitOptions);
      });
    }
  }

  public handleDatasetTreeEvents(event: DatasetTreeEvent) {
    if (event.type === 'layerActivated') {
      const geactiveerdeService = event.value.services[0];
      if (geactiveerdeService.type === 'wms') {
        this.activeWmsDatasets.push(event.value);
      } else if (geactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets.push(event.value);
      }
    } else if (event.type === 'layerDeactivated') {
      const gedeactiveerdeService = event.value.services[0];
      if (gedeactiveerdeService.type === 'wms') {
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmsDatasets = this.activeWmsDatasets.filter((dataset) => dataset.services.length > 0);
      } else if (gedeactiveerdeService.type === 'wmts') {
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) =>
          dataset.services[0].layers[0].technicalName !== gedeactiveerdeService.layers[0].technicalName);
        this.activeWmtsDatasets = this.activeWmtsDatasets.filter((dataset) => dataset.services.length > 0);
      }
    }
  }

  private sensorToFeatureProperties(sensor: ISensor) {
    return {
      sensor,
      name: sensor.name,
      category: sensor.category,
      typeName: sensor.typeName,
      active: sensor.active,
      aim: sensor.aim,
      description: sensor.description,
      manufacturer: sensor.manufacturer,
      theme: sensor.theme,
      nodeId: sensor.nodeId,
    };
  }

  private sensorToFeature(newSensor: ISensor): object {
    return {
      geometry: {
        coordinates: proj4(this.epsgWGS84, this.epsgRD, [newSensor.location.coordinates[0], newSensor.location.coordinates[1]]),
        type: 'Point',
      },
      id: newSensor._id,
      properties: this.sensorToFeatureProperties(newSensor),
      type: 'Feature',
    };
  }

  private mockNodeId(): string {
    const random = Math.random() < 0.5;
    switch (random) {
      case true:
        return 'node-gemeente-a';
        break;
      case false:
        return 'node-gemeente-b';
        break;
    }
  }

  public featureToSensorInfo(feature: Feature) {
    const info = new SensorInfo(
      feature.get('name'),
      feature.get('typeName'),
      feature.get('category'),
      feature.get('active'),
      feature.get('aim'),
      feature.get('description'),
      feature.get('manufacturer'),
      feature.get('theme'),
    );
    return info;
  }

  private setLocation(feature: Feature) {
    this.selectLocationSource = new VectorSource({
      features: [feature],
    });
    this.selectLocationLayer = new VectorLayer({
      source: this.selectLocationSource,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: '#F34E15',
            width: 2,
          }),
          fill: new Fill({
            color: '#F34E15',
          }),
        }),
      }),
    });
    this.selectLocationLayer.setZIndex(25);
    this.mapService.getMap(this.mapName).addLayer(this.selectLocationLayer);
  }

  public removeLocationFeatures() {
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
  }

  public clearLocationLayer() {
    this.mapService.getMap(this.mapName).removeLayer(this.selectLocationLayer);
  }

  public highlightFeature(feature: Feature) {
    this.mapService.getMap(this.mapName).removeLayer(this.highlightLayer);
    this.highlightSource = new VectorSource({
      features: [feature],
    });
    this.highlightLayer = new VectorLayer({
      source: this.highlightSource,
      style: [new Style({
        image: new CircleStyle({
          radius: 20,
          stroke: new Stroke({
            color: '#FF0000 ',
            width: 1,
          }),
        }),
      }), new Style({
        image: new CircleStyle({
          radius: 25,
          stroke: new Stroke({
            color: '#FF0000 ',
            width: 2,
          }),
        }),
      })], opacity: 0.7,
    });
    this.highlightLayer.setZIndex(20);
    this.mapService.getMap(this.mapName).addLayer(this.highlightLayer);
  }

  public removeHighlight() {
    this.mapService.getMap(this.mapName).removeLayer(this.highlightLayer);
    this.selectedSensor = undefined;
  }

  private zoomToPoint(point: Point) {
    const view = this.mapService.getMap('srn').getView();
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
      alert('Geolocation is not supported by this browser.');
    }
  }

  private addFindMeButton() {
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = '<button title="Locate me">◎</button>';
    locate.addEventListener('click', () => {
      this.findMe();
    });

    this.mapService.getMap('srn').addControl(new Control({
      element: locate,
    }));
  }
}
