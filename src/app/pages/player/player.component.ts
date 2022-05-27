import { Component, OnInit } from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  constructor(public janusService: JanusService, private router: Router) { }

  ngOnInit(): void {
    this.janusService.start();
  }

  amountOfStreams() {
    return Object.entries(this.janusService.slots).length;
  }

  getAudioStreams() {
    return Object.values(this.janusService.audioStreamsToOutput).map((e: any) => e);
  }

  getVideoStreams() {
    return Object.values(this.janusService.videoStreamsToOutput).map((e: any) => e);
  }

  leave() {
    this.router.navigate(['/']);
  }
}
