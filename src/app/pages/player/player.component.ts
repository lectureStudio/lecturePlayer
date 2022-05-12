import { Component, OnInit } from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  constructor(private janusService: JanusService) { }

  ngOnInit(): void {
    this.janusService.start();
  }

}
