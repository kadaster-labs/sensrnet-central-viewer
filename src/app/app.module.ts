import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { GgcDatasetLegendModule } from 'generieke-geo-componenten-dataset-legend';
import { GgcDatasetTreeModule } from 'generieke-geo-componenten-dataset-tree';
import { GgcMapModule } from 'generieke-geo-componenten-map';
import { GgcSearchModule } from 'generieke-geo-componenten-search';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewerComponent } from './viewer/viewer.component';
import { NavBarComponent } from './components/navbar/navbar.component';
import { MapComponent } from './components/map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavBarComponent,
    ViewerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    GgcMapModule.forRoot(),
    GgcSearchModule,
    GgcDatasetTreeModule,
    GgcDatasetLegendModule,
    HttpClientModule,
    NgbModule,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
