import {Component, Input, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
    selector: 'app-speaker-view',
    templateUrl: './speaker-view.component.html',
    styleUrls: ['./speaker-view.component.scss']
})
export class SpeakerViewComponent implements OnInit {

    public _cameraStreams: { stream: MediaStream, feedId: string, userName: string, loadingFinished?: boolean; firstRenderFinished?: boolean, isScreenshare?: boolean }[];

    public talkingFeedStream: { stream: MediaStream, feedId: string, userName: string };
    public nonTalkingFeedStreams: { stream: MediaStream, feedId: string, userName: string }[];

    public talkingFeedId: string = '';

    @Input() set cameraStreams(value: { stream: MediaStream, feedId: string, userName: string, isScreenshare?: boolean }[]) {
        const currentCameraStreamsAmount = this._cameraStreams?.length || -1;
        this._cameraStreams = value;
        if (currentCameraStreamsAmount !== value.length) {
            this.refreshViews(this.janusService.talkingFeeds);
        }
    }

    constructor(public janusService: JanusService) {
    }

    ngOnInit() {
    }

    ngAfterContentInit() {
        if (!this.talkingFeedId && !this.talkingFeedStream && this._cameraStreams.length > 0) {
            this.talkingFeedId = this._cameraStreams[0].feedId;
            this.talkingFeedStream = this._cameraStreams[0];

            this.nonTalkingFeedStreams = this.nonTalkingFeeds;
        }

        this.janusService.talkingFeedsSubject.subscribe(talkingFeeds => {
            this.refreshViews(talkingFeeds);
        });
    }

    refreshViews(talkingFeeds: any) {
        const tmpId = Object.keys(talkingFeeds).filter(e => talkingFeeds[e])[0];

        const screenshareStream = this._cameraStreams.find((e => e.isScreenshare === true));

        console.log(talkingFeeds);

        if (this.janusService.screensharingIsActive && screenshareStream) {
            this.talkingFeedId = screenshareStream.feedId;
            this.talkingFeedStream = screenshareStream;
            this.nonTalkingFeedStreams = this.nonTalkingFeeds;
        } else {
            if (this._cameraStreams.length === 1) {
                this.talkingFeedId = this._cameraStreams[0].feedId;
            }

            if (tmpId && tmpId != '' && this.talkingFeedId !== tmpId) {
                this.talkingFeedId = tmpId;
                console.log('(Speaker View) Active speaker changed: ', this.talkingFeedId);

                const feedStr = this.talkingFeed;
                if (feedStr) {
                    this.talkingFeedStream = feedStr;
                }
                this.nonTalkingFeedStreams = this.nonTalkingFeeds;
                console.log('Non talking feed streams: ', this.nonTalkingFeedStreams);
            } else {
                const mediaStream = this._cameraStreams.find((e => !e.isScreenshare));
                if (mediaStream) {
                    this.talkingFeedId = mediaStream.feedId;
                    this.talkingFeedStream = mediaStream;
                    this.nonTalkingFeedStreams = this.nonTalkingFeeds;
                }
            }
        }
    }

    get talkingFeed() {
        return this._cameraStreams.find(e => e.feedId == this.talkingFeedId);
    }

    get nonTalkingFeeds() {
        return this._cameraStreams.filter(e => e.feedId != this.talkingFeedId);
    }
}
