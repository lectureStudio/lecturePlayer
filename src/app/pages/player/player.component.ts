import { Component, OnInit } from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  constructor(public janusService: JanusService) { }

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
}
