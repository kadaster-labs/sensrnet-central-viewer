import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class ModalComponent {
  @Input() sensors: Record<string, any>[];
  @Input() btnCancelText: string;

  public selectedNavIndex = 0;
  public selectedSensorIndex = 0;
  public navigationSteps = ['Sensors', 'Type', 'Details', 'Data Streams', 'Location'];

  constructor(
    private activeModal: NgbActiveModal,
  ) {}

  public setSelectedNavIndex(i: number): void {
    this.selectedNavIndex = i;
  }

  public setSelectedSensorIndex(i: number): void {
    this.selectedSensorIndex = i;
    this.selectedNavIndex = 1;
  }

  public getThemes(sensor: Record<string, any>): string {
    return sensor.theme ? sensor.theme.substring(1, sensor.theme.length - 1) : '';
  }

  public getDataStreams(sensor: Record<string, any>) {
    return sensor.dataStreams ? JSON.parse(sensor.dataStreams) : [];
  }

  public decline() {
    this.activeModal.close(false);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }
}
