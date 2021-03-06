import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {

  constructor(
    private titleService: Title,
  ) {
    this.setTitle('Central Viewer');
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
