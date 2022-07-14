import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './pages/player/player.component';
import { HomeComponent } from './pages/home/home.component';
import {MatIconModule} from '@angular/material/icon';
import { GalleryViewComponent } from './components/gallery-view/gallery-view.component';
import { SpeakerViewComponent } from './components/speaker-view/speaker-view.component';
import { DocumentViewComponent } from './components/document-view/document-view.component';
import { MenubarButtonComponent } from './components/menubar/menubar-button/menubar-button.component';
import {MenubarComponent} from "./components/menubar/menubar.component";
import { SelectOverlayComponent } from './components/select-overlay/select-overlay.component';
import { MenubarButtongroupComponent } from './components/menubar/menubar-buttongroup/menubar-buttongroup.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    HomeComponent,
    GalleryViewComponent,
    SpeakerViewComponent,
    DocumentViewComponent,
    MenubarButtonComponent,
    MenubarComponent,
    SelectOverlayComponent,
    MenubarButtongroupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule
  ],
  exports: [
      MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
