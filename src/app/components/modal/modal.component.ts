import { Component, DoCheck, Input, IterableDiffers } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { HTTPService } from '../../services/http.service';

import { Datastream } from '../../model/datastream';
import { DeviceDTO } from '../../model/device';
import { DeviceLocation } from '../../model/deviceLocation';
import { Sensor } from '../../model/sensor';
import { LegalEntity } from '../../model/legalEntity';
import { ObservationGoal } from '../../model/observationGoal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
})
export class ModalComponent implements DoCheck {
  @Input() devices: DeviceDTO[];
  @Input() btnCancelText: string;

  public selectedNavIndex = 0;
  public selectedDeviceIndex = 0;
  public navigationSteps = ['Devices', 'Info', 'Sensors', 'Datastreams', 'Location', 'Contact'];

  public legalEntities: Observable<LegalEntity[]>;
  public observationGoalsMap = new Map<ObservationGoal['_id'], ObservationGoal>();

  private iterableDiffer;

  constructor(
    private activeModal: NgbActiveModal,
    private httpService: HTTPService,
    private iterableDiffers: IterableDiffers,
  ) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngDoCheck() {
    const changes = this.iterableDiffer.diff(this.devices);
    if (changes) {
      this.getDeviceDetailsFromBackend(this.devices[this.selectedDeviceIndex]);
    }
  }

  public setSelectedNavIndex(i: number): void {
    this.selectedNavIndex = i;
  }

  public setselectedDeviceIndex(i: number): void {
    this.selectedDeviceIndex = i;
    this.selectedNavIndex = 1;

    this.getDeviceDetailsFromBackend(this.devices[i]);
  }

  public getDatastreams(device: DeviceDTO): Datastream[] {
    return device.dataStreams ? JSON.parse(device.dataStreams) : [];
  }

  public getSensors(device: DeviceDTO): Sensor[] {
    return device.sensors ? JSON.parse(device.sensors) : [];
  }

  public getLocation(device: DeviceDTO): DeviceLocation {
    return JSON.parse(device.location_object);
  }

  public decline(): void {
    this.activeModal.close(false);
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }

  private getDeviceDetailsFromBackend(device: DeviceDTO) {
    this.getLegalEntities(device);
    this.getObservationGoals(device);
  }

  private getLegalEntities(device: DeviceDTO): void {
    this.legalEntities = this.httpService.getLegalEntities(device._id);
  }

  private async getObservationGoals(device: DeviceDTO): Promise<void> {
    const datastreams: Datastream[] = this.getDatastreams(device);
    for (const datastream of datastreams) {
      for (const id of datastream.observationGoalIds) {
        const goal = await this.httpService.getObservationGoals(id).toPromise();
        if (goal) {
          this.observationGoalsMap.set(goal._id, goal);
        }
      }
    }
  }
}
