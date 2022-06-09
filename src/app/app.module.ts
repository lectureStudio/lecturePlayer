import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './pages/player/player.component';
import { HomeComponent } from './pages/home/home.component';
import {MatIconModule} from '@angular/material/icon';
import { GalleryViewComponent } from './components/gallery-view/gallery-view.component';
import { SpeakerViewComponent } from './components/speaker-view/speaker-view.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    HomeComponent,
    GalleryViewComponent,
    SpeakerViewComponent
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
