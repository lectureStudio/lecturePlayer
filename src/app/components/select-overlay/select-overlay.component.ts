import {Component, Input, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";
import {SelectOverlayService} from "../../services/select-overlay.service";

@Component({
    selector: 'app-select-overlay',
    templateUrl: './select-overlay.component.html',
    styleUrls: ['./select-overlay.component.scss']
})
export class SelectOverlayComponent implements OnInit {

    constructor(public selectOverlayService: SelectOverlayService) {
    }

    ngOnInit(): void {
    }

}
