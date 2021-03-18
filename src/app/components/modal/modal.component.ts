import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Device } from '../../model/device';
import { Sensor } from '../../model/sensor';

import { Datastream } from '../../model/datastream';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class ModalComponent {
  @Input() devices: Array<Device>;
  @Input() btnCancelText: string;

  public selectedNavIndex = 0;
  public selectedDeviceIndex = 0;
  public navigationSteps = ['Devices', 'Info', 'Sensors', 'Datastreams', 'Location', 'Contact'];

  constructor(
    private activeModal: NgbActiveModal,
  ) {}

  public setSelectedNavIndex(i: number): void {
    this.selectedNavIndex = i;
  }

  public setselectedDeviceIndex(i: number): void {
    this.selectedDeviceIndex = i;
    this.selectedNavIndex = 1;
  }

  public getDatastreams(sensor: Record<string, any>): Array<Datastream> {
    return sensor.dataStreams ? JSON.parse(sensor.dataStreams) : [];
  }

  public getSensors(device: Record<string, any>): Array<Sensor> {
    return device.sensors ? JSON.parse(device.sensors) : [];
  }

  public decline(): void {
    this.activeModal.close(false);
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }
}
