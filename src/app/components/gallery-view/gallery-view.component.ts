import {
    AfterContentChecked,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    ViewChild
} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

// Based on https://github.com/Alicunde/Videoconference-Dish-CSS-JS (CC4)
// https://github.com/Alicunde/Videoconference-Dish-CSS-JS/blob/main/LICENSE.md

@Component({
    selector: 'app-gallery-view',
    templateUrl: './gallery-view.component.html',
    styleUrls: ['./gallery-view.component.scss']
})
export class GalleryViewComponent implements OnInit, AfterContentChecked {

    pageinatedStreams: { stream: MediaStream, feedId: string, userName: string, isScreenshare?: boolean; isMyStream?: boolean, isVideoMuted?: boolean, loadingFinished?: boolean; firstRenderFinished?: boolean }[] = [];

    _cameraStreams: { stream: MediaStream, feedId: string, userName: string, isScreenshare?: boolean, isMyStream?: boolean, loadingFinished?: boolean; firstRenderFinished?: boolean }[] = [];

    @Input() set cameraStreams(value: { stream: MediaStream, feedId: string, userName: string, isScreenshare?: boolean, isMyStream?: boolean }[]) {
        let shouldResize = false;
        if (value) {
            if (value.length !== this._cameraStreams.length) {
                shouldResize = true;
            }
        }

        if (this.skipAnimations) {
            value = value.map(e => {
                return {
                    ...e,
                    firstRenderFinished: true,
                    loadingFinished: true
                }
            });
        }

        this._cameraStreams = value;
        this.pageinatedStreams = this._cameraStreams.sort().slice(this.currentPage * this.maximumAmountOfCamsPerPage, this.currentPage * this.maximumAmountOfCamsPerPage + this.maximumAmountOfCamsPerPage);

        if (this.dish && shouldResize) {
            this.render();
            this.resize();
        }
    }

    @Input() skipAnimations = false;

    @Input()
    allowNavigation: boolean = true;

    @Input()
    isTinyView = false;

    @ViewChild("renderSpace")
    renderSpace: ElementRef;

    @ViewChild("conferenceView")
    conferenceView: ElementRef;

    @ViewChild("dish")
    dish: ElementRef;

    private width = 0;
    private height = 0;
    private ratios = ['4:3', '16:9', '1:1', '1:2'];
    private aspect = 1;
    private margin = 5;
    private cameras = 15;
    private ratio = this.calculateRatio();

    // Pagination
    public maximumAmountOfCamsPerPage = 6;
    private currentPage = 0;

    public mouseHoverFeedId = '';

    constructor(public janusService: JanusService) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this.render();
        this.resize();
    }

    ngAfterContentChecked() {
        if (this.dish) {
            this.render();
            this.resize();
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.render();
        this.resize();
    }

    changePage(modifier: number) {
        // All streams that were currently displayed on this page are done with their first render.
        this.pageinatedStreams.forEach(e => e.firstRenderFinished = true);
        const tmp = this.currentPage + modifier;
        if (tmp >= 0 && tmp <= (this._cameraStreams.length / this.maximumAmountOfCamsPerPage)) {
            this.currentPage = tmp;
            this.pageinatedStreams = this._cameraStreams.sort().slice(this.currentPage * this.maximumAmountOfCamsPerPage, this.currentPage * this.maximumAmountOfCamsPerPage + this.maximumAmountOfCamsPerPage);
        }
    }

    calculateDimensions() {
        this.width = this.dish.nativeElement.offsetWidth - this.margin * 2;
        this.height = this.dish.nativeElement.offsetHeight - this.margin * 2;
    }

    render() {
        if (this._cameraStreams.length > this.maximumAmountOfCamsPerPage) {
            // We need to paginate the streams!

        }
    }

    resize() {
        this.calculateDimensions();

        let max = 0;
        let i = 0;
        while (i < 5000) {
            const area = this.area(i);
            if (area === false) {
                max = i - 1;
                break;
            }
            i++;
        }

        max = max - (this.margin * 2);

        this.resizer(max);
    }

    // resizer of cameras
    resizer(width: number) {
        for (var s = 0; s < this.dish.nativeElement.children.length; s++) {

            // camera fron dish (div without class)
            let element = this.dish.nativeElement.children[s];

            // custom margin
            element.style.margin = this.margin + "px"

            // calculate dimensions
            element.style.width = width + "px"
            element.style.height = (width * this.ratio) + "px"
        }
    }

    calculateRatio(): number {
        const ratio = this.ratios[this.aspect].split(":");
        return Number.parseInt(ratio[1]) / Number.parseInt(ratio[0]);
    }

    area(increment: number) {
        let i = 0;
        let w = 0;
        let h = increment * this.ratio + (this.margin * 2);
        while (i < (this.dish.nativeElement.children.length)) {
            if ((w + increment) > this.width) {
                w = 0;
                h = h + (increment * this.ratio) + (this.margin * 2);
            }
            w = w + increment + (this.margin * 2);
            i++;
        }
        if (h > this.height || increment > this.width) return false;
        else return increment;
    }

    add() {
        this.cameras++;
        this.render();
        this.resize();
    }

    delete() {
        this.cameras--;
        this.render();
        this.resize();
    }

    getRatios() {
        return this.ratios;
    }

    getCameras() {
        return this.cameras;
    }

    setAspect(i: number) {
        this.aspect = i;
        this.ratio = this.calculateRatio();
        this.resize();
    }

    expand() {
        // detect screen exist
        let screens = this.conferenceView.nativeElement.querySelector('.Screen');
        if (screens) {

            // remove screen
            this.conferenceView.nativeElement.removeChild(screens);

        } else {

            // add div to scenary
            let screen = document.createElement('div');
            screen.classList.add('Screen');
            // append first to scenary
            this.conferenceView.nativeElement.prepend(screen);

        }
        this.resize();
    }

    muteAudioForFeedId(feedId: string) {
        this.janusService.muteRemoteAudioLocallyForFeedId(feedId);
    }
}
