import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { BrowserModule } from '@angular/platform-browser';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapService } from './components/map/map.service';
import { ViewerComponent } from './viewer/viewer.component';
import { NavBarComponent } from './components/navbar/navbar.component';
import { MapComponent } from './components/map/map.component';
import { ModalComponent } from './components/modal/modal.component';
import { ModalService } from './services/modal.service';
import { HTTPService } from './services/http.service';
import { EnvServiceProvider } from './services/env.service.provider';

import * as freeRegularSvgIcons from '@fortawesome/free-regular-svg-icons';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ModalComponent,
    NavBarComponent,
    ViewerComponent,
    LanguageSwitcherComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
    NgbModule,
  ],
  providers: [
    MapService,
    ModalService,
    HTTPService,
    EnvServiceProvider,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    // import font-awesome icons here to enable tree-shaking, making use of the "Icon Library" methodology, more info
    // here: https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/usage.md#methodologies
    library.addIcons(
      freeRegularSvgIcons.faCheckSquare,
      freeSolidSvgIcons.faArrowRight,
      freeSolidSvgIcons.faBullseye,
      freeSolidSvgIcons.faChevronLeft,
      freeSolidSvgIcons.faChevronRight,
      freeSolidSvgIcons.faCity,
      freeSolidSvgIcons.faEye,
      freeSolidSvgIcons.faInfoCircle,
      freeSolidSvgIcons.faLanguage,
      freeSolidSvgIcons.faPencilAlt,
      freeSolidSvgIcons.faPlus,
      freeSolidSvgIcons.faSignOutAlt,
      freeSolidSvgIcons.faSort,
      freeSolidSvgIcons.faSortDown,
      freeSolidSvgIcons.faSortUp,
      freeSolidSvgIcons.faTrashAlt
    );
  }
}
