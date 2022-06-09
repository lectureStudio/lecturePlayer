import {Component, OnDestroy, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  viewMode = 0;

  constructor(public janusService: JanusService, private router: Router) { }

  ngOnInit(): void {
    this.janusService.start();
  }

  ngOnDestroy() {
    this.janusService.end();
  }

  get audioStreams() {
    return Object.values(this.janusService.remoteTracks).filter(e => e.stream.getAudioTracks().length > 0);
  }

  get videoStreams() {
    return Object.values(this.janusService.remoteTracks).filter(e => e.stream.getVideoTracks().length > 0);
  }

  switchViewMode() {
    // DEBUG implementation
    this.viewMode = this.viewMode === 0 ? 1 : 0;
  }

  leave() {
    this.janusService.end();
    this.router.navigate(['/']);
  }
}
