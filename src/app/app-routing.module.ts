import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PlayerComponent} from "./pages/player/player.component";
import {HomeComponent} from "./pages/home/home.component";

const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'player', component: PlayerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
