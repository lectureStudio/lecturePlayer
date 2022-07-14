import {Component, Input, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
    selector: 'app-menubar',
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent implements OnInit {
    constructor() {
    }

    ngOnInit(): void {
    }

}
