import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationStart, Router } from '@angular/router';
import { ModalComponent } from '../components/modal/modal.component';
import {ISensor} from "../model/bodies/sensor-body";

@Injectable({ providedIn: 'root' })
export class ModalService {

  public btnCancelText = `Close`;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.modalService.dismissAll('Route changed.');
      }
    });
  }

  public showSensors(
    sensors: ISensor[],
    btnCancelText: string = this.btnCancelText,
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean> {
    const modalRef = this.modalService.open(ModalComponent, { size: dialogSize, windowClass: 'modal-window' });
    modalRef.componentInstance.sensors = sensors;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}
