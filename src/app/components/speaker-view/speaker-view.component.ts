import {Component, Input, OnInit} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";

@Component({
  selector: 'app-speaker-view',
  templateUrl: './speaker-view.component.html',
  styleUrls: ['./speaker-view.component.scss']
})
export class SpeakerViewComponent implements OnInit {

  _cameraStreams: {stream: MediaStream, feedId: string, loadingFinished?: boolean; firstRenderFinished?: boolean}[];

  private currentPage = 0;
  private maximumAmountOfCamsPerPage = 4;

  private talkingFeedId: string;

  @Input() set cameraStreams(value: {stream: MediaStream, feedId: string}[]) {
    this._cameraStreams = value;
  }

  constructor(public janusService: JanusService) { }

  ngOnInit(): void {
  }

  changePage(modifier: number) {
    // All streams that were currently displayed on this page are done with their first render.
    const tmp = this.currentPage + modifier;
    if (tmp >= 0 && tmp <= (this._cameraStreams.length / this.maximumAmountOfCamsPerPage)) {
      this.currentPage = tmp;
    }
  }

  getTalkingStream() {
    this.talkingFeedId = Object.keys(this.janusService.talkingFeeds).filter(e => !this._cameraStreams.find(cs => cs.feedId === e))[0] || '';

    if (this._cameraStreams.length === 1) {
      return this._cameraStreams[0];
    }

    return this._cameraStreams.find(e => e.feedId == this.talkingFeedId);
  }

  getAllNonTalkingStreamsForCurrentPage() {
    return this._cameraStreams.filter(e => e.feedId != this.talkingFeedId);
  }

}
