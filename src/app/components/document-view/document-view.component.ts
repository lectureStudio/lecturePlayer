import {AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SlideView} from "../../view/slide.view";
import {RenderSurface} from "../../render/render-surface";
import {SlideRenderSurface} from "../../render/slide-render-surface";
import {TextLayerSurface} from "../../render/text-layer-surface";
import {JanusService} from "../../services/janus/janus.service";
import {PlaybackService} from "../../services/playback.service";
import {StreamPageSelectedAction} from "../../action/stream.page.selected.action";
import {StreamActionParser} from "../../action/parser/stream.action.parser";
import {PageAction} from "../../action/page.action";

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})
export class DocumentViewComponent implements OnInit, AfterViewInit, SlideView {
  @ViewChild('actionCanvas') actionCanvas: ElementRef;
  @ViewChild('slideCanvas') slideCanvas: ElementRef;
  @ViewChild('volatileCanvas') volatileCanvas: ElementRef;
  @ViewChild('textLayer') textLayer: ElementRef;
  @ViewChild('parent') parent: ElementRef;

  private slideRenderSurface: SlideRenderSurface;
  private actionRenderSurface: RenderSurface;
  private volatileRenderSurface: RenderSurface;
  private textLayerSurface: TextLayerSurface;

  public showHoverMenu = false;

  public _cameraStreams: { stream: MediaStream, feedId: string, userName: string, loadingFinished?: boolean; firstRenderFinished?: boolean, isScreenshare?: boolean }[];

  @Input() set cameraStreams(value: { stream: MediaStream, feedId: string, userName: string, isScreenshare?: boolean }[]) {
    const currentCameraStreamsAmount = this._cameraStreams?.length || -1;
    if (currentCameraStreamsAmount !== value.length) {
      // this.refreshViews(this.janusService.talkingFeeds);
      this._cameraStreams = value;
    }
  }

  constructor(private janusService: JanusService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.slideRenderSurface = new SlideRenderSurface(this.slideCanvas.nativeElement);
    this.actionRenderSurface = new RenderSurface(this.actionCanvas.nativeElement);
    this.volatileRenderSurface = new RenderSurface(this.volatileCanvas.nativeElement);
    this.textLayerSurface = new TextLayerSurface(this.textLayer.nativeElement);

    this.repaint();

    new ResizeObserver(this.resize.bind(this)).observe(this.parent.nativeElement);
  }

  getActionRenderSurface(): RenderSurface {
    return this.actionRenderSurface;
  }

  getSlideRenderSurface(): SlideRenderSurface {
    return this.slideRenderSurface;
  }

  getTextLayerSurface(): TextLayerSurface {
    return this.textLayerSurface;
  }

  getVolatileRenderSurface(): RenderSurface {
    return this.volatileRenderSurface;
  }

  repaint(): void {
    this.resize();
  }

  private resize() {
    const slideRatio = 4 / 3;
    let width = this.parent.nativeElement.clientWidth;
    let height = this.parent.nativeElement.clientHeight;
    const viewRatio = width / height;

    if (viewRatio > slideRatio) {
      width = height * slideRatio;
    }
    else {
      height = width / slideRatio;
    }

    if (width === 0 || height === 0) {
      return;
    }

    this.slideRenderSurface.setSize(width, height);
    this.actionRenderSurface.setSize(width, height);
    this.volatileRenderSurface.setSize(width, height);
    this.textLayerSurface.setSize(width, height);
  }

  pageBack() {
    const activePageNumber = PlaybackService.getInstance().renderController.getPage().getPageNumber();
    this.modifyPage(Math.min(activePageNumber - 1, 0));
  }

  pageForward() {
    const activePageNumber = PlaybackService.getInstance().renderController.getPage().getPageNumber();
    this.modifyPage(Math.max(activePageNumber + 1, 0));
  }

  private modifyPage(pageNumber: number) {
    const action = new StreamPageSelectedAction(BigInt(0), pageNumber);
    const parsed = StreamActionParser.parseActionToBinary(action);

    this.janusService.sendData(parsed);

    const pageAction = new PageAction(action.pageNumber);
    pageAction.timestamp = 0;

    PlaybackService.getInstance().addAction(pageAction);
  }
}
