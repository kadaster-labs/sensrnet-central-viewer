import { Injectable } from '@angular/core';
import { Device } from '../model/device';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationStart, Router } from '@angular/router';
import { ModalComponent } from '../components/modal/modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  public btnCancelText = $localize`Close`;

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

  public showDevices(
    devices: Device[],
    btnCancelText: string = this.btnCancelText,
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean> {
    const modalRef = this.modalService.open(ModalComponent, { size: dialogSize, windowClass: 'modal-window' });
    modalRef.componentInstance.devices = devices;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}
