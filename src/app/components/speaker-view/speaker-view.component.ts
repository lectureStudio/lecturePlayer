import {Component, Input, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
  selector: 'app-speaker-view',
  templateUrl: './speaker-view.component.html',
  styleUrls: ['./speaker-view.component.scss']
})
export class SpeakerViewComponent implements OnInit {

  public _cameraStreams: {stream: MediaStream, feedId: string, loadingFinished?: boolean; firstRenderFinished?: boolean}[];

  public talkingFeedStream?: MediaStream;
  public nonTalkingFeedStreams?: MediaStream[];

  private currentPage = 0;
  private maximumAmountOfCamsPerPage = 4;

  private talkingFeedId: string;

  @Input() set cameraStreams(value: {stream: MediaStream, feedId: string}[]) {
    this._cameraStreams = value;
  }

  constructor(public janusService: JanusService) { }

  ngOnInit(): void {
    this.janusService.talkingFeedsSubject.subscribe(talkingFeeds => {
      const tmpId = Object.keys(talkingFeeds).filter(e => talkingFeeds[e])[0];

      if (this._cameraStreams.length === 1) {
        this.talkingFeedId = this._cameraStreams[0].feedId;
      }

      if (tmpId && tmpId != '' && this.talkingFeedId !== tmpId) {
        this.talkingFeedId = tmpId;
        console.log('(Speaker View) Active speaker changed: ', this.talkingFeedId);

        this.talkingFeedStream = this.talkingFeed?.stream;
        this.nonTalkingFeedStreams = this.nonTalkingFeeds.map(e => e.stream);
      }
    })
  }

  get talkingFeed() {
    return this._cameraStreams.find(e => e.feedId == this.talkingFeedId);
  }

  get nonTalkingFeeds() {
    return this._cameraStreams.filter(e => e.feedId != this.talkingFeedId);
  }

  changePage(modifier: number) {
    // All streams that were currently displayed on this page are done with their first render.
    const tmp = this.currentPage + modifier;
    if (tmp >= 0 && tmp <= (this._cameraStreams.length / this.maximumAmountOfCamsPerPage)) {
      this.currentPage = tmp;
    }
  }
}
