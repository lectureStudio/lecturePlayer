import {Component, Input, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
    selector: 'app-speaker-view',
    templateUrl: './speaker-view.component.html',
    styleUrls: ['./speaker-view.component.scss']
})
export class SpeakerViewComponent implements OnInit {

  public _cameraStreams: {stream: MediaStream, feedId: string, loadingFinished?: boolean; firstRenderFinished?: boolean, isScreenshare?: boolean}[];

    public talkingFeedStream: MediaStream;
    public nonTalkingFeedStreams: MediaStream[];

    public talkingFeedId: string = '';

  @Input() set cameraStreams(value: {stream: MediaStream, feedId: string, isScreenshare?: boolean}[]) {
    this._cameraStreams = value;
  }

    constructor(public janusService: JanusService) {
    }

    ngOnInit() {
    }

    ngAfterContentInit() {
        if (!this.talkingFeedId && !this.talkingFeedStream && this._cameraStreams.length > 0) {
            this.talkingFeedId = this._cameraStreams[0].feedId;
            this.talkingFeedStream = this._cameraStreams[0].stream;

            this.nonTalkingFeedStreams = this.nonTalkingFeeds.map(e => e.stream);
        }

        this.janusService.talkingFeedsSubject.subscribe(talkingFeeds => {
            const tmpId = Object.keys(talkingFeeds).filter(e => talkingFeeds[e])[0];

            const screenshareStream = this._cameraStreams.find((e => e.isScreenshare === true));

            if (screenshareStream) {
                console.log("=========================HELLO")
              console.log(screenshareStream.feedId);
              this.talkingFeedId = screenshareStream.feedId;
              this.talkingFeedStream = screenshareStream.stream;
              this.nonTalkingFeedStreams = this.nonTalkingFeeds.map(e => e.stream);
            } else {
              if (this._cameraStreams.length === 1) {
                this.talkingFeedId = this._cameraStreams[0].feedId;
              }

              if (tmpId && tmpId != '' && this.talkingFeedId !== tmpId) {
                this.talkingFeedId = tmpId;
                console.log('(Speaker View) Active speaker changed: ', this.talkingFeedId);

                const feedStr = this.talkingFeed?.stream;
                if (feedStr) {
                  this.talkingFeedStream = feedStr;
                }
                this.nonTalkingFeedStreams = this.nonTalkingFeeds.map(e => e.stream);
                console.log('Non talking feed streams: ', this.nonTalkingFeedStreams);
            }
          }

        });
    }

    get talkingFeed() {
        return this._cameraStreams.find(e => e.feedId == this.talkingFeedId);
    }

    get nonTalkingFeeds() {
        return this._cameraStreams.filter(e => e.feedId != this.talkingFeedId);
    }
}
