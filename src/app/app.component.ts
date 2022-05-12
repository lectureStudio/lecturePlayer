import { Component } from '@angular/core';
import {JanusService} from "./services/janus/janus.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angularPlayer';

  constructor(private router: Router) {
  }
}
