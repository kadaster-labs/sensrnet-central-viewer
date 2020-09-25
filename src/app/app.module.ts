import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { GgcDatasetLegendModule } from 'generieke-geo-componenten-dataset-legend';
import { GgcDatasetTreeModule } from 'generieke-geo-componenten-dataset-tree';
import { GgcMapModule } from 'generieke-geo-componenten-map';
import { GgcSearchModule } from 'generieke-geo-componenten-search';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { DataService } from './services/data.service';
import { ViewerComponent } from './viewer/viewer.component';

@NgModule({
  declarations: [
    AppComponent,
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
  providers: [
    DataService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }