import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JanusService} from "../../../services/janus/janus.service";

@Component({
    selector: 'app-menubar-button',
    templateUrl: './menubar-button.component.html',
    styleUrls: ['./menubar-button.component.scss']
})
export class MenubarButtonComponent implements OnInit {

    @Input() clickAction: (event: MouseEvent) => void;
    @Input() subButtonClickAction: (event: MouseEvent) => void;
    @Input() highlightToggleStateActive: boolean = false;
    @Input() matIconName: string;
    @Input() matIconNameHighlightedToggleState: string;
    @Input() caption: string;
    @Input() captionHighlightedToggleState: string;

    @Output() clicked: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit(): void {
    }

}
