import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {JanusService} from "../../services/janus/janus.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  public isSelectingMicrophone = false;
  public isSelectingCamera = false;
  public isSelectingViewMode = false;

  @ViewChild('microphoneSelection')
  private microphoneSelection: ElementRef;

  @ViewChild('cameraSelection')
  private cameraSelection: ElementRef;

  @ViewChild('viewModeSelection')
  private viewModeSelection: ElementRef;

  public chosenViewMode = 'gallery';

  public availableViewModes = {
    gallery: 'Gallery view',
    speaker: 'Speaker view'
  }

  constructor(public janusService: JanusService, private router: Router) { }

  ngOnInit(): void {
    this.janusService.start();

    document.addEventListener('click', () => {
      this.isSelectingCamera = false; // TODO refactor, see below
      this.isSelectingMicrophone = false;
      this.isSelectingViewMode = false;
    })

    this.janusService.screenshareStateSubject.subscribe(val => {
      if (val === "start") {
        this.chosenViewMode = 'speaker';
      } else {
        this.chosenViewMode = 'gallery';
      }
    });
  }

  ngOnDestroy() {
    this.janusService.end();
  }

  get audioStreams() {
    return Object.values(this.janusService.remoteTracks).filter(e => e.stream.getAudioTracks().length > 0);
  }

  get videoStreams() {
    return Object.values(this.janusService.remoteTracks).filter(e => e.stream.getVideoTracks().length > 0);
  }

  leave() {
    this.janusService.end();
    this.router.navigate(['/']);
  }

  showAvailableMicrophones(event: MouseEvent) {
    event.stopPropagation();

    console.log(event);
    console.log(event.target);

    // @ts-ignore
    const rect = event.target.getBoundingClientRect();

    // @ts-ignore
    const osL = rect.left;
    // @ts-ignore
    const osT = rect.top;

    this.isSelectingMicrophone = true;
    this.isSelectingCamera = false;
    this.microphoneSelection.nativeElement.style.top = osT + 'px';
    this.microphoneSelection.nativeElement.style.left = osL + 'px';
  }

  showAvailableCameras(event: MouseEvent) {
    event.stopPropagation();

    // @ts-ignore
    const rect = event.target.getBoundingClientRect();

    // @ts-ignore
    const osL = rect.left;
    // @ts-ignore
    const osT = rect.top;

    this.isSelectingCamera = true;
    this.isSelectingMicrophone = false;
    this.cameraSelection.nativeElement.style.top = osT + 'px';
    this.cameraSelection.nativeElement.style.left = osL + 'px';
  }

  showAvailableViewModes(event: MouseEvent) {
    event.stopPropagation();

    // @ts-ignore
    const rect = event.target.getBoundingClientRect();

    // @ts-ignore
    const osL = rect.left;
    // @ts-ignore
    const osT = rect.top;

    this.isSelectingCamera = false; // TODO Refactor this, make an actual component instead of spamming booleans and methods
    this.isSelectingMicrophone = false;
    this.isSelectingViewMode = true;
    this.viewModeSelection.nativeElement.style.top = osT + 'px';
    this.viewModeSelection.nativeElement.style.left = osL + 'px';
  }
}
