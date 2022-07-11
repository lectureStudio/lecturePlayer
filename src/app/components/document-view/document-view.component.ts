import {AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SlideView} from "../../view/slide.view";
import {RenderSurface} from "../../render/render-surface";
import {SlideRenderSurface} from "../../render/slide-render-surface";
import {TextLayerSurface} from "../../render/text-layer-surface";

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


  constructor() { }

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
}
